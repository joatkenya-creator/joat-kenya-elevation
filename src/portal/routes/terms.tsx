import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "../config";
import { Page, Section } from "../ui";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Program terms | JOAT Ambassadors" }] }),
  component: Terms,
});

function Terms() {
  return (
    <Page eyebrow="Legal" title="Program terms">
      <Section title="1. The program">
        <p>
          The {BRAND.name} Brand Ambassador Program is run by {BRAND.legalName}. It has two
          independent programs, JOAT Global and Amare's Big Planet, each with its own approval,
          commission rules and resources.
        </p>
      </Section>
      <Section title="2. Joining">
        <p>
          Joining is free. No purchase is required to join or to remain an ambassador. Each program
          may approve or decline an application, and may suspend a membership for breach of these
          terms.
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
          Rates: every ambassador starts at 8%. Ambassadors who grow their referred sales may be
          moved to 10% within their first 6 months; we confirm any change in writing, and it applies
          to sales made after the change. The rate applies to: Amare's Big Planet, eligible net
          product revenue (after discounts, excluding shipping and tax); JOAT Global, the amount
          paid on a referred client's first invoice. Commission is calculated and paid in US dollars
          after a 30-day hold from the verified payment. Payouts are made monthly by M-Pesa or bank
          transfer; payouts in another currency are converted at the exchange rate on the day of
          payment.
        </p>
      </Section>
      <Section title="6. No guarantee of earnings">
        <p>We make no promise or guarantee of income.</p>
      </Section>
    </Page>
  );
}
