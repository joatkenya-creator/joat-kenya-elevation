import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LAST_ACTIVITY_KEY, watchIdle } from "./idle";
import { buttonClass } from "./ui";

/**
 * The one way to sign out of the portal (button, idle timeout, warning modal).
 * Revokes this session's refresh token, wipes the tab's storage, then does a
 * full-page replace: that drops the in-memory React Query cache (nothing is
 * persisted) and keeps Back from returning to a protected page.
 */
export async function secureSignOut(reason?: "idle") {
  try {
    // "local" ends this tab's session only; other tabs are separate sessions.
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Offline: still clear locally below.
  }
  try {
    sessionStorage.clear(); // the auth token, tab key and idle clock
  } catch {
    // Storage blocked: nothing was stored there either.
  }
  window.location.replace(reason ? `/login?reason=${reason}` : "/login");
}

/** Mounted once in the root route: covers every page for any signed-in user. */
export function IdleTimeout({ userId, loading }: { userId: string | undefined; loading: boolean }) {
  const [warning, setWarning] = useState(false);
  const stayActive = useRef<() => void>(() => {});

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      return;
    }
    // Keyed on the user id, not the session object, so token refreshes don't restart it.
    const w = watchIdle({ onWarn: setWarning, onExpire: () => void secureSignOut("idle") });
    stayActive.current = w.stayActive;
    return w.stop;
  }, [userId, loading]);

  if (!warning) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id="idle-title" className="text-lg font-semibold">
          You'll be signed out in 2 minutes due to inactivity
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            autoFocus
            className={buttonClass}
            onClick={() => stayActive.current()}
          >
            Stay signed in
          </button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => void secureSignOut()}
          >
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
}
