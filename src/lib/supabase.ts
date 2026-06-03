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

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_KEY ?? "");

export const UPLOADS_BUCKET =
  (import.meta.env.VITE_SUPABASE_UPLOADS_BUCKET as string | undefined) ?? "contact-attachments";
