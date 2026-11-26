import { useState, type ReactNode } from "react";
import {
  Coins,
  MousePointerClick,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ConversionStatus } from "./Conversions";
import { useConversions, type ConversionRow } from "./conversions-data";
import { approxLocal, formatDay, formatMoney, useLocalRate } from "./money";
import { useMyClicks, useMyPayouts } from "./payouts-data";
import { ErrorNote, Loading } from "./ui";

// Ambassador home, modelled on the "Affiliate Dashboard" design: KPI cards,
// traffic and sales over time, monthly earnings, and a commission summary.

const DAY = 86_400_000;
// JOAT palette: gold and cream series on the dark surface (tokens in src/styles.css).
const BLUE = "#c9a227"; // clicks / revenue: joat-gold
const GREEN = "#f5efe6"; // sales / commission: joat-cream
// One colour per programme in the "All programs" charts.
const PROGRAM_COLORS = ["#c9a227", "#f5efe6", "#8c7a66", "#e0bc4a"];
const AXIS = { fontSize: 11, fill: "#cbbba6" };
const GRID = "#4a3626";
const TOOLTIP = {
  contentStyle: {
    background: "#1a130e",
    border: "1px solid #4a3626",
    borderRadius: 10,
    color: "#f5efe6",
  },
  labelStyle: { color: "#f5efe6" },
  itemStyle: { color: "#cbbba6" },
  cursor: { fill: "rgba(201,162,39,0.08)", stroke: "#4a3626" },
};
const LEGEND = { fontSize: 12, color: "#cbbba6" };

/** Sum exact decimal strings per currency, in cents. */
function byCurrency(rows: { currency: string | null; amount: string }[]) {
  const m = new Map<string, number>();
  for (const r of rows)
    if (r.currency)
      m.set(r.currency, (m.get(r.currency) ?? 0) + Math.round(Number(r.amount) * 100));
  return m;
}
const showTotals = (m: Map<string, number>, local: Parameters<typeof approxLocal>[1] = null) => {
  if (m.size === 0) return formatMoney(0, "USD");
  const text = [...m].map(([cur, cents]) => formatMoney((cents / 100).toFixed(2), cur)).join(" + ");
  const usd = m.get("USD");
  return usd && local ? `${text} (${approxLocal(usd / 100, local)})` : text;
};

function change(now: number, before: number) {
  if (before === 0) return null;
  const pct = Math.round(((now - before) / before) * 1000) / 10;
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

/** Vendo-style stat card: gold icon chip, big value, muted label; trend shown with an arrow. */
function Kpi({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string | null;
  icon: ReactNode;
}) {
  const down = delta?.startsWith("-");
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5 transition-colors duration-300 hover:border-joat-gold">
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-joat-gold text-joat-black [&_svg]:h-5 [&_svg]:w-5"
      >
        {icon}
      </span>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="min-w-0 break-words font-gilda text-[30px] leading-[1.1] tabular-nums text-joat-cream">
          {value}
        </span>
        {delta && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-joat-cream">
            {down ? (
              <TrendingDown className="h-3.5 w-3.5 text-joat-body" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-joat-gold" aria-hidden="true" />
            )}
            {delta}
            <span className="sr-only">compared with the previous 30 days</span>
          </span>
        )}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-[20px] border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-joat-cream">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AmbassadorOverview({
  userId,
  programName,
  programIds,
  country,
}: {
  userId: string;
  country: string | null;
  programName: (id: string) => string;
  /** Programmes the ambassador is (or was) active in; more than one shows a switcher. */
  programIds: string[];
}) {
  const [view, setView] = useState<string>("all");
  const clicks = useMyClicks(userId);
  const conversions = useConversions(userId);
  const payouts = useMyPayouts();
  const local = useLocalRate(country);

  if (clicks.isLoading || conversions.isLoading || payouts.isLoading)
    return <Loading label="Loading your dashboard" />;
  if (clicks.error || conversions.error || payouts.error)
    return <ErrorNote>We couldn't load your dashboard. Refresh to try again.</ErrorNote>;

  const now = Date.now();
  const within = (iso: string | null, from: number, to: number) => {
    const t = iso ? new Date(iso).getTime() : NaN;
    return t >= now - from * DAY && t < now - to * DAY;
  };
  const inView = (programId: string) => view === "all" || programId === view;
  const split = view === "all" && programIds.length > 1;
  const myClicks = clicks.data!.filter((c) => inView(c.program_id));
  const sales: ConversionRow[] = conversions.data!.filter(
    (c) => c.status !== "awaiting_payment" && inView(c.program_id),
  );
  const clicks30 = myClicks.filter((c) => within(c.at, 30, 0)).length;
  const clicksPrev = myClicks.filter((c) => within(c.at, 60, 30)).length;
  const sales30 = sales.filter((c) => within(c.occurred_at, 30, 0)).length;
  const salesPrev = sales.filter((c) => within(c.occurred_at, 60, 30)).length;

  const earned = byCurrency(sales.map((c) => ({ currency: c.currency, amount: c.commission })));
  const onHold = byCurrency(
    sales
      .filter(
        (c) => c.status === "verified" && c.hold_until && new Date(c.hold_until).getTime() > now,
      )
      .map((c) => ({ currency: c.currency, amount: c.commission })),
  );
  const paid = byCurrency(
    payouts.data!.filter((p) => p.paid_at).map((p) => ({ currency: p.currency, amount: p.amount })),
  );
  const approved = byCurrency(
    payouts
      .data!.filter((p) => !p.paid_at)
      .map((p) => ({ currency: p.currency, amount: p.amount })),
  );

  // Last 14 days of clicks and sales; clicks per programme in the "All" view.
  const sameDay = (iso: string | null, key: string) =>
    !!iso && new Date(iso).toDateString() === key;
  const traffic = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now - (13 - i) * DAY);
    const key = day.toDateString();
    const row: Record<string, string | number> = {
      day: day.toLocaleDateString(undefined, { weekday: "short" }),
      Sales: sales.filter((c) => sameDay(c.occurred_at, key)).length,
    };
    if (split)
      for (const id of programIds)
        row[`${programName(id)} clicks`] = myClicks.filter(
          (c) => c.program_id === id && sameDay(c.at, key),
        ).length;
    else row.Clicks = myClicks.filter((c) => sameDay(c.at, key)).length;
    return row;
  });
  const clickSeries = split
    ? programIds.map((id, i) => ({
        key: `${programName(id)} clicks`,
        color: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
      }))
    : [{ key: "Clicks", color: BLUE }];

  // Monthly commission for the last 6 months, in the ambassador's main currency.
  const mainCurrency = [...earned].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const inMonth = sales.filter(
      (c) =>
        c.currency === mainCurrency &&
        c.occurred_at &&
        new Date(c.occurred_at).getMonth() === d.getMonth() &&
        new Date(c.occurred_at).getFullYear() === d.getFullYear(),
    );
    const row: Record<string, string | number> = {
      month: d.toLocaleDateString(undefined, { month: "short" }),
    };
    // "All" view: commission stacked per programme (revenue of different
    // businesses isn't comparable). One programme: revenue and commission.
    if (split)
      for (const id of programIds)
        row[programName(id)] = inMonth
          .filter((c) => c.program_id === id)
          .reduce((n, c) => n + Number(c.commission), 0);
    else {
      row.Revenue = inMonth.reduce((n, c) => n + Number(c.revenue), 0);
      row.Commission = inMonth.reduce((n, c) => n + Number(c.commission), 0);
    }
    return row;
  });
  // Payouts are paid per ambassador, not per programme.
  const allPrograms = view === "all" ? "" : " (all programs)";

  return (
    <div className="space-y-4">
      {programIds.length > 1 && (
        <div role="tablist" aria-label="Program" className="flex flex-wrap gap-2">
          {["all", ...programIds].map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                view === id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              {id === "all" ? "All programs" : programName(id)}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<MousePointerClick />}
          label="Clicks (30 days)"
          value={String(clicks30)}
          delta={change(clicks30, clicksPrev)}
        />
        <Kpi
          icon={<ShoppingBag />}
          label="Sales (30 days)"
          value={String(sales30)}
          delta={change(sales30, salesPrev)}
        />
        <Kpi icon={<Coins />} label="Commission earned" value={showTotals(earned, local)} />
        <Kpi
          icon={<Wallet />}
          label={`Paid to you${allPrograms}`}
          value={showTotals(paid, local)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1.3fr_1fr]">
        <Panel title="Traffic & sales (14 days)">
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={traffic} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                <XAxis dataKey="day" tick={AXIS} stroke={GRID} interval={1} />
                <YAxis allowDecimals={false} tick={AXIS} stroke={GRID} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={LEGEND} />
                {clickSeries.map((c) => (
                  <Area
                    key={c.key}
                    type="monotone"
                    dataKey={c.key}
                    stroke={c.color}
                    fill={c.color}
                    fillOpacity={0.12}
                    dot
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="Sales"
                  stroke={GREEN}
                  fill={GREEN}
                  fillOpacity={0.12}
                  dot
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title={`${split ? "Commission" : "Earnings"} by month${mainCurrency ? ` (${mainCurrency})` : ""}`}
        >
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                <XAxis dataKey="month" tick={AXIS} stroke={GRID} />
                <YAxis tick={AXIS} stroke={GRID} />
                <Tooltip {...TOOLTIP} />
                <Legend wrapperStyle={LEGEND} />
                {split
                  ? programIds.map((id, i) => (
                      <Bar
                        key={id}
                        dataKey={programName(id)}
                        stackId="commission"
                        fill={PROGRAM_COLORS[i % PROGRAM_COLORS.length]}
                      />
                    ))
                  : [
                      <Bar key="r" dataKey="Revenue" fill={BLUE} radius={[3, 3, 0, 0]} />,
                      <Bar key="c" dataKey="Commission" fill={GREEN} radius={[3, 3, 0, 0]} />,
                    ]}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Commission overview">
          <dl className="space-y-3 text-sm">
            {(
              [
                ["Total earned", showTotals(earned, local)],
                ["On 30-day hold", showTotals(onHold, local)],
                [`Approved, being paid${allPrograms}`, showTotals(approved, local)],
                [`Paid to you${allPrograms}`, showTotals(paid, local)],
                ["Payout schedule", "Monthly"],
              ] as const
            ).map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-3 border-b border-border pb-2 last:border-0"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel title="Recent commissions">
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sales yet. Share your links from the Links section to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-joat-cream">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Program</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2 text-right">Commission</th>
                  <th className="py-2 pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.slice(0, 8).map((c) => (
                  <tr key={`${c.kind}-${c.reference}`}>
                    <td className="py-2 tabular-nums">{formatDay(c.occurred_at)}</td>
                    <td className="py-2">{programName(c.program_id)}</td>
                    <td className="py-2 font-mono">{c.reference}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatMoney(c.commission, c.currency)}
                    </td>
                    <td className="py-2 pl-4">
                      <ConversionStatus status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
