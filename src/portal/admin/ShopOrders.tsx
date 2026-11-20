import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ConversionStatus } from "../Conversions";
import { useConversions } from "../conversions-data";
import { formatDay, formatMoney, holdNote } from "../money";
import { ErrorNote, Loading } from "../ui";
import { formatDate, useMembers } from "./data";

// Amare shop orders credited to ambassadors, as reported by Shopify webhooks,
// plus the recent webhook log so problems with the Shopify connection show up.

type OrderRow = {
  order_id: string;
  order_name: string | null;
  profile_id: string | null;
  self_referral: boolean;
};
type EventRow = { id: string; topic: string; received_at: string; outcome: string | null };

function useShopData() {
  return useQuery({
    queryKey: ["admin", "shop"],
    queryFn: async () => {
      const [orders, events] = await Promise.all([
        supabase
          .from("shopify_orders")
          .select("order_id, order_name, profile_id, self_referral")
          .not("profile_id", "is", null),
        // Support and super admins only (RLS); others get an empty list.
        supabase
          .from("webhook_events")
          .select("id, topic, received_at, outcome")
          .order("received_at", { ascending: false })
          .limit(25),
      ]);
      if (orders.error ?? events.error) throw orders.error ?? events.error;
      return {
        orders: (orders.data ?? []) as OrderRow[],
        events: (events.data ?? []) as EventRow[],
      };
    },
  });
}

export function ShopOrders() {
  const shop = useShopData();
  const conversions = useConversions("admin");
  const members = useMembers();

  if (shop.isLoading || conversions.isLoading || members.isLoading) return <Loading />;
  if (shop.error || conversions.error || members.error)
    return <ErrorNote>We couldn't load shop orders. Refresh to try again.</ErrorNote>;

  const rows = conversions.data!.filter((c) => c.kind === "shop_order");
  const nameOf = (id: string) =>
    members.data!.find((m) => m.profile_id === id)?.affiliate_profiles?.full_name ?? "Ambassador";
  const flagged = new Set(
    shop.data!.orders.filter((o) => o.self_referral).map((o) => o.order_name ?? o.order_id),
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Referred shop orders</h3>
        {rows.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-5 text-muted-foreground">
            No referred orders yet. They appear here when Shopify reports a paid order that carries
            an ambassador referral.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Ambassador</th>
                  <th className="p-3 text-right">Eligible revenue</th>
                  <th className="p-3 text-right">Refunded</th>
                  <th className="p-3 text-right">Commission</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => (
                  <tr key={c.reference}>
                    <td className="p-3 tabular-nums">{formatDay(c.occurred_at)}</td>
                    <td className="p-3 font-mono">{c.reference}</td>
                    <td className="p-3">
                      {nameOf(c.profile_id)}
                      {flagged.has(c.reference) && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-900">
                          Own purchase?
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatMoney(c.revenue, c.currency)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatMoney(c.refunded, c.currency)}
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
        <p className="text-sm text-muted-foreground">
          "Own purchase?" means the buyer's email matches the ambassador's account email. Review
          before approving any commission, and check Shopify's chargebacks list (Finance → Payouts)
          because Shopify doesn't report disputes to the portal.
        </p>
      </section>

      {shop.data!.events.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Recent Shopify notifications</h3>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {shop.data!.events.map((e) => (
              <li key={e.id} className="flex flex-wrap justify-between gap-2 p-3">
                <span className="font-mono">{e.topic}</span>
                <span className="text-muted-foreground">
                  {e.outcome ?? "received"} · {formatDate(e.received_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
