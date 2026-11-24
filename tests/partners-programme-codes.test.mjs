// One referral code per programme: ambassadors in both programmes get two
// codes, each crediting only its programme; codes already shared keep working.
// Offline (PGlite).
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";

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
`);
const run = (f) => db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));
for (const f of [
  "20260529160000_contact_submissions.sql",
  "20260902100000_consultation_bookings.sql",
  "20261118100000_partner_portal_foundation.sql",
  "20261119100000_partner_onboarding.sql",
  "20261120100000_partner_tracking.sql",
  "20261121100000_partner_conversions.sql",
  "20261122100000_partner_commissions.sql",
])
  await run(f);

// Live-like data before the migration: DUAL is in both programmes, SOLO in JOAT only.
const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [DUAL, SOLO, LATE] = [1, 2, 3].map(id);
await db.exec(`
  insert into auth.users values ('${DUAL}', 'd@x.y'), ('${SOLO}', 's@x.y'), ('${LATE}', 'l@x.y');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${DUAL}', 'Dee Dual', 'KE', 'DDDD1111'), ('${SOLO}', 'So Lo', 'KE', 'SSSS1111'), ('${LATE}', 'La Te', 'KE', 'LLLL1111');
  insert into public.affiliate_memberships (profile_id, program_id, status, created_at) values
    ('${DUAL}', 'joat', 'approved', now() - interval '2 days'), ('${DUAL}', 'amare', 'approved', now()),
    ('${SOLO}', 'joat', 'approved', now()), ('${LATE}', 'amare', 'approved', now());
`);

for (const f of [
  "20261126100000_partner_ambassador_export.sql",
  "20261127100000_partner_ambassador_codes.sql",
  "20261128100000_partner_shop_links.sql",
  "20261130100000_partner_webhook_fallbacks.sql",
  "20261201100000_partner_ambassador_discounts.sql",
  "20261202100000_partner_programme_codes.sql",
])
  await run(f);

const q = async (sql) => (await db.query(sql)).rows;
const codes = async (who) =>
  Object.fromEntries(
    (
      await q(
        `select program_id, ref_code, alias_code from public.affiliate_memberships where profile_id = '${who}'`,
      )
    ).map((r) => [r.program_id, [r.ref_code, r.alias_code]]),
  );

// Backfill.
const dual = await codes(DUAL);
assert.deepEqual(dual.amare, ["DDDD1111", null], "Amare keeps the existing code");
assert.notEqual(dual.joat[0], "DDDD1111", "JOAT gets a new code");
assert.match(dual.joat[0], /^[0-9A-HJKMNP-TV-Z]{8}$/);
assert.equal(dual.joat[1], "DDDD1111", "old code kept as JOAT alias");
assert.deepEqual((await codes(SOLO)).joat, ["SSSS1111", null], "single programme unchanged");

// Clicks: each code credits only its own programme; the shared old code still works on JOAT.
const click = async (program, code, ip) =>
  (
    await q(
      `select click_id from public.record_partner_click('${program}', '${code}', null, '/', '{}', null, '${ip}', true)`,
    )
  )[0]?.click_id;
const who = async (clickId) =>
  (await q(`select profile_id, program_id from public.affiliate_clicks where id = ${clickId}`))[0];
assert.deepEqual(await who(await click("joat", dual.joat[0], "a")), {
  profile_id: DUAL,
  program_id: "joat",
});
assert.deepEqual(await who(await click("amare", "DDDD1111", "b")), {
  profile_id: DUAL,
  program_id: "amare",
});
assert.deepEqual(
  await who(await click("joat", "dddd1111", "c")),
  { profile_id: DUAL, program_id: "joat" },
  "legacy link",
);
assert.equal(await click("amare", dual.joat[0], "d"), undefined, "JOAT code doesn't work on Amare");
assert.equal(await click("amare", "SSSS1111", "e"), undefined, "not an Amare member");

// Typed codes (website box / cart) follow the same rule.
const lookup = async (program, code) =>
  (await q(`select public.lookup_ambassador('${program}', '${code}', 'ip-z') n`))[0].n;
assert.equal(await lookup("amare", "DDDD1111"), "Dee D.");
assert.equal(await lookup("amare", dual.joat[0]), null);

// New memberships: first one gets the profile code, a second a new code (no alias).
await db.exec(
  `insert into public.affiliate_memberships (profile_id, program_id, status) values ('${SOLO}', 'amare', 'approved')`,
);
const solo = await codes(SOLO);
assert.notEqual(solo.amare[0], "SSSS1111");
assert.equal(solo.amare[1], null);
assert.equal(await click("amare", "SSSS1111", "f"), undefined, "new ambassadors get strict codes");
assert.deepEqual(await who(await click("amare", solo.amare[0], "g")), {
  profile_id: SOLO,
  program_id: "amare",
});

// Webhook: a cart code backed by its Apply click credits the right membership.
await q(
  `select * from public.record_partner_code_click('amare', 'DDDD1111', 'code_cart', '/cart', 'ip-cart')`,
);
const out = (
  await db.query(
    "select public.ingest_shopify_event('w1', 'orders/paid', now(), $1::jsonb, null) o",
    [
      JSON.stringify({
        order_id: "1",
        name: "#1",
        currency: "USD",
        created_at: new Date().toISOString(),
        lines: [{ price: "10.00", qty: 1, discounts: [], gift_card: false }],
        code: "DDDD1111",
        discount_codes: [],
        ip_hash: "ip-cart",
        landing_path: "/cart",
      }),
    ],
  )
).rows[0].o;
assert.equal(out, "processed");
assert.equal(
  (await q("select profile_id from public.shopify_orders where order_id = '1'"))[0].profile_id,
  DUAL,
);
// Discount code = the Amare code.
const out2 = (
  await db.query(
    "select public.ingest_shopify_event('w2', 'orders/paid', now(), $1::jsonb, null) o",
    [
      JSON.stringify({
        order_id: "2",
        name: "#2",
        currency: "USD",
        created_at: new Date().toISOString(),
        lines: [{ price: "10.00", qty: 1, discounts: [], gift_card: false }],
        code: null,
        discount_codes: [solo.amare[0]],
        ip_hash: null,
        landing_path: null,
      }),
    ],
  )
).rows[0].o;
assert.equal(out2, "processed");
assert.equal(
  (await q("select profile_id from public.shopify_orders where order_id = '2'"))[0].profile_id,
  SOLO,
);

// Codes are unique and always present.
await assert.rejects(
  db.query(
    `update public.affiliate_memberships set ref_code = 'DDDD1111' where profile_id = '${SOLO}' and program_id = 'joat'`,
  ),
  /unique/,
);
await assert.rejects(
  db.query(
    `update public.affiliate_memberships set ref_code = null where profile_id = '${SOLO}' and program_id = 'joat'`,
  ),
  /null/,
);
console.log("all passed");
