// Conversion tests (Phase 4): JOAT enquiries carrying a referral, Shopify
// order/refund/cancel/dispute webhooks, and the JOAT engagement → invoice →
// M-Pesa payment flow. Offline: PGlite (with pgcrypto) + Web Crypto.
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { signToken } from "../supabase/functions/_shared/referral.js";
import { emailHash, extract, verifyShopifyHmac } from "../supabase/functions/_shared/shopify.js";

let fails = 0;
const expect = (label, got, want) => {
  const ok =
    want === "err"
      ? String(got).startsWith("ERR")
      : want instanceof RegExp
        ? want.test(String(got))
        : JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}  -> ${typeof got === "object" ? JSON.stringify(got) : got}`,
  );
};

const KEY = "test-referral-key-0123456789-abcdefghij";
const HOUR = 3600;
const now = () => Math.floor(Date.now() / 1000);

// ─── Shopify helpers (no database) ────────────────────────────────────────────
console.log("— Shopify signatures and payloads");
const body = JSON.stringify({ id: 1 });
const goodSig = createHmac("sha256", "shop-secret").update(body).digest("base64");
expect("valid Shopify signature", await verifyShopifyHmac(body, goodSig, "shop-secret"), true);
expect("wrong secret", await verifyShopifyHmac(body, goodSig, "other"), false);
expect("edited body", await verifyShopifyHmac(body + " ", goodSig, "shop-secret"), false);
expect("missing signature", await verifyShopifyHmac(body, null, "shop-secret"), false);
const paidPayload = {
  id: 5001,
  name: "#1001",
  currency: "USD",
  created_at: new Date().toISOString(),
  email: "Buyer@Example.com",
  customer: { first_name: "Should", last_name: "Not be kept" },
  shipping_address: { address1: "1 Main St" },
  note_attributes: [{ name: "_abp_ref", value: "tok.en" }],
  line_items: [
    { price: "32.94", quantity: 2, discount_allocations: [{ amount: "6.59" }], gift_card: false },
    { price: "25.00", quantity: 1, discount_allocations: [], gift_card: true },
  ],
};
const extracted = extract("orders/paid", paidPayload);
// browser_ip and email are hashed then dropped by shopify-webhook before storage.
expect("order data keeps no names or addresses", Object.keys(extracted).sort(), [
  "browser_ip",
  "code",
  "created_at",
  "currency",
  "discount_codes",
  "email",
  "landing_site",
  "lines",
  "name",
  "order_id",
  "token",
]);
expect("referral attribute is picked up", extracted.token, "tok.en");
expect("amounts stay strings (no floats)", extracted.lines[0], {
  price: "32.94",
  qty: 2,
  discounts: ["6.59"],
  gift_card: false,
});
expect("unknown topic is ignored", extract("products/update", {}), null);

// ─── Database ─────────────────────────────────────────────────────────────────
const db = new PGlite({ extensions: { pgcrypto } });
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  create schema extensions;
  create schema auth; create table auth.users (id uuid primary key, email text);
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, metadata jsonb);
  create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
  insert into vault.decrypted_secrets values ('referral_token_key', '${KEY}');
`);
for (const f of [
  "20260529160000_contact_submissions.sql",
  "20260902100000_consultation_bookings.sql",
  "20261118100000_partner_portal_foundation.sql",
  "20261119100000_partner_onboarding.sql",
  "20261120100000_partner_tracking.sql",
  "20261121100000_partner_conversions.sql",
  "20261122100000_partner_commissions.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [AMB_J, AMB_A, MGR_J, FIN, FIN2, MGR_A] = [1, 2, 3, 4, 5, 6].map(id);
await db.exec(`
  insert into auth.users values ('${AMB_J}', 'joat.amb@example.com'), ('${AMB_A}', 'buyer@example.com'),
    ('${MGR_J}', 'm@x.y'), ('${FIN}', 'f@x.y'), ('${FIN2}', 'f2@x.y'), ('${MGR_A}', 'ma@x.y');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${AMB_J}', 'Jo Amb', 'US', 'JJJJ1111'), ('${AMB_A}', 'Am Amb', 'US', 'AAAA1111');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${AMB_J}', 'joat', 'approved'), ('${AMB_A}', 'amare', 'approved');
  insert into public.partner_staff (user_id, role, program_id) values
    ('${MGR_J}', 'program_manager', 'joat'), ('${FIN}', 'finance', null), ('${FIN2}', 'finance', null),
    ('${MGR_A}', 'program_manager', 'amare');
`);

async function run(sql, { sub = "", aal = "aal1", role = "authenticated" } = {}) {
  try {
    let out;
    await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        sub ? JSON.stringify({ sub, aal }) : "",
      ]);
      await tx.exec(`set local role ${role}`);
      const r = await tx.query(sql);
      out =
        r.rows.length === 1 && r.fields.length === 1 ? Object.values(r.rows[0])[0] : r.rows.length;
    });
    return out === "" || out === null ? "ok" : out;
  } catch (e) {
    return `ERR ${e.message.slice(0, 70)}`;
  }
}
const q = async (sql) => (await db.query(sql)).rows;
const svc = { role: "service_role" };
const staff = (sub) => ({ sub, aal: "aal2" });
const amb = (sub) => ({ sub });

// Consented clicks for each ambassador, plus one without consent.
const click = async (program, ref, consent) =>
  (
    await q(
      `select click_id from public.record_partner_click('${program}', '${ref}', null, '/', '{}', null, 'ip-${program}-${consent}', ${consent})`,
    )
  )[0].click_id;
const joatClick = await click("joat", "JJJJ1111", true);
const joatNoConsent = await click("joat", "JJJJ1111", false);
const amareClick = await click("amare", "AAAA1111", true);
const tok = (k, p, exp = now() + 30 * 86400) => signToken({ v: 1, k, p, exp }, KEY);

console.log("— referral tokens checked in SQL");
const verify = (t, p = "joat") => `select private.verify_referral_token('${t}', '${p}', now())`;
expect(
  "token signed in JS verifies in SQL",
  (await q(verify(await tok(joatClick, "joat"))))[0].verify_referral_token,
  joatClick,
);
const good = await tok(joatClick, "joat");
expect(
  "tampered signature",
  (await q(verify(good.slice(0, -2) + "xx")))[0].verify_referral_token,
  null,
);
expect(
  "expired token",
  (await q(verify(await tok(joatClick, "joat", now() - HOUR))))[0].verify_referral_token,
  null,
);
expect(
  "token for the other programme",
  (await q(verify(good, "amare")))[0].verify_referral_token,
  null,
);
expect(
  "click without consent",
  (await q(verify(await tok(joatNoConsent, "joat"))))[0].verify_referral_token,
  null,
);
expect("garbage", (await q(verify("not-a-real.token")))[0].verify_referral_token, null);

console.log("— JOAT enquiry forms");
const contact = (token, extra = "") =>
  `insert into public.contact_submissions (first_name,last_name,email,service_area,message,referral_token${extra ? ",referral_click_id" : ""})
   values ('Cli','Ent','client@biz.com','Software','We need an app', ${token === null ? "null" : `'${token}'`}${extra})`;
expect("enquiry with a valid referral", await run(contact(good), { role: "anon" }), 0);
expect(
  "enquiry with a forged referral",
  await run(contact(good.slice(0, -3) + "abc"), { role: "anon" }),
  0,
);
expect(
  "visitor tries to set the click id directly",
  await run(contact(null, `, ${joatClick}`), { role: "anon" }),
  0,
);
expect(
  "only the valid one is attributed; tokens are never stored",
  await q(
    "select referral_click_id c, referral_token t from public.contact_submissions order by created_at, c nulls last",
  ),
  [
    { c: joatClick, t: null },
    { c: null, t: null },
    { c: null, t: null },
  ],
);
expect(
  "JOAT manager sees referred enquiries only",
  await run("select count(*)::int from public.contact_submissions", staff(MGR_J)),
  1,
);
expect(
  "JOAT manager without MFA sees none",
  await run("select count(*)::int from public.contact_submissions", { sub: MGR_J }),
  0,
);
expect(
  "Amare manager sees none",
  await run("select count(*)::int from public.contact_submissions", staff(MGR_A)),
  0,
);
expect(
  "ambassador sees none",
  await run("select count(*)::int from public.contact_submissions", amb(AMB_J)),
  0,
);
const leadId = (
  await q("select id from public.contact_submissions where referral_click_id is not null")
)[0].id;
const plainLead = (
  await q("select id from public.contact_submissions where referral_click_id is null limit 1")
)[0].id;

console.log("— Shopify webhooks");
const ingest = (wid, topic, data, clickId = "null", at = "now()") =>
  `select public.ingest_shopify_event('${wid}', '${topic}', ${at}, '${JSON.stringify(data)}'::jsonb, ${clickId})`;
const paid = {
  order_id: "5001",
  name: "#1001",
  currency: "USD",
  created_at: new Date().toISOString(),
  email_hash: await emailHash("someone@else.com"),
  lines: [
    { price: "32.94", qty: 2, discounts: ["3.29", "3.30"], gift_card: false },
    { price: "25.00", qty: 1, discounts: [], gift_card: true },
  ],
};
expect(
  "browser can't post orders",
  await run(ingest("w0", "orders/paid", paid, amareClick), amb(AMB_A)),
  "err",
);
expect(
  "paid order with a referral",
  await run(ingest("w1", "orders/paid", paid, amareClick), svc),
  "processed",
);
expect(
  "same webhook delivered twice",
  await run(ingest("w1", "orders/paid", paid, amareClick), svc),
  "duplicate",
);
expect(
  "eligible revenue: 2 × 32.94 − 6.59 discounts, gift card excluded",
  (await q("select eligible_revenue::text r from public.shopify_orders where order_id='5001'"))[0]
    .r,
  "59.29",
);
expect(
  "order without a referral is not stored",
  await run(ingest("w2", "orders/paid", { ...paid, order_id: "5002" }), svc),
  "ignored: no referral",
);
expect(
  "no row for it",
  (await q("select count(*)::int n from public.shopify_orders where order_id='5002'"))[0].n,
  0,
);
expect(
  "a JOAT click can't credit an Amare order",
  await run(ingest("w3", "orders/paid", { ...paid, order_id: "5003" }, joatClick), svc),
  "ignored: no referral",
);

const conv = async (ref) =>
  (
    await q(
      `select revenue::text, refunded::text, status from public.affiliate_conversions where reference='${ref}'`,
    )
  )[0];
// The view filters by the caller; query it as Amare staff.
const asAmareStaff = async (ref) => {
  let row;
  await db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: MGR_A, aal: "aal2" }),
    ]);
    await tx.exec("set local role authenticated");
    row = (
      await tx.query(
        `select revenue::text, refunded::text, status from public.affiliate_conversions where reference='${ref}'`,
      )
    ).rows[0];
  });
  return row;
};
expect("conversion shows as verified", await asAmareStaff("#1001"), {
  revenue: "59.29",
  refunded: "0.00",
  status: "verified",
});
expect(
  "Amare commission: 10% of 59.29 rounds to 5.93, held 30 days",
  await run(
    "select commission::text || ' ' || (hold_until = paid_at + interval '30 days') from public.affiliate_conversions c join public.shopify_orders o on coalesce(o.order_name, o.order_id) = c.reference where c.reference='#1001'",
    staff(MGR_A),
  ),
  "5.93 true",
);
await run(
  ingest("w4", "refunds/create", {
    refund_id: "r1",
    order_id: "5001",
    lines: [{ subtotal: "29.65", gift_card: false }],
  }),
  svc,
);
expect("partial refund reduces revenue to 29.64", await asAmareStaff("#1001"), {
  revenue: "29.64",
  refunded: "29.65",
  status: "verified",
});
await run(
  ingest(
    "w5",
    "disputes/create",
    { dispute_id: "d1", order_id: "5001", status: "needs_response" },
    "null",
    "now() + interval '1 hour'",
  ),
  svc,
);
expect("open chargeback", (await asAmareStaff("#1001")).status, "disputed");
await run(
  ingest(
    "w6",
    "disputes/update",
    { dispute_id: "d1", order_id: "5001", status: "won" },
    "null",
    "now() + interval '3 hours'",
  ),
  svc,
);
await run(
  ingest(
    "w7",
    "disputes/update",
    { dispute_id: "d1", order_id: "5001", status: "under_review" },
    "null",
    "now() + interval '2 hours'",
  ),
  svc,
);
expect(
  "won chargeback (late, older update ignored)",
  (await asAmareStaff("#1001")).status,
  "verified",
);
// A refund that arrives before the payment webhook is still applied.
await run(
  ingest("w8", "refunds/create", {
    refund_id: "r2",
    order_id: "5010",
    lines: [{ subtotal: "10.00" }],
  }),
  svc,
);
await run(
  ingest(
    "w9",
    "orders/paid",
    {
      ...paid,
      order_id: "5010",
      name: "#1010",
      lines: [{ price: "40.00", qty: 1, discounts: [] }],
    },
    amareClick,
  ),
  svc,
);
expect("refund received before payment still counts", await asAmareStaff("#1010"), {
  revenue: "30.00",
  refunded: "10.00",
  status: "verified",
});
await run(
  ingest("w10", "orders/cancelled", { order_id: "5010", cancelled_at: new Date().toISOString() }),
  svc,
);
expect("cancelled order is reversed", (await asAmareStaff("#1010")).status, "reversed");
await run(
  ingest(
    "w11",
    "orders/paid",
    {
      ...paid,
      order_id: "5020",
      name: "#1020",
      email_hash: await emailHash(" BUYER@example.com "),
    },
    amareClick,
  ),
  svc,
);
expect(
  "ambassador buying through own link is flagged",
  (await q("select self_referral s from public.shopify_orders where order_id='5020'"))[0].s,
  true,
);
expect(
  "normal order is not flagged",
  (await q("select self_referral s from public.shopify_orders where order_id='5001'"))[0].s,
  false,
);

console.log("— who sees conversions");
expect(
  "Amare ambassador sees own orders",
  await run("select count(*)::int from public.affiliate_conversions", amb(AMB_A)),
  3,
);
expect(
  "JOAT ambassador sees none of them",
  await run(
    "select count(*)::int from public.affiliate_conversions where program_id='amare'",
    amb(AMB_J),
  ),
  0,
);
expect(
  "anon can't read conversions",
  await run("select * from public.affiliate_conversions", { role: "anon" }),
  "err",
);
expect(
  "ambassador can't read raw orders",
  await run("select count(*)::int from public.shopify_orders", amb(AMB_A)),
  0,
);
expect(
  "ambassador can't read webhook log",
  await run("select count(*)::int from public.webhook_events", amb(AMB_A)),
  0,
);

console.log("— JOAT: engagement → invoice → M-Pesa payment");
const engage = (lead, who) =>
  run(
    `select public.create_joat_engagement('contact', '${lead}', 'Acme Ltd', 'Mobile app', current_date, 'CT-7')`,
    who,
  );
expect(
  "Amare manager creates a JOAT engagement",
  await engage(leadId, staff(MGR_A)),
  /not_authorised/,
);
expect("ambassador creates one", await engage(leadId, amb(AMB_J)), /not_authorised/);
expect(
  "from an enquiry with no referral",
  await engage(plainLead, staff(MGR_J)),
  /lead_not_referred/,
);
const ref = await engage(leadId, staff(MGR_J));
expect("JOAT manager creates it", ref, /^J-[0-9A-Z]{8}$/);
expect("same enquiry twice", await engage(leadId, staff(MGR_J)), /engagement_exists/);
const engId = (await q("select id from public.joat_engagements"))[0].id;
const invoice = (num, amount, cur = "KES") =>
  `select public.add_joat_invoice('${engId}', '${num}', '${amount}', '${cur}', current_date)`;
expect("add invoice", await run(invoice("INV-001", "100.10"), staff(MGR_J)), "ok");
expect(
  "second invoice in another currency",
  await run(invoice("INV-002", "50", "USD"), staff(FIN)),
  /currency_mismatch/,
);
expect(
  "duplicate invoice number",
  await run(invoice("INV-001", "5"), staff(MGR_J)),
  /invoice_exists/,
);
expect(
  "unpaid invoice: awaiting payment, no revenue",
  await run(
    `select status || ' ' || revenue::text from public.affiliate_conversions where reference='${ref}'`,
    staff(MGR_J),
  ),
  "awaiting_payment 0.00",
);
const invId = (await q("select id from public.joat_invoices where invoice_number='INV-001'"))[0].id;
const pay = (amount, code, who, date = "current_date") =>
  run(
    `select public.record_joat_payment('${invId}', '${amount}', ${date}, 'mpesa', '${code}')`,
    who,
  );
expect(
  "payment dated in the future",
  await pay("10", "QFX1", staff(MGR_J), "current_date + 3"),
  /future_date/,
);
expect("record M-Pesa payment 33.37", await pay("33.37", "qgh7ab12cd", staff(MGR_J)), "ok");
expect(
  "same M-Pesa code again (any case)",
  await pay("1", "QGH7AB12CD", staff(FIN)),
  /duplicate_payment/,
);
expect("more than the invoice", await pay("70", "QGH7AB12CE", staff(MGR_J)), /overpayment/);
expect("record second payment 66.73", await pay("66.73", "QGH7AB12CF", staff(FIN)), "ok");
expect(
  "recorded but unconfirmed payments don't count",
  await run(
    `select status from public.affiliate_conversions where reference='${ref}'`,
    staff(MGR_J),
  ),
  "awaiting_payment",
);
const payIds = (await q("select id, recorded_by from public.joat_payments order by amount")).map(
  (r) => r.id,
);
const review = (pid, ok, who, note = "null") =>
  run(`select public.review_joat_payment('${pid}', ${ok}, ${note})`, who);
expect(
  "manager confirms (not finance)",
  await review(payIds[0], true, staff(MGR_J)),
  /not_authorised/,
);
expect(
  "finance confirms their own entry",
  await review(payIds[1], true, staff(FIN)),
  /cannot_confirm_own_entry/,
);
expect("finance confirms someone else's entry", await review(payIds[0], true, staff(FIN)), "ok");
expect("reject without a reason", await review(payIds[1], false, staff(FIN2)), /reason_required/);
expect("second finance person confirms", await review(payIds[1], true, staff(FIN2)), "ok");
expect("confirm twice", await review(payIds[1], true, staff(FIN)), /invalid_transition/);
expect(
  "collected 33.37 + 66.73 = 100.10 exactly",
  await run(
    `select status || ' ' || revenue::text || ' ' || currency from public.affiliate_conversions where reference='${ref}'`,
    staff(FIN),
  ),
  "verified 100.10 KES",
);
expect(
  "JOAT ambassador sees the engagement",
  await run(
    `select count(*)::int from public.affiliate_conversions where reference='${ref}'`,
    amb(AMB_J),
  ),
  1,
);
expect(
  "Amare ambassador doesn't",
  await run(
    `select count(*)::int from public.affiliate_conversions where reference='${ref}'`,
    amb(AMB_A),
  ),
  0,
);
expect(
  "ambassador can't read client names",
  await run("select count(*)::int from public.joat_engagements", amb(AMB_J)),
  0,
);
expect(
  "staff can't edit a payment directly",
  await run(`update public.joat_payments set amount = 1`, staff(FIN)),
  "err",
);
expect(
  "every step is in the activity log",
  (
    await q(
      "select string_agg(action, ',' order by id) a from public.partner_audit_log where action like 'joat.%'",
    )
  )[0].a,
  "joat.engagement_created,joat.invoice_added,joat.payment_recorded,joat.payment_recorded,joat.payment_confirmed,joat.payment_confirmed",
);

console.log("— Commission (Phase 5)");
const commission = () =>
  run(
    `select commission::text || ' ' || (hold_until::date - current_date) from public.affiliate_conversions where reference='${ref}'`,
    staff(FIN),
  );
expect("JOAT: 10% of first invoice 100.10, hold ends in 30 days", await commission(), "10.01 30");
expect("later invoice", await run(invoice("INV-003", "500"), staff(MGR_J)), "ok");
const inv3 = (await q("select id from public.joat_invoices where invoice_number='INV-003'"))[0].id;
expect(
  "pay it",
  await run(`select public.record_joat_payment('${inv3}', '500', current_date, 'mpesa', 'QGH9ZZ')`, staff(MGR_J)),
  "ok",
);
const p3 = (await q("select id from public.joat_payments where amount = 500"))[0].id;
expect("confirm it", await review(p3, true, staff(FIN)), "ok");
expect(
  "revenue grows but commission stays on the first invoice only",
  await run(
    `select revenue::text || ' ' || commission::text from public.affiliate_conversions where reference='${ref}'`,
    staff(FIN),
  ),
  "600.10 10.01",
);
expect(
  "ambassador sees their own commission",
  await run(`select commission::text from public.affiliate_conversions where reference='${ref}'`, amb(AMB_J)),
  "10.01",
);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
