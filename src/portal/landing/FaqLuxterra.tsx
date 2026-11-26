/**
 * FAQ accordion (Jiro "FAQs – Luxterra", Appendix B), recoloured to the JOAT palette.
 * One item open at a time (item 02 on mount); the open question grows; the round toggle turns
 * from gold to brown and rotates 180°. Luxterra's capsule photos are dropped (no matching
 * images). Geist → Inter Tight (the portal's body font).
 */
import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { focusRing } from "./kit";

const ease = [0.16, 1, 0.3, 1] as const;

export function FaqLuxterra({
  items,
  seeAll = false,
  className = "bg-joat-black-alt",
}: {
  items: { q: string; a: string }[];
  /** Adds a "See all FAQs" link (landing page teaser). */
  seeAll?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(items.length > 1 ? 1 : 0);
  const base = useId();
  return (
    <section
      id="faqs"
      aria-labelledby={`${base}-title`}
      className={`relative w-full select-none overflow-hidden px-6 py-[80px] font-inter-tight sm:px-12 lg:px-16 lg:py-[100px] ${className}`}
    >
      <div className="mx-auto flex max-w-[1472px] flex-col gap-12 lg:gap-16">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
        >
          <div className="flex max-w-[640px] flex-col gap-4 lg:gap-6">
            <p className="m-0 text-[20px] leading-[120%] tracking-[-0.02em] text-joat-gold lg:text-[24px]">
              FAQs
            </p>
            <h2
              id={`${base}-title`}
              className="m-0 font-gilda text-[44px] font-normal leading-[115%] tracking-[-0.04em] text-joat-cream sm:text-[60px] lg:text-[76px] lg:leading-[120%]"
            >
              Clear answers before you apply
            </h2>
          </div>
          <div className="flex max-w-[543px] flex-col items-start gap-5">
            <p className="m-0 text-[18px] leading-[160%] tracking-[-0.02em] text-joat-body sm:text-[20px] lg:text-[24px]">
              Joining, commission, disclosure and payouts. The full rules are in the program terms.
            </p>
            {seeAll && (
              <Link
                to="/faq"
                className={`select-text text-[17px] text-joat-gold underline underline-offset-4 hover:text-joat-gold-hover ${focusRing}`}
              >
                See all FAQs
              </Link>
            )}
          </div>
        </motion.div>

        {/* Accordion */}
        <ul className="m-0 flex list-none flex-col border-b border-joat-border p-0">
          {items.map((f, i) => {
            const isOpen = open === i;
            const qId = `${base}-q${i}`;
            const aId = `${base}-a${i}`;
            return (
              <motion.li
                key={f.q}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.65, delay: i * 0.08, ease }}
                className="border-t border-joat-border"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={qId}
                    aria-expanded={isOpen}
                    aria-controls={aId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={`group flex w-full cursor-pointer items-center justify-between bg-transparent text-left transition-all duration-300 ${focusRing} ${
                      isOpen ? "pb-4 pt-7 sm:pb-5 sm:pt-8 lg:pt-9" : "py-7 sm:py-8 lg:py-9"
                    }`}
                  >
                    <span className="flex flex-1 items-baseline gap-6 pr-4 sm:gap-10 lg:gap-14">
                      <span
                        className={`shrink-0 font-gilda text-[24px] tracking-[-0.02em] transition-colors duration-300 sm:text-[30px] lg:text-[36px] ${
                          isOpen
                            ? "text-joat-gold"
                            : "text-joat-cream/60 group-hover:text-joat-cream"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-gilda transition-all duration-300 ${
                          isOpen
                            ? "text-[28px] leading-[120%] text-joat-cream sm:text-[38px] lg:text-[46px]"
                            : "text-[22px] leading-[130%] text-joat-cream/90 group-hover:text-joat-cream sm:text-[28px] lg:text-[34px]"
                        }`}
                      >
                        {f.q}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12 ${
                        isOpen
                          ? "rotate-180 bg-joat-brown text-joat-cream"
                          : "bg-joat-gold text-joat-black group-hover:bg-joat-gold-hover"
                      }`}
                    >
                      <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={aId}
                      role="region"
                      aria-labelledby={qId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: { duration: 0.45, ease },
                          opacity: { duration: 0.35, delay: 0.1 },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          height: { duration: 0.35, ease },
                          opacity: { duration: 0.2 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-[42px] pr-2 pt-2 sm:pb-10 sm:pl-[66px] lg:pl-[84px]">
                        <p className="m-0 max-w-[700px] select-text text-[15px] leading-[175%] text-joat-body sm:text-[17px] lg:text-[18px]">
                          {f.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
