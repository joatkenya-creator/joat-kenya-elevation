// track-click: records an ambassador referral click and, when the visitor has
// accepted cookies, returns a signed referral token for the site to keep.
//
// Called from the browser on joatkenya.com and amaresbigplanet.com. Deploy
// without JWT verification (visitors aren't signed in):
//   supabase functions deploy track-click --no-verify-jwt
// Needs the secret REFERRAL_TOKEN_KEY (32+ random characters):
//   supabase secrets set REFERRAL_TOKEN_KEY=...
//
// Request (POST, JSON):
//   { landing_url, referrer?, consent }      a new click
//   { click_id, consent: true }              visitor accepted cookies after landing
// Response: { ok, click_id?, token?, max_age?, model? }

import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  REF_PATTERN,
  hashIp,
  isSiteHost,
  parseLanding,
  referrerDomain,
  signToken,
} from "../_shared/referral.js";

type Program = { id: string; site_url: string | null };
type ClickRow = { click_id: number; window_days: number; model: string };

const KEY = Deno.env.get("REFERRAL_TOKEN_KEY") ?? "";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

let cache: { at: number; programs: Program[] } | null = null;
async function programs(): Promise<Program[]> {
  if (cache && Date.now() - cache.at < 60_000) return cache.programs;
  const { data, error } = await db.from("affiliate_programs").select("id, site_url");
  if (error) throw error;
  cache = { at: Date.now(), programs: (data ?? []) as Program[] };
  return cache.programs;
}

const reply = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "content-type": "application/json", "cache-control": "no-store" },
  });

async function withToken(row: ClickRow | undefined, programId: string, consent: boolean) {
  if (!row) return { ok: false };
  if (!consent) return { ok: true, click_id: row.click_id };
  const maxAge = row.window_days * 86_400;
  const token = await signToken(
    { v: 1, k: row.click_id, p: programId, exp: Math.floor(Date.now() / 1000) + maxAge },
    KEY,
  );
  return { ok: true, click_id: row.click_id, token, max_age: maxAge, model: row.model };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  let site: Program | undefined;
  try {
    const host = origin ? new URL(origin).host : "";
    site = (await programs()).find((p) => p.site_url && isSiteHost(host, p.site_url));
  } catch {
    site = undefined;
  }

  // Only the programmes' own sites may call this from a browser.
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false }, 400, cors);
  }
  const consent = body.consent === true;
  // Supabase is served through Cloudflare, which overwrites cf-connecting-ip
  // with the real client IP (checked 2026-11-21), so a visitor can't forge it.
  // No header means the request didn't come through Cloudflare: refuse it.
  const ip = req.headers.get("cf-connecting-ip");
  if (!ip) return reply({ ok: false }, 400, cors);
  const ipHash = await hashIp(ip, KEY);

  if (typeof body.click_id === "number") {
    if (!consent) return reply({ ok: false }, 400, cors);
    const { data, error } = await db.rpc("consent_partner_click", {
      p_click_id: body.click_id,
      p_program_id: site.id,
      p_ip_hash: ipHash,
    });
    if (error) {
      console.error("consent_partner_click failed", error.message);
      return reply({ ok: false }, 500, cors);
    }
    return reply(await withToken((data as ClickRow[])?.[0], site.id, true), 200, cors);
  }

  const landing = parseLanding(String(body.landing_url ?? ""), site.site_url!);
  if (!landing || !REF_PATTERN.test(landing.ref)) return reply({ ok: false }, 200, cors);

  const { data, error } = await db.rpc("record_partner_click", {
    p_program_id: site.id,
    p_ref: landing.ref,
    p_link_code: landing.linkCode,
    p_landing_path: landing.path,
    p_utm: landing.utm,
    p_referrer_domain: referrerDomain(String(body.referrer ?? ""), site.site_url!),
    p_ip_hash: ipHash,
    p_consent: consent,
  });
  if (error) {
    console.error("record_partner_click failed", error.message);
    return reply({ ok: false }, 500, cors);
  }
  return reply(await withToken((data as ClickRow[])?.[0], site.id, consent), 200, cors);
});
