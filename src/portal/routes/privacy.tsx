import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "../config";
import { DraftNotice, Page, Section } from "../ui";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy (draft) | JOAT Global Partners" }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <Page title="Partner portal privacy notice" intro={<DraftNotice />}>
      <Section title="Who we are">
        <p>
          {BRAND.legalName} runs this portal. This notice covers ambassadors and portal users. The
          main website privacy policies still apply to customers.
        </p>
      </Section>
      <Section title="What we collect from ambassadors">
        <ul className="list-disc space-y-1 pl-6">
          <li>Account details: your name, email address and country.</li>
          <li>Application details: your social profiles, website, audience and experience.</li>
          <li>Programme records: your referral links, memberships, commissions and payouts.</li>
          <li>Payout details you provide, stored securely and never shown in full after saving.</li>
        </ul>
      </Section>
      <Section title="Referral tracking">
        <p>
          When someone clicks a referral link, we record the link, the time, the page they landed on
          and campaign tags. We don't store visitors' raw IP addresses, and we don't use
          fingerprinting. Ambassadors see summary results only, never customers' personal details.
        </p>
      </Section>
      <Section title="Where data is stored">
        <p>
          Portal data is stored with Supabase (database and sign-in), and the portal is served by
          Cloudflare. Access is restricted by role, and staff must use two-factor sign-in.
        </p>
      </Section>
      <Section title="Retention and your rights">
        <p>
          Financial records are kept for as long as tax and accounting rules require. You can ask to
          see, correct or delete your other personal data through the contact page.
        </p>
      </Section>
    </Page>
  );
}
