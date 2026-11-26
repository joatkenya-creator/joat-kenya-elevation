/**
 * The programs (Jiro "Miles" File 3, "Services"), recoloured. Two cards instead of six: they
 * start stacked in the middle and fan out to either side of the heading when scrolled into view.
 * Card copy is the existing program descriptions and commission basis.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Briefcase, type LucideIcon } from "lucide-react";
import { usePrograms, type Program } from "../account";
import { ApplicationStatus } from "../ui";
import { Artboard, Badge, Reveal, Responsive, at, focusRing, prefersReducedMotion } from "./kit";

type Card = {
  id: "joat" | "amare";
  to: "/programs/joat" | "/programs/amare";
  title: string;
  text: string;
  basis: string;
  icon: LucideIcon;
  x: number;
  y: number;
};

const W = 460;
const H = 370;
const CARDS: Card[] = [
  {
    id: "joat",
    to: "/programs/joat",
    title: "JOAT Global",
    text: "Refer businesses to JOAT Global for virtual assistants, AI and automation, marketing and lead generation, software development and media production.",
    basis: "8% of the first invoice paid by each client you refer, rising to 10% as you grow.",
    icon: Briefcase,
    x: 70,
    y: 265,
  },
  {
    id: "amare",
    to: "/programs/amare",
    title: "Amare's Big Planet",
    text: "Recommend Amare's Big Planet, a children's learning brand with songs, videos, the Drawalet letter-tracing app and an online shop, to parents and families.",
    basis: "8% of eligible net product sales from the Amare shop, rising to 10% as you grow.",
    icon: BookOpen,
    x: 1600 - 70 - W,
    y: 265,
  },
];

function Heading({ className = "" }: { className?: string }) {
  return (
    <h2 className={`m-0 font-gilda font-normal capitalize text-joat-cream ${className}`}>
      The <span className="font-glory leading-[0] text-joat-gold">Programs.</span>
    </h2>
  );
}

function ProgramCard({
  card,
  program,
  wide = false,
}: {
  card: Card;
  program: Program | undefined;
  wide?: boolean;
}) {
  const Icon = card.icon;
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-joat-border bg-joat-surface transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[6px] hover:border-joat-gold hover:shadow-[0_24px_40px_-24px_rgba(201,162,39,0.45)] ${
        wide ? "p-[16px]" : "p-[12px]"
      }`}
    >
      <div className="flex gap-[14px]">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-joat-gold text-joat-black ${
            wide ? "h-[103px] w-[112px]" : "h-[80px] w-[86px]"
          }`}
        >
          <Icon
            aria-hidden
            strokeWidth={1.4}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-[1.12] ${
              wide ? "h-[54px] w-[54px]" : "h-[42px] w-[42px]"
            }`}
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-2">
          <h3
            className={`m-0 font-gilda font-normal capitalize text-joat-cream transition-colors duration-300 group-hover:text-joat-gold ${
              wide
                ? "text-[28px] leading-[32px] tracking-[-0.8px]"
                : "text-[24px] tracking-[-0.6px]"
            }`}
          >
            {card.title}
          </h3>
          <ApplicationStatus program={program} />
        </div>
      </div>
      <p
        className={`m-0 text-joat-body ${wide ? "mt-[16px] text-[16px] leading-[24px]" : "mt-[12px] text-[15px] leading-[22px]"}`}
      >
        {card.text}
      </p>
      <p
        className={`m-0 text-joat-cream ${wide ? "mt-[10px] text-[16px] leading-[24px]" : "mt-[8px] text-[15px] leading-[22px]"}`}
      >
        {card.basis}
      </p>
      <Link
        to={card.to}
        className={`mt-auto inline-flex items-center gap-[6px] self-start pt-[14px] text-[15px] font-medium text-joat-gold hover:text-joat-gold-hover ${focusRing}`}
      >
        {card.title} program details
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[3px]"
        />
      </Link>
    </article>
  );
}

// ── Desktop (≥1024px): fixed 1600 × 900 artboard ──────────────────
function ServicesDesktop() {
  const { data: programs } = usePrograms();
  // Cards start stacked together in the middle; once the section is in view they fan out to their places.
  const stage = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(prefersReducedMotion);
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setSpread(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const CX = 800 - W / 2; // stacked position: centre of the frame
  const CY = 450 - H / 2;
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  return (
    <Artboard id="programs" height={900} className="bg-joat-black">
      <div ref={stage} className="pointer-events-none" style={at(0, 0, 1600, 900)} />
      <div
        className="flex justify-center"
        style={{
          ...at(0, 391, 1600),
          opacity: spread ? 1 : 0,
          transition: `opacity 700ms ${ease} ${spread ? 450 : 0}ms`,
        }}
      >
        <Badge>Choose one or both</Badge>
      </div>
      <div
        style={{
          ...at(0, 429, 1600),
          opacity: spread ? 1 : 0,
          transition: `opacity 900ms ${ease} ${spread ? 550 : 0}ms`,
        }}
      >
        <Heading className="text-center text-[60px] leading-[74px] tracking-[-1.8px]" />
      </div>
      {CARDS.map((card, i) => {
        const tilt = [-6, 4][i % 2]; // a slightly messy stack, like a deck of cards
        const stacked = `translate(${CX - card.x}px, ${CY - card.y}px) rotate(${tilt}deg) scale(0.92)`;
        return (
          <div
            key={card.id}
            style={{
              ...at(card.x, card.y, W, H),
              zIndex: CARDS.length - i, // first card stays on top of the stack
              transform: spread ? "none" : stacked,
              transition: `transform 1200ms ${ease} ${spread ? 150 + i * 90 : 0}ms`,
            }}
          >
            <ProgramCard card={card} program={programs?.find((p) => p.id === card.id)} wide />
          </div>
        );
      })}
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function ServicesMobile() {
  const { data: programs } = usePrograms();
  return (
    <section id="programs" className="bg-joat-black px-[20px] py-[64px] sm:px-[40px]">
      <Reveal className="flex justify-center">
        <Badge>Choose one or both</Badge>
      </Reveal>
      <Reveal delay={200} className="mt-[14px]">
        <Heading className="text-center text-[40px] leading-[48px] tracking-[-1.2px]" />
      </Reveal>
      <div className="mt-[32px] grid gap-[14px] md:grid-cols-2">
        {CARDS.map((card, i) => (
          <Reveal key={card.id} delay={i * 80}>
            <ProgramCard card={card} program={programs?.find((p) => p.id === card.id)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function ServicesMiles() {
  return <Responsive desktop={<ServicesDesktop />} mobile={<ServicesMobile />} />;
}

// ── Six-card deck (the template's own layout), used on the JOAT Global program page ──
export type DeckCard = { title: string; text: string; icon: LucideIcon };

const DW = 460;
const DH = 150;
// Exact Figma spots from the template (cards widened slightly for longer summaries).
const SPOTS = [
  { x: 570, y: 100 },
  { x: 70, y: 238 },
  { x: 1070, y: 238 },
  { x: 70, y: 524 },
  { x: 1070, y: 524 },
  { x: 570, y: 662 },
];

function DeckCardView({ card, wide = false }: { card: DeckCard; wide?: boolean }) {
  const Icon = card.icon;
  return (
    <article
      className={`group relative flex h-full overflow-hidden rounded-[12px] border border-joat-border bg-joat-surface transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[6px] hover:border-joat-gold hover:shadow-[0_24px_40px_-24px_rgba(201,162,39,0.45)] ${
        wide ? "p-[10px]" : "w-full gap-[14px] p-[8px]"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-joat-gold text-joat-black ${
          wide ? "h-full w-[112px]" : "h-[88px] w-[92px]"
        }`}
      >
        <Icon
          aria-hidden
          strokeWidth={1.4}
          className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-[1.12] ${
            wide ? "h-[54px] w-[54px]" : "h-[44px] w-[44px]"
          }`}
        />
      </div>
      <div
        className={wide ? "ml-[13px] mt-[8px] min-w-0 flex-1" : "min-w-0 flex-1 py-[6px] pr-[6px]"}
      >
        <h3
          className={`m-0 font-gilda font-normal capitalize text-joat-cream transition-colors duration-300 group-hover:text-joat-gold ${
            wide ? "text-[22px] leading-[26px] tracking-[-0.6px]" : "text-[21px] tracking-[-0.6px]"
          }`}
        >
          {card.title}
        </h3>
        <p
          className={`m-0 text-joat-body ${wide ? "mt-[8px] text-[15px] leading-[20px]" : "mt-[4px] text-[15px] leading-[21px]"}`}
        >
          {card.text}
        </p>
      </div>
    </article>
  );
}

function DeckDesktop({ id, badge, heading, cards }: DeckProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(prefersReducedMotion);
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setSpread(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const CX = 800 - DW / 2;
  const CY = 450 - DH / 2;
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  return (
    <Artboard id={id} height={900} className="bg-joat-black">
      <div ref={stage} className="pointer-events-none" style={at(0, 0, 1600, 900)} />
      <div
        className="flex justify-center"
        style={{
          ...at(0, 391, 1600),
          opacity: spread ? 1 : 0,
          transition: `opacity 700ms ${ease} ${spread ? 450 : 0}ms`,
        }}
      >
        <Badge>{badge}</Badge>
      </div>
      <div
        style={{
          ...at(0, 429, 1600),
          opacity: spread ? 1 : 0,
          transition: `opacity 900ms ${ease} ${spread ? 550 : 0}ms`,
        }}
      >
        <h2 className="m-0 text-center font-gilda text-[60px] font-normal capitalize leading-[74px] tracking-[-1.8px] text-joat-cream">
          {heading}
        </h2>
      </div>
      {cards.slice(0, 6).map((card, i) => {
        const spot = SPOTS[i];
        const tilt = [-6, 4, -3, 5, -5, 3][i % 6]; // a slightly messy stack, like a deck of cards
        const stacked = `translate(${CX - spot.x}px, ${CY - spot.y}px) rotate(${tilt}deg) scale(0.92)`;
        return (
          <div
            key={card.title}
            style={{
              ...at(spot.x, spot.y, DW, DH),
              zIndex: cards.length - i,
              transform: spread ? "none" : stacked,
              transition: `transform 1200ms ${ease} ${spread ? 150 + i * 90 : 0}ms`,
            }}
          >
            <DeckCardView card={card} wide />
          </div>
        );
      })}
    </Artboard>
  );
}

function DeckMobile({ id, badge, heading, cards }: DeckProps) {
  return (
    <section id={id} className="bg-joat-black px-[20px] py-[64px] sm:px-[40px]">
      <Reveal className="flex justify-center">
        <Badge>{badge}</Badge>
      </Reveal>
      <Reveal delay={200} className="mt-[14px]">
        <h2 className="m-0 text-center font-gilda text-[40px] font-normal capitalize leading-[48px] tracking-[-1.2px] text-joat-cream">
          {heading}
        </h2>
      </Reveal>
      <div className="mt-[32px] grid gap-[14px] md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 80}>
            <DeckCardView card={c} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

type DeckProps = { id?: string; badge: string; heading: ReactNode; cards: DeckCard[] };

export function ServiceDeck(props: DeckProps) {
  return <Responsive desktop={<DeckDesktop {...props} />} mobile={<DeckMobile {...props} />} />;
}
