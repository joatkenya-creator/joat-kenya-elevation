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

## Open, lower risk (track)

1. **Click IP header** (`track-click`): confirm the platform overwrites `cf-connecting-ip`, and
   reject clicks without it. Clicks earn nothing, so impact is limited to fraud-signal accuracy.
2. **Shopify timestamps** come from the unsigned `x-shopify-triggered-at` header; take them from
   the signed body instead. Needs a captured signed webhook to exploit.
3. **Commission rates** are read live: freeze the rate per sale before ever changing a rate.
4. **Payout-details change email** to the ambassador (needs the transactional email provider, D7).
5. Self-referral detection is by account email only; a different email gets past it. Review
   "Own purchase?" flags and unusual sales rates in Reports.
