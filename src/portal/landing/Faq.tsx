/**
 * FAQ accordion in the JOAT palette (stands in for the Jiro "FAQs – Luxterra"
 * section, whose source wasn't available). Used on the landing page (top 5)
 * and on /faq (all).
 */
import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { Heading, Reveal, focusRing } from "./kit";

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

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className="border-b border-joat-border">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-a`}
          id={`${id}-q`}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full cursor-pointer items-center justify-between gap-6 bg-transparent py-[22px] text-left font-gilda text-[20px] leading-[28px] text-joat-cream sm:text-[24px] sm:leading-[32px] ${focusRing}`}
        >
          {q}
          <span
            aria-hidden
            className={`flex size-[40px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
              open ? "bg-joat-brown text-joat-cream" : "bg-joat-gold text-joat-black"
            }`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
        inert={!open}
      >
        <div className="overflow-hidden">
          <p className="m-0 max-w-[760px] pb-[24px] text-[16px] leading-[26px] text-joat-body sm:text-[17px] sm:leading-[28px]">
            {a}
          </p>
        </div>
      </div>
    </li>
  );
}

export function FaqSection({
  items,
  seeAll = false,
  headingLevel = 2,
}: {
  items: { q: string; a: string }[];
  seeAll?: boolean;
  headingLevel?: 1 | 2;
}) {
  const title = (
    <>
      Clear answers <span className="text-joat-gold">before you apply</span>
    </>
  );
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-joat-black px-[20px] py-[72px] font-inter-tight sm:px-[40px] lg:py-[110px]"
    >
      <div className="mx-auto grid max-w-[1200px] gap-[40px] lg:grid-cols-[1fr_1.6fr] lg:gap-[80px]">
        <Reveal>
          <p className="m-0 text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
            FAQ
          </p>
          {headingLevel === 1 ? (
            <h1
              id="faq-title"
              className="m-0 mt-[12px] font-gilda text-[40px] font-normal leading-[48px] tracking-[-1px] text-joat-cream sm:text-[56px] sm:leading-[64px]"
            >
              {title}
            </h1>
          ) : (
            <Heading id="faq-title" className="mt-[12px]">
              {title}
            </Heading>
          )}
          {seeAll && (
            <Link
              to="/faq"
              className={`mt-[24px] inline-block text-[16px] text-joat-gold underline underline-offset-4 hover:text-joat-gold-hover ${focusRing}`}
            >
              See all FAQs
            </Link>
          )}
        </Reveal>
        <Reveal delay={150}>
          <ul className="m-0 list-none border-t border-joat-border p-0">
            {items.map((f) => (
              <Item key={f.q} {...f} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
