import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { requestPasswordReset, signInStudent, updatePassword, useSession } from "@/lib/auth";
import { isPasswordRecovery } from "@/lib/supabase";

const inputClass =
  "w-full rounded-md bg-black/5 border border-(--glass-border) px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50 transition-colors";

export function CourseLogin() {
  const { session } = useSession();
  // Arrived from a reset email: the link has already signed them in, so ask
  // for the new password instead of showing the login form.
  const [recovering, setRecovering] = useState(isPasswordRecovery);
  if (recovering && session) return <SetNewPassword onDone={() => setRecovering(false)} />;
  return <LoginForm />;
}

function SetNewPassword({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending) return;
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");
    setError(null);
    setSending(true);
    const { error: updateError } = await updatePassword(password);
    setSending(false);
    if (updateError) return setError(updateError.message || "Could not update your password.");
    onDone();
    void navigate({ to: "/courses/account" });
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">New password</label>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Confirm new password</label>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save new password
        </button>
      </form>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showReset, setShowReset] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    const { error: signInError } = await signInStudent(email.trim(), password);
    if (signInError) {
      setSending(false);
      setError(signInError.message || "Could not log you in. Check your email and password.");
      return;
    }
    void navigate({ to: "/courses/account" });
  };

  const submitReset = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (resetSending || !email.trim()) return;
    setResetSending(true);
    await requestPasswordReset(email.trim());
    setResetSending(false);
    setResetSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Log in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back. Log in to see your registration.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Password</label>
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in…
            </>
          ) : (
            "Log in"
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowReset((v) => !v)}
          className="block mx-auto text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Forgot password?
        </button>

        {showReset && (
          <div className="rounded-md bg-black/5 border border-(--glass-border) p-4">
            {resetSent ? (
              <p className="text-sm text-muted-foreground">
                If an account exists for {email || "that email"}, a reset link is on its way.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter your email above, then send a reset link.
                </p>
                <button
                  type="button"
                  onClick={submitReset}
                  disabled={resetSending || !email.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all disabled:opacity-60"
                >
                  {resetSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send reset link
                </button>
              </>
            )}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/courses/sign-up"
            className="text-foreground underline underline-offset-2 hover:text-gold"
          >
            Register for the cohort
          </Link>
        </p>
      </form>
    </div>
  );
}
