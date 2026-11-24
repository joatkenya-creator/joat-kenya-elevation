// Shared by the browser-facing Edge Functions (track-click, lookup-ambassador):
// which programme a request's Origin belongs to, CORS headers, the visitor's
// IP hash and JSON replies. Only the programmes' own sites may call them.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { hashIp, isSiteHost } from "./referral.js";

export type Program = { id: string; site_url: string | null; shop_url: string | null };

/** The hosts a programme's visitors arrive on: its site and, if it has one, its shop. */
export const hostsOf = (p: Program) => [p.site_url, p.shop_url];

export const KEY = Deno.env.get("REFERRAL_TOKEN_KEY") ?? "";
export const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

let cache: { at: number; programs: Program[] } | null = null;
async function programs(): Promise<Program[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.programs;
  const { data, error } = await db.from("affiliate_programs").select("id, site_url, shop_url");
  if (error) throw error;
  cache = { at: Date.now(), programs: (data ?? []) as Program[] };
  return cache.programs;
}

export const reply = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "content-type": "application/json", "cache-control": "no-store" },
  });

/**
 * Checks the request before any work: allowed origin, CORS preflight, POST,
 * secret configured, Cloudflare client IP present, JSON body. Returns either
 * a finished Response or what the handler needs.
 */
export async function gate(
  req: Request,
): Promise<
  | Response
  | { site: Program; cors: Record<string, string>; ipHash: string; body: Record<string, unknown> }
> {
  const origin = req.headers.get("origin") ?? "";
  let site: Program | undefined;
  try {
    const host = origin ? new URL(origin).host : "";
    site = (await programs()).find((p) => p.site_url && isSiteHost(host, hostsOf(p)));
  } catch {
    site = undefined;
  }
  if (!site) return reply({ ok: false }, 403, {});

  const cors = {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply({ ok: false }, 405, cors);
  if (KEY.length < 32) {
    console.error("REFERRAL_TOKEN_KEY is missing or too short");
    return reply({ ok: false }, 503, cors);
  }
  // Supabase is served through Cloudflare, which overwrites cf-connecting-ip
  // with the real client IP (checked 2026-11-21), so a visitor can't forge it.
  // No header means the request didn't come through Cloudflare: refuse it.
  const ip = req.headers.get("cf-connecting-ip");
  if (!ip) return reply({ ok: false }, 400, cors);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false }, 400, cors);
  }
  return { site, cors, ipHash: await hashIp(ip, KEY), body };
}
