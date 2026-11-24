import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError, usePrograms, type MembershipStatus } from "../account";
import { ErrorNote, Loading } from "../ui";
import { useMembers } from "./data";

const STATUSES: MembershipStatus[] = ["pending", "approved", "suspended", "rejected", "withdrawn"];

export function Programmes({ superAdmin }: { superAdmin: boolean }) {
  const programs = usePrograms();
  const members = useMembers();
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async (v: { id: string; open: boolean }) => {
      const { error } = await supabase.rpc("set_partner_program_accepting", {
        p_program_id: v.id,
        p_accepting: v.open,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  if (programs.isLoading || members.isLoading) return <Loading label="Loading programs" />;
  if (programs.error || members.error)
    return <ErrorNote>We couldn't load program data. Refresh to try again.</ErrorNote>;

  const count = (program: string, status: MembershipStatus) =>
    members.data!.filter((m) => m.program_id === program && m.status === status).length;

  return (
    <section className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Program</th>
              <th className="p-3">Applications</th>
              <th className="p-3">Attribution</th>
              {STATUSES.map((s) => (
                <th key={s} className="p-3 capitalize">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {programs.data!.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span>{p.accepting_applications ? "Open" : "Closed"}</span>
                    {superAdmin && (
                      <button
                        type="button"
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: p.id, open: !p.accepting_applications })}
                        className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-muted disabled:opacity-60"
                      >
                        {p.accepting_applications ? "Close" : "Open"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  {p.attribution_model
                    ? `${p.attribution_model.replace("_", " ")}, `
                    : "Model not selected, "}
                  {p.attribution_window_days} days
                </td>
                {STATUSES.map((s) => (
                  <td key={s} className="p-3 tabular-nums">
                    {count(p.id, s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toggle.error && <ErrorNote>{friendlyError(toggle.error)}</ErrorNote>}
      {superAdmin && (
        <p className="text-sm text-muted-foreground">
          Opening a program makes the application form available for it right away. Publish its
          commission rate and final terms first.
        </p>
      )}
    </section>
  );
}
