import { ErrorNote, Loading } from "../ui";
import { formatDate, useActivity, useMembers } from "./data";

const ACTION_LABEL: Record<string, string> = {
  "application.submitted": "Application submitted",
  "membership.approved": "Approved",
  "membership.rejected": "Rejected",
  "membership.suspended": "Suspended",
  "membership.withdrawn": "Left the programme",
  "program.applications_opened": "Applications opened",
  "program.applications_closed": "Applications closed",
  "link.disabled": "Link disabled",
  "link.active": "Link re-enabled",
};

export function Activity({ programName }: { programName: (id: string) => string }) {
  const activity = useActivity();
  const members = useMembers();

  if (activity.isLoading || members.isLoading) return <Loading label="Loading activity" />;
  if (activity.error || members.error)
    return <ErrorNote>We couldn't load the activity log. Refresh to try again.</ErrorNote>;
  if (activity.data!.length === 0)
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
        No activity yet.
      </p>
    );

  const nameOf = (id: string | null) =>
    id
      ? (members.data!.find((m) => m.profile_id === id)?.affiliate_profiles?.full_name ?? null)
      : null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-3">When</th>
            <th className="p-3">What</th>
            <th className="p-3">Programme</th>
            <th className="p-3">Ambassador</th>
            <th className="p-3">By</th>
            <th className="p-3">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activity.data!.map((a) => (
            <tr key={a.id} className="align-top">
              <td className="whitespace-nowrap p-3 tabular-nums">{formatDate(a.at)}</td>
              <td className="p-3">
                {ACTION_LABEL[a.action] ?? a.action}
                {a.details.from && (
                  <span className="text-muted-foreground"> (was {a.details.from})</span>
                )}
              </td>
              <td className="p-3">{a.program_id ? programName(a.program_id) : "–"}</td>
              <td className="p-3">{nameOf(a.subject_id) ?? "–"}</td>
              <td className="p-3">
                {!a.actor_id
                  ? "System"
                  : a.actor_id === a.subject_id
                    ? "Ambassador"
                    : `Staff ${a.actor_id.slice(0, 8)}`}
              </td>
              <td className="p-3 whitespace-pre-line">{a.details.reason ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
