# Security audit report — joatkenya.com

**Assessment date:** 2 October 2026
**Scope:** this repository (`joat-kenya-elevation`), its Apache hosting config, the live site `https://joatkenya.com` (read-only header checks), and the Supabase project `prkdfkkhqncxkyehokop` as seen through the public anon key (read-only).
**Method:** manual code and config review, traced from each form to its database table or bucket; read-only live probes; `npm audit`; secret scanning of the source, git history and build output; type check, lint and production build; new regression tests.

The site is not "completely secure", and this report does not claim it is. Section 5 lists what could not be verified.

---

## 1. Architecture and attack surface

| Layer | What it is | Publicly reachable |
|---|---|---|
| Front end | Static React 19 SPA (Vite 7, TanStack Router), prerendered per-route HTML | Yes |
| Hosting | Truehost / cPanel Apache, configured by `public/.htaccess` | Yes |
| Data | Supabase (Postgres + PostgREST + Storage + Auth), called straight from the browser with the anon key | Yes, through the anon key |
| Email | Web3Forms (public access key by design) for contact, careers, course and booking notifications | Yes |
| Auth | Supabase email + password, used only for `/courses` student accounts. Email confirmation is on; no OAuth providers; anonymous sign-in is off | Yes |
| Third parties | Calendly, Google Maps, GA4, Microsoft Clarity, legacy `jack` Edge Function (chatbot) | Yes |

The site has no server code of its own, so **every access-control decision is made by Supabase RLS, grants and bucket settings.** The browser code cannot enforce anything.

Data flows:

- Contact form → `contact_submissions` table + `contact-attachments` bucket
- Careers → `applications` table + `joatkenya-applications-and-bot` bucket
- Courses → Supabase Auth + `course_students` table (own row only)
- Kenya consultation → `consultation_bookings` table + `consultation_booked_slots` view
- Articles → `blog_posts`, rendered as HTML

---

## 2. Findings

Status key: **Confirmed** = reproduced or proven from the policy text. **Suspected** = strong evidence, not reproduced. **Unverified** = could not be tested safely.

### Critical

#### C-1 — Contact-form uploads (CVs, receipts) can be listed and downloaded by anyone
- **Where:** storage bucket `contact-attachments`, policy `Public read on contact-attachments` (`supabase/migrations/20260529160000_contact_submissions.sql`)
- **Category:** Broken access control / sensitive data exposure (OWASP A01)
- **Evidence (live, today):** `POST /storage/v1/object/list/contact-attachments` with the public anon key returns the bucket's folders and files. `npm run security:live` reports `FAIL bucket contact-attachments not listable`.
- **Impact:** anyone with the anon key, which ships in the site's JS, can enumerate and download every PDF people sent through the contact form. No login is needed.
- **Status:** Confirmed, **still exposed in production.**
- **Fix written:** `supabase/migrations/20261002100000_lock_down_contact_attachments_listing.sql` drops the SELECT policy. The form only uploads and builds the public URL, and neither needs SELECT.
- **Retest:** after `supabase db push`, `npm run security:live` must show `PASS bucket contact-attachments not listable`. **Not yet retested, because the migration is not applied.**
- **Also do:** files were exposed, so assume the existing uploads may already have been listed (see section 6).

### Medium

#### M-1 — Students can set their own course `status` and change their `tier`
- **Where:** `public.course_students`; migration `20260707120000_course_students_status.sql`
- **Category:** Broken access control / mass assignment (A01)
- **Evidence:** That migration ran `revoke update (status) on course_students from authenticated`. Supabase grants `authenticated` table-level INSERT and UPDATE on public tables, and Postgres documents that revoking a column privilege has no effect while the table-level privilege remains. The "update own row" policy restricts rows, not columns. So a signed-in student can:
  - PATCH their own row to `status = 'completed'` or `'deposit_paid'`;
  - insert their row with any `status`;
  - change `tier` after registering, although the code comment says tier changes go through the team.
- **Impact:** students can falsify their payment or progress stage and their price tier. They cannot touch other students' rows: RLS holds.
- **Status:** Suspected, with high confidence. Not reproduced live, because that would mean creating a real account on production.
- **Fix written:** `20261002110000_tighten_course_students_and_bookings.sql` revokes table-level INSERT/UPDATE from `authenticated` and grants column lists instead:
  - **INSERT:** the 8 fields the sign-up form sends;
  - **UPDATE:** the 5 fields the account page edits.

  `status` and `tier` become team-only. All grants are removed from `anon` as well, since it had no policies anyway.
- **Retest:** run query Q1 in section 7 after the push; all three values must be `false`.

#### M-2 — Anyone can fill, or block, the consultation calendar
- **Where:** `public.consultation_bookings`, policy `Public can request a consultation` (`with check (true)`)
- **Category:** Business-logic flaw / insufficient input validation (A04)
- **Evidence:** the policy accepts any row from the anon key. Combined with the one-booking-per-slot unique index, a script can reserve every slot for weeks. It can also create rows already marked `confirmed`, rows in the past, or rows years ahead, with fields of unlimited length. All limits exist only in the browser (zod).
- **Status:** Confirmed from the policy definition. Not exercised live, because that would write to production.
- **Fix written:** same migration. New rows must have `status = 'requested'`, `start_at` between now and +90 days (the UI horizon is 45), and field lengths matching the form's validation.
- **Residual risk:** someone can still book every *valid* slot. Stopping that needs rate limiting or a CAPTCHA (see section 8).

#### M-3 — Article HTML was rendered unsanitized (stored-XSS sink)
- **Where:** `src/components/site/News.tsx`, `dangerouslySetInnerHTML={{ __html: active.content }}`
- **Category:** XSS (A03)
- **Evidence:** `blog_posts.content` is injected as raw HTML on `/articles`. The CSP is report-only, so it would not block injected script. Whether the anon key can write `blog_posts` is **unverified**: `blog_posts` has no migration in this repo, and the write probe was blocked (section 5).
- **Impact:** if a malicious row is ever written to `blog_posts` (through an over-broad policy, a compromised dashboard account, or the JACK bot project that shares this database), it runs script on joatkenya.com for every reader.
- **Fix:** `active.content` is now passed through `DOMPurify.sanitize()`. All 21 live articles use only `p`, `a`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `href`, `start` and `data-*`, which DOMPurify keeps, so the articles render exactly as before.
- **Retest:** the regression test `every dangerouslySetInnerHTML is sanitized` passes. Against the pre-fix file it fails with `unsanitized __html: active.content`.

#### M-4 — Site served over plain HTTP, no HSTS
- **Where:** `public/.htaccess`
- **Category:** Security misconfiguration (A05)
- **Evidence (live):** `http://joatkenya.com/` returns `200` with the full site and no redirect. No `Strict-Transport-Security` header is sent. The HTTPS redirect existed in the file, but it was commented out *and* placed after the SPA fallback, so it would never have run even if uncommented.
- **Impact:** visitors on hostile networks (public Wi-Fi) can be served a tampered page, and contact-form data can be intercepted.
- **Fix:** the HTTPS redirect is now the first rewrite rule, and `Strict-Transport-Security: max-age=31536000` is added. `includeSubDomains` and `preload` are left off on purpose.
- **Retest:** the regression tests `HTTPS redirect runs before the SPA fallback` and `hardening headers…` pass, and both fail on the old file. **Live retest pending deploy:** after upload, `curl -I http://joatkenya.com/` must return `301` to `https://`.

#### M-5 — Contact bucket accepted any content and any size
- **Where:** `contact-attachments` bucket config and its upload policy
- **Category:** Unrestricted file upload (A04)
- **Evidence:** the upload policy only checks that the *name* ends in `.pdf` or that the uploader-supplied mimetype claims PDF. The bucket has no `file_size_limit` or `allowed_mime_types` in any migration. Its live settings can't be read with the anon key.
- **Impact:** a free public file host on your Supabase storage: arbitrary content up to the project's global limit, under a `.pdf` name, served from your project's domain.
- **Fix:** the same pending migration sets `allowed_mime_types = ['application/pdf']` and `file_size_limit = 10 MB`, matching what the form already promises.
- **Retest:** query Q2 after the push.

### Low

| ID | Finding | Status | Action |
|---|---|---|---|
| L-1 | Directory listing on (`https://joatkenya.com/assets/` lists 864 files) | Confirmed live | **Fixed:** `Options -Indexes`. Covered by a test. Verify after deploy (see section 6). |
| L-2 | `npm audit`: high/moderate advisories in build tooling (postcss, browserslist, nanoid, js-yaml, brace-expansion, baseline-browser-mapping) | Confirmed. Build-time only, not shipped to browsers. | **Fixed** with `npm audit fix` (no `--force`, lockfile only). |
| L-3 | `sharp` ≤ 0.35.4 (libvips/libheif CVEs). Dev dependency, used only by local image-compression scripts on your own images. | Confirmed, low exposure | **Open.** The fix is 0.34 → 0.35, which npm marks as breaking. Upgrade deliberately and re-run `scripts/compress-*.mjs`. |
| L-4 | 8-character password minimum is enforced only in the browser | Server setting unverified | **Open:** set the minimum length (and the leaked-password check, if your plan has it) in Supabase → Auth → Policies. |
| L-5 | Password reset link signs the student in, but the site never asks for a new password (`PASSWORD_RECOVERY` is not handled, and `updateUser` is never called) | Confirmed in code | **Open:** feature work, not changed. Add a "set new password" step on `/courses/login`. |
| L-6 | Anon-insert tables (`contact_submissions`, `applications`, `newsletter_subscribers`, `page_events`) and the uploads have no server-side rate limit or length caps | Confirmed from policies | **Open:** spam and storage abuse. See section 8. |
| L-7 | CSP is `Report-Only`, so it does not block anything yet | Confirmed live | **Open.** The inline-script hash is **correct** (browsers hash after normalizing CRLF to LF), and a new test now guards it. Enforcing is safe to try after the console check described in `.htaccess`. |

### Informational

- **Good:** every PII table (`applications`, `contact_submissions`, `consultation_bookings`, `course_students`, `newsletter_subscribers`, `page_events`, `leads`) returns no rows to the anon key. The careers bucket is not listable. The REST schema (OpenAPI) is not public (401). No service-role or `sb_secret_` key appears in the source, git history, `public/` or `dist/`, and `.env` has never been committed. The JWTs hardcoded in `src/lib/chat.ts` and `src/lib/news.ts` are `anon` role, which is public by design.
- `consultation_booked_slots` is a security-definer view by design. It exposes only start times and durations. The Supabase linter will flag it; that is expected.
- The `leads` table exists in the database with no migration in this repo. Its policies are unknown, though reads are blocked.
- `src/lib/chat.ts` says JACK is not called, but the code does call the `jack` Edge Function, with the public key. Replies are rendered as text, so there is no XSS. The function's code is not in this repo: if it calls a paid LLM, anyone can call it and run up cost. Unverified.
- Upload object names: careers files keep the original file name and get a random 48-bit token; contact files get a full UUID. Both are unguessable, so they are safe once listing is off.

---

## 3. Remediation performed

| File | Change | Why |
|---|---|---|
| `supabase/migrations/20261002100000_lock_down_contact_attachments_listing.sql` | Drop the public SELECT policy; set PDF-only and 10 MB on the bucket | C-1, M-5 |
| `supabase/migrations/20261002110000_tighten_course_students_and_bookings.sql` (new) | Column-level grants on `course_students`; constrained booking insert policy | M-1, M-2 |
| `src/components/site/News.tsx` | `DOMPurify.sanitize()` on article HTML | M-3 |
| `public/.htaccess` | HTTPS redirect (first rule), HSTS, `Options -Indexes`, comment pointing at the CSP-hash test | M-4, L-1 |
| `package.json` / `package-lock.json` | Add `dompurify` ^3.4.16; `npm audit fix`; add the `test:security` and `security:live` scripts | M-3, L-2 |
| `tests/security.test.mjs` (new) | Static regression tests (Node's built-in runner, no new dependencies) | All of the above |
| `scripts/security-check-live.mjs` (new) | Read-only live check of table reads, bucket listing and schema exposure | C-1 regression |

**Dependency changes:** added `dompurify` (Cure53, the standard HTML sanitizer). Lockfile-only bumps of postcss, browserslist, nanoid, js-yaml, brace-expansion and baseline-browser-mapping within their existing semver ranges. No major upgrades.

**Environment variables:** no changes needed.

---

## 4. Tests executed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass (also passed before the changes) |
| `npm run build` (Vite + prerender of 12 routes) | Pass |
| `npm run test:security` | 5 of 5 pass |
| Mutation check: the same tests run against the pre-fix `.htaccess` and `News.tsx`, plus a planted service-role JWT, a planted `sb_secret_` key and an edited inline script | 5 of 5 tests fail as they should |
| `npm run security:live` | 9 pass, **1 fail (C-1: expected until the migration is pushed)** |
| `npm audit` | 1 high remaining (`sharp`, dev only; see L-3), down from 7 |
| `npx eslint .` | 1,488 pre-existing errors before the changes, all `prettier/prettier` from CRLF line endings. No new errors from these changes; `News.tsx` dropped from 269 to 1 (the one left is pre-existing, at line 57). |
| Built bundle contains no privileged key | Pass (covered by the test suite, which scans `dist/`) |

There is no existing unit or end-to-end test suite in the project. Forms, navigation and responsive layout were **not** clicked through in a browser in this session.

---

## 5. Not verified, or needs manual review

1. **Write access to content tables (`blog_posts`, `testimonials`, `faqs`, `services`, `sitemap_entries`, `case_studies`, `team_members`, `redirects`, `meta_overrides`, `leads`).** A non-destructive probe was designed: send `{"id": null}`, which can never be stored, and read whether the error comes from RLS or from the NOT NULL constraint. It was blocked by the session's safety controls before it ran against production. Run Q3 in section 7 instead.
2. **DELETE policies** on all tables. These can't be tested non-destructively through the API. Q3 shows them.
3. **The `joatkenya-applications-and-bot` bucket's upload rules and limits.** They are set in the dashboard, not in a migration. Q2 shows them.
4. **The `jack` Edge Function** (code not in this repo): authentication, cost controls, and any data it can reach.
5. **Supabase dashboard settings:** the server-side password policy, the Auth rate limits, and that the Site URL and redirect allow-list only contain `https://joatkenya.com`.
6. **Truehost:** that `Options -Indexes` is allowed by the host (see section 6).

---

## 6. Manual steps for the owner

1. **Apply the migrations** (fixes C-1, M-1, M-2, M-5): `supabase db push`. Then run `npm run security:live` (it should show all PASS) and queries Q1 and Q2.
2. **Deploy the new build** (`npm run build`, then upload `dist/` including `.htaccess`). Then check:
   - `curl -I http://joatkenya.com/` returns `301` to `https://`;
   - the homepage loads (if it returns **500**, the host forbids `Options`: delete that one line and redeploy);
   - `https://joatkenya.com/assets/` no longer lists files;
   - an article opens and looks normal;
   - test sign-up, contact and booking once each.
3. **Exposed contact attachments (C-1).** Review the bucket's contents. Consider deleting files you no longer need, and assess whether to notify the people whose CVs or receipts were in it. Kenya's Data Protection Act 2019 may require notifying the ODPC within 72 hours of becoming aware of a breach involving personal data. That is a decision for you or your counsel.
4. **Secrets to rotate:** none required. No private credential was found in the code, history or build. The Supabase anon key and the Web3Forms access key are public by design. If you ever pasted a service-role key anywhere outside the Supabase dashboard, rotate it.
5. **Run Q3** and send any table that shows an INSERT/UPDATE/DELETE policy for `anon` or `public` back for a fix.

---

## 7. Verification queries (Supabase SQL editor, read-only)

```sql
-- Q1: course_students column locks. Expect false, false, false.
select has_column_privilege('authenticated', 'public.course_students', 'status', 'UPDATE') as status_update,
       has_column_privilege('authenticated', 'public.course_students', 'status', 'INSERT') as status_insert,
       has_column_privilege('authenticated', 'public.course_students', 'tier',   'UPDATE') as tier_update;

-- Q2: bucket settings. Expect contact-attachments: 10485760, {application/pdf}.
select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id;

-- Q3: every write policy reachable without a team login.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
order by tablename, cmd;
```

---

## 8. Recommended ongoing controls

- **Run `npm run test:security` before every deploy**, and `npm run security:live` after any Supabase change.
- **Put every table and bucket policy in `supabase/migrations/`.** `applications`, `blog_posts`, `leads` and the careers bucket are currently configured only in the dashboard, which is how C-1-style drift goes unnoticed.
- **Add a CAPTCHA (Cloudflare Turnstile) to the public forms** and move inserts behind a small Edge Function that verifies it. This is the real fix for M-2's residual risk and for L-6.
- **Enforce the CSP** (rename the header from `Report-Only`) once a pass over the pages shows no console violations.
- **Turn on Supabase's Security Advisor** and review it monthly. Upgrade `sharp` when convenient.
- **Set a retention period** for contact attachments and CVs, and delete old files on a schedule.
