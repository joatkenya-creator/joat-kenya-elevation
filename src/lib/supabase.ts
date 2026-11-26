import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client. Uses the public anon key, so all access is
 * gated by Row-Level Security policies in the Supabase dashboard.
 *
 * Env vars (see `.env` at the project root):
 *   VITE_SUPABASE_URL       = https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY  = the project's anon JWT or sb_publishable_… key
 *
 * Do NOT put a service_role / sb_secret_* key in here — it would bypass RLS
 * and be visible to every visitor's browser.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "Supabase env vars not set. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.",
  );
}

// A password-reset email link lands with `#...type=recovery` in the URL. The
// client strips that hash once it has signed the user in, so read it first.
export const isPasswordRecovery =
  typeof window !== "undefined" && /type=recovery/.test(window.location.hash);

// Partner portal build only (vite.portal.config.ts sets the flag): the session
// lives in this tab's sessionStorage, so closing the tab ends it. The public
// site keeps the default localStorage session for course students.
const tabSessions =
  import.meta.env.VITE_PORTAL_TAB_SESSIONS === "true" && typeof window !== "undefined";

function portalAuthOptions() {
  // Sessions from before this change sat in localStorage; drop them so they
  // can't sign anyone in (or be read by someone at the same browser later).
  for (const key of Object.keys(localStorage))
    if (/^sb-.*-(auth-token|code-verifier)$/.test(key)) localStorage.removeItem(key);

  // A key per tab, not per project: supabase-js broadcasts sign-in/out events
  // to other tabs on a channel named after this key, which would leak one
  // tab's session state into another. "Duplicate tab" copies it (and the session).
  const TAB_KEY = "joat_portal_tab_key";
  let storageKey = sessionStorage.getItem(TAB_KEY);
  if (!storageKey) {
    storageKey = `sb-portal-${crypto.randomUUID()}-auth-token`;
    sessionStorage.setItem(TAB_KEY, storageKey);
  }
  return {
    auth: {
      storage: window.sessionStorage,
      storageKey,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Kept implicit (the existing default): email confirmation and password
      // reset links open in a new tab, where a PKCE verifier from the old tab
      // wouldn't exist. Google sign-in redirects within the same tab either way.
      flowType: "implicit" as const,
    },
  };
}

export const supabase = createClient(
  SUPABASE_URL ?? "",
  SUPABASE_KEY ?? "",
  tabSessions ? portalAuthOptions() : undefined,
);

export const UPLOADS_BUCKET =
  (import.meta.env.VITE_SUPABASE_UPLOADS_BUCKET as string | undefined) ?? "contact-attachments";
