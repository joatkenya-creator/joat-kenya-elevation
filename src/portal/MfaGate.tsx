import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ErrorNote, Loading, buttonClass, inputClass } from "./ui";

/**
 * Two-factor sign-in for staff. The database ignores staff roles until the
 * session is at assurance level aal2, so this screen is the only way into
 * admin data. First visit: enrol an authenticator app (QR code). Later
 * visits: enter the current 6-digit code.
 */
export function MfaGate({ onPassed }: { onPassed: () => void }) {
  const [factor, setFactor] = useState<{ id: string; qr?: string; secret?: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false); // StrictMode runs effects twice in dev; enrol once.

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) return setError(listError.message);
      const verified = data.totp[0];
      if (verified) return setFactor({ id: verified.id });
      // Clear half-finished enrolments so a fresh QR code can be issued.
      for (const f of data.all.filter((f) => f.status === "unverified"))
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data: enrolled, error: enrolError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (enrolError) return setError(enrolError.message);
      setFactor({ id: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret });
    })();
  }, []);

  const verify = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!factor || busy) return;
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verifyError)
      return setError(
        "That code didn't work. Check the time on your phone and try the newest code.",
      );
    onPassed();
  };

  if (error && !factor) return <ErrorNote>{error}</ErrorNote>;
  if (!factor) return <Loading label="Preparing two-factor sign-in" />;

  return (
    <div className="mx-auto max-w-md rounded-[20px] border border-joat-border bg-joat-surface p-6 sm:p-9">
      <h2 className="text-[28px] leading-[34px]">Two-factor sign-in required</h2>
      {factor.qr ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Staff accounts need an authenticator app (Google Authenticator, Microsoft Authenticator,
            1Password or similar). Scan this code, then enter the 6-digit code the app shows.
          </p>
          {/* white backing keeps the QR code scannable */}
          <img
            src={factor.qr}
            alt="QR code for your authenticator app"
            className="mt-4 h-44 w-44 rounded-[10px] bg-white p-2"
          />
          <p className="mt-2 text-xs text-muted-foreground break-all">
            Can't scan? Enter this key instead: <code className="font-mono">{factor.secret}</code>
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      )}
      <form onSubmit={verify} className="mt-5 space-y-3">
        <label htmlFor="mfa-code" className="text-sm text-joat-body">
          6-digit code
        </label>
        <input
          id="mfa-code"
          className={inputClass}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <button
          type="submit"
          className={`${buttonClass} w-full`}
          disabled={busy || code.length !== 6}
        >
          {busy ? "Checking…" : "Verify"}
        </button>
      </form>
    </div>
  );
}
