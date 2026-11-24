# Partner portal: setup and deployment

The portal at `partners.joatkenya.com` is a second build of this repository. It shares the
Supabase project with the public site but deploys separately, so a portal release never touches
joatkenya.com.

| | Public site | Partner portal |
|---|---|---|
| Entry | `index.html`, `src/main.tsx`, `src/routes/` | `portal/index.html`, `src/portal/main.tsx`, `src/portal/routes/` |
| Dev | `npm run dev` (port 8080) | `npm run dev:portal` (port 8081) |
| Build | `npm run build` → `dist/` | `npm run build:portal` → `dist-portal/` |
| Hosting | Truehost (manual upload) | Cloudflare Pages |
| Headers | `public/.htaccess` | `portal/public/_headers` |

Type-check both with `npm run typecheck`. The two route trees use separate tsconfigs
(`tsconfig.json` excludes `src/portal`; `tsconfig.portal.json` covers it) because each tree
registers its own router types.

## 1. Apply the database migrations

Supabase project: **`prkdfkkhqncxkyehokop`** (named `joatkenya_JACKbot_admin_handler`). It's the
only project this repo uses; every Supabase step below happens there.

**Why not `supabase db push`:** the live database has 4 migrations in its history that aren't in this
repo (`20260529150000`, `20260826000000`, `20260826010000`, `20260918100000`, probably the JACK bot's).
The CLI refuses to push while that is the case. Do **not** "fix" this with
`supabase migration repair --status reverted`; that would rewrite another system's history.

Instead, run the 4 new files by hand, then record them:

1. Open https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/sql/new
2. For each file below, **in this order**: open it in VS Code, select all (Ctrl+A), copy, paste into
   the SQL Editor (replacing what's there), click **Run**, and wait for "Success. No rows returned".
   1. `supabase/migrations/20261002100000_lock_down_contact_attachments_listing.sql`
   2. `supabase/migrations/20261002110000_tighten_course_students_and_bookings.sql`
   3. `supabase/migrations/20261007100000_rate_limit_public_forms.sql`
   4. `supabase/migrations/20261118100000_partner_portal_foundation.sql`

   If one fails, stop and send the error message before running the next.
3. Record them in the migration history so the CLI stays in step. In the VS Code terminal, at the repo
   root:

   ```sh
   supabase migration repair --status applied 20261002100000 20261002110000 20261007100000 20261118100000
   ```

   This only writes the history table; it doesn't run any SQL.
4. Check, in the same terminal:

   ```sh
   npm run security:live
   ```

   Every line should say PASS, including `bucket contact-attachments not listable`.

## 2. Supabase Auth settings (dashboard)

1. Open https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/auth/url-configuration
2. Leave **Site URL** as it is. Course logins on joatkenya.com depend on it.
3. Under **Redirect URLs**, click **Add URL** and add, one at a time:
   - `https://partners.joatkenya.com/login`
   - `http://localhost:8081/login` (local testing)
4. Click **Save**.
5. In the left menu, under Authentication, open **Multi-Factor** and check that **TOTP
   (Authenticator app)** is enabled. It is on by default. Staff can't reach admin data without it.

## 3. Grant the first staff roles

There is no self-service path to a staff role.

1. The person needs an account first. If they don't have one:
   https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/auth/users → **Add user** → **Create new
   user** → enter email and password → tick **Auto Confirm User** → **Create user**.
2. Open https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/sql/new, paste the following with the
   real email, and click **Run**:

   ```sql
   insert into public.partner_staff (user_id, role)
   select id, 'super_admin' from auth.users where email = 'you@yourdomain.com';
   ```

   It should report **1 row affected**. 0 rows means the email has no account (check spelling).
3. Optional, other roles (a programme manager always has one programme, `'joat'` or `'amare'`):

   ```sql
   insert into public.partner_staff (user_id, role, program_id)
   select id, 'program_manager', 'amare' from auth.users where email = 'manager@yourdomain.com';

   insert into public.partner_staff (user_id, role)
   select id, 'finance', null from auth.users where email = 'finance@yourdomain.com';
   ```

4. Check who has access:

   ```sql
   select u.email, s.role, s.program_id
   from public.partner_staff s join auth.users u on u.id = s.user_id;
   ```

Roles: `super_admin`, `program_manager` (one programme), `finance`, `support` (read-only). On first
visit to `/admin`, each staff member scans a QR code with an authenticator app.

## 4. Cloudflare Pages project

Cloudflare builds from GitHub, so **commit and push Phase 1 first** (VS Code terminal, repo root):

```sh
git add .env.example .gitignore .prettierignore eslint.config.js package.json tsconfig.json tsconfig.portal.json vite.portal.config.ts portal src/portal supabase/migrations/20261118100000_partner_portal_foundation.sql tests/partners-policies.test.mjs docs/partners/portal-deploy.md
git commit -m "Add partner portal foundation (Phase 1)"
git push origin main
```

Then:

1. Sign in at https://dash.cloudflare.com. The account that already hosts amaresbigplanet.com is fine.
2. **Workers & Pages** → **Create** → choose the **Pages** tab → **Import an existing Git repository**
   (or "Connect to Git").
3. Connect GitHub if asked, and pick **joatkenya-creator/joat-kenya-elevation** → **Begin setup**.
4. Fill in:
   - Project name: `joat-partners` (this becomes `joat-partners.pages.dev`)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `npm run build:portal`
   - Build output directory: `dist-portal`
5. Expand **Environment variables** and add:
   - `VITE_SUPABASE_URL`: copy the value from the `.env` file in the repo root
   - `VITE_SUPABASE_ANON_KEY`: copy the value from the same `.env` file (it's the public anon key,
     never the service_role key)
   - `NODE_VERSION`: `22`
6. **Save and Deploy**. When it finishes, open `https://joat-partners.pages.dev` and check the
   programme home page loads.

`_headers` pins the Supabase project URL in the Content-Security-Policy `connect-src`. If the
project ever changes, update it there too.

## 5. DNS for partners.joatkenya.com

joatkenya.com's DNS is hosted by Truehost (nameservers `ns1.cloudoon.com`, `ns2.cloudoon.net`,
`ns3.cloudoon.org`), so the record goes in Truehost.

1. In Cloudflare: the `joat-partners` project → **Custom domains** → **Set up a custom domain** →
   enter `partners.joatkenya.com` → **Continue**. Cloudflare then shows the CNAME record it expects.
   Do this before adding the DNS record.
2. Log in to Truehost cPanel for joatkenya.com → **Domains** section → **Zone Editor** → on the
   `joatkenya.com` row click **+ CNAME Record**. (No cPanel access? Truehost client area →
   **Domains** → joatkenya.com → **Manage DNS**, or ask Truehost support to add it.)

   | Field | Value |
   |---|---|
   | Name | `partners` (cPanel may show it as `partners.joatkenya.com.`) |
   | Type | `CNAME` |
   | TTL | `300` (or the lowest offered) |
   | Record / CNAME | `joat-partners.pages.dev` |

   If a `partners` A record or subdomain already exists in cPanel, remove it first; a name can't have
   both.
3. Save. Back in Cloudflare, the domain changes from "Verifying" to **Active**, usually within
   minutes and up to 24 hours. The certificate is issued automatically.
4. Open https://partners.joatkenya.com and sign in with the super-admin account. Visiting **Admin**
   should show the authenticator QR code.

Nothing else in the joatkenya.com zone changes; the main site stays on Truehost.

## Phase 3: referral tracking

Run these in order. Steps 1–3 are in the VS Code terminal at the repo root.

1. **Database.** Paste `supabase/migrations/20261120100000_partner_tracking.sql` into the
   [SQL Editor](https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/sql/new) → **Run**. Then:

   ```sh
   supabase migration repair --status applied 20261120100000
   ```

2. **Signing key** for referral tokens. Generate one and store it as a Supabase secret (it never
   goes in a file or in Git):

   ```sh
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   supabase secrets set REFERRAL_TOKEN_KEY=<paste the value printed above>
   ```

   Changing this key later invalidates every referral cookie already issued.

3. **Deploy the track-click function** (public: visitors aren't signed in, so no JWT check):

   ```sh
   supabase functions deploy track-click --no-verify-jwt --use-api
   ```

   Check it answers. This sends one fake visit with a made-up code (`AAAAAAAA`); nothing is saved.
   The right answer is `{"ok":false}` ("not a valid referral"). A 503 error means the
   REFERRAL_TOKEN_KEY secret is missing; a 404 means the function isn't deployed.

   PowerShell:

   ```powershell
   Invoke-RestMethod -Method Post -Uri https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/track-click -Headers @{ Origin = "https://joatkenya.com" } -ContentType "application/json" -Body '{"landing_url":"https://joatkenya.com/?ref=AAAAAAAA","consent":false}'
   ```

   Git Bash:

   ```sh
   curl -s -X POST https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/track-click -H "Origin: https://joatkenya.com" -H "content-type: application/json" -d "{\"landing_url\":\"https://joatkenya.com/?ref=AAAAAAAA\",\"consent\":false}"
   ```

4. **joatkenya.com.** `npm run build`, then upload `dist/` to Truehost as usual. This release
   changes `.htaccess` (new script hash in the CSP) and `index.html` (analytics wait for consent),
   so upload all of `dist/`, including the hidden `.htaccess`.
5. **Portal.** `npm run build:portal`, then upload `dist-portal` to the `joat-partners` Pages project.
6. **amaresbigplanet.com.** Review and merge the pull request from branch
   `partner-referral-tracking`. Merging deploys automatically.

**Check it end to end:** open a programme, apply with a second account, approve it, copy its
link from the dashboard, open the link in a private window, click **Accept**, then refresh the
dashboard. The click count goes up by one, and the browser has a `joat_ref` (or `abp_ref`) cookie.

## Phase 4: Amare shop orders and JOAT sales

Do these **in order**. Step 2 must happen before step 7, or the joatkenya.com forms would send a
field the database doesn't have yet.

Supabase CLI steps need `$env:SUPABASE_ACCESS_TOKEN = "sbp_..."` set in the PowerShell window first.

### 1. Put the referral key in Supabase Vault

The database checks referrals on the JOAT enquiry forms, so it needs the same key as the
`REFERRAL_TOKEN_KEY` function secret. Edge Function secrets can't be read back, so:

- **If you still have the key** you set in Phase 3, use it below.
- **If not**, make a new one and set it in both places. Referral cookies already handed out
  stop working, which is fine before launch.

  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
  supabase secrets set REFERRAL_TOKEN_KEY=<new key>
  ```

Then in the [SQL Editor](https://supabase.com/dashboard/project/prkdfkkhqncxkyehokop/sql/new):

```sql
select vault.create_secret('<the key>', 'referral_token_key');
```

(If it says the name already exists, use
`select vault.update_secret(id, '<the key>') from vault.secrets where name = 'referral_token_key';`.)

### 2. Database

Paste `supabase/migrations/20261121100000_partner_conversions.sql` into the SQL Editor → **Run**. Then:

```powershell
supabase migration repair --status applied 20261121100000
```

### 3. (Optional, skipped for now) Connect shop.amaresbigplanet.com to Shopify

The store stays on `amares-big-planet.myshopify.com` (decision D5, 2026-11-20); skip to step 4.
Referrals still work: every Shop link on amaresbigplanet.com carries the referral. Connecting the
domain later would also credit shoppers who reach the shop some other way.

1. Shopify admin → **Settings → Domains → Connect existing domain** → enter
   `shop.amaresbigplanet.com` → **Next**. Shopify shows the record it needs (a CNAME to
   `shops.myshopify.com`).
2. Cloudflare dashboard → **amaresbigplanet.com → DNS → Records → Add record**:

   | Field | Value |
   |---|---|
   | Type | CNAME |
   | Name | `shop` |
   | Target | `shops.myshopify.com` |
   | Proxy status | **DNS only** (grey cloud; Shopify won't verify a proxied record) |

3. Back in Shopify, click **Verify connection**. When it's connected, choose **Change primary
   domain** and pick `shop.amaresbigplanet.com`. Old `myshopify.com` links keep working and
   redirect there.

### 4. Add the referral snippet to the Shopify theme

Superseded: follow [docs/shopify-theme-install.md](../shopify-theme-install.md), which installs
`docs/partners/shopify/abp-referral.liquid` (shop links and the cart code field as well).

1. **Customize** the theme → a product page → the buy buttons block → untick **Show dynamic
   checkout buttons**. "Buy it now" skips the cart, so the referral wouldn't reach the order.

### 5. Shopify webhooks

Shopify admin → **Settings → Notifications → Webhooks** (at the bottom) → **Create webhook**,
three times, all with Format **JSON**, the latest API version, and this URL:

`https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/shopify-webhook`

Events: **Order payment**, **Order cancellation**, **Refund create**.

Shopify doesn't offer dispute (chargeback) events in this list. Shopify emails the store owner
about every chargeback, and they're listed in Shopify admin under **Finance → Payouts →
Chargebacks** (or **Settings → Payments → View payouts**). Before approving commission on a shop
order, finance checks that list and rejects commission on any order that has a chargeback.

Under the list, Shopify shows "Your webhooks will be signed with **…**". Copy that value.

### 6. Function secrets and deploy

```powershell
supabase secrets set SHOPIFY_AMARE_WEBHOOK_SECRET=<value from step 5> SHOPIFY_AMARE_SHOP_DOMAIN=wu0b1t-n6.myshopify.com
supabase functions deploy shopify-webhook --no-verify-jwt --use-api
```

Check it: on the Shopify webhooks page, click **Send test notification** on the "Order payment"
webhook. In the portal, **Admin → Shop orders → Recent Shopify notifications** shows
`orders/paid · ignored: no referral` (the test order has no referral, which is correct).
That list is visible to super admins and support staff.

### 7. Release the sites

1. `npm run build` → upload `dist/` to Truehost (the contact and booking forms now carry referrals).
2. `npm run build:portal` → upload `dist-portal` to the `joat-partners` Pages project.
3. Optional: the Amare pull request from branch `partner-shop-domain` only matters if step 3 is
   done later. Merging it now is harmless.

### Check it end to end

- **Amare:** private window → an approved ambassador's Amare link → **Accept** → Shop → buy
  something (a real low-priced item you then refund works; Shopify Payments has no test mode on a
  live store unless you turn it on under Settings → Payments). **Admin → Shop orders** shows the
  order as Verified. Refund it in Shopify: it changes to Reversed.
- **JOAT:** private window → an approved ambassador's JOAT link → **Accept** → send the contact
  form. **Admin → JOAT sales** shows it under Referred enquiries → **Create engagement** → **Add
  invoice** → **Record a payment** with an M-Pesa code → a *different* finance user clicks
  **Confirm**. The ambassador's dashboard shows the sale as Verified.

## Phase 5a: commission rates

Shows 10% commission and the 30-day hold on every referred sale, and publishes the rates on the
portal's programme pages, terms and FAQ.

1. Supabase dashboard → project `prkdfkkhqncxkyehokop` → **SQL Editor** → paste
   `supabase/migrations/20261122100000_partner_commissions.sql` → **Run**. Then, in PowerShell:
   `supabase migration repair --status applied 20261122100000`
2. `npm run build:portal` and upload `dist-portal` to the `joat-partners` Cloudflare Pages project
   as before. joatkenya.com doesn't change.
3. Check: the programme pages show "Rate: 10%"; Admin → Shop orders has a Commission column.

Upload the portal only after step 1: until then its sales tables can't load.

## Phases 5b–8: payouts, welcome pack, reports, new dashboards

1. Supabase dashboard → project `prkdfkkhqncxkyehokop` → **SQL Editor** → paste
   `supabase/migrations/20261123100000_partner_payouts.sql` → **Run**. Then in PowerShell:
   `supabase migration repair --status applied 20261123100000`
2. `npm run build:portal` and upload `dist-portal` to the `joat-partners` Cloudflare Pages project.
   Upload only after step 1. joatkenya.com doesn't change.
3. One person runs payouts: the batch creator can approve it (see the next section).

**Monthly payout run (payouts manager):**
1. Admin → **Payouts** → **Create USD batch**. It includes every commission past its 30-day
   hold that hasn't been paid, minus refunds on sales already paid. Own purchases are never
   included; disputed sales and ambassadors without payout details wait for the next run.
2. Check Shopify's chargebacks list (Shopify admin → Finance → Payouts) and use **Hold back** on
   anyone affected.
3. Click **Approve**.
4. Pay each ambassador by M-Pesa or bank (use **Export** for the list). M-Pesa rows show an
   estimate in KES at today's rate; send the KES equivalent of the USD amount on the day. Enter
   the M-Pesa/bank reference and click **Mark paid**. The batch closes when everyone is paid.

## 2026-11-21: 8%→10% tiers, USD, single-person payouts, payout-change email

1. **SQL Editor** → paste `supabase/migrations/20261124100000_partner_rates_usd.sql` → **Run**.
   Then in PowerShell: `supabase migration repair --status applied 20261124100000`
2. **Email provider (Resend):** create an account at resend.com, add and verify the domain
   `joatkenya.com` (it gives you DNS records to add), and create an API key. Then:

   ```powershell
   supabase secrets set RESEND_API_KEY=<the key> EMAIL_FROM="JOAT Global Partners <partners@joatkenya.com>" EMAIL_REPLY_TO=<team inbox>
   supabase functions deploy payout-details-notify --no-verify-jwt
   supabase functions deploy track-click --no-verify-jwt
   ```

3. `npm run build:portal` and upload `dist-portal` to `joat-partners` (after step 1).
4. Add the second super admin (they must have signed in to the portal once, or be added under
   Authentication → Users first), then set up two-factor sign-in on their first admin visit:

   ```sql
   insert into public.partner_staff (user_id, role)
   select id, 'super_admin' from auth.users where email = 'joatkenya120@gmail.com';
   ```

## 2026-11-21: Ambassador emails (welcome, application, approved, rejected, suspended)

Needs the Resend secrets from the step above.

1. **SQL Editor** → paste `supabase/migrations/20261125100000_partner_emails.sql` → **Run**.
   Then: `supabase migration repair --status applied 20261125100000`
2. `supabase functions deploy partner-email --no-verify-jwt`
3. `npm run build:portal` and upload `dist-portal` (admin form now says the reason is emailed),
   and rebuild/upload the main site (course sign-ups are tagged so they get no partner welcome).

Emails go to the ambassador's sign-in address: welcome when an account is confirmed (or on first
Google sign-in), one "application received" per application, and approved / reinstated /
rejected / suspended per program. **Rejection and suspension reasons are sent to the
ambassador word for word**, so write them for the ambassador to read. Failed sends show in
Edge Functions → partner-email → Logs.

**Rates:** everyone starts at 8%. To move an ambassador to 10%: Admin → **Ambassadors** → their
card → **Move to 10%…** with a reason. Only sales after the change use the new rate; every sale
keeps the rate it was attributed at. Sales recorded before this release keep 10%.

**Currency:** both programs are USD. New JOAT invoices are entered in USD. Ambassadors outside
the US see an approximate local amount next to their USD totals (rates from open.er-api.com,
display only). Check that the Amare Shopify store's currency is USD: orders in another currency
are never paid out.

## Download active ambassadors (super admins)

1. **SQL Editor** → paste `supabase/migrations/20261126100000_partner_ambassador_export.sql` →
   **Run** (after 20261125100000). Then: `supabase migration repair --status applied 20261126100000`
2. Rebuild and upload the portal.

Admin → **Ambassadors** → **Download active ambassadors (CSV)**: name, sign-in email, country,
program, rate, member since, referral code and profile links, one row per program. Only super
admins (with two-factor sign-in) see the button, and every download is in the activity log.

## Rollback

Cloudflare Pages keeps every deployment: Deployments → pick the previous one → Rollback.
Database changes are additive (new tables only); to remove the portal schema, drop the
`affiliate_*` and `partner_staff` tables and the two `private` helper functions.
