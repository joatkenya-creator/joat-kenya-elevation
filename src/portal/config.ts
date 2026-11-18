// Portal configuration. URLs come from env so nothing production-specific is
// baked in; defaults follow decision D1 (JOAT referrals land on joatkenya.com
// for now). See .env.example.
const env = import.meta.env;

export const JOAT_SITE_URL =
  (env.VITE_JOAT_SITE_URL as string | undefined) || "https://joatkenya.com";
export const AMARE_SITE_URL =
  (env.VITE_AMARE_SITE_URL as string | undefined) || "https://amaresbigplanet.com";
/** Optional. Unset: the contact page points to the main site's contact form instead. */
export const SUPPORT_EMAIL = (env.VITE_PARTNERS_SUPPORT_EMAIL as string | undefined) || null;

export const BRAND = {
  legalName: "JOAT Global Mission Solutions LLC",
  name: "JOAT Global",
  tagline: "Providing what your business needs to succeed.",
};
