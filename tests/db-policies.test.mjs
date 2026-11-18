// Database policy regression tests. Applies the real migrations to an
// in-process Postgres (PGlite) set up like Supabase (anon/authenticated roles,
// default table grants, auth.uid()), then tries what an attacker would.
// Runs offline as part of `npm run test:security`; touches no real database.
// `node tests/db-policies.test.mjs old` leaves the newest migrations out, to
// show the pre-fix schema failing.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const MIG = "supabase/migrations";
const OLD = process.argv[2] === "old";
const db = new PGlite();
// Minimal Supabase stand-in: roles, default grants, auth.uid(), storage tables.
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, metadata jsonb);
  alter table storage.objects enable row level security;
  create table public.applications (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), name text, email text);
  insert into auth.users values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
`);
const files = [
  "20260529160000_contact_submissions.sql",
  "20260529170000_seo_content_tables.sql",
  "20260610140000_lock_down_applications_reads.sql",
  "20260707100000_course_students.sql",
  "20260707120000_course_students_status.sql",
  "20260902100000_consultation_bookings.sql",
];
if (!OLD)
  files.push(
    "20261002100000_lock_down_contact_attachments_listing.sql",
    "20261002110000_tighten_course_students_and_bookings.sql",
    "20261007100000_rate_limit_public_forms.sql",
  );
for (const f of files) await db.exec(readFileSync(`${MIG}/${f}`, "utf8"));
console.log(
  OLD ? "(schema as currently live: new migrations NOT applied)\n" : "(all migrations applied)\n",
);

const U1 = "11111111-1111-1111-1111-111111111111";
const U2 = "22222222-2222-2222-2222-222222222222";
async function as(role, sql, { sub = "", ip } = {}) {
  try {
    await db.transaction(async (tx) => {
      const headers = ip ? { "cf-connecting-ip": ip, "x-forwarded-for": "1.2.3.4" } : {};
      await tx.query(
        "select set_config('request.jwt.claim.sub', $1, true), set_config('request.headers', $2, true)",
        [sub, JSON.stringify(headers)],
      );
      await tx.exec(`set local role ${role}; ${sql}`);
    });
    return "ok";
  } catch (e) {
    return `ERR ${e.code} ${e.message.slice(0, 60)}`;
  }
}
let fails = 0;
const expect = (label, got, want) => {
  const ok = want === "ok" ? got === "ok" : got.startsWith("ERR");
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  -> ${got}`);
};
const contact =
  "insert into public.contact_submissions (first_name,last_name,email,service_area,message) values ('a','b','c@d.e','x','hello there')";
const booking = ({
  status = "'requested'",
  when = "now() + interval '3 days'",
  details = "'details text here'",
} = {}) =>
  `insert into public.consultation_bookings (duration_minutes,start_at,client_timezone,full_name,email,phone,country,details,status)
   values (60, ${when} + (random() * interval '20 days'), 'Africa/Nairobi','n','e@x.y','0700','KE',${details},${status})`;
const student = (id, extraCol = "", extraVal = "") =>
  `insert into public.course_students (id,full_name,phone,registrant_type,tier,payment_preference${extraCol})
   values ('${id}','a','1','student','builder','full'${extraVal})`;

console.log("— consultation_bookings policy");
expect("anon books status=confirmed", await as("anon", booking({ status: "'confirmed'" })), "err");
expect(
  "anon books in the past",
  await as("anon", booking({ when: "now() - interval '30 days'" })),
  "err",
);
expect(
  "anon books 200 days ahead",
  await as("anon", booking({ when: "now() + interval '200 days'" })),
  "err",
);
expect(
  "anon books with 5000-char details",
  await as("anon", booking({ details: "repeat('x',5000)" })),
  "err",
);
expect("anon books a valid slot", await as("anon", booking()), "ok");

console.log("— course_students column grants");
expect(
  "student inserts own row with status=completed",
  await as("authenticated", student(U1, ",status", ",'completed'"), { sub: U1 }),
  "err",
);
expect(
  "student inserts own row normally",
  await as("authenticated", student(U1), { sub: U1 }),
  "ok",
);
expect(
  "student inserts a row for someone else",
  await as("authenticated", student(U2), { sub: U1 }),
  "err",
);
expect(
  "student sets own status=completed",
  await as(
    "authenticated",
    `update public.course_students set status='completed' where id='${U1}'`,
    { sub: U1 },
  ),
  "err",
);
expect(
  "student changes own tier",
  await as("authenticated", `update public.course_students set tier='pro' where id='${U1}'`, {
    sub: U1,
  }),
  "err",
);
expect(
  "student edits own phone",
  await as("authenticated", `update public.course_students set phone='0711' where id='${U1}'`, {
    sub: U1,
  }),
  "ok",
);
expect(
  "student reads own row",
  await as("authenticated", `select * from public.course_students where id='${U1}'`, { sub: U1 }),
  "ok",
);

if (!OLD) {
  console.log("— rate limits");
  let r = [];
  for (let i = 0; i < 10; i++) r.push(await as("anon", contact, { ip: "203.0.113.9" }));
  expect(
    "10 contact submissions from one IP",
    r.every((x) => x === "ok") ? "ok" : r.join(" | "),
    "ok",
  );
  expect(
    "11th contact submission from same IP",
    await as("anon", contact, { ip: "203.0.113.9" }),
    "err",
  );
  expect("contact from a different IP", await as("anon", contact, { ip: "198.51.100.7" }), "ok");
  expect("contact with no client-IP header (team / SQL editor)", await as("anon", contact), "ok");
  r = [];
  for (let i = 0; i < 3; i++) r.push(await as("anon", booking(), { ip: "203.0.113.50" }));
  expect("3 bookings from one IP", r.every((x) => x === "ok") ? "ok" : r.join(" | "), "ok");
  expect("4th booking from same IP", await as("anon", booking(), { ip: "203.0.113.50" }), "err");
  await db.exec(
    "update private.form_rate_limits set at = now() - interval '2 hours' where ip = '203.0.113.50'",
  );
  expect(
    "same IP again once the hour has passed",
    await as("anon", booking(), { ip: "203.0.113.50" }),
    "ok",
  );
  expect(
    "anon reads the rate-limit table",
    await as("anon", "select * from private.form_rate_limits"),
    "err",
  );
  for (let i = 0; i < 5; i++)
    await as("anon", `insert into public.newsletter_subscribers (email) values ('n${i}@x.y')`, {
      ip: "203.0.113.77",
    });
  expect(
    "6th newsletter signup from one IP",
    await as("anon", "insert into public.newsletter_subscribers (email) values ('n9@x.y')", {
      ip: "203.0.113.77",
    }),
    "err",
  );
  r = [];
  for (let i = 0; i < 11; i++)
    r.push(
      await as("anon", "insert into public.applications (name,email) values ('a','b')", {
        ip: "203.0.113.88",
      }),
    );
  expect("11th job application from one IP", r[10], "err");

  console.log("— storage");
  const b = (
    await db.query(
      "select file_size_limit, allowed_mime_types from storage.buckets where id='contact-attachments'",
    )
  ).rows[0];
  expect(
    "contact-attachments: 10 MB, PDF only",
    b.file_size_limit == 10485760 && b.allowed_mime_types?.join() === "application/pdf"
      ? "ok"
      : JSON.stringify(b),
    "ok",
  );
  const n = (
    await db.query(
      "select count(*)::int n from pg_policies where tablename='objects' and cmd='SELECT'",
    )
  ).rows[0].n;
  expect(
    "no public SELECT (listing) policy on storage.objects",
    n === 0 ? "ok" : `ERR ${n} policies`,
    "ok",
  );
}
console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
