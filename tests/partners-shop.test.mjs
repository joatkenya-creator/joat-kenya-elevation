// Shop links (Part 3): create_partner_link accepts the programme's site or
// shop and records which. Offline (PGlite).
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
`);
for (const f of [
  "20261118100000_partner_portal_foundation.sql",
  "20261119100000_partner_onboarding.sql",
  "20261120100000_partner_tracking.sql",
  "20261127100000_partner_ambassador_codes.sql",
  "20261128100000_partner_shop_links.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const AMB = "00000000-0000-0000-0000-000000000001";
await db.exec(`
  insert into auth.users values ('${AMB}');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values ('${AMB}', 'Amb', 'KE', 'AAAA1111');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${AMB}', 'amare', 'approved'), ('${AMB}', 'joat', 'approved');
`);

async function link(dest, program = "amare") {
  try {
    let out;
    await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: AMB }),
      ]);
      await tx.exec("set local role authenticated");
      const r = await tx.query("select public.create_partner_link($1, $2) c", [program, dest]);
      out = r.rows[0].c;
    });
    return out;
  } catch (e) {
    return `ERR ${e.message}`;
  }
}
const stored = async (code) =>
  (
    await db.query(
      `select destination_host h, destination_path p from public.affiliate_links where code = '${code}'`,
    )
  ).rows[0];

assert.equal(
  (await db.query("select shop_url from public.affiliate_programs where id = 'amare'")).rows[0]
    .shop_url,
  "https://amares-big-planet.myshopify.com",
);
assert.equal(
  (await db.query("select shop_url from public.affiliate_programs where id = 'joat'")).rows[0]
    .shop_url,
  null,
);

assert.deepEqual(
  await stored(await link("https://amares-big-planet.myshopify.com/products/hoodie")),
  { h: "shop", p: "/products/hoodie" },
);
assert.deepEqual(
  await stored(await link("https://www.amares-big-planet.myshopify.com/collections/xmas")),
  { h: "shop", p: "/collections/xmas" },
);
assert.deepEqual(await stored(await link("https://amares-big-planet.myshopify.com")), {
  h: "shop",
  p: "/",
});
assert.deepEqual(await stored(await link("https://amaresbigplanet.com/articles")), {
  h: "site",
  p: "/articles",
});
assert.deepEqual(await stored(await link("/donate")), { h: "site", p: "/donate" });
// Same path on site and shop are different links.
assert.deepEqual(await stored(await link("https://amaresbigplanet.com/")), { h: "site", p: "/" });
assert.match(await link("https://amares-big-planet.myshopify.com/products/hoodie"), /link_exists/);

for (const bad of [
  "https://other.myshopify.com/products/x",
  "https://amares-big-planet.myshopify.com.evil.com/x",
  "https://amares-big-planet.myshopify.com//evil.com",
  "https://amares-big-planet.myshopify.com/x?abp_ref=forged",
  "https://amares-big-planet.myshopify.com/x?ref=OTHER123",
  "javascript:alert(1)",
])
  assert.match(await link(bad), /invalid_destination/, bad);
// JOAT has no shop: its links still only go to joatkenya.com.
assert.match(
  await link("https://amares-big-planet.myshopify.com/x", "joat"),
  /invalid_destination/,
);
assert.deepEqual(await stored(await link("https://joatkenya.com/services", "joat")), {
  h: "site",
  p: "/services",
});
console.log("all passed");
