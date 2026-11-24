import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { canManage, friendlyError, isFinance, type Account } from "../account";
import { ConversionStatus } from "../Conversions";
import { useConversions } from "../conversions-data";
import { MONEY_PATTERN, formatDay, formatMoney, holdNote } from "../money";
import { ErrorNote, Loading, buttonClass, inputClass } from "../ui";
import { useMembers } from "./data";

// JOAT sales, end to end: referred enquiry → engagement → invoice → M-Pesa
// payment → confirmed by a second person. Every write is a database function
// that re-checks the caller's role; the buttons here only hide what won't work.

type Lead = {
  type: "contact" | "booking";
  id: string;
  created_at: string;
  name: string;
  email: string;
  detail: string | null;
  click_id: number;
};
type Engagement = {
  id: string;
  reference: string;
  lead_type: string;
  lead_id: string;
  profile_id: string;
  client_name: string;
  service: string;
  agreed_on: string;
  contract_ref: string | null;
  self_referral: boolean;
};
type Invoice = {
  id: string;
  engagement_id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  issued_on: string;
};
type Payment = {
  id: string;
  invoice_id: string;
  amount: string;
  received_on: string;
  method: string;
  reference: string;
  status: "recorded" | "confirmed" | "rejected";
  recorded_by: string;
  review_note: string | null;
};

function useJoatData() {
  return useQuery({
    queryKey: ["admin", "joat"],
    queryFn: async () => {
      const [contacts, bookings, engagements, invoices, payments, clicks] = await Promise.all([
        supabase
          .from("contact_submissions")
          .select("id, created_at, first_name, last_name, email, service_area, referral_click_id")
          .not("referral_click_id", "is", null),
        supabase
          .from("consultation_bookings")
          .select("id, created_at, full_name, email, company, referral_click_id")
          .not("referral_click_id", "is", null),
        supabase.from("joat_engagements").select("*").order("created_at", { ascending: false }),
        supabase.from("joat_invoices").select("*").order("issued_on"),
        supabase.from("joat_payments").select("*").order("received_on"),
        supabase.from("affiliate_clicks").select("id, profile_id").eq("program_id", "joat"),
      ]);
      const error =
        contacts.error ??
        bookings.error ??
        engagements.error ??
        invoices.error ??
        payments.error ??
        clicks.error;
      if (error) throw error;
      const leads: Lead[] = [
        ...(contacts.data ?? []).map((c) => ({
          type: "contact" as const,
          id: c.id,
          created_at: c.created_at,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          detail: c.service_area,
          click_id: c.referral_click_id,
        })),
        ...(bookings.data ?? []).map((b) => ({
          type: "booking" as const,
          id: b.id,
          created_at: b.created_at,
          name: b.full_name,
          email: b.email,
          detail: b.company ? `Consultation · ${b.company}` : "Consultation",
          click_id: b.referral_click_id,
        })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at));
      return {
        leads,
        engagements: (engagements.data ?? []) as Engagement[],
        invoices: (invoices.data ?? []) as Invoice[],
        payments: (payments.data ?? []) as Payment[],
        clickOwner: new Map(
          (clicks.data ?? []).map((c) => [c.id as number, c.profile_id as string]),
        ),
      };
    },
  });
}

function useRpc(fn: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: Record<string, unknown>) => {
      const { error } = await supabase.rpc(fn, args);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      void queryClient.invalidateQueries({ queryKey: ["conversions"] });
    },
  });
}

export function JoatSales({ staff, userId }: { staff: Account["staff"]; userId: string }) {
  const data = useJoatData();
  const members = useMembers();
  const conversions = useConversions("admin");

  if (data.isLoading || members.isLoading || conversions.isLoading) return <Loading />;
  if (data.error || members.error || conversions.error)
    return <ErrorNote>We couldn't load JOAT sales. Refresh to try again.</ErrorNote>;

  const { leads, engagements, invoices, payments, clickOwner } = data.data!;
  const nameOf = (profileId: string | undefined) =>
    members.data!.find((m) => m.profile_id === profileId)?.affiliate_profiles?.full_name ??
    "Ambassador";
  const engaged = new Set(engagements.map((e) => `${e.lead_type}:${e.lead_id}`));
  const open = leads.filter((l) => !engaged.has(`${l.type}:${l.id}`));
  const manager = canManage(staff, "joat");
  const finance = isFinance(staff);
  const canBill = manager || finance;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Referred inquiries</h3>
        <p className="text-sm text-muted-foreground">
          Inquiries that arrived through an ambassador link. When one becomes a client, create an
          engagement to start tracking invoices and payments.
        </p>
        {open.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-5 text-muted-foreground">
            No referred inquiries waiting.
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((l) => (
              <li key={`${l.type}-${l.id}`} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{l.name}</p>
                    <p className="break-all text-sm text-muted-foreground">
                      {l.email} · {l.detail} · {formatDay(l.created_at)}
                    </p>
                  </div>
                  <p className="text-sm">Referred by {nameOf(clickOwner.get(l.click_id))}</p>
                </div>
                {manager && <NewEngagement lead={l} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Engagements</h3>
        {engagements.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-5 text-muted-foreground">
            No engagements yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {engagements.map((e) => {
              const conv = conversions.data!.find(
                (c) => c.kind === "engagement" && c.reference === e.reference,
              );
              const mine = invoices.filter((i) => i.engagement_id === e.id);
              return (
                <li key={e.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">
                        <span className="font-mono">{e.reference}</span> · {e.client_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.service} · agreed {formatDay(e.agreed_on)}
                        {e.contract_ref && ` · contract ${e.contract_ref}`} · referred by{" "}
                        {nameOf(e.profile_id)}
                      </p>
                      {e.self_referral && (
                        <p className="mt-1 text-sm font-medium text-red-800">
                          Flag: the client's email matches the ambassador's own account.
                        </p>
                      )}
                    </div>
                    {conv && (
                      <div className="text-right">
                        <ConversionStatus status={conv.status} />
                        <p className="mt-1 text-sm tabular-nums">
                          Collected {formatMoney(conv.revenue, conv.currency)}
                        </p>
                        <p className="text-sm tabular-nums">
                          Commission {formatMoney(conv.commission, conv.currency)}
                        </p>
                        {conv.status === "verified" && holdNote(conv.hold_until) && (
                          <p className="text-xs text-muted-foreground">
                            {holdNote(conv.hold_until)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {mine.map((inv) => (
                      <InvoiceBlock
                        key={inv.id}
                        invoice={inv}
                        payments={payments.filter((p) => p.invoice_id === inv.id)}
                        canBill={canBill}
                        finance={finance}
                        userId={userId}
                      />
                    ))}
                    {canBill && <NewInvoice engagementId={e.id} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function NewEngagement({ lead }: { lead: Lead }) {
  const create = useRpc("create_joat_engagement");
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState(lead.name);
  const [service, setService] = useState(lead.detail ?? "");
  const [agreed, setAgreed] = useState(new Date().toISOString().slice(0, 10));
  const [contract, setContract] = useState("");
  const idp = `eng-${lead.type}-${lead.id}`;

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      >
        Create engagement…
      </button>
    );
  return (
    <form
      className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        create.mutate({
          p_lead_type: lead.type,
          p_lead_id: lead.id,
          p_client_name: client,
          p_service: service,
          p_agreed_on: agreed,
          p_contract_ref: contract || null,
        });
      }}
    >
      <Field id={`${idp}-client`} label="Client (business or person)">
        <input
          id={`${idp}-client`}
          className={inputClass}
          required
          maxLength={200}
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
      </Field>
      <Field id={`${idp}-service`} label="Service">
        <input
          id={`${idp}-service`}
          className={inputClass}
          required
          maxLength={200}
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
      </Field>
      <Field id={`${idp}-agreed`} label="Agreed on">
        <input
          id={`${idp}-agreed`}
          type="date"
          className={inputClass}
          required
          value={agreed}
          onChange={(e) => setAgreed(e.target.value)}
        />
      </Field>
      <Field id={`${idp}-contract`} label="Contract or proposal reference (optional)">
        <input
          id={`${idp}-contract`}
          className={inputClass}
          maxLength={200}
          value={contract}
          onChange={(e) => setContract(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className={buttonClass} disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create engagement"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
      {create.error && <ErrorNote>{friendlyError(create.error)}</ErrorNote>}
    </form>
  );
}

function NewInvoice({ engagementId }: { engagementId: string }) {
  const add = useRpc("add_joat_invoice");
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [issued, setIssued] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const idp = `inv-${engagementId}`;

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      >
        Add invoice…
      </button>
    );
  return (
    <form
      className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!MONEY_PATTERN.test(amount))
          return setError("Enter the amount as a number, e.g. 2000 or 2000.50.");
        setError(null);
        add.mutate(
          {
            p_engagement_id: engagementId,
            p_invoice_number: number,
            p_amount: amount,
            p_currency: "USD",
            p_issued_on: issued,
          },
          { onSuccess: () => setOpen(false) },
        );
      }}
    >
      <Field id={`${idp}-num`} label="Invoice number">
        <input
          id={`${idp}-num`}
          className={inputClass}
          required
          maxLength={60}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </Field>
      <Field id={`${idp}-amt`} label="Amount (USD)">
        <input
          id={`${idp}-amt`}
          className={inputClass}
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.trim())}
        />
      </Field>
      <Field id={`${idp}-date`} label="Issued on">
        <input
          id={`${idp}-date`}
          type="date"
          className={inputClass}
          required
          value={issued}
          onChange={(e) => setIssued(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" className={buttonClass} disabled={add.isPending}>
          {add.isPending ? "Saving…" : "Add invoice"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
      {(error || add.error) && <ErrorNote>{error ?? friendlyError(add.error)}</ErrorNote>}
    </form>
  );
}

const PAYMENT_STYLE: Record<Payment["status"], string> = {
  recorded: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  rejected: "bg-zinc-200 text-zinc-800",
};
const PAYMENT_LABEL: Record<Payment["status"], string> = {
  recorded: "Awaiting confirmation",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

function InvoiceBlock(props: {
  invoice: Invoice;
  payments: Payment[];
  canBill: boolean;
  finance: boolean;
  userId: string;
}) {
  const { invoice: inv } = props;
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-sm font-medium">
        Invoice {inv.invoice_number} · {formatMoney(inv.amount, inv.currency)} · issued{" "}
        {formatDay(inv.issued_on)}
      </p>
      {props.payments.length > 0 && (
        <ul className="mt-2 space-y-2">
          {props.payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="tabular-nums">
                {formatMoney(p.amount, inv.currency)} · {p.method === "mpesa" ? "M-Pesa" : p.method}{" "}
                <span className="font-mono">{p.reference}</span> · {formatDay(p.received_on)}
                {p.review_note && <span className="text-muted-foreground"> · {p.review_note}</span>}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${PAYMENT_STYLE[p.status]}`}>
                  {PAYMENT_LABEL[p.status]}
                </span>
                {p.status === "recorded" && props.finance && p.recorded_by !== props.userId && (
                  <ReviewPayment payment={p} />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {props.canBill && <RecordPayment invoiceId={inv.id} />}
    </div>
  );
}

function RecordPayment({ invoiceId }: { invoiceId: string }) {
  const record = useRpc("record_joat_payment");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [received, setReceived] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const idp = `pay-${invoiceId}`;

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
      >
        Record a payment…
      </button>
    );
  return (
    <form
      className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!MONEY_PATTERN.test(amount))
          return setError("Enter the amount as a number, e.g. 2000 or 2000.50.");
        setError(null);
        record.mutate(
          {
            p_invoice_id: invoiceId,
            p_amount: amount,
            p_received_on: received,
            p_method: method,
            p_reference: code,
          },
          { onSuccess: () => setOpen(false) },
        );
      }}
    >
      <Field id={`${idp}-amt`} label="Amount received">
        <input
          id={`${idp}-amt`}
          className={inputClass}
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.trim())}
        />
      </Field>
      <Field id={`${idp}-method`} label="Method">
        <select
          id={`${idp}-method`}
          className={inputClass}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="mpesa">M-Pesa</option>
          <option value="bank">Bank transfer</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field
        id={`${idp}-code`}
        label={method === "mpesa" ? "M-Pesa transaction code" : "Payment reference"}
      >
        <input
          id={`${idp}-code`}
          className={inputClass}
          required
          maxLength={60}
          placeholder={method === "mpesa" ? "e.g. QGH7AB12CD" : ""}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </Field>
      <Field id={`${idp}-date`} label="Received on">
        <input
          id={`${idp}-date`}
          type="date"
          className={inputClass}
          required
          value={received}
          onChange={(e) => setReceived(e.target.value)}
        />
      </Field>
      <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
        A second staff member (finance) confirms the payment against the M-Pesa statement before it
        counts.
      </p>
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" className={buttonClass} disabled={record.isPending}>
          {record.isPending ? "Saving…" : "Record payment"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
      {(error || record.error) && <ErrorNote>{error ?? friendlyError(record.error)}</ErrorNote>}
    </form>
  );
}

function ReviewPayment({ payment }: { payment: Payment }) {
  const review = useRpc("review_joat_payment");
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const noteId = `note-${payment.id}`;

  if (rejecting)
    return (
      <span className="flex flex-wrap items-center gap-2">
        <label htmlFor={noteId} className="sr-only">
          Reason for rejecting
        </label>
        <input
          id={noteId}
          className={`${inputClass} w-full py-1 sm:w-48`}
          placeholder="Reason"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          disabled={!note.trim() || review.isPending}
          onClick={() =>
            review.mutate({ p_payment_id: payment.id, p_confirm: false, p_note: note })
          }
          className="rounded-md bg-red-700 px-2 py-1 text-xs text-white disabled:opacity-60"
        >
          Reject
        </button>
        <button type="button" onClick={() => setRejecting(false)} className="text-xs underline">
          Cancel
        </button>
        {review.error && <ErrorNote>{friendlyError(review.error)}</ErrorNote>}
      </span>
    );
  return (
    <span className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={review.isPending}
        onClick={() => review.mutate({ p_payment_id: payment.id, p_confirm: true })}
        className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-60"
      >
        Confirm (matches statement)
      </button>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="rounded-md border border-border px-2 py-1 text-xs"
      >
        Reject…
      </button>
      {review.error && <ErrorNote>{friendlyError(review.error)}</ErrorNote>}
    </span>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
