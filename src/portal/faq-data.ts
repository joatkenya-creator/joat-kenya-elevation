// Every FAQ entry on the portal. The landing page shows TOP_FAQS; /faq shows all.
export const FAQS: { q: string; a: string }[] = [
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
    a: "No. This is a single-level program. You earn only on verified sales to customers you refer yourself. There are no recruitment rewards and no recruitment targets.",
  },
  {
    q: "How much will I earn?",
    a: "We don't promise or guarantee any income. Earnings depend entirely on genuine sales to customers you refer. Commission rates are on each program page.",
  },
  {
    q: "Can I join both programs?",
    a: "Yes. You can apply to JOAT Global, Amare's Big Planet, or both. Each program reviews and approves you separately, and you only see the programs you're approved for.",
  },
  {
    q: "Do I have to say I'm an ambassador when I post?",
    a: "Yes. Every recommendation must clearly disclose that you're a JOAT Global ambassador and may earn a commission. Put the disclosure next to the link or claim, where people will see it before they click. In videos and live streams, say it out loud in the content itself, not only in the description.",
  },
  {
    q: "How are my referrals tracked?",
    a: "Through your personal referral links. A referral is credited if the customer buys within the program's attribution window after clicking your link. We use first-party tracking only and respect cookie choices.",
  },
  {
    q: "How much commission do I earn?",
    a: "Everyone starts at 8% on both programs, and ambassadors who grow their sales can move up to 10% within their first 6 months. Commission is paid in US dollars. Amare's Big Planet: your rate on eligible net product revenue on each referred order (after discounts, excluding shipping and tax). JOAT Global: your rate on the amount the referred client pays on their first invoice.",
  },
  {
    q: "When is commission paid?",
    a: "After the customer's payment is verified and the program's hold period has passed. Every sale has a 30-day hold after the payment is verified, then our team reviews and approves the commission. Payouts are made monthly; the payout method is confirmed with you when you're approved.",
  },
  {
    q: "What happens if a customer gets a refund?",
    a: "The commission on that sale is reduced or reversed to match the refund.",
  },
];

/** Shown on the landing page: cost, purchase, recruiting, rate, payout timing. */
export const TOP_FAQS = [0, 1, 2, 7, 8].map((i) => FAQS[i]);
