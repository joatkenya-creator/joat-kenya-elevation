// Shopify webhook helpers for the ambassador programme. Plain JavaScript and
// Web Crypto, so it runs in the shopify-webhook Edge Function (Deno) and in
// the Node tests.

const enc = new TextEncoder();

/**
 * Checks X-Shopify-Hmac-Sha256: base64 HMAC-SHA256 of the raw request body,
 * keyed with the webhook signing secret. Constant-time via crypto.subtle.verify.
 */
export async function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sig = Uint8Array.from(atob(hmacHeader), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify("HMAC", key, sig, enc.encode(rawBody));
  } catch {
    return false;
  }
}

/** SHA-256 hex of the trimmed, lowercased email (matches private.email_hash in SQL). */
export async function emailHash(email) {
  if (typeof email !== "string" || !email.trim()) return null;
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(email.trim().toLowerCase()));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const amount = (set, fallback) => String(set?.shop_money?.amount ?? fallback ?? "0");

/**
 * Keeps only what commissions need from a webhook payload: ids, amounts as
 * strings (summed in SQL, never as JS floats), the hidden referral attribute.
 * No names, addresses or payment details. Returns null for topics we ignore.
 */
export function extract(topic, p) {
  switch (topic) {
    case "orders/paid":
      return {
        order_id: String(p.id),
        name: p.name ?? null,
        currency: p.currency ?? null,
        created_at: p.created_at ?? null,
        email: p.email ?? p.contact_email ?? p.customer?.email ?? null,
        token: (p.note_attributes ?? []).find((a) => a?.name === "_abp_ref")?.value ?? null,
        lines: (p.line_items ?? []).map((l) => ({
          price: amount(l.price_set, l.price),
          qty: Number(l.quantity) || 0,
          discounts: (l.discount_allocations ?? []).map((d) => amount(d.amount_set, d.amount)),
          gift_card: !!l.gift_card,
        })),
      };
    case "refunds/create":
      return {
        refund_id: String(p.id),
        order_id: String(p.order_id),
        lines: (p.refund_line_items ?? []).map((r) => ({
          subtotal: amount(r.subtotal_set, r.subtotal),
          gift_card: !!r.line_item?.gift_card,
        })),
      };
    case "orders/cancelled":
      return { order_id: String(p.id), cancelled_at: p.cancelled_at ?? null };
    case "disputes/create":
    case "disputes/update":
      return {
        dispute_id: String(p.id),
        order_id: String(p.order_id),
        status: p.status ?? "unknown",
      };
    default:
      return null;
  }
}
