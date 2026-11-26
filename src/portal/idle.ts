// Portal idle timeout. Plain TypeScript with no imports, so the tests can run it
// under Node with fake timers. The React side (modal, sign-out) is IdleTimeout.tsx.

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const WARNING_BEFORE_MS = 2 * 60 * 1000;
/** sessionStorage key: survives a refresh, dies with the tab. */
export const LAST_ACTIVITY_KEY = "joat_portal_last_activity";
const THROTTLE_MS = 15_000;
const CHECK_EVERY_MS = 15_000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Doc = EventTarget & { visibilityState: string };

/** Milliseconds since the last recorded activity (0 if nothing recorded). */
export function idleFor(store: Store, now = Date.now()) {
  const last = Number(store.getItem(LAST_ACTIVITY_KEY));
  return last ? now - last : 0;
}

export const isIdleExpired = (store: Store) => idleFor(store) >= IDLE_TIMEOUT_MS;

/**
 * Watches for activity while a user is signed in. Calls onWarn(true) at 28 idle
 * minutes, onWarn(false) when activity resumes, and onExpire() once at 30.
 * Only DOM events count as activity, so background token refreshes never do.
 */
export function watchIdle({
  onWarn,
  onExpire,
  store = sessionStorage,
  target = window,
  doc = document,
}: {
  onWarn: (warning: boolean) => void;
  onExpire: () => void;
  store?: Store;
  target?: EventTarget;
  doc?: Doc;
}) {
  let warned = false;
  let expired = false;
  let lastHandled = 0;

  const check = () => {
    if (expired) return;
    const idle = idleFor(store);
    if (idle >= IDLE_TIMEOUT_MS) {
      expired = true;
      stop();
      onExpire();
      return;
    }
    const warn = idle >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS;
    if (warn !== warned) onWarn((warned = warn));
  };

  // Check first: coming back after 30+ minutes must expire, not reset the clock.
  const record = () => {
    check();
    if (expired) return;
    store.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    check();
  };

  const onActivity = () => {
    const now = Date.now();
    if (now - lastHandled < THROTTLE_MS) return;
    lastHandled = now;
    record();
  };
  const onVisibility = () => {
    if (doc.visibilityState === "visible") record();
  };

  for (const e of ACTIVITY_EVENTS) target.addEventListener(e, onActivity, { passive: true });
  doc.addEventListener("visibilitychange", onVisibility);
  // Background tabs throttle this; the visibility and load checks cover that.
  const timer = setInterval(check, CHECK_EVERY_MS);

  function stop() {
    clearInterval(timer);
    for (const e of ACTIVITY_EVENTS) target.removeEventListener(e, onActivity);
    doc.removeEventListener("visibilitychange", onVisibility);
  }

  if (!store.getItem(LAST_ACTIVITY_KEY)) store.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  check();

  return { stop, stayActive: record };
}
