// Referral tracking tests (Phase 3): links, click recording, consent upgrade,
// signed tokens and landing-URL parsing. Offline (PGlite + Web Crypto).
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import {
  REF_PATTERN,
  hashIp,
  parseLanding,
  referrerDomain,
  signToken,
  verifyToken,
} from "../supabase/functions/_shared/referral.js";

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

// ─── Tokens and parsing (no database) ─────────────────────────────────────────
console.log("— tokens");
const KEY = "k".repeat(40);
const exp = Math.floor(Date.now() / 1000) + 3600;
const token = await signToken({ v: 1, k: 42, p: "amare", exp }, KEY);
expect("valid token verifies", (await verifyToken(token, KEY))?.k, 42);
expect("wrong key is rejected", await verifyToken(token, "x".repeat(40)), null);
const [body, sig] = token.split(".");
const forged = Buffer.from(JSON.stringify({ v: 1, k: 99, p: "amare", exp })).toString("base64url");
expect("edited payload is rejected", await verifyToken(`${forged}.${sig}`, KEY), null);
expect("expired token is rejected", await verifyToken(token, KEY, (exp + 1) * 1000), null);
expect("garbage is rejected", await verifyToken("not.a.token", KEY), null);
expect("empty is rejected", await verifyToken("", KEY), null);
expect(
  "same IP, same day hashes the same",
  (await hashIp("1.2.3.4", KEY)) === (await hashIp("1.2.3.4", KEY)),
  true,
);
expect(
  "same IP, next day hashes differently",
  (await hashIp("1.2.3.4", KEY, Date.now())) ===
    (await hashIp("1.2.3.4", KEY, Date.now() + 86_400_000)),
  false,
);

console.log("— landing URLs");
const SITE = "https://joatkenya.com";
expect("home page with ref", parseLanding("https://joatkenya.com/?ref=ab12cd34", SITE), {
  ref: "AB12CD34",
  linkCode: null,
  path: "/",
  utm: {},
});
expect(
  "deep link keeps other params and UTM, drops ref/ln",
  parseLanding(
    "https://www.joatkenya.com/services?x=1&ref=AB12CD34&ln=ZZ99ZZ99&utm_source=ig",
    SITE,
  ),
  {
    ref: "AB12CD34",
    linkCode: "ZZ99ZZ99",
    path: "/services?x=1&utm_source=ig",
    utm: { source: "ig" },
  },
);
expect("another site is refused", parseLanding("https://evil.com/?ref=AB12CD34", SITE), null);
expect(
  "look-alike host is refused",
  parseLanding("https://joatkenya.com.evil.com/?ref=AB12CD34", SITE),
  null,
);
expect("plain http is refused", parseLanding("http://joatkenya.com/?ref=AB12CD34", SITE), null);
expect(
  "referral code pattern rejects lookalikes",
  ["AB12CD34", "AB12CD3I", "ab12", "AB12CD34X"].map((c) => REF_PATTERN.test(c)),
  [true, false, false, false],
);
expect(
  "referrer from Instagram",
  referrerDomain("https://l.instagram.com/x", SITE),
  "l.instagram.com",
);
expect(
  "referrer from the site itself is dropped",
  referrerDomain("https://joatkenya.com/about", SITE),
  null,
);

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
])
  await db.exec(readFileSync(`supabase/migrations/${f}`, "utf8"));

const id = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const [AMB, PENDING, OTHER, MGR_JOAT, MGR_AMARE] = [1, 2, 3, 4, 5].map(id);
await db.exec(`
  insert into auth.users values ${[AMB, PENDING, OTHER, MGR_JOAT, MGR_AMARE].map((u) => `('${u}')`).join(",")};
  insert into public.affiliate_profiles (id, full_name, country, public_code) values
    ('${AMB}', 'Approved', 'US', 'AAAA1111'), ('${PENDING}', 'Pending', 'US', 'BBBB2222'), ('${OTHER}', 'Other', 'US', 'CCCC3333');
  insert into public.affiliate_memberships (profile_id, program_id, status) values
    ('${AMB}', 'joat', 'approved'), ('${PENDING}', 'joat', 'pending'), ('${OTHER}', 'amare', 'approved');
  insert into public.partner_staff (user_id, role, program_id) values
    ('${MGR_JOAT}', 'program_manager', 'joat'), ('${MGR_AMARE}', 'program_manager', 'amare');
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
    return out === "" ? "ok" : out;
  } catch (e) {
    return `ERR ${e.message.slice(0, 70)}`;
  }
}
const amb = (sub) => ({ sub });
const staff = (sub) => ({ sub, aal: "aal2" });
const link = (dest, campaign = "null", program = "joat") =>
  `select public.create_partner_link('${program}', ${dest === null ? "null" : `'${dest}'`}, ${campaign})`;
const click = ({
  ref = "AAAA1111",
  ln = "null",
  program = "joat",
  ip = "'ip-1'",
  consent = "false",
} = {}) =>
  `select click_id from public.record_partner_click('${program}', '${ref}', ${ln}, '/', '{}', null, ${ip}, ${consent})`;

console.log("— programme settings (D4)");
expect(
  "both programmes: last click, 30 days, own site",
  (
    await db.query(
      "select id, attribution_model m, attribution_window_days d, site_url s from public.affiliate_programs order by id",
    )
  ).rows,
  [
    { id: "amare", m: "last_touch", d: 30, s: "https://amaresbigplanet.com" },
    { id: "joat", m: "last_touch", d: 30, s: "https://joatkenya.com" },
  ],
);

console.log("— creating links");
expect(
  "approved ambassador links a page by path",
  await run(link("/services", "'Spring-Promo'"), amb(AMB)),
  REF_PATTERN,
);
expect("same link again", await run(link("/services", "'spring-promo'"), amb(AMB)), /link_exists/);
expect(
  "full address on the site",
  await run(link("https://joatkenya.com/contact"), amb(AMB)),
  REF_PATTERN,
);
expect(
  "www address on the site",
  await run(link("https://www.joatkenya.com/about"), amb(AMB)),
  REF_PATTERN,
);
expect(
  "stored paths",
  (
    await db.query(
      `select destination_path p, campaign c from public.affiliate_links where profile_id='${AMB}' order by p`,
    )
  ).rows,
  [
    { p: "/about", c: null },
    { p: "/contact", c: null },
    { p: "/services", c: "spring-promo" },
  ],
);
for (const [label, dest] of [
  ["another site", "https://evil.com/x"],
  ["look-alike host", "https://joatkenya.com.evil.com/x"],
  ["protocol-relative", "//evil.com"],
  ["backslash trick", "/\\\\evil.com"],
  ["javascript:", "javascript:alert(1)"],
  ["plain http", "http://joatkenya.com/x"],
  ["the other programme's site", "https://amaresbigplanet.com/"],
  ["a link that sets its own ref", "/?ref=CCCC3333"],
])
  expect(`refused: ${label}`, await run(link(dest), amb(AMB)), /invalid_destination/);
expect("bad campaign label", await run(link("/x", "'has spaces'"), amb(AMB)), /invalid_campaign/);
expect("pending applicant creates a link", await run(link("/"), amb(PENDING)), /not_approved/);
expect(
  "approved in JOAT, link for Amare",
  await run(link("/", "null", "amare"), amb(AMB)),
  /not_approved/,
);
expect("anon creates a link", await run(link("/"), { role: "anon" }), "err");
expect(
  "ambassador inserts a link directly",
  await run(
    `insert into public.affiliate_links (profile_id, program_id, destination_path) values ('${AMB}','joat','/')`,
    amb(AMB),
  ),
  "err",
);
expect(
  "ambassador sees only own links",
  await run("select count(*)::int from public.affiliate_links", amb(OTHER)),
  0,
);

console.log("— recording clicks (service role only)");
expect("anon records a click", await run(click(), { role: "anon" }), "err");
expect("signed-in user records a click", await run(click(), amb(AMB)), "err");
const firstClick = await run(click(), { role: "service_role" });
expect("valid click is recorded", typeof firstClick, "number");
expect(
  "unknown code: no click",
  await run(click({ ref: "ZZZZ9999" }), { role: "service_role" }),
  0,
);
expect(
  "pending ambassador: no click",
  await run(click({ ref: "BBBB2222" }), { role: "service_role" }),
  0,
);
expect(
  "code used on the wrong programme: no click",
  await run(click({ program: "amare" }), { role: "service_role" }),
  0,
);
const code = (
  await db.query(`select code from public.affiliate_links where destination_path='/services'`)
).rows[0].code;
await run(click({ ln: `'${code}'`, ip: "'ip-2'" }), { role: "service_role" });
expect(
  "click is tied to the link",
  (await db.query("select count(*)::int n from public.affiliate_clicks where link_id is not null"))
    .rows[0].n,
  1,
);
await run(click(), { role: "service_role" });
expect(
  "repeat click from same visitor is flagged duplicate",
  (await db.query("select count(*)::int n from public.affiliate_clicks where is_duplicate")).rows[0]
    .n,
  1,
);

console.log("— consent upgrade");
const upgrade = (clickId, ip = "ip-1", program = "joat") =>
  `select window_days from public.consent_partner_click(${clickId}, '${program}', '${ip}')`;
expect(
  "different visitor can't claim the click",
  await run(upgrade(firstClick, "ip-9"), { role: "service_role" }),
  0,
);
expect(
  "other programme can't claim it",
  await run(upgrade(firstClick, "ip-1", "amare"), { role: "service_role" }),
  0,
);
expect(
  "same visitor accepts cookies",
  await run(upgrade(firstClick), { role: "service_role" }),
  30,
);
expect("only once", await run(upgrade(firstClick), { role: "service_role" }), 0);
await db.exec(
  `update public.affiliate_clicks set at = now() - interval '2 hours', consent = false where id = ${firstClick}`,
);
expect("not after an hour", await run(upgrade(firstClick), { role: "service_role" }), 0);

console.log("— who sees clicks");
expect(
  "ambassador sees own clicks",
  await run("select count(*)::int from public.affiliate_clicks", amb(AMB)),
  3,
);
expect(
  "other ambassador sees none",
  await run("select count(*)::int from public.affiliate_clicks", amb(OTHER)),
  0,
);
expect(
  "hashed IP is hidden from ambassadors",
  await run("select ip_hash from public.affiliate_clicks", amb(AMB)),
  "err",
);
expect(
  "hashed IP is hidden from staff",
  await run("select ip_hash from public.affiliate_clicks", staff(MGR_JOAT)),
  "err",
);
expect(
  "JOAT manager sees JOAT clicks",
  await run("select count(*)::int from public.affiliate_clicks", staff(MGR_JOAT)),
  3,
);
expect(
  "Amare manager sees none of them",
  await run("select count(*)::int from public.affiliate_clicks", staff(MGR_AMARE)),
  0,
);

console.log("— disabling links");
const linkId = (await db.query(`select id from public.affiliate_links where code='${code}'`))
  .rows[0].id;
const setStatus = (status, reason = "null") =>
  `select public.set_partner_link_status('${linkId}', '${status}', ${reason})`;
expect(
  "ambassador disables a link",
  await run(setStatus("disabled", "'x'"), amb(AMB)),
  /not_authorised/,
);
expect(
  "Amare manager disables a JOAT link",
  await run(setStatus("disabled", "'x'"), staff(MGR_AMARE)),
  /not_authorised/,
);
expect(
  "disable without a reason",
  await run(setStatus("disabled"), staff(MGR_JOAT)),
  /reason_required/,
);
expect(
  "JOAT manager disables it",
  await run(setStatus("disabled", "'Misleading post'"), staff(MGR_JOAT)),
  "ok",
);
await run(click({ ln: `'${code}'`, ip: "'ip-3'" }), { role: "service_role" });
expect(
  "clicks on a disabled link still count for the ambassador, without the link",
  (await db.query("select link_id from public.affiliate_clicks where ip_hash='ip-3'")).rows[0]
    .link_id,
  null,
);
expect("re-enable", await run(setStatus("active"), staff(MGR_JOAT)), "ok");
expect(
  "both changes are in the activity log",
  (
    await db.query(
      "select count(*)::int n from public.partner_audit_log where action like 'link.%'",
    )
  ).rows[0].n,
  2,
);

console.log("— flood protection");
for (let i = 0; i < 100; i++) await run(click({ ip: "'flood'" }), { role: "service_role" });
expect(
  "101st click in an hour from one visitor is dropped",
  await run(click({ ip: "'flood'" }), { role: "service_role" }),
  0,
);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
