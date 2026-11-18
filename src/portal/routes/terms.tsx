import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "../config";
import { DraftNotice, Page, Section } from "../ui";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Programme terms (draft) | JOAT Global Partners" }] }),
  component: Terms,
});

function Terms() {
  return (
    <Page title="Programme terms" intro={<DraftNotice />}>
      <Section title="1. The programme">
        <p>
          The {BRAND.name} Brand Ambassador Programme is run by {BRAND.legalName}. It has two
          independent programmes, JOAT Global and Amare's Big Planet, each with its own approval,
          commission rules and resources.
        </p>
      </Section>
      <Section title="2. Joining">
        <p>
          Joining is free. No purchase is required to join or to remain an ambassador. Each
          programme may approve or decline an application, and may suspend a membership for breach
          of these terms.
        </p>
      </Section>
      <Section title="3. Single-level compensation">
        <p>
          Ambassadors earn commission only on verified qualifying sales to customers they refer
          personally. No commission or reward is paid for recruiting other ambassadors, and there
          are no recruitment quotas.
        </p>
      </Section>
      <Section title="4. Disclosure and conduct">
        <p>
          Ambassadors must clearly and conspicuously disclose their relationship with the brand in
          every endorsement, close to the referral link or claim. Ambassadors must not make
          unsupported product claims, income claims, misleading comparisons, false scarcity claims,
          or fake testimonials. Promotion of Amare's Big Planet must be directed at adults, not
          children.
        </p>
      </Section>
      <Section title="5. Commission">
        <p>
          Commission is calculated under the rule in force when the qualifying sale is verified, and
          that record does not change if rates change later. Commission is reduced or reversed for
          refunds, cancellations and chargebacks. Payouts are reviewed and approved by our team.
          Rates, hold periods, payout methods and minimum payout amounts will be set out here before
          launch.
        </p>
      </Section>
      <Section title="6. No guarantee of earnings">
        <p>We make no promise or guarantee of income.</p>
      </Section>
    </Page>
  );
}
