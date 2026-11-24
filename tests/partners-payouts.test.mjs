// Payout tests (Phase 5b) and fraud signals (Phase 7). Offline: PGlite.
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";

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
  "20261123100000_partner_payouts.sql",
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


const AMB_B = "00000000-0000-0000-0000-000000000007";
await db.exec(`
  insert into auth.users values ('${AMB_B}', 'b@x.y');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values ('${AMB_B}', 'Bee Amb', 'KE', 'BBBB1111');
  insert into public.affiliate_memberships (profile_id, program_id, status) values ('${AMB_B}', 'amare', 'approved');
  -- AMB_A gets 25 clicks, 20 of them from one visitor (suspicious).
  insert into public.affiliate_clicks (program_id, profile_id, landing_path, ip_hash, consent, is_duplicate)
    select 'amare', '${AMB_A}', '/', case when g <= 20 then 'same' else 'ip' || g end, true, g between 2 and 20
    from generate_series(1, 25) g;
  insert into public.shopify_orders (order_id, order_name, currency, paid_at, eligible_revenue, profile_id, self_referral) values
    ('1', '#1', 'USD', now() - interval '40 days', 100.00, '${AMB_A}', false),
    ('2', '#2', 'USD', now() - interval '35 days', 59.29,  '${AMB_A}', false),
    ('3', '#3', 'USD', now() - interval '5 days',  80.00,  '${AMB_A}', false),
    ('4', '#4', 'USD', now() - interval '40 days', 500.00, '${AMB_A}', true),
    ('5', '#5', 'USD', now() - interval '40 days', 30.00,  '${AMB_B}', false),
    ('6', '#6', 'KES', now() - interval '40 days', 1000.00,'${AMB_A}', false);
`);

console.log("— Payout details");
const save = (who, args) => run(`select public.save_payout_details(${args})`, who);
expect("non-ambassador can't save details", await save(staff(FIN), "'mpesa', 'Fin', '+254700000000'"), /not_authorised/);
expect("bad phone", await save(amb(AMB_A), "'mpesa', 'Am Amb', '07-abc'"), "err");
expect("bank without account number", await save(amb(AMB_A), "'bank', 'Am Amb', null, 'KCB'"), "err");
expect("save M-Pesa", await save(amb(AMB_A), "'mpesa', 'Am Amb', '+254 712-345-678'"), "ok");
expect("ambassador sees it masked", await run("select destination from public.my_payout_details()", amb(AMB_A)), "M-Pesa ••••5678");
expect("ambassador can't read the table", await run("select count(*)::int from public.affiliate_payout_details", amb(AMB_A)), 0);
expect("finance reads it in full", await run("select mpesa_phone from public.affiliate_payout_details", staff(FIN)), "+254712345678");
expect("manager can't", await run("select count(*)::int from public.affiliate_payout_details", staff(MGR_A)), 0);
expect("finance without MFA can't", await run("select count(*)::int from public.affiliate_payout_details", { sub: FIN }), 0);
expect("direct insert is refused", await run(`insert into public.affiliate_payout_details (profile_id, method, account_name, mpesa_phone) values ('${AMB_B}', 'mpesa', 'x', '+254700000001')`, amb(AMB_B)), "err");

const ageDetails = () => q("update public.affiliate_payout_details set updated_at = now() - interval '8 days'");
console.log("— Batches");
expect("details changed this week: nothing to pay yet", await run("select public.create_payout_batch('USD')", staff(FIN)), /nothing_to_pay/);
await ageDetails();
const create = (who, cur = "USD") => run(`select public.create_payout_batch('${cur}')`, who);
expect("manager can't create a batch", await create(staff(MGR_A)), /not_authorised/);
const batch = await create(staff(FIN));
expect("finance creates a USD batch", batch, /^[0-9a-f-]{36}$/);
expect(
  "pays 10.00 + 5.93 only (hold, own purchase, no details, other currency excluded)",
  await run(`select string_agg(profile_id::text || ' ' || amount::text || ' ' || destination, ',') from public.affiliate_payout_payees where batch_id='${batch}'`, staff(FIN)),
  `${AMB_A} 15.93 +254712345678`,
);
expect("a second batch finds nothing new", await create(staff(FIN2)), /nothing_to_pay/);
expect("creator can't approve", await run(`select public.approve_payout_batch('${batch}')`, staff(FIN)), /cannot_approve_own_batch/);
expect("can't mark paid before approval", await run(`select public.mark_payout_paid('${batch}', '${AMB_A}', 'QAB1')`, staff(FIN)), /invalid_transition/);
expect("second finance user approves", await run(`select public.approve_payout_batch('${batch}')`, staff(FIN2)), "ok");
expect("changing details now doesn't redirect the money", await save(amb(AMB_A), "'mpesa', 'Am Amb', '+254799999999'"), "ok");
expect("snapshot kept", await run(`select destination from public.affiliate_payout_payees where batch_id='${batch}'`, staff(FIN)), "+254712345678");
expect("ambassador sees approved payout", await run("select status || ' ' || amount::text from public.my_payouts()", amb(AMB_A)), "approved 15.93");
expect("paid without reference", await run(`select public.mark_payout_paid('${batch}', '${AMB_A}', ' ')`, staff(FIN)), /reference_required/);
expect("mark paid", await run(`select public.mark_payout_paid('${batch}', '${AMB_A}', 'QAB1CD2EF3')`, staff(FIN)), "ok");
expect("batch closes when everyone is paid", await run(`select status from public.affiliate_payout_batches where id='${batch}'`, staff(FIN)), "paid");
expect("can't cancel a paid batch", await run(`select public.cancel_payout_batch('${batch}', 'oops')`, staff(FIN)), /invalid_transition/);
expect("ambassador sees it paid", await run("select status || ' ' || paid_reference from public.my_payouts()", amb(AMB_A)), "paid QAB1CD2EF3");
expect("other ambassador sees nothing", await run("select count(*)::int from public.my_payouts()", amb(AMB_B)), 0);

console.log("— Refund after payout is deducted next time");
await db.exec(`
  insert into public.shopify_refunds values ('r1', '1', 40.00, now());
  update public.shopify_orders set paid_at = now() - interval '31 days' where order_id = '3';
`);
await ageDetails();
await q(`update public.affiliate_memberships set status = 'suspended' where profile_id = '${AMB_A}'`);
expect("suspended ambassador's money is held", await create(staff(FIN)), /nothing_to_pay/);
await q(`update public.affiliate_memberships set status = 'approved' where profile_id = '${AMB_A}'`);
const b2 = await create(staff(FIN));
expect("next batch: 8.00 due - 4.00 clawback = 4.00", await run(`select amount::text from public.affiliate_payout_payees where batch_id='${b2}'`, staff(FIN)), "4.00");
expect("cancel needs a reason", await run(`select public.cancel_payout_batch('${b2}', '')`, staff(FIN)), /reason_required/);
expect("cancel draft", await run(`select public.cancel_payout_batch('${b2}', 'redo')`, staff(FIN)), "ok");
const b3 = await create(staff(FIN));
expect("cancelled batch frees the amounts again", await run(`select amount::text from public.affiliate_payout_payees where batch_id='${b3}'`, staff(FIN)), "4.00");
expect("remove payee from draft with reason", await run(`select public.remove_payout_payee('${b3}', '${AMB_A}', 'hold for review')`, staff(FIN2)), "ok");
expect("empty batch can't be approved", await run(`select public.approve_payout_batch('${b3}')`, staff(FIN2)), /nothing_to_pay/);
await q(`insert into public.partner_staff (user_id, role) values ('${AMB_A}', 'finance')`);
const b4 = await create(staff(FIN));
expect("finance user can't approve a batch paying themselves", await run(`select public.approve_payout_batch('${b4}')`, staff(AMB_A)), /cannot_approve_own_payout/);
expect("staff can't edit payees directly", await run(`update public.affiliate_payout_payees set amount = 1`, staff(FIN)), "err");

console.log("— Fraud signals");
expect(
  "clicks, visitors, top visitor, duplicates, own purchases",
  await run(`select clicks || ' ' || unique_visitors || ' ' || top_visitor_clicks || ' ' || duplicate_clicks || ' ' || self_referrals from public.partner_fraud_signals() where profile_id='${AMB_A}' and program_id='amare'`, staff(MGR_A)),
  "25 6 20 19 1",
);
expect("JOAT manager doesn't see Amare signals", await run(`select count(*)::int from public.partner_fraud_signals() where program_id='amare'`, staff(MGR_J)), 0);
expect("ambassador gets nothing", await run("select count(*)::int from public.partner_fraud_signals()", amb(AMB_A)), 0);
expect(
  "audit trail",
  (await q("select string_agg(distinct action, ',' order by action) a from public.partner_audit_log where action like 'payout%'"))[0].a,
  "payout.batch_approved,payout.batch_cancelled,payout.batch_created,payout.paid,payout.payee_removed,payout_details.updated",
);

console.log("— Tiers, frozen rates, USD, single-person payouts (20261124100000)");
await db.exec(readFileSync("supabase/migrations/20261124100000_partner_rates_usd.sql", "utf8"));
const rateOf = (ref) => run(`select commission::text || ' ' || commission_rate::text from public.affiliate_conversions where reference='${ref}'`, staff(FIN));
expect("earlier sales keep 10%", await rateOf("#2"), "5.93 0.1000");
expect("new members start at 8%", (await q(`select commission_rate::text r from public.affiliate_memberships where profile_id='${AMB_B}'`))[0].r, "0.0800");
await q(`insert into public.shopify_orders (order_id, order_name, currency, paid_at, eligible_revenue, profile_id) values ('7', '#7', 'USD', now() - interval '40 days', 100.00, '${AMB_B}')`);
expect("new sale frozen at 8%", await rateOf("#7"), "8.00 0.0800");
const setRate = (who, rate, reason = "'grew sales'") => run(`select public.set_commission_rate('${AMB_B}', 'amare', ${rate}, ${reason})`, who);
expect("other program's manager can't change the rate", await setRate(staff(MGR_J), 0.10), /not_authorised/);
expect("only 8% or 10%", await setRate(staff(MGR_A), 0.09), /invalid_rate/);
expect("reason required", await setRate(staff(MGR_A), 0.10, "''"), /reason_required/);
expect("manager moves ambassador to 10%", await setRate(staff(MGR_A), 0.10), "ok");
expect("ambassador can't change their rate", await run(`update public.affiliate_memberships set commission_rate = 0.5`, amb(AMB_B)), "err");
await q(`insert into public.shopify_orders (order_id, order_name, currency, paid_at, eligible_revenue, profile_id) values ('8', '#8', 'USD', now() - interval '40 days', 100.00, '${AMB_B}')`);
expect("old sale unchanged after the upgrade", await rateOf("#7"), "8.00 0.0800");
expect("new sale at 10%", await rateOf("#8"), "10.00 0.1000");
await q(`update public.shopify_orders set eligible_revenue = 100.00 where order_id = '7'`);
expect("reprocessing an order keeps its rate", await rateOf("#7"), "8.00 0.0800");
expect("rate change audited", (await q("select details->>'to' t from public.partner_audit_log where action = 'membership.rate_changed'"))[0].t, "0.1");
expect("KES batch refused", await create(staff(FIN), "KES"), "err");
await save(amb(AMB_B), "'mpesa', 'Bee Amb', '+254711111111'");
await ageDetails();
const b5 = await create(staff(FIN));
expect("AMB_B: 3.00 (10%, old) + 8.00 + 10.00", await run(`select amount::text from public.affiliate_payout_payees where batch_id='${b5}' and profile_id='${AMB_B}'`, staff(FIN)), "21.00");
expect("one person creates and approves", await run(`select public.approve_payout_batch('${b5}')`, staff(FIN)), "ok");

console.log("— Ambassador emails (20261125100000)");
await db.exec(readFileSync("supabase/migrations/20261125100000_partner_emails.sql", "utf8"));
expect("ambassadors can't read the sent-email log", await run(`select * from public.partner_emails_sent`, amb(AMB_B)), "err");

console.log("— Active ambassadors export (20261126100000)");
await db.exec(readFileSync("supabase/migrations/20261126100000_partner_ambassador_export.sql", "utf8"));
const SUPER = id(8);
await db.exec(`insert into auth.users values ('${SUPER}', 's@x.y'); insert into public.partner_staff (user_id, role) values ('${SUPER}', 'super_admin')`);
const exportAs = (who) => run("select string_agg(email || ' ' || program_id || ' ' || commission_rate::text, ',' order by email) from public.export_active_ambassadors()", who);
expect("super admin gets approved ambassadors with emails", await exportAs(staff(SUPER)), "b@x.y amare 0.1000,buyer@example.com amare 0.0800,joat.amb@example.com joat 0.0800");
expect("needs two-factor sign-in", await exportAs({ sub: SUPER }), /not_authorised/);
expect("finance can't export", await exportAs(staff(FIN)), /not_authorised/);
expect("export is logged", (await q("select count(*)::int n from public.partner_audit_log where action = 'ambassadors.exported'"))[0].n, 1);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
