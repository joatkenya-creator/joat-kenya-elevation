import { useState } from "react";
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { isPasswordRecovery, supabase } from "@/lib/supabase";
import { ErrorNote, Page, buttonClass, inputClass } from "../ui";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in | JOAT Global Partners" }, { name: "robots", content: "noindex" }],
  }),
  component: Login,
});

function Login() {
  const { session, loading } = useSession();
  // A reset-email link signs the user in; ask for the new password first.
  const [recovering, setRecovering] = useState(isPasswordRecovery);
  if (recovering && session) return <SetNewPassword onDone={() => setRecovering(false)} />;
  if (!loading && session) return <Navigate to="/dashboard" />;
  return <SignInForm />;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const signIn = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    // Same message whether the email exists or not, so the form can't be used to probe accounts.
    if (e) setError("Email or password is incorrect.");
  };

  const reset = async () => {
    if (!email.trim())
      return setError("Enter your email address first, then choose “Forgot password”.");
    setError(null);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setNotice("If that address has an account, a reset link is on its way.");
  };

  return (
    <Page title="Sign in" intro="Sign in to your ambassador or staff account.">
      <form onSubmit={signIn} className="max-w-sm space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        {notice && (
          <p role="status" className="text-sm text-muted-foreground">
            {notice}
          </p>
        )}
        <div className="flex items-center gap-4">
          <button type="submit" className={buttonClass} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => void reset()}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          New to the programme? Applications open soon. Accounts are created when you apply.
        </p>
      </form>
    </Page>
  );
}

function SetNewPassword({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const { error: e } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (e) return setError(e.message || "Could not update your password.");
    onDone();
    void navigate({ to: "/dashboard" });
  };

  return (
    <Page title="Set a new password">
      <form onSubmit={save} className="max-w-sm space-y-4">
        <div className="space-y-1">
          <label htmlFor="new-password" className="text-xs text-muted-foreground">
            New password
          </label>
          <input
            id="new-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirm-password" className="text-xs text-muted-foreground">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" className={buttonClass} disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
    </Page>
  );
}
