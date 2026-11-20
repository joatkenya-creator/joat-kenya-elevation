import { useState } from "react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { MfaGate } from "../MfaGate";
import { ROLE_LABEL, canSee, isSuperAdmin, useAccount, usePrograms } from "../account";
import { ErrorNote, Loading, Page } from "../ui";
import { Members } from "../admin/Members";
import { JoatSales } from "../admin/JoatSales";
import { ShopOrders } from "../admin/ShopOrders";
import { Programmes } from "../admin/Programmes";
import { Activity } from "../admin/Activity";
import { useMembers } from "../admin/data";

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

  return <AdminHome staff={staff} userId={session.user.id} />;
}

type Tab = "queue" | "ambassadors" | "joat" | "shop" | "programmes" | "activity";

function AdminHome({
  staff,
  userId,
}: {
  staff: NonNullable<ReturnType<typeof useAccount>["data"]>["staff"];
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("queue");
  const programs = usePrograms();
  const members = useMembers();
  const programName = (id: string) => programs.data?.find((p) => p.id === id)?.name ?? id;
  const pending = members.data?.filter((m) => m.status === "pending").length ?? 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: "queue", label: pending ? `Applications (${pending})` : "Applications" },
    { id: "ambassadors", label: "Ambassadors" },
    ...(canSee(staff, "joat") ? [{ id: "joat" as const, label: "JOAT sales" }] : []),
    ...(canSee(staff, "amare") ? [{ id: "shop" as const, label: "Shop orders" }] : []),
    { id: "programmes", label: "Programmes" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <Page
      title="Admin"
      intro={
        <span className="flex flex-wrap gap-2">
          {staff.map((s) => (
            <span
              key={`${s.role}-${s.program_id}`}
              className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
            >
              {ROLE_LABEL[s.role]}
              {s.program_id && ` · ${programName(s.program_id)}`}
            </span>
          ))}
        </span>
      }
    >
      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === t.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "queue" && <Members view="queue" staff={staff} programName={programName} />}
        {tab === "ambassadors" && (
          <Members view="ambassadors" staff={staff} programName={programName} />
        )}
        {tab === "joat" && <JoatSales staff={staff} userId={userId} />}
        {tab === "shop" && <ShopOrders />}
        {tab === "programmes" && <Programmes superAdmin={isSuperAdmin(staff)} />}
        {tab === "activity" && <Activity programName={programName} />}
      </div>
    </Page>
  );
}
