import { useConversions, type ConversionRow } from "./conversions-data";
import { ErrorNote, Loading } from "./ui";
import { formatDay, formatMoney, holdNote } from "./money";

const STATUS: Record<ConversionRow["status"], { label: string; style: string }> = {
  verified: { label: "Verified", style: "bg-joat-gold text-joat-black" },
  awaiting_payment: { label: "Awaiting payment", style: "bg-joat-brown text-joat-cream" },
  disputed: { label: "Payment disputed", style: "border border-joat-error text-joat-cream" },
  reversed: { label: "Reversed", style: "border border-joat-border text-joat-body" },
};

export function ConversionStatus({ status }: { status: ConversionRow["status"] }) {
  const s = STATUS[status];
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${s.style}`}>
      {s.label}
    </span>
  );
}

/** Ambassador dashboard: referred sales, without any customer details. */
export function MyConversions({
  userId,
  programName,
}: {
  userId: string;
  programName: (id: string) => string;
}) {
  const conversions = useConversions(userId);
  if (conversions.isLoading) return <Loading label="Loading your sales" />;
  if (conversions.error)
    return <ErrorNote>We couldn't load your sales. Refresh to try again.</ErrorNote>;
  const rows = conversions.data!;

  return (
    <section>
      <h2 className="text-lg font-semibold">Referred sales</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sales count once the customer's payment is verified. Amare amounts exclude shipping, tax and
        discounts; refunds and chargebacks reduce or reverse them. Commission is your rate (8% to
        start, up to 10% as you grow; JOAT: on the client's first invoice), in US dollars, and can
        be approved for payout after a 30-day hold.
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-lg border border-border bg-card p-5 text-muted-foreground">
          No referred sales yet.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Program</th>
                <th className="p-3">Reference</th>
                <th className="p-3 text-right">Eligible revenue</th>
                <th className="p-3 text-right">Commission</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr key={`${c.kind}-${c.reference}`}>
                  <td className="p-3 tabular-nums">{formatDay(c.occurred_at)}</td>
                  <td className="p-3">{programName(c.program_id)}</td>
                  <td className="p-3 font-mono">{c.reference}</td>
                  <td className="p-3 text-right tabular-nums">
                    {formatMoney(c.revenue, c.currency)}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatMoney(c.commission, c.currency)}
                    {c.status === "verified" && holdNote(c.hold_until) && (
                      <span className="block text-xs text-muted-foreground">
                        {holdNote(c.hold_until)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <ConversionStatus status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
