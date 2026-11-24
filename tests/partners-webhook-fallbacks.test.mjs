// Shopify attribution fallbacks (Part 5): token first, then a cart code backed
// by its Apply click (same visitor), then an ambassador discount code.
// Offline (PGlite + Web Crypto).
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { emailHash, extract, landingPath } from "../supabase/functions/_shared/shopify.js";
import { hashIp, signToken, verifyToken } from "../supabase/functions/_shared/referral.js";

const KEY = "test-referral-key-0123456789-abcdefghij";

// ─── Payload extraction ───────────────────────────────────────────────────────
const raw = {
  id: 7001,
  created_at: new Date().toISOString(),
  email: "buyer@example.com",
  browser_ip: "203.0.113.9",
  landing_site: "/products/hoodie?ref=AAAA1111&ln=ZZZZ9999&utm_source=whatsapp",
  note_attributes: [
    { name: "_abp_ref", value: "tok.en" },
    { name: "_abp_code", value: "aaaa1111" },
  ],
  discount_codes: [{ code: "XMAS10" }, { code: "BBBB2222" }],
  line_items: [],
};
const x = extract("orders/paid", raw);
assert.equal(x.code, "aaaa1111");
assert.deepEqual(x.discount_codes, ["XMAS10", "BBBB2222"]);
assert.equal(x.browser_ip, "203.0.113.9");
assert.equal(
  extract("orders/paid", {
    ...raw,
    browser_ip: undefined,
    client_details: { browser_ip: "1.1.1.1" },
  }).browser_ip,
  "1.1.1.1",
);
assert.equal(landingPath(x.landing_site), "/products/hoodie?utm_source=whatsapp");
assert.equal(landingPath("/x?abp_ref=tok.en"), "/x");
assert.equal(landingPath(null), null);
assert.equal(landingPath("/" + "a".repeat(900)).length, 500);

// Forged and expired tokens never get past the Edge Function.
const exp = Math.floor(Date.now() / 1000) + 3600;
const good = await signToken({ v: 1, k: 1, p: "amare", exp }, KEY);
const forged = Buffer.from(JSON.stringify({ v: 1, k: 2, p: "amare", exp })).toString("base64url");
assert.equal(await verifyToken(`${forged}.${good.split(".")[1]}`, KEY), null, "forged token");
assert.equal(await verifyToken(good, KEY, (exp + 1) * 1000), null, "expired token");

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
  "20261127100000_partner_ambassador_codes.sql",
  "20261128100000_partner_shop_links.sql",
  "20261130100000_partner_webhook_fallbacks.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [A, B, S] = [1, 2, 3].map(id);
await db.exec(`
  insert into auth.users values ('${A}', 'amb.a@example.com'), ('${B}', 'amb.b@example.com'), ('${S}', 's@example.com');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${A}', 'Ann A', 'KE', 'AAAA1111'), ('${B}', 'Ben B', 'KE', 'BBBB2222'), ('${S}', 'Sus S', 'KE', 'SSSS3333');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${A}', 'amare', 'approved'), ('${B}', 'amare', 'approved'), ('${S}', 'amare', 'approved');
`);
const q = async (sql) => (await db.query(sql)).rows;
const clicks = async () => (await q("select count(*)::int n from public.affiliate_clicks"))[0].n;

const IP = "203.0.113.9";
const ipHash = await hashIp(IP, KEY);
// What the cart's Apply button records (through track-click).
const apply = async (code, hash = ipHash) =>
  (
    await q(
      `select click_id from public.record_partner_code_click('amare', '${code}', 'code_cart', '/cart', '${hash}')`,
    )
  )[0]?.click_id;

let n = 0;
const order = async (extra, clickId = "null") => {
  n++;
  const data = {
    order_id: String(9000 + n),
    name: `#${n}`,
    currency: "USD",
    created_at: new Date().toISOString(),
    email_hash: await emailHash("someone@else.com"),
    lines: [{ price: "20.00", qty: 1, discounts: [], gift_card: false }],
    code: null,
    discount_codes: [],
    ip_hash: ipHash,
    landing_path: "/products/hoodie",
    ...extra,
  };
  const out = (
    await db.query(
      "select public.ingest_shopify_event($1, 'orders/paid', now(), $2::jsonb, $3) o",
      [`w${n}`, JSON.stringify(data), clickId === "null" ? null : clickId],
    )
  ).rows[0].o;
  const row = (
    await q(
      `select profile_id, click_id, self_referral from public.shopify_orders where order_id = '${data.order_id}'`,
    )
  )[0];
  return { out, row, data };
};

// 1. Token wins over a code and a discount code.
const tokenClick = (
  await q(
    `select click_id from public.record_partner_click('amare', 'BBBB2222', null, '/', '{}', null, 'ip-x', true)`,
  )
)[0].click_id;
await apply("AAAA1111");
let r = await order({ code: "AAAA1111", discount_codes: ["AAAA1111"] }, tokenClick);
assert.equal(r.out, "processed");
assert.equal(r.row.profile_id, B, "token's ambassador credited");

// 2. Cart code backed by its Apply click: credited, the Apply click is reused.
const applied = await apply("AAAA1111");
let before = await clicks();
r = await order({ code: "AAAA1111" });
assert.equal(r.out, "processed");
assert.equal(r.row.profile_id, A);
assert.equal(String(r.row.click_id), String(applied), "the Apply click is the one used");
assert.equal(await clicks(), before, "no extra click");

// Typed straight into the hidden attribute (no Apply click for that code): nothing.
r = await order({ code: "BBBB2222" });
assert.equal(r.out, "ignored: no referral");
// Apply click from a different visitor: nothing.
r = await order({ code: "AAAA1111", ip_hash: await hashIp("198.51.100.1", KEY) });
assert.equal(r.out, "ignored: no referral");
// No browser IP on the order: can't be matched, nothing.
r = await order({ code: "AAAA1111", ip_hash: null });
assert.equal(r.out, "ignored: no referral");
// Unknown code.
r = await order({ code: "ZZZZ9999" });
assert.equal(r.out, "ignored: no referral");
// Suspended ambassador's code, even with an earlier Apply click.
await apply("SSSS3333");
await db.exec(
  `update public.affiliate_memberships set status = 'suspended' where profile_id = '${S}'`,
);
r = await order({ code: "SSSS3333" });
assert.equal(r.out, "ignored: no referral");
// Forged/expired token arrives as no click id and no code: nothing.
r = await order({});
assert.equal(r.out, "ignored: no referral");

// 3. Ambassador discount code: a discount_code click with the order's IP hash and landing page.
before = await clicks();
r = await order({ discount_codes: ["XMAS10", "BBBB2222"] });
assert.equal(r.out, "processed");
assert.equal(r.row.profile_id, B);
const dc = (
  await q(
    `select source, consent, ip_hash, landing_path from public.affiliate_clicks where id = ${r.row.click_id}`,
  )
)[0];
assert.deepEqual(dc, {
  source: "discount_code",
  consent: true,
  ip_hash: ipHash,
  landing_path: "/products/hoodie",
});
assert.equal(await clicks(), before + 1);
// Same order paid again under a new webhook id reuses that click.
const again = (
  await db.query(
    "select public.ingest_shopify_event('w-again', 'orders/paid', now(), $1::jsonb, null) o",
    [JSON.stringify(r.data)],
  )
).rows[0].o;
assert.equal(again, "processed");
assert.equal(await clicks(), before + 1, "no second click for the same order");
// Same webhook delivered twice: duplicate, nothing new.
assert.equal(
  (
    await db.query(
      "select public.ingest_shopify_event('w-again', 'orders/paid', now(), $1::jsonb, null) o",
      [JSON.stringify(r.data)],
    )
  ).rows[0].o,
  "duplicate",
);
// Draft/POS order without IP or landing page: stored as null, not made up.
r = await order({ discount_codes: ["BBBB2222"], ip_hash: null, landing_path: null });
assert.equal(r.out, "processed");
assert.deepEqual(
  (
    await q(
      `select ip_hash, landing_path from public.affiliate_clicks where id = ${r.row.click_id}`,
    )
  )[0],
  { ip_hash: null, landing_path: null },
);
// Suspended or unknown discount codes: nothing.
assert.equal((await order({ discount_codes: ["SSSS3333"] })).out, "ignored: no referral");
assert.equal((await order({ discount_codes: ["NOTACODE"] })).out, "ignored: no referral");

// Self-referral check still applies on fallback paths.
await apply("AAAA1111");
r = await order({ code: "AAAA1111", email_hash: await emailHash("AMB.A@example.com ") });
assert.equal(r.row.self_referral, true);

// Only discount-code clicks may lack visit details.
await assert.rejects(
  db.query(
    `insert into public.affiliate_clicks (program_id, profile_id, landing_path, ip_hash) values ('amare', '${A}', '/', null)`,
  ),
  /visit_details/,
);
console.log("all passed");
