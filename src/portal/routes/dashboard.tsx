import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { useAccount, usePrograms } from "../account";
import { ErrorNote, Loading, Page, StatusBadge } from "../ui";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard | JOAT Global Partners" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { session, loading } = useSession();
  const account = useAccount(session?.user.id);
  const { data: programs } = usePrograms();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" />;
  if (account.isLoading) return <Loading label="Loading your account" />;
  if (account.error)
    return (
      <Page title="Dashboard">
        <ErrorNote>We couldn't load your account. Refresh the page to try again.</ErrorNote>
      </Page>
    );

  const { profile, memberships, staff } = account.data!;
  const programName = (id: string) => programs?.find((p) => p.id === id)?.name ?? id;

  return (
    <Page title="Dashboard" intro={<>Signed in as {session.user.email}</>}>
      {!profile ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">You're not an ambassador yet</h2>
          <p className="mt-2 text-muted-foreground">
            This account doesn't have an ambassador profile. Applications open soon. When they do,
            you'll be able to apply to one or both programmes from here.
          </p>
          {staff.length > 0 && (
            <p className="mt-4 text-sm">
              You have a staff role. Go to the{" "}
              <Link to="/admin" className="text-primary underline">
                admin area
              </Link>
              .
            </p>
          )}
        </section>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{profile.full_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.country}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Your programmes</h2>
            {memberships.length === 0 ? (
              <p className="mt-2 text-muted-foreground">You haven't joined a programme yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
                {memberships.map((m) => (
                  <li key={m.program_id} className="flex items-center justify-between p-4">
                    <span className="font-medium">{programName(m.program_id)}</span>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Referral links, clicks, conversions and commissions will appear here once tracking is
              switched on for your approved programmes.
            </p>
          </section>
        </>
      )}
    </Page>
  );
}
