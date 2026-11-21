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
import { formatDay, formatMoney } from "./money";
import { useMyClicks, useMyPayouts } from "./payouts-data";
import { ErrorNote, Loading } from "./ui";

// Ambassador home, modelled on the "Affiliate Dashboard" design: KPI cards,
// traffic and sales over time, monthly earnings, and a commission summary.

const DAY = 86_400_000;
const BLUE = "#2563eb";
const GREEN = "#16a34a";

/** Sum exact decimal strings per currency, in cents. */
function byCurrency(rows: { currency: string | null; amount: string }[]) {
  const m = new Map<string, number>();
  for (const r of rows)
    if (r.currency)
      m.set(r.currency, (m.get(r.currency) ?? 0) + Math.round(Number(r.amount) * 100));
  return m;
}
const showTotals = (m: Map<string, number>) =>
  m.size === 0
    ? "0.00"
    : [...m].map(([cur, cents]) => formatMoney((cents / 100).toFixed(2), cur)).join(" + ");

function change(now: number, before: number) {
  if (before === 0) return null;
  const pct = Math.round(((now - before) / before) * 1000) / 10;
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function Kpi({ label, value, delta }: { label: string; value: string; delta?: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {delta && (
          <span
            className={`text-xs font-medium ${delta.startsWith("-") ? "text-red-700" : "text-emerald-700"}`}
          >
            {delta}
          </span>
        )}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AmbassadorOverview({
  userId,
  programName,
}: {
  userId: string;
  programName: (id: string) => string;
}) {
  const clicks = useMyClicks(userId);
  const conversions = useConversions(userId);
  const payouts = useMyPayouts();

  if (clicks.isLoading || conversions.isLoading || payouts.isLoading)
    return <Loading label="Loading your dashboard" />;
  if (clicks.error || conversions.error || payouts.error)
    return <ErrorNote>We couldn't load your dashboard. Refresh to try again.</ErrorNote>;

  const now = Date.now();
  const within = (iso: string | null, from: number, to: number) => {
    const t = iso ? new Date(iso).getTime() : NaN;
    return t >= now - from * DAY && t < now - to * DAY;
  };
  const sales: ConversionRow[] = conversions.data!.filter((c) => c.status !== "awaiting_payment");
  const clicks30 = clicks.data!.filter((c) => within(c.at, 30, 0)).length;
  const clicksPrev = clicks.data!.filter((c) => within(c.at, 60, 30)).length;
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

  // Last 14 days of clicks and sales.
  const traffic = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now - (13 - i) * DAY);
    const key = day.toDateString();
    return {
      day: day.toLocaleDateString(undefined, { weekday: "short" }),
      Clicks: clicks.data!.filter((c) => new Date(c.at).toDateString() === key).length,
      Sales: sales.filter((c) => c.occurred_at && new Date(c.occurred_at).toDateString() === key)
        .length,
    };
  });

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
    return {
      month: d.toLocaleDateString(undefined, { month: "short" }),
      Revenue: inMonth.reduce((n, c) => n + Number(c.revenue), 0),
      Commission: inMonth.reduce((n, c) => n + Number(c.commission), 0),
    };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Clicks (30 days)"
          value={String(clicks30)}
          delta={change(clicks30, clicksPrev)}
        />
        <Kpi label="Sales (30 days)" value={String(sales30)} delta={change(sales30, salesPrev)} />
        <Kpi label="Commission earned" value={showTotals(earned)} />
        <Kpi label="Paid to you" value={showTotals(paid)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1.3fr_1fr]">
        <Panel title="Traffic & sales (14 days)">
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={traffic} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="Clicks"
                  stroke={BLUE}
                  fill={BLUE}
                  fillOpacity={0.12}
                  dot
                />
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
        <Panel title={`Earnings by month${mainCurrency ? ` (${mainCurrency})` : ""}`}>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={months} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill={BLUE} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Commission" fill={GREEN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Commission overview">
          <dl className="space-y-3 text-sm">
            {(
              [
                ["Total earned", showTotals(earned)],
                ["On 30-day hold", showTotals(onHold)],
                ["Approved, being paid", showTotals(approved)],
                ["Paid to you", showTotals(paid)],
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
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Programme</th>
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
