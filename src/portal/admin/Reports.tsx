import { useConversions } from "../conversions-data";
import { downloadCsv } from "../csv";
import { formatMoney } from "../money";
import { ErrorNote, Loading } from "../ui";
import { fraudFlags, useFraudSignals, useMembers } from "./data";

// Per-ambassador performance for the last 30 days, fraud warnings, and CSV
// exports. Every number comes from the database; nothing is estimated here.

export function Reports({ programName }: { programName: (id: string) => string }) {
  const members = useMembers();
  const signals = useFraudSignals();
  const conversions = useConversions("admin");

  if (members.isLoading || signals.isLoading || conversions.isLoading)
    return <Loading label="Loading reports" />;
  if (members.error || signals.error || conversions.error)
    return <ErrorNote>We couldn't load reports. Refresh to try again.</ErrorNote>;

  const nameOf = (id: string) =>
    members.data!.find((m) => m.profile_id === id)?.affiliate_profiles?.full_name ?? "Ambassador";
  const rows = members
    .data!.filter((m) => m.status === "approved" || m.status === "suspended")
    .map((m) => {
      const s = signals.data!.find(
        (x) => x.profile_id === m.profile_id && x.program_id === m.program_id,
      );
      const mine = conversions.data!.filter(
        (c) => c.profile_id === m.profile_id && c.program_id === m.program_id,
      );
      // Totals per currency, summed from exact decimal strings in cents.
      const byCurrency = new Map<string, number>();
      for (const c of mine)
        if (c.currency)
          byCurrency.set(
            c.currency,
            (byCurrency.get(c.currency) ?? 0) + Math.round(Number(c.commission) * 100),
          );
      const commission = [...byCurrency].map(([cur, cents]) =>
        formatMoney((cents / 100).toFixed(2), cur),
      );
      return { m, s, sales: mine.length, commission, flags: fraudFlags(s) };
    })
    .sort((a, b) => b.flags.length - a.flags.length || (b.s?.clicks ?? 0) - (a.s?.clicks ?? 0));

  const exportReport = () =>
    downloadCsv(
      `ambassadors-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Ambassador",
        "Programme",
        "Status",
        "Clicks (30d)",
        "Unique visitors (30d)",
        "Sales (30d)",
        "Sales (all)",
        "Commission (all)",
        "Flags",
      ],
      rows.map((r) => [
        nameOf(r.m.profile_id),
        programName(r.m.program_id),
        r.m.status,
        r.s?.clicks ?? 0,
        r.s?.unique_visitors ?? 0,
        r.s?.sales ?? 0,
        r.sales,
        r.commission.join(" + "),
        r.flags.join("; "),
      ]),
    );
  const exportSales = () =>
    downloadCsv(
      `referred-sales-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Date",
        "Programme",
        "Reference",
        "Ambassador",
        "Status",
        "Currency",
        "Revenue",
        "Refunded",
        "Commission",
        "Hold ends",
      ],
      conversions.data!.map((c) => [
        c.occurred_at?.slice(0, 10),
        programName(c.program_id),
        c.reference,
        nameOf(c.profile_id),
        c.status,
        c.currency,
        c.revenue,
        c.refunded,
        c.commission,
        c.hold_until?.slice(0, 10),
      ]),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Last 30 days of clicks; sales and commission cover all time. Flags are prompts to look
          closer, not proof of fraud.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={exportReport}
          >
            Export ambassadors
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={exportSales}
          >
            Export sales
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Ambassador</th>
              <th className="p-3">Programme</th>
              <th className="p-3 text-right">Clicks</th>
              <th className="p-3 text-right">Visitors</th>
              <th className="p-3 text-right">Sales 30d</th>
              <th className="p-3 text-right">Commission</th>
              <th className="p-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-5 text-muted-foreground">
                  No approved ambassadors yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={`${r.m.profile_id}-${r.m.program_id}`}>
                <td className="p-3 font-medium">{nameOf(r.m.profile_id)}</td>
                <td className="p-3">{programName(r.m.program_id)}</td>
                <td className="p-3 text-right tabular-nums">{r.s?.clicks ?? 0}</td>
                <td className="p-3 text-right tabular-nums">{r.s?.unique_visitors ?? 0}</td>
                <td className="p-3 text-right tabular-nums">{r.s?.sales ?? 0}</td>
                <td className="p-3 text-right tabular-nums">{r.commission.join(" + ") || "–"}</td>
                <td className="p-3">
                  {r.flags.length === 0 ? (
                    <span className="text-muted-foreground">None</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {r.flags.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-900"
                        >
                          {f}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
