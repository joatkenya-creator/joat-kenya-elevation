# Partner platform: security review (Phase 8, 2026-11-21)

Scope: all partner migrations (20261118…–20261123…), the `track-click` and `shopify-webhook`
Edge Functions, and the portal's CSV export. Independent code review plus live checks.

## Live checks

- Anonymous requests to every partner table and view are refused (`permission denied`);
  `contact_submissions` and `consultation_bookings` return no rows.
- Portal headers: CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies.
- `npm audit`: non-breaking fixes applied (vite, dompurify, seroval). Remaining: zod (major
  upgrade, client-side validation only, low risk).

## Fixed in this pass (20261123100000_partner_payouts.sql)

| Issue | Fix |
|---|---|
| Two simultaneous "Create batch" clicks could put the same sales in two batches (double payout) | Batch creation serialised per currency with an advisory lock |
| Payee total and line items computed from two snapshots (a refund arriving mid-way could overpay permanently) | Single statement computes both |
| "Mark paid" could race with "Cancel batch" (paid sales re-paid next month) | Every batch change locks the batch row first |
| Suspended ambassadors were still paid automatically | Only approved memberships are paid; suspended money is held |
| A hijacked account could redirect the next payout immediately | New or changed payout details only used after 7 days |
| A finance user who is also an ambassador could approve their own payout | Refused (`cannot_approve_own_payout`) |
| CSV export turned negative amounts (clawbacks) into text | Plain numbers are no longer prefixed; formula guard kept |
| Conversions view without `security_barrier` | Added |

All covered by `tests/partners-payouts.test.mjs` and `tests/partners-csv.test.mjs`
(`npm run test:security`).

## Closed on 2026-11-21 (20261124100000_partner_rates_usd.sql)

- **Click IP header:** Supabase is served through Cloudflare, which overwrites `cf-connecting-ip`
  with the real client IP; `track-click` now refuses requests without it.
- **Commission rates:** frozen per sale when the sale is attributed (`commission_rate` on
  `shopify_orders` and `joat_engagements`).
- **Payout-details change email:** `payout-details-notify`, triggered from the database, emails the
  ambassador's sign-in address once per change.
- **Changed by decision:** the two-person payout approval was removed (one person runs payouts).
  Every step is still in the activity log, and a payouts manager who is also an ambassador can't
  approve a batch paying themselves.

## Open, lower risk (track)

1. **Shopify timestamps** come from the unsigned `x-shopify-triggered-at` header; take them from
   the signed body instead. Needs a captured signed webhook to exploit.
2. Self-referral detection is by account email only; a different email gets past it. Review
   "Own purchase?" flags and unusual sales rates in Reports.
