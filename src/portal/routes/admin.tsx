import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { MfaGate } from "../MfaGate";
import { ROLE_LABEL, useAccount, usePrograms, type MembershipStatus } from "../account";
import { ErrorNote, Loading, Page } from "../ui";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | JOAT Global Partners" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

function Admin() {
  const { session, loading } = useSession();
  const account = useAccount(session?.user.id);
  const queryClient = useQueryClient();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" />;
  if (account.isLoading) return <Loading label="Checking your access" />;
  if (account.error)
    return (
      <Page title="Admin">
        <ErrorNote>We couldn't check your access. Refresh the page to try again.</ErrorNote>
      </Page>
    );

  const { staff, aal } = account.data!;
  if (staff.length === 0)
    return (
      <Page title="Admin">
        <ErrorNote>
          Your account doesn't have a staff role. If you need access, ask a super administrator.
        </ErrorNote>
      </Page>
    );

  if (aal !== "aal2")
    return (
      <Page title="Admin">
        <MfaGate onPassed={() => void queryClient.invalidateQueries()} />
      </Page>
    );

  return (
    <Page title="Admin">
      <section>
        <h2 className="text-lg font-semibold">Your access</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {staff.map((s) => (
            <li
              key={`${s.role}-${s.program_id}`}
              className="rounded-full bg-muted px-3 py-1 text-sm"
            >
              {ROLE_LABEL[s.role]}
              {s.program_id && ` · ${s.program_id}`}
            </li>
          ))}
        </ul>
      </section>
      <Programmes />
      <p className="text-sm text-muted-foreground">
        The application queue and ambassador management arrive with the onboarding release.
      </p>
    </Page>
  );
}

const STATUSES: MembershipStatus[] = ["pending", "approved", "suspended", "rejected", "withdrawn"];

function Programmes() {
  const programs = usePrograms();
  // RLS limits this to the programmes this staff member can see.
  // ponytail: counts in the browser; switch to a SQL view once memberships reach thousands.
  const memberships = useQuery({
    queryKey: ["admin-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_memberships")
        .select("program_id, status");
      if (error) throw error;
      return data as { program_id: string; status: MembershipStatus }[];
    },
  });

  if (programs.isLoading || memberships.isLoading) return <Loading label="Loading programmes" />;
  if (programs.error || memberships.error)
    return <ErrorNote>We couldn't load programme data. Refresh to try again.</ErrorNote>;

  const count = (program: string, status: MembershipStatus) =>
    memberships.data!.filter((m) => m.program_id === program && m.status === status).length;

  return (
    <section>
      <h2 className="text-lg font-semibold">Programmes</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Programme</th>
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
                <td className="p-3">{p.accepting_applications ? "Open" : "Closed"}</td>
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
    </section>
  );
}
