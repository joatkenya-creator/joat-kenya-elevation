import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
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

export function DraftNotice() {
  return (
    <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Draft pending legal review.</strong> This text is a working draft prepared for review
      by a qualified US attorney. It is not legal advice and is not the final programme terms.
    </p>
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
