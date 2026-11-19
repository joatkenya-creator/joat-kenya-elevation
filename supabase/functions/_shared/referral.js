// Referral tokens and landing-URL parsing for the ambassador programme.
// Plain JavaScript with Web Crypto only, so the same file runs in the
// track-click Edge Function (Deno) and in the Node tests.

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const fromB64url = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

const hmacKey = (secret) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

/** Public referral codes: 8 characters of Crockford base32 (see private.new_public_code). */
export const REF_PATTERN = /^[0-9A-HJKMNP-TV-Z]{8}$/;

/**
 * Signed, tamper-proof referral token: "<payload>.<signature>". The payload
 * holds only the click id, programme and expiry, never personal data.
 * Shopify and lead verification (Phase 4) check it with verifyToken.
 */
export async function signToken(payload, secret) {
  const body = toB64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return `${body}.${toB64url(sig)}`;
}

/** Returns the payload, or null if the token is malformed, forged or expired. */
export async function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== "string" || token.length > 600) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  try {
    // crypto.subtle.verify compares in constant time.
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromB64url(parts[1]),
      enc.encode(parts[0]),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromB64url(parts[0])));
    if (typeof payload?.exp !== "number" || payload.exp * 1000 <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

/** True when `host` is the site's host or its www. variant. */
export function isSiteHost(host, siteUrl) {
  const site = new URL(siteUrl).host;
  return host === site || host === `www.${site}`;
}

/**
 * Splits the page a visitor landed on into what gets stored. Returns null
 * unless the URL is on the programme's own site. The ref/ln parameters are
 * removed from the stored path; UTM tags are kept, trimmed.
 */
export function parseLanding(landingUrl, siteUrl) {
  let url;
  try {
    url = new URL(landingUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !isSiteHost(url.host, siteUrl)) return null;

  const ref = (url.searchParams.get("ref") ?? "").trim().toUpperCase();
  const linkCode = (url.searchParams.get("ln") ?? "").trim().toUpperCase() || null;
  const utm = {};
  for (const k of ["source", "medium", "campaign", "content"]) {
    const v = url.searchParams.get(`utm_${k}`);
    if (v) utm[k] = v.slice(0, 100);
  }
  url.searchParams.delete("ref");
  url.searchParams.delete("ln");
  return { ref, linkCode, path: (url.pathname + url.search).slice(0, 500), utm };
}

/** Domain of the page that sent the visitor, or null for the site itself / none. */
export function referrerDomain(referrer, siteUrl) {
  try {
    const host = new URL(referrer).hostname;
    return isSiteHost(host, siteUrl) ? null : host.slice(0, 255);
  } catch {
    return null;
  }
}

/** Daily-salted IP hash: same visitor on the same day matches, nothing more. */
export async function hashIp(ip, secret, now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`${secret}|${day}|${ip}`));
  return toB64url(digest).slice(0, 32);
}
