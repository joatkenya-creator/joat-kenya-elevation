import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError, isFinance, type Account } from "../account";
import { downloadCsv } from "../csv";
import { formatMoney } from "../money";
import { ErrorNote, Loading, buttonClass, inputClass } from "../ui";
import { formatDate, useMembers } from "./data";

// Monthly payouts: finance creates a batch per currency, a second finance user
// approves it, then each ambassador is paid by M-Pesa or bank outside the
// portal and the transaction reference is recorded here.

type Batch = {
  id: string;
  currency: string;
  status: "draft" | "approved" | "paid" | "cancelled";
  created_by: string;
  created_at: string;
  approved_at: string | null;
  note: string | null;
};
type Payee = {
  batch_id: string;
  profile_id: string;
  amount: string;
  method: "mpesa" | "bank";
  account_name: string;
  destination: string;
  paid_reference: string | null;
  paid_at: string | null;
};

const STATUS_STYLE: Record<Batch["status"], string> = {
  draft: "bg-amber-100 text-amber-900",
  approved: "bg-sky-100 text-sky-900",
  paid: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-zinc-200 text-zinc-800",
};

function usePayoutData() {
  return useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: async () => {
      const [b, p] = await Promise.all([
        supabase
          .from("affiliate_payout_batches")
          .select("id, currency, status, created_by, created_at, approved_at, note")
          .order("created_at", { ascending: false })
          .limit(24),
        supabase
          .from("affiliate_payout_payees")
          .select(
            "batch_id, profile_id, amount, method, account_name, destination, paid_reference, paid_at",
          ),
      ]);
      if (b.error ?? p.error) throw b.error ?? p.error;
      return { batches: (b.data ?? []) as Batch[], payees: (p.data ?? []) as Payee[] };
    },
  });
}

function useRpc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fn, args }: { fn: string; args: Record<string, unknown> }) => {
      const { error } = await supabase.rpc(fn, args);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

export function Payouts({ staff, userId }: { staff: Account["staff"]; userId: string }) {
  const data = usePayoutData();
  const members = useMembers();
  const rpc = useRpc();
  const [currency, setCurrency] = useState("KES");

  if (!isFinance(staff))
    return (
      <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
        Payouts are handled by finance users and super administrators.
      </p>
    );
  if (data.isLoading || members.isLoading) return <Loading label="Loading payouts" />;
  if (data.error || members.error)
    return <ErrorNote>We couldn't load payouts. Refresh to try again.</ErrorNote>;

  const nameOf = (id: string) =>
    members.data!.find((m) => m.profile_id === id)?.affiliate_profiles?.full_name ?? "Ambassador";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg font-semibold">New payout batch</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Collects every commission past its 30-day hold that hasn't been paid, minus refunds on
          sales already paid. Own purchases are never included. Disputed sales, suspended
          ambassadors, and anyone without payout details (or who changed them in the last 7 days)
          wait for the next run. Check Shopify's chargebacks list (Finance → Payouts) before
          approving.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Currency
            <select
              className={`${inputClass} mt-1 w-28`}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>KES</option>
              <option>USD</option>
            </select>
          </label>
          <button
            type="button"
            className={buttonClass}
            disabled={rpc.isPending}
            onClick={() =>
              rpc.mutate({ fn: "create_payout_batch", args: { p_currency: currency } })
            }
          >
            Create batch
          </button>
        </div>
        {rpc.error && (
          <div className="mt-3">
            <ErrorNote>{friendlyError(rpc.error)}</ErrorNote>
          </div>
        )}
      </section>

      {data.data!.batches.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
          No payout batches yet.
        </p>
      ) : (
        data.data!.batches.map((b) => (
          <BatchCard
            key={b.id}
            batch={b}
            payees={data.data!.payees.filter((p) => p.batch_id === b.id)}
            nameOf={nameOf}
            ownBatch={b.created_by === userId}
          />
        ))
      )}
    </div>
  );
}

function BatchCard({
  batch,
  payees,
  nameOf,
  ownBatch,
}: {
  batch: Batch;
  payees: Payee[];
  nameOf: (id: string) => string;
  ownBatch: boolean;
}) {
  const rpc = useRpc();
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const total = payees.reduce((n, p) => n + Number(p.amount), 0);
  const open = batch.status === "draft" || batch.status === "approved";

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {batch.currency} batch · {formatDate(batch.created_at)}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[batch.status]}`}
            >
              {batch.status[0].toUpperCase() + batch.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {payees.length} ambassador{payees.length === 1 ? "" : "s"} ·{" "}
            {formatMoney(total.toFixed(2), batch.currency)}
            {batch.note && ` · ${batch.note}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={() =>
              downloadCsv(
                `payout-${batch.currency}-${batch.created_at.slice(0, 10)}.csv`,
                [
                  "Ambassador",
                  "Account name",
                  "Method",
                  "Destination",
                  "Amount",
                  "Currency",
                  "Reference",
                ],
                payees.map((p) => [
                  nameOf(p.profile_id),
                  p.account_name,
                  p.method === "mpesa" ? "M-Pesa" : "Bank",
                  p.destination,
                  p.amount,
                  batch.currency,
                  p.paid_reference,
                ]),
              )
            }
          >
            Export
          </button>
          {batch.status === "draft" && (
            <button
              type="button"
              className={buttonClass}
              disabled={rpc.isPending || ownBatch}
              title={ownBatch ? "Another finance user must approve" : undefined}
              onClick={() =>
                rpc.mutate({ fn: "approve_payout_batch", args: { p_batch: batch.id } })
              }
            >
              {ownBatch ? "Awaiting second approver" : "Approve"}
            </button>
          )}
          {open && !cancelling && (
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1.5 text-sm"
              onClick={() => setCancelling(true)}
            >
              Cancel batch
            </button>
          )}
        </div>
      </header>

      {cancelling && (
        <div className="flex flex-wrap items-end gap-2 border-b border-border p-5">
          <label className="flex-1 text-sm">
            Reason for cancelling (kept in the activity log)
            <input
              className={`${inputClass} mt-1`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="rounded-md bg-red-700 px-3 py-2 text-sm text-white"
            disabled={rpc.isPending}
            onClick={() =>
              rpc.mutate({
                fn: "cancel_payout_batch",
                args: { p_batch: batch.id, p_reason: reason },
              })
            }
          >
            Cancel batch
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm"
            onClick={() => setCancelling(false)}
          >
            Keep it
          </button>
        </div>
      )}

      <ul className="divide-y divide-border">
        {payees.map((p) => (
          <li key={p.profile_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{nameOf(p.profile_id)}</p>
              <p className="text-sm text-muted-foreground">
                {p.method === "mpesa" ? "M-Pesa" : "Bank"} · {p.account_name} ·{" "}
                <span className="font-mono">{p.destination}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold tabular-nums">
                {formatMoney(p.amount, batch.currency)}
              </span>
              {p.paid_reference ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-900">
                  Paid · {p.paid_reference}
                </span>
              ) : batch.status === "approved" ? (
                <>
                  <input
                    aria-label={`Payment reference for ${nameOf(p.profile_id)}`}
                    placeholder="M-Pesa / bank ref"
                    className={`${inputClass} w-40`}
                    value={refs[p.profile_id] ?? ""}
                    onChange={(e) => setRefs({ ...refs, [p.profile_id]: e.target.value })}
                  />
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={rpc.isPending}
                    onClick={() =>
                      rpc.mutate({
                        fn: "mark_payout_paid",
                        args: {
                          p_batch: batch.id,
                          p_profile: p.profile_id,
                          p_reference: refs[p.profile_id] ?? "",
                        },
                      })
                    }
                  >
                    Mark paid
                  </button>
                </>
              ) : batch.status === "draft" ? (
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  disabled={rpc.isPending}
                  onClick={() =>
                    rpc.mutate({
                      fn: "remove_payout_payee",
                      args: {
                        p_batch: batch.id,
                        p_profile: p.profile_id,
                        p_reason: "Held back for review",
                      },
                    })
                  }
                >
                  Hold back
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {rpc.error && (
        <div className="p-4">
          <ErrorNote>{friendlyError(rpc.error)}</ErrorNote>
        </div>
      )}
    </section>
  );
}
