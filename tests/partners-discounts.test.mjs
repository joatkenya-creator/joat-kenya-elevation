// Ambassador discount codes (Part 6): off by default, super admin only, and
// the sync plan creates for approved ambassadors and switches off the rest.
// Offline (PGlite). The Shopify calls themselves aren't run here.
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
  "20261201100000_partner_ambassador_discounts.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [A, B, P, SUPER, MGR] = [1, 2, 3, 4, 5].map(id);
await db.exec(`
  insert into auth.users values ('${A}'), ('${B}'), ('${P}'), ('${SUPER}'), ('${MGR}');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${A}', 'A', 'KE', 'AAAA1111'), ('${B}', 'B', 'KE', 'BBBB2222'), ('${P}', 'P', 'KE', 'PPPP3333');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${A}', 'amare', 'approved'), ('${B}', 'amare', 'approved'), ('${P}', 'amare', 'pending');
  insert into public.partner_staff (user_id, role, program_id) values
    ('${SUPER}', 'super_admin', null), ('${MGR}', 'program_manager', 'amare');
`);

async function run(sql, sub, { aal = "aal2", role = "authenticated" } = {}) {
  try {
    let rows;
    await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        sub ? JSON.stringify({ sub, aal }) : "",
      ]);
      await tx.exec(`set local role ${role}`);
      rows = (await tx.query(sql)).rows;
    });
    return rows;
  } catch (e) {
    return `ERR ${e.message}`;
  }
}
const setPct = (pct, who = SUPER, opts) =>
  run(`select public.set_program_discount_percent('amare', ${pct})`, who, opts);
const plan = async (who = SUPER) => {
  const r = await run("select * from public.discount_sync_plan('amare') order by code", who);
  return typeof r === "string" ? r : r.map((x) => [x.code, x.want_active, x.shopify_id, x.active]);
};

// Off by default.
assert.equal(
  (
    await db.query(
      "select ambassador_discount_percent p from public.affiliate_programs where id = 'amare'",
    )
  ).rows[0].p,
  null,
);
assert.deepEqual(await plan(), [
  ["AAAA1111", false, null, null],
  ["BBBB2222", false, null, null],
]);

// Only a super admin with MFA.
assert.match(await setPct(10, MGR), /not_authorised/);
assert.match(await setPct(10, SUPER, { aal: "aal1" }), /not_authorised/);
assert.match(await plan(MGR), /not_authorised/);
assert.match(
  String(await run("select * from public.ambassador_discount_codes", SUPER)),
  /permission denied/,
);
assert.match(
  String(
    await run(`select public.record_discount_sync('amare', '${A}', 'X', 'gid', 10, true)`, SUPER),
  ),
  /permission denied/,
);
assert.match(await setPct(0), /invalid_percent/);
assert.match(await setPct(100), /invalid_percent/);
assert.match(
  String(await run("select public.set_program_discount_percent('joat', 10)", SUPER)),
  /no_shop/,
);

// On: approved ambassadors get codes; pending doesn't.
assert.deepEqual(await setPct(10), [{ set_program_discount_percent: "" }]);
assert.deepEqual(await plan(), [
  ["AAAA1111", true, null, null],
  ["BBBB2222", true, null, null],
]);
assert.equal(
  (
    await db.query(
      "select count(*)::int n from public.partner_audit_log where action = 'program.discount_set'",
    )
  ).rows[0].n,
  1,
);

// After a sync, B is suspended: B's code is to be switched off.
await db.exec(`
  select public.record_discount_sync('amare', '${A}', 'AAAA1111', 'gid://A', 10, true);
  select public.record_discount_sync('amare', '${B}', 'BBBB2222', 'gid://B', 10, true);
  update public.affiliate_memberships set status = 'suspended' where profile_id = '${B}';
`);
assert.deepEqual(await plan(), [
  ["AAAA1111", true, "gid://A", true],
  ["BBBB2222", false, "gid://B", true],
]);

// Turned off again: every code is to be switched off.
await setPct("null");
assert.deepEqual(await plan(), [
  ["AAAA1111", false, "gid://A", true],
  ["BBBB2222", false, "gid://B", true],
]);
console.log("all passed");
