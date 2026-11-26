import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { deliverPartnerApplicationViaWeb3Forms } from "@/lib/web3forms";
import { ACTIVE_STATUSES, friendlyError, useAccount, usePrograms } from "../account";
import {
  ErrorNote,
  GoogleButton,
  Loading,
  OrDivider,
  PageHero,
  PasswordInput,
  buttonClass,
  inputClass,
} from "../ui";

const STEPS = ["Apply", "Get approved", "Share your link & code", "Earn on verified sales"];

/** The four Process steps as a small horizontal stepper; this page is step 1. */
function Stepper() {
  return (
    <ol aria-label="How it works" className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      {STEPS.map((s, i) => (
        <li
          key={s}
          aria-current={i === 0 ? "step" : undefined}
          className={`flex items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-sm ${
            i === 0
              ? "border-joat-gold bg-joat-gold/10 text-joat-cream"
              : "border-joat-border text-joat-body"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i === 0 ? "bg-joat-gold text-joat-black" : "border border-joat-border"
            }`}
          >
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}

const card =
  "mx-auto w-full max-w-2xl rounded-[20px] border border-joat-border bg-joat-surface p-6 sm:p-9";
const legend = "font-gilda text-[24px] font-normal text-joat-cream";

export const Route = createFileRoute("/apply")({
  head: () => ({ meta: [{ title: "Apply | JOAT Global Partners" }] }),
  component: Apply,
});

function Apply() {
  const { session, loading } = useSession();
  if (loading) return <Loading />;
  return (
    <>
      <PageHero
        eyebrow="Apply"
        title="Apply to become an ambassador"
        intro="Free to join. No purchase required. You earn only on verified sales to customers you refer yourself."
      >
        <Stepper />
      </PageHero>
      <div className="px-5 py-12 sm:px-10 lg:py-16">
        {session ? (
          <ApplicationForm
            userId={session.user.id}
            email={session.user.email ?? ""}
            googleName={session.user.user_metadata?.full_name ?? ""}
          />
        ) : (
          <CreateAccount />
        )}
      </div>
    </>
  );
}

function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/apply` },
    });
    setBusy(false);
    if (e) return setError(e.message || "We couldn't create your account. Please try again.");
    // With email confirmation on, there's no session until the link is clicked.
    if (!data.session) setCheckInbox(true);
  };

  if (checkInbox)
    return (
      <section className={card} role="status">
        <h2 className="text-[28px] leading-[34px]">Check your inbox</h2>
        <p className="mt-2 text-muted-foreground">
          We've sent a confirmation link to <strong>{email.trim()}</strong>. Click it to confirm
          your email, and you'll come back here to fill in your application.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          No email after a few minutes? Check spam, or{" "}
          <Link to="/login" className="text-primary underline">
            sign in
          </Link>{" "}
          if you already have an account.
        </p>
      </section>
    );

  return (
    <section className={`${card} max-w-[480px]`}>
      <h2 className="text-[28px] leading-[34px]">Step 1: Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Already have one?{" "}
        <Link to="/login" className="text-primary underline">
          Sign in
        </Link>
        , then come back to this page.
      </p>
      <div className="mt-5">
        <GoogleButton next="/apply" label="Sign up with Google" />
      </div>
      <OrDivider>or use your email</OrDivider>
      <form onSubmit={submit} className="space-y-4">
        <Field id="signup-email" label="Email">
          <input
            id="signup-email"
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field id="signup-password" label="Password (at least 8 characters)">
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field id="signup-confirm" label="Confirm password">
          <PasswordInput
            id="signup-confirm"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {error && <ErrorNote>{error}</ErrorNote>}
        <button type="submit" className={`${buttonClass} w-full`} disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </section>
  );
}

function ApplicationForm({
  userId,
  email,
  googleName,
}: {
  userId: string;
  email: string;
  googleName: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const programs = usePrograms();
  const account = useAccount(userId);

  const [fullName, setFullName] = useState(googleName);
  const [country, setCountry] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [links, setLinks] = useState("");
  const [website, setWebsite] = useState("");
  const [audience, setAudience] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [disclosure, setDisclosure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from an existing profile (re-applying, or adding a second programme).
  const profile = account.data?.profile;
  useEffect(() => {
    if (!profile) return;
    setFullName((v) => v || profile.full_name);
    setCountry((v) => v || profile.country);
  }, [profile]);

  if (programs.isLoading || account.isLoading) return <Loading label="Loading the application" />;
  if (programs.error || account.error)
    return <ErrorNote>We couldn't load the application form. Refresh to try again.</ErrorNote>;

  const statusOf = (id: string) =>
    account.data!.memberships.find((m) => m.program_id === id)?.status;
  const available = programs.data!.filter(
    (p) => p.accepting_applications && !ACTIVE_STATUSES.includes(statusOf(p.id)!),
  );

  if (available.length === 0)
    return (
      <section className={card}>
        <h2 className="text-[28px] leading-[34px]">Nothing to apply for right now</h2>
        <p className="mt-2 text-muted-foreground">
          Either applications aren't open yet, or you've already applied to every open program. Your
          applications are on your{" "}
          <Link to="/dashboard" className="text-primary underline">
            dashboard
          </Link>
          .
        </p>
      </section>
    );

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const linkList = links
      .split(/\s+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (chosen.length === 0) return setError("Choose at least one program.");
    if ([...linkList, website.trim()].some((l) => l && !/^https?:\/\/\S+$/i.test(l)))
      return setError("Each link must be a full web address starting with https://");
    if (!(terms && privacy && disclosure))
      return setError("Please check all three boxes at the end of the form.");

    setBusy(true);
    setError(null);
    const { error: e } = await supabase.rpc("submit_partner_application", {
      p_programs: chosen,
      p_full_name: fullName,
      p_country: country,
      p_social_links: linkList,
      p_website: website.trim() || null,
      p_audience: audience,
      p_experience: experience,
      p_interests: interests,
      p_accept_terms: true,
    });
    setBusy(false);
    if (e) return setError(friendlyError(e));

    void deliverPartnerApplicationViaWeb3Forms({
      fullName: fullName.trim(),
      email,
      country: country.trim(),
      programmes: programs.data!.filter((p) => chosen.includes(p.id)).map((p) => p.name),
      adminUrl: `${window.location.origin}/admin`,
    });
    await queryClient.invalidateQueries({ queryKey: ["account"] });
    void navigate({ to: "/dashboard" });
  };

  const toggle = (id: string) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <form onSubmit={submit} className={`${card} space-y-10`} noValidate>
      <fieldset className="space-y-3">
        <legend className={legend}>Programs</legend>
        <p className="text-sm text-muted-foreground">
          Choose one or both. Each reviews you separately.
        </p>
        {programs.data!.map((p) => {
          const st = statusOf(p.id);
          const blocked = !p.accepting_applications || ACTIVE_STATUSES.includes(st!);
          return (
            <label
              key={p.id}
              className={`flex min-h-11 items-start gap-3 rounded-[12px] border border-joat-border bg-joat-black p-4 transition-colors has-[:checked]:border-joat-gold has-[:checked]:bg-joat-gold/10 ${blocked ? "opacity-60" : "cursor-pointer hover:border-joat-gold"}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0"
                disabled={blocked}
                checked={chosen.includes(p.id)}
                onChange={() => toggle(p.id)}
              />
              <span>
                <span className="font-medium text-joat-cream">{p.name}</span>
                {blocked && (
                  <span className="block text-sm text-muted-foreground">
                    {st && ACTIVE_STATUSES.includes(st)
                      ? `Already ${st}`
                      : "Not accepting applications yet"}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>About you</legend>
        <Field id="full-name" label="Full name">
          <input
            id="full-name"
            className={inputClass}
            autoComplete="name"
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>
        <Field id="country" label="Country of residence">
          <input
            id="country"
            className={inputClass}
            autoComplete="country-name"
            required
            maxLength={80}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </Field>
        <Field id="links" label="Social media profiles (one link per line, up to 10)">
          <textarea
            id="links"
            className={inputClass}
            rows={3}
            placeholder="https://www.instagram.com/yourname"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
        </Field>
        <Field id="website" label="Website or blog (optional)">
          <input
            id="website"
            className={inputClass}
            type="url"
            placeholder="https://"
            maxLength={300}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>Your audience and experience (optional)</legend>
        <Field id="audience" label="Who would you share these brands with?">
          <textarea
            id="audience"
            className={inputClass}
            rows={3}
            maxLength={1000}
            placeholder="For example: parents of young children, small business owners"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </Field>
        <Field id="experience" label="Relevant experience">
          <textarea
            id="experience"
            className={inputClass}
            rows={3}
            maxLength={2000}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </Field>
        <Field id="interests" label="Marketing interests">
          <textarea
            id="interests"
            className={inputClass}
            rows={2}
            maxLength={1000}
            placeholder="For example: short videos, newsletters, community groups"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={legend}>Agreements</legend>
        <Check checked={terms} onChange={setTerms}>
          I have read the{" "}
          <Link to="/terms" target="_blank" className="text-primary underline">
            program terms
          </Link>{" "}
          and agree to them.
        </Check>
        <Check checked={privacy} onChange={setPrivacy}>
          I have read the{" "}
          <Link to="/privacy" target="_blank" className="text-primary underline">
            privacy notice
          </Link>
          .
        </Check>
        <Check checked={disclosure} onChange={setDisclosure}>
          Whenever I share a referral link or recommend these brands, I will clearly disclose that
          I'm a JOAT Global ambassador and may earn a commission.
        </Check>
      </fieldset>

      {error && <ErrorNote>{error}</ErrorNote>}
      <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={busy}>
        {busy ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm text-joat-body">
        {label}
      </label>
      {children}
    </div>
  );
}

function Check(props: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[15px] leading-[24px] text-joat-body">
      <input
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>{props.children}</span>
    </label>
  );
}
