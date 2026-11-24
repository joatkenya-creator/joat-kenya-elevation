// track-click: records an ambassador referral click and, when the visitor has
// accepted cookies (or typed an ambassador code), returns a signed referral
// token for the site to keep.
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
//   { code, source, landing_url? }           visitor typed an ambassador code
//                                            (source: "code_site" | "code_cart");
//                                            always consented, always gets a token
// Response: { ok, click_id?, token?, max_age?, model?, display_name? }

import {
  REF_PATTERN,
  normaliseCode,
  parseLanding,
  referrerDomain,
  signToken,
} from "../_shared/referral.js";
import { KEY, db, gate, hostsOf, reply } from "../_shared/site.ts";

type ClickRow = { click_id: number; window_days: number; model: string; display_name?: string };

async function withToken(row: ClickRow | undefined, programId: string, consent: boolean) {
  if (!row) return { ok: false };
  if (!consent) return { ok: true, click_id: row.click_id };
  const maxAge = row.window_days * 86_400;
  const token = await signToken(
    { v: 1, k: row.click_id, p: programId, exp: Math.floor(Date.now() / 1000) + maxAge },
    KEY,
  );
  return {
    ok: true,
    click_id: row.click_id,
    token,
    max_age: maxAge,
    model: row.model,
    ...(row.display_name ? { display_name: row.display_name } : {}),
  };
}

Deno.serve(async (req) => {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const { site, cors, ipHash, body } = g;
  const consent = body.consent === true;

  if ("code" in body) {
    const code = normaliseCode(body.code);
    const source = body.source === "code_cart" ? "code_cart" : "code_site";
    if (!code) return reply({ ok: false }, 200, cors);
    const landing = parseLanding(String(body.landing_url ?? ""), hostsOf(site));
    const { data, error } = await db.rpc("record_partner_code_click", {
      p_program_id: site.id,
      p_code: code,
      p_source: source,
      p_landing_path: landing?.path ?? "/",
      p_ip_hash: ipHash,
    });
    if (error) {
      console.error("record_partner_code_click failed", error.message);
      return reply({ ok: false }, 500, cors);
    }
    return reply(await withToken((data as ClickRow[])?.[0], site.id, true), 200, cors);
  }

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

  const landing = parseLanding(String(body.landing_url ?? ""), hostsOf(site));
  if (!landing || !REF_PATTERN.test(landing.ref)) return reply({ ok: false }, 200, cors);

  const { data, error } = await db.rpc("record_partner_click", {
    p_program_id: site.id,
    p_ref: landing.ref,
    p_link_code: landing.linkCode,
    p_landing_path: landing.path,
    p_utm: landing.utm,
    p_referrer_domain: referrerDomain(String(body.referrer ?? ""), hostsOf(site)),
    p_ip_hash: ipHash,
    p_consent: consent,
  });
  if (error) {
    console.error("record_partner_click failed", error.message);
    return reply({ ok: false }, 500, cors);
  }
  return reply(await withToken((data as ClickRow[])?.[0], site.id, consent), 200, cors);
});
