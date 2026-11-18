// Partner onboarding tests (Phase 2): applications, staff review, withdrawal,
// opening programmes and the append-only activity log. Applies the real
// migrations to an in-process Postgres (PGlite) set up like Supabase. Offline.
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
for (const f of [
  "20261118100000_partner_portal_foundation.sql",
  "20261119100000_partner_onboarding.sql",
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [A1, A2, SUPER, MGR_AMARE, MGR_JOAT, SUPPORT] = [1, 2, 3, 4, 5, 6].map(id);
await db.exec(`
  insert into auth.users values ${[A1, A2, SUPER, MGR_AMARE, MGR_JOAT, SUPPORT].map((u) => `('${u}')`).join(",")};
  insert into public.partner_staff (user_id, role, program_id) values
    ('${SUPER}', 'super_admin', null), ('${MGR_AMARE}', 'program_manager', 'amare'),
    ('${MGR_JOAT}', 'program_manager', 'joat'), ('${SUPPORT}', 'support', null);
`);

// Runs `sql` as `role` for user `sub` at MFA level `aal`. Returns the first
// column of the first row, the row count, or "ERR <message>".
async function run(sql, { sub = "", aal = "aal1", role = "authenticated" } = {}) {
  try {
    let out;
    await db.transaction(async (tx) => {
      const claims = sub ? JSON.stringify({ sub, aal }) : "";
      await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
      await tx.exec(`set local role ${role}`);
      const r = await tx.query(sql);
      out =
        r.rows.length === 1 && r.fields.length === 1
          ? Object.values(r.rows[0])[0]
          : r.affectedRows || r.rows.length;
    });
    return out === undefined || out === "" ? "ok" : out; // void functions return ""
  } catch (e) {
    return `ERR ${e.message.slice(0, 70)}`;
  }
}
let fails = 0;
const expect = (label, got, want) => {
  const ok =
    want === "err"
      ? String(got).startsWith("ERR")
      : want instanceof RegExp
        ? want.test(String(got))
        : got === want;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  -> ${got}`);
};
const amb = (sub) => ({ sub });
const staff = (sub, aal = "aal2") => ({ sub, aal });
const apply = ({
  programs = "array['amare']",
  name = "'Ann Applicant'",
  links = "array['https://instagram.com/ann']",
  website = "null",
  terms = "true",
} = {}) =>
  `select public.submit_partner_application(${programs}, ${name}, 'US', ${links}, ${website}, 'Parents', 'Blog', 'Kids learning', ${terms})`;
const review = (profile, program, status, reason = "null") =>
  `select public.review_partner_membership('${profile}', '${program}', '${status}', ${reason})`;
const status = async (profile, program) =>
  (
    await db.query(
      `select status from public.affiliate_memberships where profile_id='${profile}' and program_id='${program}'`,
    )
  ).rows[0]?.status ?? "none";

console.log("— opening applications");
expect("applying while programmes are closed", await run(apply(), amb(A1)), /programme_closed/);
expect(
  "ambassador opens a programme",
  await run("select public.set_partner_program_accepting('amare', true)", amb(A1)),
  /not_authorised/,
);
expect(
  "manager opens a programme",
  await run("select public.set_partner_program_accepting('amare', true)", staff(MGR_AMARE)),
  /not_authorised/,
);
expect(
  "super admin without MFA opens a programme",
  await run("select public.set_partner_program_accepting('amare', true)", staff(SUPER, "aal1")),
  /not_authorised/,
);
expect(
  "super admin opens Amare",
  await run("select public.set_partner_program_accepting('amare', true)", staff(SUPER)),
  "ok",
);
await run("select public.set_partner_program_accepting('joat', true)", staff(SUPER));

console.log("— submitting");
expect("anon applies", await run(apply(), { role: "anon" }), "err");
expect(
  "without accepting the terms",
  await run(apply({ terms: "false" }), amb(A1)),
  /terms_not_accepted/,
);
expect(
  "with no programme",
  await run(apply({ programs: "array[]::text[]" }), amb(A1)),
  /no_programme/,
);
expect(
  "to an unknown programme",
  await run(apply({ programs: "array['nope']" }), amb(A1)),
  /programme_closed/,
);
expect(
  "with a javascript: link",
  await run(apply({ links: "array['javascript:alert(1)']" }), amb(A1)),
  /invalid_link/,
);
expect("with a bad website", await run(apply({ website: "'not a url'" }), amb(A1)), /invalid_link/);
expect("with a blank name", await run(apply({ name: "'   '" }), amb(A1)), /invalid_name/);
expect("valid application to Amare", await run(apply(), amb(A1)), /^[0-9a-f-]{36}$/);
expect("membership is pending", await status(A1, "amare"), "pending");
expect(
  "profile was created with a referral code",
  (await db.query(`select public_code from public.affiliate_profiles where id='${A1}'`)).rows[0]
    ?.public_code?.length,
  8,
);
expect("duplicate application to Amare", await run(apply(), amb(A1)), /already_applied/);
expect(
  "applying to both when already in one",
  await run(apply({ programs: "array['amare','joat']" }), amb(A1)),
  /already_applied/,
);
expect(
  "second applicant applies to both",
  await run(apply({ programs: "array['joat','amare']" }), amb(A2)),
  /^[0-9a-f-]{36}$/,
);

console.log("— who sees applications");
expect(
  "applicant sees only own applications",
  await run("select count(*)::int from public.affiliate_applications", amb(A1)),
  1,
);
expect(
  "Amare manager sees Amare applications",
  await run("select count(*)::int from public.affiliate_applications", staff(MGR_AMARE)),
  2,
);
expect(
  "JOAT manager sees only the JOAT application",
  await run("select count(*)::int from public.affiliate_applications", staff(MGR_JOAT)),
  1,
);
expect(
  "support sees all",
  await run("select count(*)::int from public.affiliate_applications", staff(SUPPORT)),
  2,
);
expect(
  "applicant inserts an application directly",
  await run(
    `insert into public.affiliate_applications (user_id, programs, full_name, country, accepted_terms_version) values ('${A1}', '{amare}', 'x', 'US', 'v')`,
    amb(A1),
  ),
  "err",
);

console.log("— review");
expect(
  "applicant approves self",
  await run(review(A1, "amare", "approved"), amb(A1)),
  /not_authorised/,
);
expect(
  "JOAT manager approves an Amare membership",
  await run(review(A1, "amare", "approved"), staff(MGR_JOAT)),
  /not_authorised/,
);
expect(
  "support approves",
  await run(review(A1, "amare", "approved"), staff(SUPPORT)),
  /not_authorised/,
);
expect(
  "Amare manager without MFA approves",
  await run(review(A1, "amare", "approved"), staff(MGR_AMARE, "aal1")),
  /not_authorised/,
);
expect(
  "reject without a reason",
  await run(review(A1, "amare", "rejected"), staff(MGR_AMARE)),
  /reason_required/,
);
expect(
  "pending straight to suspended",
  await run(review(A1, "amare", "suspended", "'x'"), staff(MGR_AMARE)),
  /invalid_transition/,
);
expect(
  "Amare manager approves",
  await run(review(A1, "amare", "approved"), staff(MGR_AMARE)),
  "ok",
);
expect("membership is approved", await status(A1, "amare"), "approved");
expect(
  "approve again",
  await run(review(A1, "amare", "approved"), staff(MGR_AMARE)),
  /invalid_transition/,
);
expect(
  "suspend with a reason",
  await run(review(A1, "amare", "suspended", "'Undisclosed promotion'"), staff(MGR_AMARE)),
  "ok",
);
expect(
  "suspended ambassador withdraws to escape",
  await run("select public.withdraw_partner_membership('amare')", amb(A1)),
  /nothing_to_withdraw/,
);
expect("reinstate", await run(review(A1, "amare", "approved"), staff(MGR_AMARE)), "ok");
expect(
  "JOAT manager rejects A2 for JOAT",
  await run(review(A2, "joat", "rejected", "'Audience mismatch'"), staff(MGR_JOAT)),
  "ok",
);
expect("A2 still pending for Amare", await status(A2, "amare"), "pending");
expect(
  "rejected applicant can re-apply",
  await run(apply({ programs: "array['joat']" }), amb(A2)),
  /^[0-9a-f-]{36}$/,
);
expect("re-application is pending again", await status(A2, "joat"), "pending");
expect(
  "staff member who is also an ambassador reviews self",
  await (async () => {
    await db.exec(
      `insert into public.partner_staff (user_id, role, program_id) values ('${A2}', 'program_manager', 'amare')`,
    );
    return run(review(A2, "amare", "approved"), staff(A2));
  })(),
  /cannot_review_self/,
);

console.log("— withdraw");
expect(
  "ambassador withdraws from Amare",
  await run("select public.withdraw_partner_membership('amare')", amb(A1)),
  "ok",
);
expect("membership is withdrawn", await status(A1, "amare"), "withdrawn");
expect(
  "withdraw again",
  await run("select public.withdraw_partner_membership('amare')", amb(A1)),
  /nothing_to_withdraw/,
);

console.log("— rate limit");
expect("second application today", await run(apply(), amb(A1)), /^[0-9a-f-]{36}$/);
await run("select public.withdraw_partner_membership('amare')", amb(A1));
expect(
  "fourth application today",
  await (async () => {
    await run(apply(), amb(A1)); // 3rd
    await run("select public.withdraw_partner_membership('amare')", amb(A1));
    return run(apply(), amb(A1)); // 4th
  })(),
  /too_many_applications/,
);

console.log("— activity log");
const logCount = (await db.query("select count(*)::int n from public.partner_audit_log")).rows[0].n;
expect("actions were logged", logCount > 10 ? "ok" : `ERR only ${logCount}`, "ok");
expect(
  "ambassador reads the log",
  await run("select count(*)::int from public.partner_audit_log", amb(A1)),
  0,
);
expect(
  "Amare manager reads only Amare entries",
  await run(
    "select count(*)::int from public.partner_audit_log where program_id <> 'amare' or program_id is null",
    staff(MGR_AMARE),
  ),
  0,
);
expect(
  "super admin edits the log",
  await run("update public.partner_audit_log set action='x'", staff(SUPER)),
  "err",
);
expect(
  "even the database owner can't edit the log",
  await run("update public.partner_audit_log set action='x'", { role: "postgres" }),
  /append-only/,
);
expect(
  "even the database owner can't delete from the log",
  await run("delete from public.partner_audit_log", { role: "postgres" }),
  /append-only/,
);
expect(
  "rejection reason is recorded",
  (
    await db.query(
      "select details->>'reason' r from public.partner_audit_log where action='membership.rejected'",
    )
  ).rows[0]?.r,
  "Audience mismatch",
);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
