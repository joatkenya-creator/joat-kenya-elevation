import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  canReview,
  friendlyError,
  isSuperAdmin,
  type Account,
  type MembershipStatus,
} from "../account";
import { downloadCsv } from "../csv";
import { Ban, X } from "lucide-react";
import { ErrorNote, Loading, StatusBadge, dangerButtonClass, inputClass } from "../ui";
import {
  formatDate,
  isWebLink,
  useApplications,
  useMembers,
  useReview,
  useSetRate,
  type ApplicationRow,
  type MemberRow,
  useAllLinks,
  useSetLinkStatus,
  type AdminLink,
} from "./data";

/**
 * One list, two views: the application queue (pending) and the ambassador
 * list (approved and suspended). Staff who can't review a programme see the
 * rows read-only.
 */
export function Members(props: {
  view: "queue" | "ambassadors";
  staff: Account["staff"];
  programName: (id: string) => string;
}) {
  const members = useMembers();
  const applications = useApplications();

  if (members.isLoading || applications.isLoading) return <Loading />;
  if (members.error || applications.error)
    return <ErrorNote>We couldn't load ambassador data. Refresh to try again.</ErrorNote>;

  const wanted: MembershipStatus[] =
    props.view === "queue" ? ["pending"] : ["approved", "suspended"];
  const rows = members.data!.filter((m) => wanted.includes(m.status));
  // Oldest first in the queue, so nobody waits longest.
  if (props.view === "queue") rows.reverse();

  if (rows.length === 0)
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
        {props.view === "queue"
          ? "No applications waiting for review."
          : "No approved or suspended ambassadors yet."}
      </p>
    );

  // The newest application that included this programme.
  const applicationFor = (m: MemberRow) =>
    applications.data!.find((a) => a.user_id === m.profile_id && a.programs.includes(m.program_id));

  return (
    <div className="space-y-4">
      {props.view === "ambassadors" && isSuperAdmin(props.staff) && (
        <ExportActive programName={props.programName} />
      )}
      <ul className="space-y-4">
        {rows.map((m) => (
          <MemberCard
            key={`${m.profile_id}-${m.program_id}`}
            member={m}
            application={applicationFor(m)}
            programName={props.programName(m.program_id)}
            canAct={canReview(props.staff, m.program_id)}
          />
        ))}
      </ul>
    </div>
  );
}

/** Super admins: download every approved ambassador, with sign-in email. Each download is logged. */
function ExportActive({ programName }: { programName: (id: string) => string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const download = async () => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("export_active_ambassadors");
    setBusy(false);
    if (error) return setError(friendlyError(error));
    const rows = (data ?? []) as {
      full_name: string;
      email: string;
      country: string;
      program_id: string;
      commission_rate: string;
      member_since: string;
      public_code: string;
      social_links: string[];
    }[];
    downloadCsv(
      `active-ambassadors-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Email", "Country", "Program", "Rate", "Member since", "Referral code", "Profiles"],
      rows.map((r) => [
        r.full_name,
        r.email,
        r.country,
        programName(r.program_id),
        `${Math.round(Number(r.commission_rate) * 100)}%`,
        r.member_since.slice(0, 10),
        r.public_code,
        r.social_links.join(" "),
      ]),
    );
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Active ambassadors, one row per program, with their sign-in email. Downloads are recorded in
        the activity log.
      </p>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "Preparing…" : "Download active ambassadors (CSV)"}
      </button>
      {error && <ErrorNote>{error}</ErrorNote>}
    </div>
  );
}

function MemberCard(props: {
  member: MemberRow;
  application: ApplicationRow | undefined;
  programName: string;
  canAct: boolean;
}) {
  const { member: m, application: app } = props;
  const p = m.affiliate_profiles;
  const links = [...(p?.social_links ?? []), ...(app?.website ? [app.website] : [])].filter(
    isWebLink,
  );

  return (
    <li className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold">
            {p?.full_name ?? "Unknown applicant"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {p?.country} · {props.programName} · {m.status === "pending" ? "applied" : "since"}{" "}
            {formatDate(m.status_changed_at)}
            {m.status !== "pending" && ` · code ${m.ref_code}`}
            {m.status !== "pending" && ` · ${Math.round(Number(m.commission_rate) * 100)}% rate`}
          </p>
        </div>
        <StatusBadge status={m.status} />
      </div>

      {links.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-sm">
          {links.map((l) => (
            <li key={l} className="break-all">
              <a
                href={l}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-primary underline"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
      )}

      {app && (app.audience || app.experience || app.marketing_interests) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          {(
            [
              ["Audience", app.audience],
              ["Experience", app.experience],
              ["Interests", app.marketing_interests],
            ] as const
          ).map(
            ([label, value]) =>
              value && (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="whitespace-pre-line">{value}</dd>
                </div>
              ),
          )}
        </dl>
      )}

      {m.status !== "pending" && <MemberLinks member={m} canAct={props.canAct} />}
      {props.canAct && <ReviewActions member={m} />}
      {props.canAct && m.status !== "pending" && <RateControl member={m} />}
    </li>
  );
}

// Everyone starts at 8%; staff move ambassadors who grow their sales to 10%
// (reviewed within 6 months of joining). Only sales after the change use it.
function RateControl({ member }: { member: MemberRow }) {
  const setRate = useSetRate();
  const [reason, setReason] = useState("");
  const [asking, setAsking] = useState(false);
  const atGrowth = Number(member.commission_rate) >= 0.1;
  const next = atGrowth ? 0.08 : 0.1;
  const review = new Date(member.created_at);
  review.setMonth(review.getMonth() + 6);
  const id = `rate-${member.profile_id}-${member.program_id}`;

  return (
    <div className="mt-3 space-y-2 text-sm">
      {!asking ? (
        <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
          {atGrowth
            ? "On the 10% growth rate."
            : `On the 8% starting rate. 6-month review: ${formatDate(review.toISOString())}.`}
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted"
          >
            {atGrowth ? "Back to 8%…" : "Move to 10%…"}
          </button>
        </p>
      ) : (
        <div className="space-y-2">
          <label htmlFor={id} className="text-muted-foreground">
            Reason for moving to {next * 100}% (kept in the activity log). Applies to new sales
            only.
          </label>
          <input
            id={id}
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={setRate.isPending || !reason.trim()}
              onClick={() =>
                setRate.mutate(
                  {
                    profileId: member.profile_id,
                    programId: member.program_id,
                    rate: next,
                    reason: reason.trim(),
                  },
                  { onSuccess: () => setAsking(false) },
                )
              }
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground disabled:opacity-60"
            >
              Confirm {next * 100}%
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="rounded-md border border-border px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {setRate.error && <ErrorNote>{friendlyError(setRate.error)}</ErrorNote>}
    </div>
  );
}

const ACTIONS: Record<
  "pending" | "approved" | "suspended",
  { status: "approved" | "rejected" | "suspended"; label: string; needsReason: boolean }[]
> = {
  pending: [
    { status: "approved", label: "Approve", needsReason: false },
    { status: "rejected", label: "Reject", needsReason: true },
  ],
  approved: [{ status: "suspended", label: "Suspend", needsReason: true }],
  suspended: [{ status: "approved", label: "Reinstate", needsReason: false }],
};

function ReviewActions({ member }: { member: MemberRow }) {
  const review = useReview();
  const [asking, setAsking] = useState<"rejected" | "suspended" | null>(null);
  const [reason, setReason] = useState("");
  const actions = ACTIONS[member.status as keyof typeof ACTIONS] ?? [];
  const reasonId = `reason-${member.profile_id}-${member.program_id}`;

  const run = (status: "approved" | "rejected" | "suspended", why?: string) =>
    review.mutate({
      profileId: member.profile_id,
      programId: member.program_id,
      status,
      reason: why,
    });

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {asking ? (
        <div className="space-y-2">
          <label htmlFor={reasonId} className="text-sm text-muted-foreground">
            Reason (included in the email to the ambassador)
          </label>
          <textarea
            id={reasonId}
            className={inputClass}
            rows={2}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={review.isPending || !reason.trim()}
              onClick={() => run(asking, reason.trim())}
              className={dangerButtonClass}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {asking === "rejected" ? "Confirm rejection" : "Confirm suspension"}
            </button>
            <button
              type="button"
              onClick={() => setAsking(null)}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) =>
            a.needsReason ? (
              <button
                key={a.label}
                type="button"
                onClick={() => setAsking(a.status as "rejected" | "suspended")}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                {a.label}…
              </button>
            ) : (
              <button
                key={a.label}
                type="button"
                disabled={review.isPending}
                onClick={() => run(a.status)}
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
      {review.error && <ErrorNote>{friendlyError(review.error)}</ErrorNote>}
    </div>
  );
}

function MemberLinks({ member, canAct }: { member: MemberRow; canAct: boolean }) {
  const links = useAllLinks();
  const mine = (links.data ?? []).filter(
    (l) => l.profile_id === member.profile_id && l.program_id === member.program_id,
  );
  if (mine.length === 0) return null;
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-muted-foreground">
        Referral links ({mine.length})
      </summary>
      <ul className="mt-2 space-y-2">
        {mine.map((l) => (
          <LinkRow key={l.id} link={l} canAct={canAct} />
        ))}
      </ul>
    </details>
  );
}

function LinkRow({ link, canAct }: { link: AdminLink; canAct: boolean }) {
  const setStatus = useSetLinkStatus();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = `link-reason-${link.id}`;
  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 break-all">
          <span className="font-mono">{link.destination_path}</span>
          {link.campaign && <span className="text-muted-foreground"> · {link.campaign}</span>}
          {link.status === "disabled" && (
            <span className="ml-2 rounded-full border border-joat-error text-joat-cream px-2 py-0.5 text-xs">
              Disabled
            </span>
          )}
        </span>
        {canAct && !asking && (
          <button
            type="button"
            disabled={setStatus.isPending}
            onClick={() =>
              link.status === "active"
                ? setAsking(true)
                : setStatus.mutate({ linkId: link.id, status: "active" })
            }
            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-60"
          >
            {link.status === "active" ? "Disable…" : "Re-enable"}
          </button>
        )}
      </div>
      {asking && (
        <div className="mt-2 space-y-2">
          <label htmlFor={reasonId} className="text-xs text-muted-foreground">
            Reason (kept in the activity log)
          </label>
          <input
            id={reasonId}
            className={inputClass}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={setStatus.isPending || !reason.trim()}
              onClick={() =>
                setStatus.mutate(
                  { linkId: link.id, status: "disabled", reason: reason.trim() },
                  { onSuccess: () => setAsking(false) },
                )
              }
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] border border-joat-error px-3 text-xs font-medium text-joat-cream transition-colors hover:bg-joat-error/15 disabled:opacity-60"
            >
              <Ban className="h-3.5 w-3.5 text-joat-error" aria-hidden="true" />
              Confirm disable
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="rounded-md border border-border px-3 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {setStatus.error && <ErrorNote>{friendlyError(setStatus.error)}</ErrorNote>}
    </li>
  );
}
