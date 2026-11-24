# Installing the ambassador snippet in the Amare Shopify theme

The snippet is [docs/partners/shopify/abp-referral.liquid](partners/shopify/abp-referral.liquid).
It replaces the older inline script (`abp-referral-snippet.html`) that is currently pasted
above `</body>` in the live theme **Rebel** (Horizon 4.1.1, theme id 154477789356).

The Shopify CLI isn't installed on this machine, so these are the steps to install it by hand
in the theme code editor. Do it on a **copy** of the theme first.

## Before you start

Deploy these first, or the shop links and cart field won't work:

- migrations `20261127100000`, `20261128100000`, `20261129100000`
- the Edge Functions `track-click` and `lookup-ambassador` (see the deploy list in the
  hand-over notes)

## 1. Make an unpublished copy

Shopify admin → **Online Store → Themes** → on **Rebel**, **⋯ → Duplicate**. Shopify names the
copy "Copy of Rebel". Do all the following steps on the copy.

## 2. Add the snippet file

1. On "Copy of Rebel": **⋯ → Edit code**.
2. In the left sidebar, **snippets** folder → **Add a new snippet** → name it `abp-referral`
   (Shopify adds `.liquid`).
3. Paste the whole contents of `docs/partners/shopify/abp-referral.liquid` into it. **Save**.

## 3. Swap the old script for the snippet

1. Open **layout/theme.liquid**.
2. Search for `abp_ref` near `</body>`. Delete the old block: everything from the
   `<!--` comment that starts with "Amare's Big Planet: ambassador referral snippet" down to its
   closing `</script>`.
3. In the same place (just above `</body>`), add this one line:

   ```liquid
   {% render 'abp-referral' %}
   ```

4. **Save**.

## 4. Turn off "Buy it now" (if it's on)

"Buy it now" (dynamic checkout buttons) skips the cart, so the referral never reaches the
order. **Customize** the theme → open a product page → select the **Buy buttons** block →
untick **Show dynamic checkout buttons** → **Save**.

## 5. Preview and test the copy

On "Copy of Rebel": **⋯ → Preview**. The preview opens on the shop with `?preview_theme_id=…` in
the address. Keep that parameter when testing:

1. **Cart field.** Add any product to the cart and open the cart drawer, then the cart page
   (`/cart`). Above the checkout button, both should show **Ambassador code (optional)** with an
   **Apply** button and the "isn't a discount code" note.
2. **Apply a code.** Enter a real approved Amare ambassador code → you should see
   "Referred by <First name> <Initial>. ✓". Open `/cart.js` in a new tab: `attributes` shows
   `_abp_ref` (a long token) and `_abp_code`.
3. **Remove.** Click **Remove** → `/cart.js` no longer shows either attribute.
4. **Shop link.** Create a shop link in the portal (Links → page on the Amare shop), open it,
   and add `&preview_theme_id=<id>` to the address. The `ref` and `ln` parameters disappear from
   the address bar. In the portal the click count goes up. If the store's cookie banner is on
   and you accept marketing, `/cart.js` shows `_abp_ref`.

When everything works, **⋯ → Publish** on "Copy of Rebel". Keep the old Rebel until a real
referred order has come through, then delete it.

## Notes

- The field finds the checkout buttons (`name="checkout"`) on the page and inserts itself above
  them, and puts itself back whenever Horizon re-draws the cart. If a theme update moves the
  buttons and the field disappears, check that the checkout button still has `name="checkout"`.
- Consent for shop links comes from Shopify's Customer Privacy API (`marketingAllowed()`).
  Where Shopify shows no cookie banner (visitor regions that don't require one), Shopify
  reports consent as given.
- If ambassador discount codes are switched on later
  ([docs/partners/shopify-discounts.md](partners/shopify-discounts.md)), change the note in the
  snippet (the `NOTE` line), because the code will then also work as a discount at checkout.
