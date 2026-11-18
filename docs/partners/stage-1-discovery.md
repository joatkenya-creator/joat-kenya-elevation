# Stage 1 Discovery & Architecture Report — JOAT Global Ambassador Platform

**Status:** Discovery complete (2026-11-17). Implementation **not yet approved**.
**Audience:** Project owner and implementing engineers.

Labels: **[V]** verified (in code or on a live server) · **[R]** recommendation · **[U]** unknown, needs an answer.

Discovery was read-only: file reads, `git status`, `git fetch --dry-run`, the test suite, a type check, lint, the read-only `security:live` script, and public DNS/HTTP lookups.

---

## Decision log

| # | Decision | Answer | Date |
|---|---|---|---|
| D1 | Which site JOAT referral links point to | **(c) joatkenya.com for now.** Link format: `https://joatkenya.com/?ref={affiliate_id}` (and deep links on joatkenya.com). | 2026-11-18 |
| D2 | Portal hosting | **Cloudflare Pages**, at **`partners.joatkenya.com`** (CNAME added in Truehost DNS). Amare links use `https://amaresbigplanet.com/?ref={affiliate_id}`. | 2026-11-18 (host corrected same day) |
| D13 | Where this report lives | This file. | 2026-11-18 |
| D3–D12 | See §13 | Open | – |

### What D1 and D2 change

- **JOAT click capture runs in the browser.** joatkenya.com is a static site with no server, so a small script reads `?ref=`, calls the `track-click` Edge Function, and keeps the returned signed token in a first-party cookie (only after consent). The enquiry forms send that token with the submission, and a database trigger verifies it before linking the lead to the ambassador. Clicks are never trusted from the browser alone: the function checks the code, the membership and the destination.
- **The CSP needs no new origin for Edge Functions.** They live on the Supabase host that `.htaccess` already allows in `connect-src`.
- **joatkenya.com needs a cookie-consent banner** before attribution cookies are set (none exists today).
- **Public copy stays "JOAT Global".** joatkenya.com is used only as the link domain; portal pages, emails and materials use the JOAT Global name.
- **Portal deployment is separate from the public site.** The Pages project builds only the portal target from this repository, so a portal deploy cannot affect the Truehost upload of joatkenya.com.
- **DNS steps (owner action, nothing changed yet):** add the custom domain in the Cloudflare Pages project first, then create `partners CNAME <project>.pages.dev` in Truehost DNS for joatkenya.com. Add `https://partners.joatkenya.com/login` to Supabase Auth's allowed redirect URLs.

---

## 0. Findings that change the brief

1. **[V] joatglobal.com is not a JOAT site.** The owner confirmed on 2026-11-18 that it is unrelated to this project, so nothing here uses it. For the record, discovery found an unrelated Shopify store there: Store `zmzmkq-gr.myshopify.com`, theme "JOAT FINAL", DNS in Google Cloud DNS. Its public catalogue lists "Lucky Belt", "Confetti Belt" and "Keeper Belt" at $89.90 and has a French page address (`/pages/conseil-dentretien`), which look like leftover demo products on a live domain.
2. **[V] This repository serves joatkenya.com**, a static site on Truehost (cPanel/Apache) with no server of its own. DNS is at cloudoon (Truehost). `joatglobal.com` appears nowhere in the code; `joatkenya.com` is the canonical domain in 22 places.
3. **[V] The JOAT enquiry funnel exists only on joatkenya.com** (contact form, consultation bookings, course sign-ups). Resolved by D1.
4. **[V] Amare has no Shopify code in its repository.** The live site's "Shop 🛍️" menu item links to `https://amares-big-planet.myshopify.com/` (print products, vendor "Amare's Big Planet"). With no custom shop domain, a cookie on amaresbigplanet.com cannot be read by the shop, so the referral must be carried across explicitly (§6).
5. **[V] Amare is a children's site.** COPPA applies: attribution must be limited to parent-facing pages and the shop (§11).
6. **[V] Neither codebase has a CRM, contracts, invoicing, payment processor, transactional email, admin roles or cookie consent.** JOAT's team edits records in Supabase Studio; notifications go to the admin inbox via Web3Forms.

## 1. Repositories and technology

| | JOAT (`joat-kenya-elevation`) | Amare (`amares-big-planet`) |
|---|---|---|
| Framework | [V] React 19, TanStack Router, Vite 7. Static SPA with a prerender script | [V] TanStack Start (server-rendered, server functions), React 19, Lovable template |
| Styling/UI | [V] Tailwind 4, Radix/shadcn, Zod, react-hook-form, react-query, recharts | [V] Same stack |
| Package manager | [V] npm | [V] npm |
| Hosting | [V] Truehost cPanel/Apache; `npm run build`, manual upload of `dist/`, `.htaccess` | [V] Cloudflare Workers via GitHub Actions on push to `main` |
| Tests | [V] `npm run test:security`: 7/7 pass, incl. offline DB-policy tests (PGlite) | [V] None |
| Type check | [V] `tsc --noEmit` clean | not run |
| Lint | [V] 480 pre-existing errors, reported auto-fixable (likely formatting/line endings) | not run |
| Git (2026-11-17) | [V] `main`, in sync with origin; 10 modified + 3 untracked files uncommitted, incl. a new migration | [V] `main`, local copy behind origin (remote `c1378b2`); 1 modified file |

## 2. Authentication and database (JOAT)

- [V] Supabase project `prkdfkkhqncxkyehokop`, **shared with the JACK chatbot**. The browser uses only the anon key; no server-side secrets in the repository.
- [V] Supabase Auth (email + password) already used for course students (`course_students` 1:1 with `auth.users`, RLS own-row only).
- [V] Existing patterns to keep: RLS on every table, column-level grants (`20261002110000`), per-IP rate-limit trigger on `cf-connecting-ip`, a `private` schema, offline PGlite policy tests.
- [V] Live DB has `leads` and `page_events` tables not defined in this repo's migrations (probably the JACK bot's). [U] Structure and owner.
- [V] **Open security hole:** the `contact-attachments` bucket is listable by anyone (`npm run security:live` FAIL). Migrations `20261002*` and `20261007*` are not pushed to the live DB. **Fix before storing ambassador payout/personal data.**
- [V] No Edge Functions in the repository; the JACK function is deployed but its source is not here.

## 3. Hosting and deployment

- [V] joatkenya.com: Truehost Apache, strict CSP in `.htaccess`, manual upload.
- [V] joatglobal.com: unrelated to JOAT (owner, 2026-11-18). Not used.
- [R] Portal: `partners.joatkenya.com` on Cloudflare Pages, via a CNAME in joatkenya.com's Truehost DNS (D2).
- [V] amaresbigplanet.com: Cloudflare Worker, DNS on Cloudflare, account referenced in `deploy.yml`.
- [U] Who has access to joatkenya.com's DNS at Truehost and to a Cloudflare account for the Pages project.

## 4. Amare and Shopify

- [V] "Shop" links to the `myshopify.com` address; products are print apparel ("Print Material"), consistent with Gelato print-on-demand.
- [V] The Amare site has server code (`createServerFn`, request middleware in `src/start.ts`), so it can record a click and add the referral token to the Shop link server-side.
- [U] Shopify plan, whether Shopify Payments is on (dispute webhooks), installed apps, whether "Buy it now" buttons are enabled.

## 5. JOAT enquiry-to-payment workflow (today)

- [V] Contact form → `contact_submissions` + Web3Forms email.
- [V] Consultation booking → `consultation_bookings`; confirmed by hand by replying to the email.
- [V] Courses → `course_students`, KES prices, `status` set by hand in Studio.
- [V] **No proposal, contract, invoice or payment record exists.** Commission cannot be triggered by a verified system event, so the reliable option is an **admin verification workflow with evidence and a second-person check** (§10).
- [U] Any invoicing/accounting tool outside the code (QuickBooks, Zoho Books, Wave, Stripe Invoicing, M-Pesa statements) that could be connected later.

---

## 6. Recommended architecture

```
          Ambassadors / Admins (browser)
                     │
                     ▼
  partners.joatkenya.com ── portal built from THIS repo
  (own layout, navigation, login)   [Cloudflare Pages, CNAME from Truehost DNS]
                     │ user session, Row Level Security
                     ▼
 ┌────────────── Supabase (existing project) ─────────────────────────┐
 │ Auth (shared)   Postgres: affiliate_* tables, RLS, approval RPCs   │
 │ Edge Functions: track-click · shopify-webhook · admin-finance      │
 │                 · notify (email)                                   │
 │ Storage: partner-assets (private, signed URLs)                     │
 └───▲──────────────────▲─────────────────────────▲───────────────────┘
     │ click → signed   │ verified webhooks       │ enquiry stored
     │ referral token   │ + order re-fetched      │ with referral token
     │                  │                         │
 amaresbigplanet.com   Shopify: amares-big-planet  joatkenya.com
 (CF Worker) ──Shop link + ?abp_ref=token──►  theme snippet → hidden
                                              cart attribute → on the
                                              order in the webhook
```

- **One codebase, separate identity.** The portal is a second build target of this repository with its own routes, layout, navigation and login, deployed independently. The public site's build is unchanged.
- **Server logic in Supabase Edge Functions.** No new backend. Secrets (Shopify keys, token-signing key, email key) live there, never in the browser.
- **Attribution flow:**
  1. Visitor arrives with `?ref=CODE`.
  2. The brand site (server on Amare; browser script on joatkenya.com) calls `track-click`.
  3. `track-click` validates code, membership and destination allowlist, records the click, and returns a signed token valid for the attribution window (affiliate, programme, click ID, expiry).
  4. The token, not the raw code, follows the visitor into the shop or the enquiry form.
- **Amare → Shopify:**
  1. Amare's server adds the token to the Shop link.
  2. A short Shopify theme snippet writes it to a hidden cart attribute (`_abp_ref`). Works on every Shopify plan; no checkout customisation needed.
  3. The attribute is on the order and arrives in the `orders/paid` webhook; the server verifies signature and expiry.
  4. Backup signal: Shopify's own record of the order's landing page.
  5. Optional: connect `shop.amaresbigplanet.com` as the store's custom domain so both share a first-party cookie (D5).
  6. **Must test in a test store:** whether "Buy it now" buttons keep the attribute.
- **Shopify webhooks** (`orders/paid`, `orders/cancelled`, `refunds/create`, plus `disputes/*` if Shopify Payments is on):
  - Signature checked against the raw body.
  - Duplicates dropped by stored `X-Shopify-Webhook-Id`.
  - The webhook is only a trigger: the function re-fetches the current order from the Admin API and reconciles against it, which handles delayed, repeated and out-of-order events in one place.
  - Only the order-reading scope is requested.

## 7. Changes per repository

- **JOAT (main):** portal routes `src/routes/partners/*` and `src/routes/partners/admin/*`; shared logic `src/lib/partners/*`; a second Vite build target; migrations and Edge Functions under `supabase/`; a referral capture script plus one optional `referral_token` field on public forms; consent banner; tests alongside the PGlite policy tests.
- **Amare (narrow):** request middleware that reads `?ref` → calls `track-click` → sets a parent-facing cookie, and server-side rendering of the token into the Shop link. About 2 files.
- **Shopify (Amare store):** custom app (webhooks, order-reading scope) and a short theme snippet, delivered as a setup guide. **No live Shopify settings are changed by the implementer.**

## 8. Database design and security

**Tables** (`public` with an `affiliate_` prefix per repo conventions; helpers in `private`):

- `affiliate_programs`: `joat`, `amare`, with attribution window and model.
- `affiliate_profiles`: one per user; random 8-character public code (no confusable characters, non-sequential); masked payout method.
- `affiliate_applications`: requested programmes, acknowledgements, status.
- `affiliate_memberships`: `(profile, program)` with its own status (pending, approved, rejected, suspended, withdrawn).
- `affiliate_campaigns`, `affiliate_links` (destination checked against a per-programme allowlist).
- `affiliate_clicks`: no raw IP; salted daily IP hash for bot detection, UTM, consent state, referring domain.
- `referral_attributions`: click → lead or order.
- `affiliate_conversions`: Shopify order or JOAT engagement.
- `joat_engagements`, `joat_invoices`, `joat_payments`: the missing JOAT revenue chain, admin-entered.
- `affiliate_commission_rules`: versioned, with effective dates.
- `affiliate_commissions`: immutable snapshot of rule version, rate, base and currency. Corrections are `affiliate_commission_adjustments` rows; records are never edited.
- `affiliate_payouts`, `affiliate_payout_items`: an item appears in at most one payout (unique constraint).
- `affiliate_fraud_flags`, `webhook_events`, `partner_audit_log` (append-only).
- `partner_assets`, `partner_staff` (role + programme scope), `legal_approvals`.

**Money:** `numeric(14,2)` plus currency code, calculated in SQL, never JavaScript floats. Rounding half-up to the cent per commission line, pending D9.

**Commission statuses:** `pending_verification → pending_review → approved → payable → paid`, side states `held`, `reversed`, `rejected`. Transitions enforced in a database function.

**Single level only:** no relationship/override table at launch; CHECK constraint `level = 1`; no admin toggle. A second level would need a new migration plus documented legal approval.

**Access control:**

| | Own data | Other ambassadors | Edit financial records | Notes |
|---|---|---|---|---|
| Visitor (anon) | – | ✗ | ✗ | Clicks recorded only via `track-click` |
| Ambassador | Read: profile, memberships, links, own click totals, conversions (customer data masked), commissions, payouts | ✗ | ✗ (no write access) | Edits allowed profile fields only |
| Programme manager | – | Assigned programmes only | Review/approve conversions and commissions for their programme | Cannot approve payouts |
| Finance | – | Read | Create/approve payout batches; record payment evidence | Cannot approve a payment they entered (two-person check) |
| Super admin | – | All | All, audited | Admin actions require two-factor sign-in, enforced in the DB |
| Service role | Edge Functions only | | | Never in the browser |

## 9. Integrations and configuration

- **Shopify:** custom app on the Amare store.
- **Transactional email:** needed for ambassador emails and Supabase Auth (built-in email is heavily rate-limited; Web3Forms only reaches the team inbox). Options: Resend, ZeptoMail (Zoho already used), Postmark. **D7.**
- **Portal hosting:** Cloudflare Pages + `partners` CNAME in joatkenya.com's Truehost DNS (D2).
- **Secrets** (Edge Function secrets): `SHOPIFY_AMARE_WEBHOOK_SECRET`, `SHOPIFY_AMARE_ADMIN_TOKEN`, `REFERRAL_TOKEN_KEY`, `EMAIL_API_KEY`.
- **Consent:** lightweight banner on joatkenya.com and the parent-facing Amare pages. GA4/Clarity currently run without one.

## 10. Commission calculation examples

Rates below are **placeholders to show the arithmetic, not proposals.**

**Amare order** (10% placeholder):

| | |
|---|---|
| 2 × T-shirt at $32.94 | $65.88 |
| 10% discount | −$6.59 |
| **Eligible base** (shipping $7.50 and tax $4.20 excluded) | **$59.29** |
| Commission (10% × $59.29 = $5.929) | **$5.93**, `pending_verification` until the hold ends |
| Partial refund of 1 item (Shopify refund line total) | $29.65 |
| New base | $29.64 → $2.96 |
| Adjustment row (original unchanged) | **−$2.97** |
| Full refund or chargeback | Adjustment row −$5.93 |

**JOAT engagement** (placeholder: 10% of first collected invoice, or $150 fixed fee):

| | |
|---|---|
| Lead arrived via joatkenya.com with a referral token | Attribution kept on the lead |
| Admin records engagement, INV-001 for $2,000 | No commission (unpaid) |
| $2,000 payment recorded with evidence, confirmed by a second admin | $200.00 (or $150.00 fixed), `pending_review` |
| INV-002 for $2,000 later | **No commission** (first-invoice-only) |
| Same payment recorded twice | Rejected by unique constraint on payment reference |

## 11. Risks, dependencies and legal checklist

- **Blocking before Phase 1:** unpushed security migrations and the listable bucket; 10 uncommitted JOAT files; Amare local copy behind origin (before Phase 3).
- **COPPA:** attribution cookies only on parent-facing Amare pages and the shop, never in children's content or the game. Ambassador material aimed at children needs separate review.
- **"Buy it now"** may drop the cart attribute: test; fallbacks are Shopify's order-source data or disabling those buttons.
- **JOAT commissions rely on accurate admin entry** until an invoicing system is connected; controls are the two-person check and the audit log.
- **Shared Supabase project** with the JACK bot and course students: fine with RLS and roles, but one mistake affects everything (D12).
- **Currency:** JOAT prices in KES today; US launch implies USD. Commissions stay in the original transaction's currency.
- **Tax:** W-9 and 1099-NEC above the IRS threshold for US ambassadors (confirm the current figure with a tax adviser); W-8BEN for non-US; OFAC screening before payouts.

**Legal / FTC checklist for a US attorney** (all programme terms marked as drafts pending review):

- [ ] FTC Endorsement Guides (16 CFR 255): clear disclosure next to the endorsement, including spoken disclosure in videos and live streams.
- [ ] FTC Act §5: earnings claims; no income guarantees.
- [ ] Business Opportunity Rule applicability ($0 fee, no required purchase; attorney to confirm).
- [ ] COPPA and children's advertising guidance for Amare.
- [ ] CCPA/CPRA and other state privacy laws (affiliate cookies as "sharing"; opt-out).
- [ ] State sales-tax nexus created by affiliates.
- [ ] CAN-SPAM for programme emails.
- [ ] Data retention and deletion policy.
- [ ] Kenya Data Protection Act 2019 (data processed by the Kenyan team).
- [ ] Ambassador agreement terms; anti-pyramid statutes for any future second level.

## 12. Phased plan and rough effort (engineer-days)

| Phase | Scope | Effort | Blocked by |
|---|---|---|---|
| 0 | Commit existing work, push security migrations, fix the bucket | 0.5 | Owner go-ahead |
| 1 | Portal shell, separate build, roles, admin two-factor, core tables, RLS + tests, public programme pages | 5–7 | ~~D1, D2~~ resolved |
| 2 | Applications, approval queue, memberships, ambassador dashboard, emails | 4–6 | D7 |
| 3 | `track-click`, signed tokens, links, campaigns, deep links, consent, joatkenya.com + Amare capture | 5–7 | D4, D5 |
| 4 | Shopify app, webhooks, reconciliation; JOAT engagement/invoice/payment admin workflow | 7–10 | D3 |
| 5 | Commission engine, holds, adjustments, payout batches, two-person approval | 6–8 | D6, D8, D9 |
| 6 | Resource library, welcome pack, disclosure guide | 3–4 | Verified brand content |
| 7 | Admin reports, CSV export (formula-injection safe), fraud flags, audit views | 5–7 | – |
| 8 | Security pass, end-to-end tests, setup and operations docs | 4–6 | – |
| **Total** | | **~40–55** | |

## 13. Open decisions

- **D3.** Amare store's Shopify plan and Shopify Payments status; permission to create a custom app and add the theme snippet.
- **D4.** First-touch or last-touch attribution. Recommended: last-touch, 30-day window.
- **D5.** Connect `shop.amaresbigplanet.com` as the store's custom domain (optional, more robust attribution).
- **D6.** Commission rates; eligible-revenue definition (e.g. is Gelato production cost deducted?); JOAT qualifying event (recommended: first collected invoice only).
- **D7.** Transactional email provider.
- **D8.** Hold period before approval (suggested 30 days after payment/collection), payout method, currency, schedule, minimum payout.
- **D9.** Rounding rule; KES as well as USD?
- **D10.** Tax documentation workflow (in portal or outside).
- **D11.** First super admin, programme managers, finance users.
- **D12.** Shared Supabase project (recommended) or a separate one.
