import { EXTERNAL } from "./links";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

const CSS_URL = "https://assets.calendly.com/assets/external/widget.css";
const JS_URL = "https://assets.calendly.com/assets/external/widget.js";

let loadPromise: Promise<void> | null = null;

/**
 * Lazily injects Calendly's CSS + JS into the document. Resolves once
 * `window.Calendly.initPopupWidget` is callable. Idempotent — safe to call from
 * every Book button.
 */
function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${JS_URL}"]`);
    if (existing) {
      if (window.Calendly) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Calendly widget script failed to load")),
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly widget script failed to load"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Open the Calendly booking modal. Matches the original joatkenya.com pattern —
 * `Calendly.initPopupWidget({ url })`. Falls back to opening the URL in a new tab
 * if the widget script fails to load (e.g., adblocker).
 */
export async function openCalendly(url: string = EXTERNAL.calendly): Promise<void> {
  try {
    await loadCalendly();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
      return;
    }
    throw new Error("Calendly widget unavailable after load");
  } catch (err) {
    console.error("openCalendly failed, opening fallback tab", err);
    window.open(url, "_blank", "noreferrer");
  }
}
