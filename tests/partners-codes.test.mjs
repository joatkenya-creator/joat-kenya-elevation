// Ambassador codes (Part 2): normalising typed codes, the "Referred by" lookup,
// its guessing limit, and code clicks. Offline (PGlite).
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { normaliseCode } from "../supabase/functions/_shared/referral.js";

// ─── Normalising ──────────────────────────────────────────────────────────────
assert.equal(normaliseCode(" 98nxcr22 "), "98NXCR22");
assert.equal(normaliseCode("98NX-CR22"), "98NXCR22");
assert.equal(normaliseCode("O1LIABCD"), "0111ABCD", "O→0, I/L→1");
assert.equal(normaliseCode("98NXCR2"), null, "too short");
assert.equal(normaliseCode("98NXCR2U"), null, "U is not Crockford");
assert.equal(normaliseCode(12345678), null);
assert.equal(normaliseCode("x".repeat(100)), null);

// ─── Database ─────────────────────────────────────────────────────────────────
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
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
await db.exec(`
  insert into auth.users values ('${id(1)}'), ('${id(2)}'), ('${id(3)}');
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${id(1)}', '  Erick Peterson Otieno ', 'KE', 'AAAA1111'),
    ('${id(2)}', 'Madonna', 'US', 'BBBB2222'),
    ('${id(3)}', 'Suspended Person', 'US', 'CCCC3333');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${id(1)}', 'amare', 'approved'), ('${id(2)}', 'amare', 'approved'),
    ('${id(2)}', 'joat', 'pending'), ('${id(3)}', 'amare', 'suspended');
`);
const one = async (sql, role = "service_role") => {
  try {
    let v;
    await db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      const r = await tx.query(sql);
      v = r.rows[0] ? Object.values(r.rows[0])[0] : null;
    });
    return v;
  } catch (e) {
    return `ERR ${e.message}`;
  }
};
const lookup = (code, ip = "ip-1", program = "amare") =>
  one(`select public.lookup_ambassador('${program}', '${code}', '${ip}')`);

assert.equal(await lookup("AAAA1111"), "Erick O.", "first name + last initial only");
assert.equal(await lookup("BBBB2222"), "Madonna", "single name");
assert.equal(await lookup("BBBB2222", "ip-1", "joat"), null, "pending in that programme");
assert.equal(await lookup("CCCC3333"), null, "suspended");
assert.equal(await lookup("ZZZZ9999"), null, "unknown");

// Browsers can't call any of it.
for (const role of ["anon", "authenticated"]) {
  assert.match(
    String(await one(`select public.lookup_ambassador('amare', 'AAAA1111', 'x')`, role)),
    /permission denied/,
  );
  assert.match(
    String(
      await one(
        `select * from public.record_partner_code_click('amare', 'AAAA1111', 'code_site', '/', 'x')`,
        role,
      ),
    ),
    /permission denied/,
  );
}

// Guessing: 20 failures in an hour lock the visitor out, even for a valid code.
for (let i = 0; i < 19; i++) await lookup(`ZZZZ${String(1000 + i)}`.slice(0, 8), "guesser");
assert.equal(await lookup("AAAA1111", "guesser"), "Erick O.", "under the limit still works");
await lookup("ZZZZ0001", "guesser"); // 20th failure
assert.equal(await lookup("AAAA1111", "guesser"), null, "locked out after 20 failures");
assert.equal(await lookup("AAAA1111", "someone-else"), "Erick O.", "other visitors unaffected");
// Successful lookups don't count towards the limit.
for (let i = 0; i < 30; i++) await lookup("AAAA1111", "busy-school");
assert.equal(await lookup("AAAA1111", "busy-school"), "Erick O.");

// ─── Code clicks ──────────────────────────────────────────────────────────────
const codeClick = (code, source = "code_site", ip = "ip-2") =>
  db.query(
    `select * from public.record_partner_code_click('amare', '${code}', '${source}', '/', '${ip}')`,
  );
const r = (await codeClick("AAAA1111")).rows[0];
assert.equal(r.display_name, "Erick O.");
assert.equal(r.window_days, 30);
const row = (
  await db.query(
    `select source, consent, profile_id from public.affiliate_clicks where id = ${r.click_id}`,
  )
).rows[0];
assert.deepEqual(row, { source: "code_site", consent: true, profile_id: id(1) });
assert.equal((await codeClick("BBBB2222", "code_cart")).rows[0].display_name, "Madonna");
assert.equal((await codeClick("CCCC3333")).rows.length, 0, "suspended code records nothing");
assert.match(
  String(
    await one(
      `select * from public.record_partner_code_click('amare', 'AAAA1111', 'link', '/', 'x')`,
    ),
  ),
  /invalid_source/,
);
assert.match(
  String(
    await one(
      `select * from public.record_partner_code_click('amare', 'AAAA1111', 'discount_code', '/', 'x')`,
    ),
  ),
  /invalid_source/,
);

// Existing link clicks default to source 'link'.
await db.query(
  `select * from public.record_partner_click('amare', 'AAAA1111', null, '/', '{}', null, 'ip-3', false)`,
);
assert.equal(
  (await db.query(`select source from public.affiliate_clicks where ip_hash = 'ip-3'`)).rows[0]
    .source,
  "link",
);
await assert.rejects(
  db.query(
    `insert into public.affiliate_clicks (program_id, profile_id, landing_path, ip_hash, source) values ('amare', '${id(1)}', '/', 'x', 'bogus')`,
  ),
  /check constraint/,
);
console.log("all passed");
