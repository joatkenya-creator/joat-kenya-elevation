import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "./account";
import { formatDay, formatMoney } from "./money";
import { useMyPayoutDetails, useMyPayouts } from "./payouts-data";
import { ErrorNote, Loading, buttonClass, inputClass } from "./ui";

// Ambassador's payout details (M-Pesa or bank) and payout history. Saved
// details are only ever shown back masked; finance sees them in full.

export function PayoutSettings() {
  const details = useMyPayoutDetails();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState<"mpesa" | "bank">("mpesa");
  const save = useMutation({
    mutationFn: async (f: FormData) => {
      const v = (k: string) => (f.get(k) as string | null)?.trim() || null;
      const { error } = await supabase.rpc("save_payout_details", {
        p_method: method,
        p_account_name: v("account_name") ?? "",
        p_mpesa_phone: v("mpesa_phone"),
        p_bank_name: v("bank_name"),
        p_bank_branch: v("bank_branch"),
        p_account_number: v("account_number"),
        p_swift_code: v("swift_code"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["payout-details"] });
    },
  });

  if (details.isLoading) return <Loading label="Loading payout details" />;
  if (details.error)
    return <ErrorNote>We couldn't load your payout details. Refresh to try again.</ErrorNote>;
  const current = details.data;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    save.mutate(new FormData(e.currentTarget));
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">How you're paid</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Payouts run monthly by M-Pesa or bank transfer. Commission is in US dollars and converted to
        your local currency when it's sent. Commission is included once its 30-day hold has passed.
      </p>

      {current && !editing ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0">
            <p className="break-all font-medium">{current.destination}</p>
            <p className="text-sm text-muted-foreground">
              {current.account_name} · updated {formatDay(current.updated_at)}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            onClick={() => {
              setMethod(current.method);
              setEditing(true);
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <fieldset className="flex gap-4 text-sm">
            <legend className="sr-only">Payout method</legend>
            {(
              [
                ["mpesa", "M-Pesa"],
                ["bank", "Bank transfer"],
              ] as const
            ).map(([id, label]) => (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="method"
                  checked={method === id}
                  onChange={() => setMethod(id)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="block text-sm">
            Name on the {method === "mpesa" ? "M-Pesa line" : "account"}
            <input name="account_name" required minLength={2} className={`${inputClass} mt-1`} />
          </label>
          {method === "mpesa" ? (
            <label className="block text-sm">
              M-Pesa phone number
              <input
                name="mpesa_phone"
                required
                inputMode="tel"
                placeholder="+254 7XX XXX XXX"
                pattern="\+?[0-9 \-]{9,20}"
                className={`${inputClass} mt-1`}
              />
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Bank
                <input name="bank_name" required className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-sm">
                Branch (optional)
                <input name="bank_branch" className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-sm">
                Account number
                <input
                  name="account_number"
                  required
                  pattern="[A-Za-z0-9 \-]{4,40}"
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="block text-sm">
                SWIFT code (banks outside Kenya)
                <input name="swift_code" className={`${inputClass} mt-1`} />
              </label>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            For your security, new or changed details are used from the first payout run at least 7
            days later, and the change is recorded. Payouts already approved go to the details you
            had then.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonClass} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save payout details"}
            </button>
            {current && (
              <button
                type="button"
                className="rounded-md border border-border px-3 py-2 text-sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
          {save.error && (
            <ErrorNote>
              {friendlyError(save.error) ||
                "Check the details: phone numbers use digits only, account numbers 4–40 characters."}
            </ErrorNote>
          )}
        </form>
      )}
      <PayoutHistory />
    </section>
  );
}

function PayoutHistory() {
  const payouts = useMyPayouts();
  if (payouts.isLoading || payouts.error || payouts.data!.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="font-semibold">Payouts</h3>
      <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
        {payouts.data!.map((p) => (
          <li key={p.batch_id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <span className="text-sm">
              {p.paid_at ? `Paid ${formatDay(p.paid_at)}` : `Approved ${formatDay(p.approved_at)}`}{" "}
              · {p.method === "mpesa" ? "M-Pesa" : "Bank"}
              {p.paid_reference && (
                <span className="ml-1 font-mono text-muted-foreground">{p.paid_reference}</span>
              )}
            </span>
            <span className="font-semibold tabular-nums">{formatMoney(p.amount, p.currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
