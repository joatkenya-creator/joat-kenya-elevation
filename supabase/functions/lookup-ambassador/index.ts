// lookup-ambassador: "Referred by Erick O." for a code a visitor typed on the
// website or in the shop cart. Returns the first name and last initial of an
// ambassador approved in the calling site's programme, nothing else.
//
// Deploy without JWT verification (visitors aren't signed in):
//   supabase functions deploy lookup-ambassador --no-verify-jwt
// Uses REFERRAL_TOKEN_KEY (already set for track-click) to salt the IP hash.
//
// Request (POST, JSON): { code }
// Response: { ok: true, display_name } or { ok: false, error } — the same
// generic error for unknown, unapproved, malformed and rate-limited codes.
// This only looks the code up; track-click records it.

import { normaliseCode } from "../_shared/referral.js";
import { db, gate, reply } from "../_shared/site.ts";

const NOT_FOUND = { ok: false, error: "We couldn't find that code" };

Deno.serve(async (req) => {
  const g = await gate(req);
  if (g instanceof Response) return g;
  const { site, cors, ipHash, body } = g;

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
