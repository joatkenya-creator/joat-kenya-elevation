import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { MembershipStatus, Program } from "./account";

export const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function Page({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
      {intro && <div className="mt-3 max-w-2xl text-muted-foreground">{intro}</div>}
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 py-16 text-sm text-muted-foreground justify-center"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}…
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {children}
    </p>
  );
}

const STATUS_STYLE: Record<MembershipStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-zinc-200 text-zinc-800",
  suspended: "bg-red-100 text-red-900",
  withdrawn: "bg-zinc-200 text-zinc-800",
};

export function StatusBadge({ status }: { status: MembershipStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

export function ApplicationStatus({ program }: { program: Program | undefined }) {
  if (!program) return <span />;
  return program.accepting_applications ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
      Accepting applications
    </span>
  ) : (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      Applications open soon
    </span>
  );
}

/** One-click sign-up / sign-in. Google returns the user to `next` already signed in. */
export function GoogleButton({
  next,
  label = "Continue with Google",
}: {
  next: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        void supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}${next}` },
        })
      }
      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </svg>
      {label}
    </button>
  );
}
