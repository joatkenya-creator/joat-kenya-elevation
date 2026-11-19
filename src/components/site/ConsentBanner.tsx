import { useEffect, useState } from "react";
import { CONSENT_CHANGED, getConsent, setConsent } from "@/lib/referral";

/** Accept / Reject cookie banner. Nothing optional runs until Accept. */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(getConsent() === null);
    sync();
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => window.removeEventListener(CONSENT_CHANGED, sync);
  }, []);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-[2000] border-t border-(--border) bg-card px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="consent-title" className="text-sm text-foreground">
          We'd like to use cookies for analytics, and to credit the JOAT Global ambassador who sent
          you here if you became a client. Nothing optional runs unless you accept.{" "}
          <a href="/privacy#cookies" className="underline">
            Privacy policy
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void setConsent("rejected")}
            className="rounded-md border border-(--border) px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => void setConsent("accepted")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
