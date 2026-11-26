import { useState } from "react";
import { Link, Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { isPasswordRecovery, supabase } from "@/lib/supabase";
import {
  AuthCard,
  ErrorNote,
  GoogleButton,
  OrDivider,
  PasswordInput,
  buttonClass,
  inputClass,
  linkClass,
} from "../ui";

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
  const [notice, setNotice] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("reason") === "idle"
      ? "You were signed out after 30 minutes of inactivity. Please sign in again."
      : null,
  );

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
    <AuthCard title="Sign in" intro="Sign in to your ambassador or staff account.">
      <GoogleButton next="/dashboard" />
      <OrDivider>or sign in with email</OrDivider>
      <form onSubmit={signIn} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-joat-body">
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
          <label htmlFor="password" className="text-sm text-joat-body">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        {notice && (
          <p
            role="status"
            className="rounded-[10px] border border-joat-gold bg-joat-gold/10 px-4 py-3 text-sm text-joat-cream"
          >
            {notice}
          </p>
        )}
        <button type="submit" className={`${buttonClass} w-full`} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void reset()}
            className={`min-h-11 px-2 text-sm ${linkClass}`}
          >
            Forgot password
          </button>
        </div>
        <p className="border-t border-joat-border pt-5 text-center text-sm text-joat-body">
          New to the program?{" "}
          <Link to="/apply" className={linkClass}>
            Create an account and apply
          </Link>
          .
        </p>
      </form>
    </AuthCard>
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
    <AuthCard title="Set a new password">
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="new-password" className="text-sm text-joat-body">
            New password
          </label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirm-password" className="text-sm text-joat-body">
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" className={`${buttonClass} w-full`} disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthCard>
  );
}
