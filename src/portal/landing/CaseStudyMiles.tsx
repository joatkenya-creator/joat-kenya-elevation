/**
 * How earnings work (Jiro "Miles" File 5, "Case Study"), recoloured. Each case row becomes a
 * step in the referral → verified purchase → commission → payout flow, then the real worked
 * examples from the program pages. The pointer-following preview image is dropped (no
 * matching photos). Rows start stacked and drop into place when the list scrolls into view.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Briefcase,
  Link2,
  Percent,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Artboard, Badge, Reveal, Responsive, at, prefersReducedMotion } from "./kit";

export type CaseRow = { icon: LucideIcon; label: string; title: string; text: string; tag: string };

export type CaseContent = {
  id?: string;
  badge: string;
  heading: ReactNode;
  rows: CaseRow[];
  note: ReactNode;
};

const LANDING: CaseContent = {
  id: "earnings",
  badge: "How earnings work",
  heading: (
    <>
      From Link To <span className="font-glory leading-[0] text-joat-gold">Payout.</span>
    </>
  ),
  rows: [
    {
      icon: Link2,
      label: "Your link",
      title: "Referral link or code",
      text: "A customer clicks your link or uses your code",
      tag: "01",
    },
    {
      icon: BadgeCheck,
      label: "Verified",
      title: "Verified purchase",
      text: "They pay, and we confirm the payment",
      tag: "02",
    },
    {
      icon: Percent,
      label: "Commission",
      title: "8% to start, up to 10%",
      text: "In US dollars; refunds reduce or reverse it",
      tag: "03",
    },
    {
      icon: Wallet,
      label: "Payout",
      title: "Paid monthly",
      text: "After a 30-day hold and our team's approval",
      tag: "04",
    },
    {
      icon: Briefcase,
      label: "JOAT Global",
      title: "$2,000 first invoice",
      text: "Earns $160 at 8% or $200 at 10%",
      tag: "Example",
    },
    {
      icon: ShoppingBag,
      label: "Amare's Big Planet",
      title: "$59.29 order",
      text: "Earns $4.74 at 8% or $5.93 at 10%",
      tag: "Example",
    },
  ],
  note: (
    <>
      <span className="text-joat-cream">
        No commission or reward is paid for recruiting other ambassadors
      </span>
      , and there are no recruitment quotas. We don't promise or guarantee any level of income.
    </>
  ),
};

function Heading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`m-0 font-gilda font-normal capitalize text-joat-cream ${className}`}>
      {children}
    </h2>
  );
}

function Mark({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-[9px] text-joat-cream">
      <Icon aria-hidden className="h-6 w-6 shrink-0 text-joat-gold" strokeWidth={1.8} />
      <span className="text-[20px] font-medium leading-[24px] tracking-[-0.2px]">{label}</span>
    </div>
  );
}

const rowBase =
  "group block rounded-[20px] border border-solid border-joat-border bg-joat-black text-joat-cream transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-joat-gold hover:bg-joat-surface";

// ── Desktop (≥1024px): fixed 1600 × (rows) artboard ───────────────
function CaseStudyDesktop({ c }: { c: CaseContent }) {
  // Rows start stacked on the first row's spot; once the list is in view they drop down one by one.
  const list = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(prefersReducedMotion);
  useEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setOpen(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  const listH = c.rows.length * 150;
  return (
    <Artboard id={c.id} height={258 + listH + 140} className="bg-joat-black-alt">
      <Reveal className="flex justify-center" style={at(0, 80, 1600)}>
        <Badge>{c.badge}</Badge>
      </Reveal>
      <Reveal delay={200} style={at(0, 118, 1600)}>
        <Heading className="text-center text-[60px] leading-[74px] tracking-[-1.8px]">
          {c.heading}
        </Heading>
      </Reveal>

      <div ref={list} className="pointer-events-none" style={at(80, 258, 1440, listH - 20)} />
      <ol className="m-0 list-none p-0">
        {c.rows.map((r, i) => (
          <li
            key={r.title}
            style={{
              ...at(80, 258 + i * 150, 1440, 130),
              zIndex: c.rows.length - i,
              transform: open ? "none" : `translateY(${-i * 150 + i * 8}px) scale(${1 - i * 0.02})`,
              opacity: open || i < 3 ? 1 : 0,
              transition: open
                ? `transform 900ms ${ease} ${200 + i * 160}ms, opacity 300ms ease ${200 + i * 160}ms`
                : `transform 500ms ${ease}, opacity 300ms ease`,
            }}
          >
            <div className={`${rowBase} relative h-full w-full`}>
              <div className="absolute left-[49px] top-[52px] w-[300px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[8px]">
                <Mark icon={r.icon} label={r.label} />
              </div>
              <p className="absolute left-[560px] top-[50px] m-0 -translate-x-1/2 whitespace-nowrap font-gilda text-[24px] capitalize leading-[28px] tracking-[-0.6px] transition-colors duration-300 group-hover:text-joat-gold">
                {r.title}
              </p>
              <p className="absolute left-[1010px] top-[52px] m-0 -translate-x-1/2 whitespace-nowrap text-[18px] leading-[24px] text-joat-body">
                {r.text}
              </p>
              <p className="absolute left-[1364.5px] top-[52px] m-0 -translate-x-1/2 whitespace-nowrap text-[18px] leading-[24px]">
                / {r.tag}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Reveal delay={200} style={at(300, 258 + listH + 30, 1000)}>
        <p className="m-0 text-center text-[20px] leading-[30px] text-joat-body">{c.note}</p>
      </Reveal>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function CaseStudyMobile({ c }: { c: CaseContent }) {
  return (
    <section id={c.id} className="bg-joat-black-alt px-[20px] py-[64px] sm:px-[40px]">
      <Reveal className="flex justify-center">
        <Badge>{c.badge}</Badge>
      </Reveal>
      <Reveal delay={200} className="mt-[14px]">
        <Heading className="text-center text-[40px] leading-[48px] tracking-[-1.2px]">
          {c.heading}
        </Heading>
      </Reveal>
      <ol className="m-0 mt-[32px] flex list-none flex-col gap-[12px] p-0">
        {c.rows.map((r, i) => (
          <li key={r.title}>
            <Reveal delay={i * 60}>
              <div className={`${rowBase} p-[20px]`}>
                <div className="flex items-center justify-between gap-3">
                  <Mark icon={r.icon} label={r.label} />
                  <span className="shrink-0 text-[16px] leading-[24px]">/ {r.tag}</span>
                </div>
                <p className="m-0 mt-[14px] font-gilda text-[22px] capitalize leading-[28px] group-hover:text-joat-gold">
                  {r.title}
                </p>
                <p className="m-0 mt-[4px] text-[15px] leading-[22px] text-joat-body">{r.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      <Reveal className="mt-[28px]">
        <p className="m-0 text-center text-[17px] leading-[27px] text-joat-body">{c.note}</p>
      </Reveal>
    </section>
  );
}

export default function CaseStudyMiles({ content = LANDING }: { content?: CaseContent }) {
  return (
    <Responsive
      desktop={<CaseStudyDesktop c={content} />}
      mobile={<CaseStudyMobile c={content} />}
    />
  );
}
