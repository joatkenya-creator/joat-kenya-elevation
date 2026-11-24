// sync-shopify-discounts: makes Shopify's discount codes match the programme's
// ambassador discount setting. One code per approved ambassador (code =
// the Amare membership's ref_code, ambassador_discount_percent off, once per customer); codes of
// ambassadors who are no longer approved, or all codes when the setting is
// empty, are switched off. Pressed from Admin → Programs → "Sync to Shopify".
//
// NOT run against the live store yet. Setup: docs/partners/shopify-discounts.md.
//
// Deploy WITH JWT verification (only signed-in super admins may call it):
//   supabase functions deploy sync-shopify-discounts
// Secrets:
//   SHOPIFY_AMARE_ADMIN_TOKEN   Admin API access token with write_discounts
//   SHOPIFY_AMARE_SHOP_DOMAIN   already set for shopify-webhook (wu0b1t-n6.myshopify.com)
//   SHOPIFY_API_VERSION         optional, default below
//
// Request (POST, JSON): { program_id: "amare" }
// Response: { created, updated, deactivated, unchanged, errors: [{ code, message }] }

import { createClient } from "jsr:@supabase/supabase-js@2";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const db = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const ADMIN_TOKEN = Deno.env.get("SHOPIFY_AMARE_ADMIN_TOKEN") ?? "";
const SHOP = Deno.env.get("SHOPIFY_AMARE_SHOP_DOMAIN") ?? "wu0b1t-n6.myshopify.com";
const API_VERSION = Deno.env.get("SHOPIFY_API_VERSION") ?? "2026-01";
const PORTAL_ORIGINS = ["https://partners.joatkenya.com", "http://localhost:8081"];

type PlanRow = {
  profile_id: string;
  code: string;
  want_active: boolean;
  percent: number | null;
  shopify_id: string | null;
  synced_percent: number | null;
  active: boolean | null;
};

async function shopify(query: string, variables: Record<string, unknown>) {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shopify-access-token": ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.errors) throw new Error(JSON.stringify(json?.errors ?? res.status));
  const payload = Object.values(json.data ?? {})[0] as {
    codeDiscountNode?: { id: string };
    userErrors?: { message: string }[];
  };
  if (payload?.userErrors?.length)
    throw new Error(payload.userErrors.map((e) => e.message).join("; "));
  return payload?.codeDiscountNode?.id ?? null;
}

const NODE = "codeDiscountNode { id } userErrors { field message }";
const gets = (percent: number) => ({ value: { percentage: percent / 100 }, items: { all: true } });

const create = (code: string, percent: number) =>
  shopify(
    `mutation($input: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $input) { ${NODE} } }`,
    {
      input: {
        title: `Ambassador ${code}`,
        code,
        startsAt: new Date().toISOString(),
        context: { all: "ALL" },
        customerGets: gets(percent),
        appliesOncePerCustomer: true,
      },
    },
  );
const update = (id: string, percent: number) =>
  shopify(
    `mutation($id: ID!, $input: DiscountCodeBasicInput!) { discountCodeBasicUpdate(id: $id, basicCodeDiscount: $input) { ${NODE} } }`,
    { id, input: { customerGets: gets(percent) } },
  );
const setActive = (id: string, on: boolean) =>
  shopify(
    `mutation($id: ID!) { ${on ? "discountCodeActivate" : "discountCodeDeactivate"}(id: $id) { ${NODE} } }`,
    { id },
  );

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const cors: Record<string, string> = PORTAL_ORIGINS.includes(origin)
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
        "access-control-allow-methods": "POST, OPTIONS",
        vary: "origin",
      }
    : {};
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "content-type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply({ error: "method" }, 405);

  const body = await req.json().catch(() => ({}));
  const programId = String(body?.program_id ?? "");

  // Ask the database as the caller: discount_sync_plan refuses anyone who isn't
  // a super admin signed in with MFA.
  const asCaller = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false },
    global: { headers: { authorization: req.headers.get("authorization") ?? "" } },
  });
  const { data: plan, error } = await asCaller.rpc("discount_sync_plan", {
    p_program_id: programId,
  });
  if (error)
    return reply(
      { error: error.message.includes("not_authorised") ? "not_authorised" : "plan_failed" },
      403,
    );
  if (!ADMIN_TOKEN) return reply({ error: "shopify_not_configured" }, 503);

  const out = {
    created: 0,
    updated: 0,
    deactivated: 0,
    unchanged: 0,
    errors: [] as { code: string; message: string }[],
  };
  // ponytail: one Shopify call at a time; fine for hundreds of ambassadors, batch if it gets slow.
  for (const r of plan as PlanRow[]) {
    try {
      const record = (shopifyId: string, percent: number, active: boolean) =>
        db.rpc("record_discount_sync", {
          p_program_id: programId,
          p_profile_id: r.profile_id,
          p_code: r.code,
          p_shopify_id: shopifyId,
          p_percent: percent,
          p_active: active,
        });
      if (r.want_active && r.percent) {
        if (!r.shopify_id) {
          const id = await create(r.code, r.percent);
          if (!id) throw new Error("Shopify returned no discount id");
          await record(id, r.percent, true);
          out.created++;
        } else if (Number(r.synced_percent) !== Number(r.percent) || !r.active) {
          if (Number(r.synced_percent) !== Number(r.percent)) await update(r.shopify_id, r.percent);
          if (!r.active) await setActive(r.shopify_id, true);
          await record(r.shopify_id, r.percent, true);
          out.updated++;
        } else out.unchanged++;
      } else if (r.shopify_id && r.active) {
        await setActive(r.shopify_id, false);
        await record(r.shopify_id, Number(r.synced_percent), false);
        out.deactivated++;
      } else out.unchanged++;
    } catch (e) {
      out.errors.push({ code: r.code, message: String((e as Error).message).slice(0, 300) });
    }
  }
  return reply(out);
});
