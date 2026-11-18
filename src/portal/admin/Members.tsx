import { useState } from "react";
import { canReview, friendlyError, type Account, type MembershipStatus } from "../account";
import { ErrorNote, Loading, StatusBadge, inputClass } from "../ui";
import {
  formatDate,
  isWebLink,
  useApplications,
  useMembers,
  useReview,
  type ApplicationRow,
  type MemberRow,
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
        <div>
          <h3 className="text-lg font-semibold">{p?.full_name ?? "Unknown applicant"}</h3>
          <p className="text-sm text-muted-foreground">
            {p?.country} · {props.programName} · {m.status === "pending" ? "applied" : "since"}{" "}
            {formatDate(m.status_changed_at)}
            {m.status !== "pending" && p && ` · code ${p.public_code}`}
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

      {props.canAct && <ReviewActions member={m} />}
    </li>
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
            Reason (kept in the activity log, not shown to the ambassador)
          </label>
          <textarea
            id={reasonId}
            className={inputClass}
            rows={2}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={review.isPending || !reason.trim()}
              onClick={() => run(asking, reason.trim())}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800 disabled:opacity-60"
            >
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
