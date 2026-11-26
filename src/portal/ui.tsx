import { useState, type ComponentProps, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import joatLogo from "@/assets/joat-logo.png";
import { supabase } from "@/lib/supabase";
import type { MembershipStatus, Program } from "./account";

// Shared portal UI in the JOAT palette (see html.portal in src/styles.css).
// 16px inputs (no iOS zoom), 44px touch targets, gold focus rings.

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-joat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-joat-black";

export const inputClass = `w-full min-h-11 rounded-[10px] border border-joat-border bg-joat-black px-3.5 py-2.5 text-base text-joat-cream placeholder:text-joat-muted transition-colors focus:outline-none focus-visible:border-joat-gold focus-visible:ring-2 focus-visible:ring-joat-gold/40 disabled:opacity-60`;

export const buttonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-joat-gold px-5 py-2.5 text-[15px] font-medium text-joat-black transition-[background-color,transform] hover:bg-joat-gold-hover active:scale-[0.98] disabled:opacity-60 ${ring}`;

export const outlineButtonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-joat-border bg-transparent px-5 py-2.5 text-[15px] font-medium text-joat-cream transition-colors hover:border-joat-gold hover:bg-joat-surface disabled:opacity-60 ${ring}`;

/** Destructive actions (reject, delete, leave): error outline, cream text. Pair with an icon. */
export const dangerButtonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-joat-error bg-transparent px-4 py-2 text-[15px] font-medium text-joat-cream transition-colors hover:bg-joat-error/15 disabled:opacity-60 [&_svg]:text-joat-error ${ring}`;

export const linkClass =
  "text-joat-gold underline underline-offset-4 hover:text-joat-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold";

/** Password field with a show/hide toggle so people can check what they typed. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type" | "className">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={shown ? "text" : "password"} className={`${inputClass} pr-12`} />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        aria-controls={props.id}
        className={`absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-joat-body hover:text-joat-gold ${ring}`}
      >
        {shown ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** Compact page hero (the Miles hero layout without the rope) on a faint gold glow. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-joat-border bg-joat-black-alt">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_80%_at_85%_0%,color-mix(in_srgb,var(--color-joat-gold)_16%,transparent),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1200px] px-5 pb-12 pt-12 sm:px-10 lg:pb-16 lg:pt-16">
        {eyebrow && (
          <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl text-[38px] leading-[44px] sm:text-[54px] sm:leading-[62px]">
          {title}
        </h1>
        {intro && (
          <div className="mt-4 max-w-2xl text-[17px] leading-[27px] text-joat-body">{intro}</div>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

export function Page({
  title,
  intro,
  eyebrow,
  children,
}: {
  title: string;
  intro?: ReactNode;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <div className="mx-auto max-w-[1200px] space-y-12 px-5 py-12 sm:px-10 lg:py-16">
        {children}
      </div>
    </>
  );
}

/** Long-form reading section: Gilda heading, ~70 characters per line. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="max-w-[70ch]">
      <h2 className="text-[28px] leading-[34px] sm:text-[32px] sm:leading-[40px]">{title}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-[28px] text-joat-body [&_a]:text-joat-gold [&_strong]:text-joat-cream">
        {children}
      </div>
    </section>
  );
}

/** Gold shimmer skeleton on joat-surface. */
export function Loading({ label = "Loading" }: { label?: string }) {
  const bar =
    "rounded-[10px] bg-[linear-gradient(90deg,var(--color-joat-surface)_0%,color-mix(in_srgb,var(--color-joat-gold)_22%,var(--color-joat-surface))_50%,var(--color-joat-surface)_100%)] bg-[length:200%_100%] animate-[joat-shimmer_1.6s_linear_infinite] motion-reduce:animate-none";
  return (
    <div role="status" className="w-full space-y-4 py-8">
      <span className="sr-only">{label}…</span>
      <div aria-hidden className={`h-10 w-2/3 max-w-md ${bar}`} />
      <div aria-hidden className={`h-4 w-full max-w-xl ${bar}`} />
      <div aria-hidden className="grid gap-4 sm:grid-cols-3">
        <div className={`h-28 ${bar}`} />
        <div className={`h-28 ${bar}`} />
        <div className={`h-28 ${bar}`} />
      </div>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-[10px] border border-joat-error bg-joat-error/10 px-4 py-3 text-sm text-joat-cream"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-joat-error" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Status pill: colour plus text, never colour alone. */
export const badgeStyle = {
  gold: "bg-joat-gold text-joat-black",
  brown: "bg-joat-brown text-joat-cream",
  error: "border border-joat-error text-joat-cream",
  muted: "border border-joat-border text-joat-body",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof badgeStyle; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeStyle[tone]}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<MembershipStatus, keyof typeof badgeStyle> = {
  pending: "brown",
  approved: "gold",
  rejected: "error",
  suspended: "error",
  withdrawn: "muted",
};

export function StatusBadge({ status }: { status: MembershipStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>;
}

export function ApplicationStatus({ program }: { program: Program | undefined }) {
  if (!program) return <span />;
  return program.accepting_applications ? (
    <Badge tone="gold">Accepting applications</Badge>
  ) : (
    <Badge tone="muted">Applications open soon</Badge>
  );
}

/**
 * One-click sign-up / sign-in. Google returns the user to `next` already signed in.
 * Uses Google's own dark-theme button colours (#131314 / #8E918F / #E3E3E3), as Google requires.
 */
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
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#8E918F] bg-[#131314] px-4 py-2 text-[15px] font-medium text-[#E3E3E3] hover:bg-[#1f1f20] ${ring}`}
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]">
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

/** Centred sign-in / sign-up card on near-black with a faint gold glow, logo on top. */
export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-5 py-12 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_50%_0%,color-mix(in_srgb,var(--color-joat-gold)_18%,transparent),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-[440px] rounded-[20px] border border-joat-border bg-joat-surface p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] sm:p-9">
        <img src={joatLogo} alt="JOAT Global" className="mx-auto h-12 w-12 object-contain" />
        <h1 className="mt-4 text-center text-[34px] leading-[40px]">{title}</h1>
        {intro && <p className="mt-2 text-center text-[15px] text-joat-body">{intro}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

/** "or use your email" divider between the Google button and the email form. */
export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <p className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-joat-body before:h-px before:flex-1 before:bg-joat-border after:h-px after:flex-1 after:bg-joat-border">
      {children}
    </p>
  );
}
