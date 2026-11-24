import { createFileRoute } from "@tanstack/react-router";
import { FALLBACK_SERVICES } from "@/data/services-catalog";
import { JOAT_SITE_URL } from "../config";
import { usePrograms } from "../account";
import { ApplicationStatus, Page, Section } from "../ui";

export const Route = createFileRoute("/programs/joat")({
  head: () => ({ meta: [{ title: "JOAT Global program | JOAT Global Partners" }] }),
  component: JoatProgram,
});

function JoatProgram() {
  const { data: programs } = usePrograms();
  const program = programs?.find((p) => p.id === "joat");

  return (
    <Page
      title="JOAT Global program"
      intro={
        <>
          Introduce businesses that need help to JOAT Global, and earn commission when a client you
          referred becomes a paying customer. <ApplicationStatus program={program} />
        </>
      }
    >
      <Section title="What you can recommend">
        <ul className="grid gap-4 sm:grid-cols-2">
          {FALLBACK_SERVICES.map((s) => (
            <li key={s.title} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Full service descriptions are on the{" "}
          <a
            href={`${JOAT_SITE_URL}/services`}
            className="text-primary underline"
            rel="noopener"
            target="_blank"
          >
            JOAT Global website
          </a>
          . Describe services only as they appear there.
        </p>
      </Section>

      <Section title="When a referral earns commission">
        <p>A JOAT Global referral qualifies only when every step below is verified by our team:</p>
        <ol className="list-decimal space-y-1 pl-6">
          <li>The business contacts us through your referral link.</li>
          <li>It becomes a genuine client and agrees to an engagement with us.</li>
          <li>We issue an eligible invoice.</li>
          <li>The client pays, and we confirm the payment has been received.</li>
        </ol>
        <p>Unpaid invoices, proposals and inquiries do not earn commission.</p>
        <p>
          <strong>Rate: 8% of the client's first invoice, rising to 10%</strong>, on the amount
          actually paid. Everyone starts at 8%; ambassadors who grow their referrals can move up to
          10% within their first 6 months. Later invoices to the same client don't earn commission.
          For example, a first invoice of $2,000, paid in full, earns $160 at 8% or $200 at 10%.
          Commission can be approved for payout 30 days after the payment is confirmed.
        </p>
      </Section>
    </Page>
  );
}
