import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { friendlyError, usePrograms, type MembershipStatus, type Program } from "../account";
import { ErrorNote, Loading } from "../ui";
import { useMembers } from "./data";

const STATUSES: MembershipStatus[] = ["pending", "approved", "suspended", "rejected", "withdrawn"];

export function Programmes({ superAdmin }: { superAdmin: boolean }) {
  const programs = usePrograms();
  const members = useMembers();
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async (v: { id: string; open: boolean }) => {
      const { error } = await supabase.rpc("set_partner_program_accepting", {
        p_program_id: v.id,
        p_accepting: v.open,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  if (programs.isLoading || members.isLoading) return <Loading label="Loading programs" />;
  if (programs.error || members.error)
    return <ErrorNote>We couldn't load program data. Refresh to try again.</ErrorNote>;

  const count = (program: string, status: MembershipStatus) =>
    members.data!.filter((m) => m.program_id === program && m.status === status).length;

  return (
    <section className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Program</th>
              <th className="p-3">Applications</th>
              <th className="p-3">Attribution</th>
              {STATUSES.map((s) => (
                <th key={s} className="p-3 capitalize">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {programs.data!.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span>{p.accepting_applications ? "Open" : "Closed"}</span>
                    {superAdmin && (
                      <button
                        type="button"
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: p.id, open: !p.accepting_applications })}
                        className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-muted disabled:opacity-60"
                      >
                        {p.accepting_applications ? "Close" : "Open"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  {p.attribution_model
                    ? `${p.attribution_model.replace("_", " ")}, `
                    : "Model not selected, "}
                  {p.attribution_window_days} days
                </td>
                {STATUSES.map((s) => (
                  <td key={s} className="p-3 tabular-nums">
                    {count(p.id, s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toggle.error && <ErrorNote>{friendlyError(toggle.error)}</ErrorNote>}
      {superAdmin &&
        programs
          .data!.filter((p) => p.shop_url)
          .map((p) => <DiscountSetting key={p.id} program={p} />)}
      {superAdmin && (
        <p className="text-sm text-muted-foreground">
          Opening a program makes the application form available for it right away. Publish its
          commission rate and final terms first.
        </p>
      )}
    </section>
  );
}

type SyncResult = {
  created: number;
  updated: number;
  deactivated: number;
  unchanged: number;
  errors: { code: string; message: string }[];
};

// Ambassador discount codes in Shopify (docs/partners/shopify-discounts.md).
// Empty = off: no discounts, and a sync switches existing codes off.
function DiscountSetting({ program }: { program: Program }) {
  const queryClient = useQueryClient();
  const current = program.ambassador_discount_percent;
  const [value, setValue] = useState(current == null ? "" : String(current));
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("set_program_discount_percent", {
        p_program_id: program.id,
        p_percent: value.trim() === "" ? null : Number(value),
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const sync = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<SyncResult>(
        "sync-shopify-discounts",
        {
          body: { program_id: program.id },
        },
      );
      if (error) {
        const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
        throw new Error(body?.error ?? error.message);
      }
      return data!;
    },
  });

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
      <p className="font-medium">{program.name}: ambassador discount codes in Shopify</p>
      <p className="text-muted-foreground">
        {current == null
          ? "Off. Ambassador codes only credit sales (website box and shop cart); they give no discount."
          : `On: each approved ambassador's code gives ${current}% off, once per customer.`}{" "}
        Changes reach Shopify only when you press Sync.
      </p>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="flex items-center gap-1">
          <input
            type="number"
            min="0.01"
            max="99.99"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Off"
            aria-label="Discount percent (empty for off)"
            className="w-24 rounded-md border border-border bg-background px-2 py-1"
          />
          %
        </label>
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-md border border-border px-3 py-1 hover:bg-muted disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          disabled={sync.isPending}
          onClick={() => sync.mutate()}
          className="rounded-md border border-border px-3 py-1 hover:bg-muted disabled:opacity-60"
        >
          {sync.isPending ? "Syncing…" : "Sync to Shopify"}
        </button>
      </form>
      {save.error && <ErrorNote>{friendlyError(save.error)}</ErrorNote>}
      {sync.error && <ErrorNote>{friendlyError(sync.error)}</ErrorNote>}
      {sync.data && (
        <p className="text-muted-foreground" role="status">
          Created {sync.data.created}, updated {sync.data.updated}, switched off{" "}
          {sync.data.deactivated}, unchanged {sync.data.unchanged}.
          {sync.data.errors.length > 0 &&
            ` Failed: ${sync.data.errors.map((e) => `${e.code} (${e.message})`).join(", ")}`}
        </p>
      )}
    </div>
  );
}
