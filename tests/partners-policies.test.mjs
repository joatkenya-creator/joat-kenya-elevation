// Partner portal access tests. Applies the Phase 1 migration to an in-process
// Postgres (PGlite) set up like Supabase, then checks who can read and write
// what. Offline; touches no real database. Runs with `npm run test:security`.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
`);
await db.exec(
  readFileSync("supabase/migrations/20261118100000_partner_portal_foundation.sql", "utf8"),
);

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [AMB1, AMB2, AMB3, SUPER, MGR_AMARE, FIN] = [1, 2, 3, 4, 5, 6].map(id);
await db.exec(`
  insert into auth.users values ${[AMB1, AMB2, AMB3, SUPER, MGR_AMARE, FIN].map((u) => `('${u}')`).join(",")};
  insert into public.affiliate_profiles (id, full_name, country) values
    ('${AMB1}', 'Amb One', 'US'), ('${AMB2}', 'Amb Two', 'US'), ('${AMB3}', 'Amb Three', 'US');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${AMB1}', 'joat', 'approved'), ('${AMB2}', 'amare', 'pending'), ('${AMB3}', 'joat', 'pending');
  insert into public.partner_staff (user_id, role, program_id) values
    ('${SUPER}', 'super_admin', null), ('${MGR_AMARE}', 'program_manager', 'amare'), ('${FIN}', 'finance', null);
`);

// Runs `sql` as `role` with the given user and MFA level. Returns the row
// count, or "ERR ..." if Postgres refused.
async function run(role, sql, { sub = "", aal = "aal1" } = {}) {
  try {
    let n = 0;
    await db.transaction(async (tx) => {
      const claims = sub ? JSON.stringify({ sub, aal, role }) : "";
      await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
      await tx.exec(`set local role ${role}`);
      const r = await tx.query(sql);
      n = r.affectedRows || r.rows.length;
    });
    return n;
  } catch (e) {
    return `ERR ${e.message.slice(0, 70)}`;
  }
}
let fails = 0;
const expect = (label, got, want) => {
  const ok = want === "err" ? String(got).startsWith("ERR") : got === want;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  -> ${got}`);
};
const amb = (sub) => ({ sub, aal: "aal1" });
const staff = (sub, aal = "aal2") => ({ sub, aal });

console.log("— programmes");
expect("anon reads programmes", await run("anon", "select * from public.affiliate_programs"), 2);
expect(
  "anon creates a programme",
  await run("anon", "insert into public.affiliate_programs (id,name) values ('x','X')"),
  "err",
);
expect(
  "ambassador opens applications",
  await run(
    "authenticated",
    "update public.affiliate_programs set accepting_applications = true",
    amb(AMB1),
  ),
  "err",
);
expect(
  "no attribution model is active by default",
  (
    await db.query(
      "select count(*)::int n from public.affiliate_programs where attribution_model is not null",
    )
  ).rows[0].n,
  0,
);

console.log("— ambassador isolation");
expect("anon reads profiles", await run("anon", "select * from public.affiliate_profiles"), "err");
expect(
  "anon reads memberships",
  await run("anon", "select * from public.affiliate_memberships"),
  "err",
);
expect(
  "ambassador sees only own profile",
  await run("authenticated", "select * from public.affiliate_profiles", amb(AMB1)),
  1,
);
expect(
  "ambassador reads another ambassador by id",
  await run(
    "authenticated",
    `select * from public.affiliate_profiles where id='${AMB2}'`,
    amb(AMB1),
  ),
  0,
);
expect(
  "ambassador sees only own memberships",
  await run("authenticated", "select * from public.affiliate_memberships", amb(AMB1)),
  1,
);
expect(
  "ambassador edits own name",
  await run(
    "authenticated",
    `update public.affiliate_profiles set full_name='New' where id='${AMB1}'`,
    amb(AMB1),
  ),
  1,
);
expect(
  "ambassador edits another ambassador's name",
  await run(
    "authenticated",
    `update public.affiliate_profiles set full_name='X' where id='${AMB2}'`,
    amb(AMB1),
  ),
  0,
);
expect(
  "ambassador changes own referral code",
  await run(
    "authenticated",
    `update public.affiliate_profiles set public_code='AAAAAAAA' where id='${AMB1}'`,
    amb(AMB1),
  ),
  "err",
);
expect(
  "ambassador approves own membership",
  await run(
    "authenticated",
    `update public.affiliate_memberships set status='approved' where profile_id='${AMB2}'`,
    amb(AMB2),
  ),
  "err",
);
expect(
  "ambassador joins a programme directly",
  await run(
    "authenticated",
    `insert into public.affiliate_memberships (profile_id, program_id) values ('${AMB1}','amare')`,
    amb(AMB1),
  ),
  "err",
);
expect(
  "ambassador creates a profile directly",
  await run(
    "authenticated",
    `insert into public.affiliate_profiles (id, full_name, country) values ('${AMB1}','x','US')`,
    amb(AMB1),
  ),
  "err",
);

console.log("— staff roles");
expect(
  "ambassador makes self super admin",
  await run(
    "authenticated",
    `insert into public.partner_staff (user_id, role) values ('${AMB1}','super_admin')`,
    amb(AMB1),
  ),
  "err",
);
expect(
  "ambassador reads staff list",
  await run("authenticated", "select * from public.partner_staff", amb(AMB1)),
  0,
);
expect(
  "super admin without MFA sees only own staff row",
  await run("authenticated", "select * from public.partner_staff", staff(SUPER, "aal1")),
  1,
);
expect(
  "super admin without MFA reads profiles",
  await run("authenticated", "select * from public.affiliate_profiles", staff(SUPER, "aal1")),
  0,
);
expect(
  "super admin with MFA reads all profiles",
  await run("authenticated", "select * from public.affiliate_profiles", staff(SUPER)),
  3,
);
expect(
  "super admin with MFA reads all staff",
  await run("authenticated", "select * from public.partner_staff", staff(SUPER)),
  3,
);
expect(
  "super admin approves membership from the browser",
  await run(
    "authenticated",
    `update public.affiliate_memberships set status='approved' where profile_id='${AMB2}'`,
    staff(SUPER),
  ),
  "err",
);
expect(
  "Amare manager sees only Amare memberships",
  await run("authenticated", "select * from public.affiliate_memberships", staff(MGR_AMARE)),
  1,
);
expect(
  "Amare manager sees only profiles in Amare",
  await run("authenticated", "select * from public.affiliate_profiles", staff(MGR_AMARE)),
  1,
);
expect(
  "Amare manager reads JOAT ambassador by id",
  await run(
    "authenticated",
    `select * from public.affiliate_profiles where id='${AMB1}'`,
    staff(MGR_AMARE),
  ),
  0,
);
expect(
  "finance (global) reads all memberships",
  await run("authenticated", "select * from public.affiliate_memberships", staff(FIN)),
  3,
);
expect(
  "manager role without a programme is rejected",
  await run(
    "postgres",
    `insert into public.partner_staff (user_id, role) values ('${AMB3}','program_manager')`,
  ),
  "err",
);

console.log("— referral codes");
const codes = (
  await db.query("select private.new_public_code() c from generate_series(1, 2000)")
).rows.map((r) => r.c);
expect(
  "codes are 8 chars of Crockford base32",
  codes.every((c) => /^[0-9A-HJKMNP-TV-Z]{8}$/.test(c))
    ? "ok"
    : codes.find((c) => !/^[0-9A-HJKMNP-TV-Z]{8}$/.test(c)),
  "ok",
);
expect("2000 codes are all distinct", new Set(codes).size, 2000);
expect(
  "authenticated users cannot mint codes",
  await run("authenticated", "select private.new_public_code()", amb(AMB1)),
  "err",
);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
