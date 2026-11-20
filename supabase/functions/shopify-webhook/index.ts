// shopify-webhook: receives Amare's Shopify store webhooks (orders/paid,
// refunds/create, orders/cancelled, disputes/create, disputes/update) and
// records what the ambassador programme needs to credit a sale.
//
// Deploy without JWT verification (Shopify signs requests instead):
//   supabase functions deploy shopify-webhook --no-verify-jwt --use-api
// Secrets:
//   SHOPIFY_AMARE_WEBHOOK_SECRET  the signing key shown under Shopify admin →
//                                 Settings → Notifications → Webhooks
//   SHOPIFY_AMARE_SHOP_DOMAIN     wu0b1t-n6.myshopify.com (the permanent store name
//                                 Shopify sends, not the public amares-big-planet one)
//   REFERRAL_TOKEN_KEY            already set for track-click
//
// Never credits a sale from the browser: only a correctly signed webhook
// whose order carries a valid, unexpired referral token counts.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { emailHash, extract, verifyShopifyHmac } from "../_shared/shopify.js";
import { verifyToken } from "../_shared/referral.js";

const SECRET = Deno.env.get("SHOPIFY_AMARE_WEBHOOK_SECRET") ?? "";
const SHOP = Deno.env.get("SHOPIFY_AMARE_SHOP_DOMAIN") ?? "wu0b1t-n6.myshopify.com";
const REF_KEY = Deno.env.get("REFERRAL_TOKEN_KEY") ?? "";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const reply = (status: number, outcome: string) =>
  new Response(JSON.stringify({ outcome }), {
    status,
    headers: { "content-type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, "method");
  if (!SECRET || REF_KEY.length < 32) {
    console.error("shopify-webhook secrets are missing");
    return reply(503, "not configured"); // Shopify retries, so nothing is lost while this is fixed
  }

  const raw = await req.text();
  if (!(await verifyShopifyHmac(raw, req.headers.get("x-shopify-hmac-sha256"), SECRET)))
    return reply(401, "bad signature");
  const shop = (req.headers.get("x-shopify-shop-domain") ?? "").trim().toLowerCase();
  if (shop !== SHOP.trim().toLowerCase()) {
    console.error(`wrong shop: got "${shop}", expected "${SHOP}"`); // domains only, no secrets
    return reply(403, "wrong shop");
  }

  const topic = req.headers.get("x-shopify-topic") ?? "";
  const webhookId =
    req.headers.get("x-shopify-webhook-id") ?? req.headers.get("x-shopify-event-id");
  if (!webhookId) return reply(400, "no webhook id");
  const eventAt = req.headers.get("x-shopify-triggered-at") ?? new Date().toISOString();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return reply(400, "bad json");
  }
  const data = extract(topic, payload) as Record<string, unknown> | null;
  if (!data) return reply(200, "ignored: topic");

  let clickId: number | null = null;
  if (topic === "orders/paid") {
    // The token must have been valid when the order was placed.
    const placedAt = Date.parse(String(data.created_at ?? "")) || Date.now();
    const ref = await verifyToken(data.token, REF_KEY, placedAt);
    if (ref?.p === "amare" && Number.isInteger(ref.k)) clickId = ref.k;
    data.email_hash = await emailHash(data.email);
    delete data.email; // only the hash is kept, for the self-referral check
    delete data.token;
  }

  const { data: outcome, error } = await db.rpc("ingest_shopify_event", {
    p_webhook_id: webhookId,
    p_topic: topic,
    p_event_at: eventAt,
    p_data: data,
    p_click_id: clickId,
  });
  if (error) {
    console.error("ingest_shopify_event failed", topic, error.message);
    return reply(500, "error"); // Shopify retries the delivery
  }
  return reply(200, String(outcome));
});
