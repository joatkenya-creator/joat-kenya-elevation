import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { AlertTriangle, Clock, Inbox, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useConversions } from "../conversions-data";
import { formatMoney } from "../money";
import { ErrorNote, Loading } from "../ui";
import { fraudFlags, useActivity, useFraudSignals, useMembers, type MemberRow } from "./data";
import { ACTION_LABEL } from "./labels";

// Admin home, modelled on the "Afflux" partner overview: headline numbers with
// 14-day mini bars, ambassador mix, recent activity, what needs attention, and
// a card per ambassador.

// JOAT gold (joat-gold); inactive sparkline bars use joat-border.
const ACCENT = "#c9a227";
const DAYS = 14;

/** Counts per day for the last DAYS days, oldest first. */
function perDay(dates: (string | null | undefined)[]) {
  const out = Array<number>(DAYS).fill(0);
  const today = new Date().setHours(0, 0, 0, 0);
  for (const d of dates) {
    if (!d) continue;
    const ago = Math.floor((today - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
    if (ago >= 0 && ago < DAYS) out[DAYS - 1 - ago]++;
  }
  return out;
}

// ponytail: pulls up to 5,000 recent click timestamps; move to an SQL daily
// rollup once traffic outgrows that.
function useRecentClicks() {
  return useQuery({
    queryKey: ["admin", "recent-clicks"],
    queryFn: async () => {
      const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("affiliate_clicks")
        .select("at")
        .eq("is_duplicate", false)
        .gte("at", since)
        .limit(5000);
      if (error) throw error;
      return (data ?? []).map((r) => r.at as string);
    },
  });
}

function useDraftBatches() {
  return useQuery({
    queryKey: ["admin", "draft-batches"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("affiliate_payout_batches")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-8 items-end gap-[2px]" aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: i === values.length - 1 ? ACCENT : "#4a3626",
          }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value, spark }: { label: string; value: number; spark: number[] }) {
  return (
    <div className="flex items-end gap-3">
      <div>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <Spark values={spark} />
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export function Overview({
  programName,
  onOpen,
}: {
  programName: (id: string) => string;
  onOpen: (tab: "queue" | "reports" | "payouts" | "activity") => void;
}) {
  const members = useMembers();
  const signals = useFraudSignals();
  const conversions = useConversions("admin");
  const activity = useActivity();
  const clicks = useRecentClicks();
  const drafts = useDraftBatches();
  const [filter, setFilter] = useState<"all" | "joat" | "amare">("all");

  const queries = [members, signals, conversions, activity, clicks, drafts];
  if (queries.some((q) => q.isLoading)) return <Loading label="Loading overview" />;
  if (queries.some((q) => q.error))
    return <ErrorNote>We couldn't load the overview. Refresh to try again.</ErrorNote>;

  const all = members.data!;
  const approved = all.filter((m) => m.status === "approved");
  const pending = all.filter((m) => m.status === "pending");
  const sigFor = (m: MemberRow) =>
    signals.data!.find((s) => s.profile_id === m.profile_id && s.program_id === m.program_id);
  const flagged = approved.filter((m) => fraudFlags(sigFor(m)).length > 0);
  const nameOf = (id: string | null) =>
    all.find((m) => m.profile_id === id)?.affiliate_profiles?.full_name ?? null;
  const shown = approved.filter((m) => filter === "all" || m.program_id === filter);
  const maxClicks = Math.max(1, ...approved.map((m) => sigFor(m)?.clicks ?? 0));

  const mix = [
    { label: "JOAT Global", n: approved.filter((m) => m.program_id === "joat").length },
    { label: "Amare's Big Planet", n: approved.filter((m) => m.program_id === "amare").length },
    { label: "Pending review", n: pending.length },
  ];
  const attention = [
    pending.length > 0 && {
      icon: Inbox,
      title: `${pending.length} application${pending.length === 1 ? "" : "s"} waiting`,
      body: "Reply quickly so new ambassadors can start.",
      tab: "queue" as const,
    },
    drafts.data! > 0 && {
      icon: Wallet,
      title: `${drafts.data} payout batch${drafts.data === 1 ? "" : "es"} to approve`,
      body: "Check chargebacks, then approve and pay.",
      tab: "payouts" as const,
    },
    ...flagged.slice(0, 3).map((m) => ({
      icon: AlertTriangle,
      title: m.affiliate_profiles?.full_name ?? "Ambassador",
      body: fraudFlags(sigFor(m)).join(" · "),
      tab: "reports" as const,
    })),
  ].filter(Boolean) as { icon: typeof Inbox; title: string; body: string; tab: "queue" }[];

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ambassadors</h2>
          <p className="text-sm text-muted-foreground">
            Review applications, watch performance and keep payouts moving.
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <Stat
            label="Active ambassadors"
            value={approved.length}
            spark={perDay(approved.map((m) => m.status_changed_at))}
          />
          <Stat
            label={`Clicks, last ${DAYS} days`}
            value={clicks.data!.length}
            spark={perDay(clicks.data!)}
          />
          <Stat
            label={`Sales, last ${DAYS} days`}
            value={perDay(conversions.data!.map((c) => c.occurred_at)).reduce((a, b) => a + b, 0)}
            spark={perDay(conversions.data!.map((c) => c.occurred_at))}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Ambassador mix</h3>
          <p className="text-xs text-muted-foreground">By program</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-36 w-36 shrink-0" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: `${100 - i * 28}%`,
                    height: `${100 - i * 28}%`,
                    background: [`${ACCENT}1f`, `${ACCENT}59`, ACCENT][i],
                  }}
                />
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {mix.map((x, i) => (
                <li key={x.label} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: [`${ACCENT}40`, `${ACCENT}99`, ACCENT][i] }}
                  />
                  <span className="font-semibold tabular-nums">{x.n}</span>
                  <span className="text-muted-foreground">{x.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent activity</h3>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => onOpen("activity")}
            >
              View all
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {activity.data!.length === 0 && (
              <li className="text-sm text-muted-foreground">Nothing yet.</li>
            )}
            {activity.data!.slice(0, 4).map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[nameOf(a.subject_id), a.program_id && programName(a.program_id)]
                      .filter(Boolean)
                      .join(" · ") || "Program"}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDistanceToNowStrict(new Date(a.at))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Attention needed
          </h3>
          <p className="text-xs text-muted-foreground">
            {attention.length === 0
              ? "All clear"
              : `${attention.length} item${attention.length === 1 ? "" : "s"} need action`}
          </p>
          <ul className="mt-3 space-y-2">
            {attention.map((x) => (
              <li key={x.title}>
                <button
                  type="button"
                  onClick={() => onOpen(x.tab)}
                  className="flex w-full items-start gap-2 rounded-xl border border-border p-2.5 text-left hover:bg-muted"
                >
                  <x.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{x.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{x.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filter by program"
            className="flex max-w-full overflow-x-auto rounded-xl bg-muted p-1"
          >
            {(
              [
                ["all", "All"],
                ["joat", "JOAT Global"],
                ["amare", "Amare"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-sm ${filter === id ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpen("queue")}
            className="min-h-11 rounded-[10px] bg-joat-gold px-4 py-2 text-sm font-medium text-joat-black hover:bg-joat-gold-hover"
          >
            Review applications{pending.length > 0 && ` (${pending.length})`}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {shown.length} of {approved.length} active ambassadors
        </p>
        {shown.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            No active ambassadors here yet. Approved applicants appear as cards.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {shown.map((m) => {
              const s = sigFor(m);
              const flags = fraudFlags(s);
              const name = m.affiliate_profiles?.full_name ?? "Ambassador";
              const mine = conversions.data!.filter(
                (c) => c.profile_id === m.profile_id && c.program_id === m.program_id,
              );
              const cur = mine[0]?.currency ?? "USD";
              const cents = mine
                .filter((c) => c.currency === cur)
                .reduce((n, c) => n + Math.round(Number(c.commission) * 100), 0);
              return (
                <article
                  key={`${m.profile_id}-${m.program_id}`}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs font-semibold">
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {programName(m.program_id)} · {m.affiliate_profiles?.country}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 text-center">
                    <div>
                      <dt className="text-xs text-muted-foreground">Clicks</dt>
                      <dd className="font-semibold tabular-nums">{s?.clicks ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Sales</dt>
                      <dd className="font-semibold tabular-nums">{mine.length}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Earned</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatMoney((cents / 100).toFixed(0), cur)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 h-1.5 rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${((s?.clicks ?? 0) / maxClicks) * 100}%`,
                        background: ACCENT,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${flags.length ? "border-joat-error text-joat-cream" : "border-border"}`}
                      title={flags.join(" · ") || undefined}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${flags.length ? "bg-joat-error" : "bg-joat-gold"}`}
                      />
                      {flags.length ? "Review" : "Healthy"}
                    </span>
                    <span className="text-muted-foreground">
                      Joined {formatDistanceToNowStrict(new Date(m.status_changed_at))} ago
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
