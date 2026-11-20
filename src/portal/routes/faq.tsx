import { createFileRoute } from "@tanstack/react-router";
import { Page } from "../ui";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ | JOAT Global Partners" }] }),
  component: Faq,
});

const FAQS: { q: string; a: string }[] = [
  {
    q: "Does it cost anything to join?",
    a: "No. Joining is free, and there is no paid membership or upgrade.",
  },
  {
    q: "Do I have to buy anything?",
    a: "No. You never need to buy a product or service to join or to stay an ambassador.",
  },
  {
    q: "Do I earn anything for recruiting other ambassadors?",
    a: "No. This is a single-level programme. You earn only on verified sales to customers you refer yourself. There are no recruitment rewards and no recruitment targets.",
  },
  {
    q: "How much will I earn?",
    a: "We don't promise or guarantee any income. Earnings depend entirely on genuine sales to customers you refer. Rates will be published on each programme page before applications open.",
  },
  {
    q: "Can I join both programmes?",
    a: "Yes. You can apply to JOAT Global, Amare's Big Planet, or both. Each programme reviews and approves you separately, and you only see the programmes you're approved for.",
  },
  {
    q: "Do I have to say I'm an ambassador when I post?",
    a: "Yes. Every recommendation must clearly disclose that you're a JOAT Global ambassador and may earn a commission. Put the disclosure next to the link or claim, where people will see it before they click. In videos and live streams, say it out loud in the content itself, not only in the description.",
  },
  {
    q: "How are my referrals tracked?",
    a: "Through your personal referral links. A referral is credited if the customer buys within the programme's attribution window after clicking your link. We use first-party tracking only and respect cookie choices.",
  },
  {
    q: "How much commission do I earn?",
    a: "10% on both programmes. Amare's Big Planet: 10% of eligible net product revenue on each referred order (after discounts, excluding shipping and tax). JOAT Global: 10% of the amount the referred client pays on their first invoice.",
  },
  {
    q: "When is commission paid?",
    a: "After the customer's payment is verified and the programme's hold period has passed. Every sale has a 30-day hold after the payment is verified, then our team reviews and approves the commission. Payouts are made monthly; the payout method is confirmed with you when you're approved.",
  },
  {
    q: "What happens if a customer gets a refund?",
    a: "The commission on that sale is reduced or reversed to match the refund.",
  },
];

function Faq() {
  return (
    <Page title="Frequently asked questions">
      <dl className="divide-y divide-border rounded-lg border border-border bg-card">
        {FAQS.map((f) => (
          <div key={f.q} className="p-5">
            <dt className="font-semibold">{f.q}</dt>
            <dd className="mt-2 text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </Page>
  );
}
