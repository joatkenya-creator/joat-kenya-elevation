# Ambassador discount codes in Shopify (built, currently OFF)

Amare's `ambassador_discount_percent` is empty, so **no Shopify discounts exist** and ambassador
codes only credit sales, through the website box and the shop cart field. Nothing on this page
needs doing until you decide to give shoppers a discount for using an ambassador's code.

When it's on, every approved Amare ambassador's code (their 8-character `public_code`) works at
Shopify checkout for the set percentage, once per customer. The webhook credits the order to
that ambassador (`discount_code` click) if no other referral is on the order.

## One-time setup

1. **Create a custom app with discount access.** Shopify admin → **Settings → Apps and sales
   channels → Develop apps** → **Create an app** ("JOAT ambassador discounts") →
   **Configure Admin API scopes** → tick `write_discounts` and `read_discounts` → **Save** →
   **Install app**. Copy the **Admin API access token** (it's shown only once).
2. **Store it as a Supabase secret** (never in the repo):

   ```sh
   supabase secrets set SHOPIFY_AMARE_ADMIN_TOKEN=shpat_...
   ```

   `SHOPIFY_AMARE_SHOP_DOMAIN` is already set for the webhook. Optionally pin the Admin API
   version with `SHOPIFY_API_VERSION` (default `2026-01`).
3. **Deploy the function** with JWT verification (only signed-in super admins may call it):

   ```sh
   supabase functions deploy sync-shopify-discounts --use-api
   ```

4. **Test on a development store first.** Point `SHOPIFY_AMARE_SHOP_DOMAIN` and the token at a
   free Shopify development store, set a percentage, press Sync, and check **Discounts** in that
   store's admin. The mutations use `discountCodeBasicCreate`/`Update`/`Activate`/`Deactivate`
   with `context: { all: ALL }`. If Shopify reports an unknown field, the API version has moved
   on: check the `DiscountCodeBasicInput` reference for that version.

## Switching it on

1. Portal → **Admin → Programs** (super admin, signed in with MFA) → Amare's Big Planet:
   ambassador discount codes → enter the percentage → **Save**.
2. Press **Sync to Shopify**. The result line lists codes created, updated and switched off,
   and any that failed (for example, a code that already exists as a manual discount).
3. Change the note in the theme snippet (`NOTE` in `abp-referral.liquid`): it currently tells
   shoppers the code isn't a discount.
4. Press **Sync** again after approving new ambassadors or suspending any: codes are only
   created or switched off when you sync.

## Switching it off

Clear the percentage → **Save** → **Sync to Shopify**. Every code the sync created is switched
off in Shopify (kept, not deleted, so turning it back on reuses them).
