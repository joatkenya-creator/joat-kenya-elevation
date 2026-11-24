// lookup-ambassador: "Referred by Erick O." for a code a visitor typed on the
// website or in the shop cart. Returns the first name and last initial of an
// ambassador approved in the calling site's programme, nothing else.
//
// Deploy without JWT verification (visitors aren't signed in):
//   supabase functions deploy lookup-ambassador --no-verify-jwt
// Uses REFERRAL_TOKEN_KEY (already set for track-click) to salt the IP hash.
//
// Request (POST, JSON): { code }   a code the visitor typed
//                       { token }  a referral token already in the cart (shows
//                                  who referred them via a link)
// Response: { ok: true, display_name } or { ok: false, error } — the same
// generic error for unknown, unapproved, malformed and rate-limited codes.
// This only looks the code up; track-click records it.

import { normaliseCode, verifyToken } from "../_shared/referral.js";
import { KEY, db, gate, reply } from "../_shared/site.ts";

const NOT_FOUND = { ok: false, error: "We couldn't find that code" };

Deno.serve(async (req) => {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const { site, cors, ipHash, body } = g;

  if ("token" in body) {
    const ref = await verifyToken(body.token, KEY);
    if (ref?.p !== site.id || !Number.isInteger(ref.k)) return reply(NOT_FOUND, 200, cors);
    const { data } = await db.rpc("referral_display_name", {
      p_click_id: ref.k,
      p_program_id: site.id,
    });
    return reply(data ? { ok: true, display_name: data } : NOT_FOUND, 200, cors);
  }

  const code = normaliseCode(body.code);
  if (!code) return reply(NOT_FOUND, 200, cors);
  const { data, error } = await db.rpc("lookup_ambassador", {
    p_program_id: site.id,
    p_code: code,
    p_ip_hash: ipHash,
  });
  if (error) {
    console.error("lookup_ambassador failed", error.message);
    return reply(NOT_FOUND, 200, cors);
  }
  return reply(data ? { ok: true, display_name: data } : NOT_FOUND, 200, cors);
});
