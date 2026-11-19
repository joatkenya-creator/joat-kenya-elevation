/**
 * Cookie consent + ambassador referral capture for joatkenya.com.
 *
 * - A visitor arriving with ?ref=CODE is always counted as a click (no cookie,
 *   no identifier stored on their device).
 * - Only after they accept cookies does the track-click function issue a
 *   signed referral token, kept in a first-party cookie for the programme's
 *   attribution window. Last click wins, so a newer referral replaces it.
 * - GA4 and Clarity also wait for Accept (see index.html, joatLoadAnalytics).
 *
 * Amare's Big Planet has a copy of this logic in its own repository.
 */

const TRACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-click`;
const CONSENT_KEY = "joat_consent";
const REF_COOKIE = "joat_ref";
const PENDING_CLICK = "joat_pending_click";
export const CONSENT_CHANGED = "joat:consent-changed";

export type Consent = "accepted" | "rejected" | null;

declare global {
  interface Window {
    joatLoadAnalytics?: () => void;
  }
}

type TrackResponse = {
  ok: boolean;
  click_id?: number;
  token?: string;
  max_age?: number;
  model?: string;
};

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

async function track(body: Record<string, unknown>): Promise<TrackResponse | null> {
  try {
    const res = await fetch(TRACK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
    return res.ok ? ((await res.json()) as TrackResponse) : null;
  } catch {
    return null;
  }
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function keepToken(res: TrackResponse | null) {
  if (!res?.token || !res.max_age) return;
  if (res.model === "first_touch" && readCookie(REF_COOKIE)) return;
  document.cookie = `${REF_COOKIE}=${res.token}; Max-Age=${res.max_age}; Path=/; Secure; SameSite=Lax`;
}

/** The signed referral token, if this visitor arrived through an ambassador. Used by forms in Phase 4. */
export const getReferralToken = () => readCookie(REF_COOKIE) ?? null;

/**
 * Run once at startup, before the router reads the URL. Removes ref/ln from
 * the address bar (so shared links don't carry someone else's code) and
 * reports the click.
 */
export function captureReferral() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("ref")) return;
  const landing = url.href;
  url.searchParams.delete("ref");
  url.searchParams.delete("ln");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);

  const consent = getConsent();
  void track({
    landing_url: landing,
    referrer: document.referrer,
    consent: consent === "accepted",
  }).then((res) => {
    if (consent === "accepted") keepToken(res);
    // Undecided: remember the click for this tab only, so accepting the banner can claim it.
    else if (consent === null && res?.click_id) {
      try {
        sessionStorage.setItem(PENDING_CLICK, String(res.click_id));
      } catch {
        /* storage blocked: the click still counts, it just can't be credited later */
      }
    }
  });
}

export async function setConsent(choice: "accepted" | "rejected") {
  let pending: string | null = null;
  try {
    localStorage.setItem(CONSENT_KEY, choice);
    pending = sessionStorage.getItem(PENDING_CLICK);
    sessionStorage.removeItem(PENDING_CLICK);
  } catch {
    /* storage blocked: the choice applies to this page view only */
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED));

  if (choice === "accepted") {
    window.joatLoadAnalytics?.();
    if (pending) keepToken(await track({ click_id: Number(pending), consent: true }));
  } else {
    document.cookie = `${REF_COOKIE}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
  }
}

/** Show the banner again (footer "Cookie settings"). */
export function resetConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}
