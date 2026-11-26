import { useState } from "react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  ACTIVE_STATUSES,
  friendlyError,
  useAccount,
  usePrograms,
  type MembershipStatus,
} from "../account";
import { ErrorNote, Loading, Page, StatusBadge, buttonClass, dangerButtonClass } from "../ui";
import { ProgrammeLinks } from "../Links";
import { MyConversions } from "../Conversions";
import { AmbassadorOverview } from "../AmbassadorOverview";
import { PayoutSettings } from "../PayoutSettings";
import {
  BookOpen,
  LayoutDashboard,
  Link2,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard | JOAT Global Partners" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

const STATUS_TEXT: Record<MembershipStatus, string> = {
  pending: "We're reviewing your application.",
  approved: "You're approved. Create your referral links under Links.",
  rejected: "Not approved this time. You're welcome to apply again.",
  suspended: "This membership is suspended. Contact the partner team for details.",
  withdrawn: "You left this program. You can apply again at any time.",
};

function Dashboard() {
  const { session, loading } = useSession();
  const account = useAccount(session?.user.id);
  const { data: programs } = usePrograms();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" />;
  if (account.isLoading) return <Loading label="Loading your account" />;
  if (account.error)
    return (
      <Page eyebrow="Dashboard" title="Dashboard">
        <ErrorNote>We couldn't load your account. Refresh the page to try again.</ErrorNote>
      </Page>
    );

  const { profile, memberships, staff } = account.data!;
  const programName = (id: string) => programs?.find((p) => p.id === id)?.name ?? id;
  const canApply = (programs ?? []).some(
    (p) =>
      p.accepting_applications &&
      !memberships.some((m) => m.program_id === p.id && ACTIVE_STATUSES.includes(m.status)),
  );

  const isMember = memberships.some((m) => m.status === "approved" || m.status === "suspended");
  if (profile && isMember)
    return (
      <AmbassadorShell
        name={profile.full_name}
        email={session.user.email ?? ""}
        isStaff={staff.length > 0}
      >
        {(section) => (
          <>
            {section === "overview" && (
              <AmbassadorOverview
                userId={session.user.id}
                programName={programName}
                programIds={memberships
                  .filter((m) => m.status === "approved" || m.status === "suspended")
                  .map((m) => m.program_id)}
                country={profile.country}
              />
            )}
            {section === "links" &&
              memberships
                .filter((m) => m.status === "approved")
                .map((m) => {
                  const program = programs?.find((p) => p.id === m.program_id);
                  return (
                    program && (
                      <ProgrammeLinks
                        key={m.program_id}
                        userId={session.user.id}
                        publicCode={m.ref_code}
                        program={program}
                      />
                    )
                  );
                })}
            {section === "sales" && (
              <MyConversions userId={session.user.id} programName={programName} />
            )}
            {section === "payouts" && <PayoutSettings />}
            {section === "programmes" && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-[26px] leading-[32px]">Your programs</h2>
                <ul className="mt-3 divide-y divide-border">
                  {memberships.map((m) => (
                    <li
                      key={m.program_id}
                      className="flex flex-wrap items-start justify-between gap-3 py-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{programName(m.program_id)}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {STATUS_TEXT[m.status]}
                        </p>
                        {m.status === "approved" && (
                          <p className="mt-1 text-sm">
                            Your rate:{" "}
                            <strong>{Math.round(Number(m.commission_rate) * 100)}%</strong>
                            {Number(m.commission_rate) < 0.1 &&
                              " · grow your sales to move up to 10% within your first 6 months"}
                          </p>
                        )}
                      </div>
                      {(m.status === "pending" || m.status === "approved") && (
                        <LeaveProgramme programId={m.program_id} name={programName(m.program_id)} />
                      )}
                    </li>
                  ))}
                </ul>
                {canApply && <ApplyLink label="Apply to another program" />}
              </section>
            )}
          </>
        )}
      </AmbassadorShell>
    );

  return (
    <Page eyebrow="Dashboard" title="Dashboard" intro={<>Signed in as {session.user.email}</>}>
      {staff.length > 0 && (
        <p className="text-sm">
          You have a staff role. Go to the{" "}
          <Link to="/admin" className="text-primary underline">
            admin area
          </Link>
          .
        </p>
      )}

      {!profile ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">You're not an ambassador yet</h2>
          <p className="mt-2 text-muted-foreground">
            {canApply
              ? "Apply to one or both programs. It's free and takes a few minutes."
              : "Applications open soon. When they do, you'll be able to apply from here."}
          </p>
          {canApply && <ApplyLink />}
        </section>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{profile.full_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.country}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Your programs</h2>
            {memberships.length === 0 ? (
              <p className="mt-2 text-muted-foreground">You haven't joined a program yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
                {memberships.map((m) => (
                  <li
                    key={m.program_id}
                    className="flex flex-wrap items-start justify-between gap-3 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{programName(m.program_id)}</span>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{STATUS_TEXT[m.status]}</p>
                    </div>
                    {(m.status === "pending" || m.status === "approved") && (
                      <LeaveProgramme programId={m.program_id} name={programName(m.program_id)} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {canApply && <ApplyLink label="Apply to another program" />}
          </section>
          {memberships
            .filter((m) => m.status === "approved")
            .map((m) => {
              const program = programs?.find((p) => p.id === m.program_id);
              return (
                program && (
                  <ProgrammeLinks
                    key={m.program_id}
                    userId={session.user.id}
                    publicCode={m.ref_code}
                    program={program}
                  />
                )
              );
            })}
          {memberships.some((m) => m.status === "approved" || m.status === "suspended") && (
            <MyConversions userId={session.user.id} programName={programName} />
          )}
        </>
      )}
    </Page>
  );
}

function ApplyLink({ label = "Apply now" }: { label?: string }) {
  return (
    <Link to="/apply" className={`mt-4 ${buttonClass}`}>
      {label}
    </Link>
  );
}

/** Two-step button: browsers' confirm() dialogs are avoided on purpose. */
function LeaveProgramme({ programId, name }: { programId: string; name: string }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const leave = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("withdraw_partner_membership", {
        p_program_id: programId,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account"] }),
  });

  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 text-sm text-muted-foreground underline-offset-4 hover:text-joat-cream hover:underline"
      >
        Leave program
      </button>
    );
  return (
    <div className="flex flex-col items-end gap-2 text-sm">
      <span>Leave {name}?</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={leave.isPending}
          onClick={() => leave.mutate()}
          className={dangerButtonClass}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {leave.isPending ? "Leaving…" : "Yes, leave"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-11 rounded-[10px] border border-border px-4 py-2 hover:border-joat-gold"
        >
          Cancel
        </button>
      </div>
      {leave.error && <ErrorNote>{friendlyError(leave.error)}</ErrorNote>}
    </div>
  );
}

type SectionId = "overview" | "links" | "sales" | "payouts" | "programmes";
const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "links", label: "Links", icon: Link2 },
  { id: "sales", label: "Sales & commission", icon: Receipt },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "programmes", label: "Programs", icon: Settings },
];

/** Sidebar layout for ambassadors, modelled on the affiliate dashboard design. */
function AmbassadorShell({
  name,
  email,
  isStaff,
  children,
}: {
  name: string;
  email: string;
  isStaff: boolean;
  children: (section: SectionId) => React.ReactNode;
}) {
  const [section, setSection] = useState<SectionId>("overview");
  const item =
    "flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold";
  return (
    <div className="flex min-h-full flex-col bg-joat-black md:flex-row">
      <nav
        aria-label="Dashboard"
        className="flex gap-1 overflow-x-auto border-b border-joat-border bg-joat-black-alt p-2 text-joat-cream md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-3"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-current={section === s.id ? "page" : undefined}
            onClick={() => setSection(s.id)}
            className={`${item} ${section === s.id ? "bg-joat-gold font-medium text-joat-black" : "text-joat-body hover:bg-joat-surface hover:text-joat-cream"}`}
          >
            <s.icon className="h-4 w-4" aria-hidden="true" />
            {s.label}
          </button>
        ))}
        <Link
          to="/resources"
          className={`${item} text-joat-body hover:bg-joat-surface hover:text-joat-cream`}
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Resources
        </Link>
        {isStaff && (
          <Link
            to="/admin"
            className={`${item} text-joat-body hover:bg-joat-surface hover:text-joat-cream`}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Admin
          </Link>
        )}
      </nav>
      <div className="min-w-0 flex-1 space-y-5 p-4 sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[34px] leading-[40px] sm:text-[42px] sm:leading-[48px]">
            {SECTIONS.find((s) => s.id === section)!.label}
          </h1>
          <p className="min-w-0 break-all text-sm text-muted-foreground">
            {name} · {email}
          </p>
        </header>
        {children(section)}
      </div>
    </div>
  );
}
