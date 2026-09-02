/**
 * Thin wrapper over the analytics already loaded in index.html — GA4 (gtag)
 * and Microsoft Clarity. Both are stubbed there before their scripts load, so
 * events fired early are buffered, not lost. No new analytics vendor.
 */
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    clarity?: (command: string, ...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  window.clarity?.("event", event);
}
