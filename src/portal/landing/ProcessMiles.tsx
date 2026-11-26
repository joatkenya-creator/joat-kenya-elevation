/**
 * How it works (Jiro "Miles" File 6, "Process"), recoloured.
 * Interaction: the active (gold) card follows hover / focus / tap, and the text below swaps to
 * that step. Reused on the program pages with their own steps.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Artboard, Badge, Reveal, Responsive, at, prefersReducedMotion } from "./kit";

type StepIcon = "discover" | "design" | "develop" | "launch";
export type Step = { title: string; text: string };
export type ProcessContent = { id?: string; badge: string; heading: ReactNode; steps: Step[] };

const LANDING: ProcessContent = {
  id: "how-it-works",
  badge: "Four steps",
  heading: (
    <>
      How It <span className="font-glory leading-[0] text-joat-gold">Works.</span>
    </>
  ),
  steps: [
    {
      title: "Apply",
      text: "Choose JOAT Global, Amare's Big Planet, or both. Joining is free and needs no purchase.",
    },
    {
      title: "Get approved",
      text: "Our team reviews each application. Each program approves you separately.",
    },
    {
      title: "Share your link & code",
      text: "Recommend what you genuinely like, with a clear disclosure that you're an ambassador.",
    },
    {
      title: "Earn on verified sales",
      text: "Commission is earned only on your own referrals, once the payment is verified. Our team approves every payout.",
    },
  ],
};

const ICONS: StepIcon[] = ["discover", "design", "develop", "launch"];
const XS = [80, 442, 805, 1167];

function Heading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`m-0 font-gilda font-normal capitalize text-joat-cream ${className}`}>
      {children}
    </h2>
  );
}

function StepCard({
  no,
  step,
  icon,
  active,
  onActivate,
  small = false,
}: {
  no: number;
  step: Step;
  icon: StepIcon;
  active: boolean;
  onActivate: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-pressed={active}
      className={`relative block h-full w-full cursor-pointer overflow-hidden border p-0 text-left transition-[background-color,color,transform,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold ${
        small ? "rounded-[14px]" : "rounded-[16px]"
      } ${active ? "border-joat-gold bg-joat-gold text-joat-black" : "border-joat-border bg-joat-surface text-joat-cream hover:-translate-y-[4px]"}`}
    >
      <span
        className={`absolute capitalize ${
          small
            ? "left-[16px] top-[14px] text-[16px] leading-[20px]"
            : "left-[30px] top-[30px] text-[20px] leading-[25px]"
        }`}
      >
        {String(no).padStart(2, "0")}
      </span>
      <span
        className={`absolute left-1/2 -translate-x-1/2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          active ? "scale-[1.06]" : ""
        } ${small ? "top-[34px] h-[70px] w-[70px]" : "top-[67px] h-[116px] w-[116px]"}`}
      >
        <Icon name={icon} />
      </span>
      <span
        className={`absolute left-0 w-full px-[12px] text-center font-gilda capitalize transition-colors duration-500 ${
          active ? "text-joat-black" : "text-joat-cream"
        } ${small ? "top-[114px] text-[19px] leading-[22px]" : "top-[226px] text-[34px] leading-[38px] tracking-[-1px]"}`}
      >
        {step.title}
      </span>
    </button>
  );
}

/** All step texts share one grid cell and cross-fade, so the height never jumps. */
function StepText({
  steps,
  active,
  className = "",
}: {
  steps: Step[];
  active: number;
  className?: string;
}) {
  return (
    <div className={`grid ${className}`} aria-live="polite">
      {steps.map((s, i) => (
        <p
          key={s.title}
          className="m-0 transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [grid-area:1/1]"
          style={{
            opacity: i === active ? 1 : 0,
            transform: i === active ? "none" : "translateY(14px)",
            filter: i === active ? "none" : "blur(6px)",
          }}
          aria-hidden={i !== active}
        >
          {s.text}
        </p>
      ))}
    </div>
  );
}

// ── Desktop (≥1024px): fixed 1600 × 753 artboard ──────────────────
function ProcessDesktop({ c }: { c: ProcessContent }) {
  const [active, setActive] = useState(0);
  // Cards start stacked on the first card's spot (left); once in view they slide right one by one.
  const row = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(prefersReducedMotion);
  useEffect(() => {
    const el = row.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setOpen(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  return (
    <Artboard id={c.id} height={753} className="bg-joat-black">
      <Reveal className="flex justify-center" style={at(0, 80, 1600)}>
        <Badge>{c.badge}</Badge>
      </Reveal>
      <Reveal delay={200} style={at(0, 118, 1600)}>
        <Heading className="text-center text-[60px] leading-[74px] tracking-[-1.8px]">
          {c.heading}
        </Heading>
      </Reveal>
      <div ref={row} className="pointer-events-none" style={at(80, 238, 1440, 316)} />
      {c.steps.slice(0, 4).map((s, i) => (
        <div
          key={s.title}
          style={{
            ...at(XS[i], 238, 353, 316),
            zIndex: c.steps.length - i,
            transform: open
              ? "none"
              : `translateX(${XS[0] - XS[i] + i * 10}px) scale(${1 - i * 0.03})`,
            transition: open
              ? `transform 900ms ${ease} ${200 + i * 180}ms`
              : `transform 500ms ${ease}`,
          }}
        >
          <StepCard
            no={i + 1}
            step={s}
            icon={ICONS[i]}
            active={active === i}
            onActivate={() => setActive(i)}
          />
        </div>
      ))}
      <Reveal delay={300} style={at(484, 594, 631)}>
        <StepText
          steps={c.steps}
          active={active}
          className="text-center text-[20px] leading-[30px] text-joat-body"
        />
      </Reveal>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function ProcessMobile({ c }: { c: ProcessContent }) {
  const [active, setActive] = useState(0);
  return (
    <section id={c.id} className="bg-joat-black px-[20px] py-[64px] sm:px-[40px]">
      <Reveal className="flex justify-center">
        <Badge>{c.badge}</Badge>
      </Reveal>
      <Reveal delay={200} className="mt-[14px]">
        <Heading className="text-center text-[38px] leading-[46px] tracking-[-1.1px]">
          {c.heading}
        </Heading>
      </Reveal>
      <div className="mx-auto mt-[32px] grid max-w-[640px] grid-cols-2 gap-[10px]">
        {c.steps.slice(0, 4).map((s, i) => (
          <Reveal key={s.title} delay={i * 80} className="h-[168px]">
            <StepCard
              no={i + 1}
              step={s}
              icon={ICONS[i]}
              active={active === i}
              onActivate={() => setActive(i)}
              small
            />
          </Reveal>
        ))}
      </div>
      <StepText
        steps={c.steps}
        active={active}
        className="mx-auto mt-[24px] max-w-[640px] text-center text-[17px] leading-[26px] text-joat-body"
      />
    </section>
  );
}

export default function ProcessMiles({ content = LANDING }: { content?: ProcessContent }) {
  return (
    <Responsive desktop={<ProcessDesktop c={content} />} mobile={<ProcessMobile c={content} />} />
  );
}

// ── Inline SVG step icons (stroke = currentColor, so they turn near-black on the active card) ──
function Icon({ name }: { name: StepIcon }) {
  return (
    <svg
      viewBox="0 0 116 116"
      className="block h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {name === "discover" && (
        <>
          <path d="M14.5 40.93V33.31C14.5 22.92 22.92 14.5 33.32 14.5H39.55" />
          <path d="M14.5 75.07V82.69C14.5 93.08 22.92 101.5 33.32 101.5H39.39" />
          <path d="M101.5 75.07V82.69C101.5 93.08 93.08 101.5 82.69 101.5H76.46" />
          <path d="M101.5 40.93V33.31C101.5 22.92 93.08 14.5 82.68 14.5H76.61" />
          <circle cx="56.46" cy="56.03" r="16.8" />
          <path d="M67.88 68.33L76.34 76.77" />
        </>
      )}
      {name === "design" && (
        <>
          <path d="M37.61 14.5H78.38C92.63 14.5 101.5 24.56 101.5 38.79V77.21C101.5 91.44 92.63 101.5 78.38 101.5H37.61C23.36 101.5 14.5 91.44 14.5 77.21V38.79C14.5 24.56 23.41 14.5 37.61 14.5Z" />
          <path d="M60.23 39.49L62.2 35.93C63.59 33.42 67 32.93 69.04 34.97L83.41 49.34C85.44 51.37 84.96 54.79 82.44 56.18L78.88 58.14C76.91 59.24 74.45 58.89 72.86 57.3L61.08 45.52C59.48 43.92 59.14 41.47 60.23 39.49Z" />
          <path d="M72.54 56.96L69.16 77.35C68.93 78.76 67.69 79.8 66.24 79.77C61.08 79.63 48.87 79.64 39.73 82.2C38.65 82.49 37.61 82.12 36.93 81.43C36.24 80.74 35.87 79.71 36.18 78.65C38.71 69.49 38.75 57.29 38.59 52.11C38.57 50.68 39.61 49.45 41.02 49.21L61.42 45.84" />
          <path d="M51.24 67.13L36.92 81.45" />
        </>
      )}
      {name === "develop" && (
        <>
          <path d="M79.77 20.27V30.46C79.77 34.01 82.28 36.23 85.84 36.23H95.43C98.98 36.23 101.5 34.02 101.5 30.46V20.27C101.5 16.71 98.98 14.5 95.43 14.5H85.84C82.28 14.5 79.77 16.71 79.77 20.27Z" />
          <path d="M14.5 20.27V30.46C14.5 34.01 17.01 36.23 20.57 36.23H30.16C33.72 36.23 36.23 34.02 36.23 30.46V20.27C36.23 16.71 33.72 14.5 30.16 14.5H20.57C17.01 14.5 14.5 16.71 14.5 20.27Z" />
          <path d="M79.77 85.54V95.72C79.77 99.27 82.28 101.5 85.84 101.5H95.43C98.98 101.5 101.5 99.28 101.5 95.72V85.54C101.5 81.98 98.98 79.76 95.43 79.76H85.84C82.28 79.76 79.77 81.98 79.77 85.54Z" />
          <path d="M14.5 85.54V95.72C14.5 99.27 17.01 101.5 20.57 101.5H30.16C33.72 101.5 36.23 99.28 36.23 95.72V85.54C36.23 81.98 33.72 79.76 30.16 79.76H20.57C17.01 79.76 14.5 81.98 14.5 85.54Z" />
          <path d="M36.34 25.28H79.8M36.34 90.63H79.8M25.54 36.23V79.76M90.63 36.23V79.76" />
          <path d="M42.53 63.25L52.85 63.25L52.85 73.57" />
          <path d="M73.47 52.65H63.15L63.15 42.33" />
        </>
      )}
      {name === "launch" && (
        <>
          <path d="M34.16 63.46L20.28 79.73V92.56C26.72 90.92 33.25 89.68 39.85 88.85C51.92 87.39 64.12 87.39 76.2 88.85C82.77 89.68 89.29 90.92 95.71 92.56V79.73L81.61 63.46" />
          <path d="M40.74 91.72C37.01 81.52 34.73 70.85 33.97 60.02C33.97 60.02 32.89 25.22 58 14.5C82.73 24.8 82.03 60.02 82.03 60.02C81.29 70.86 79.01 81.53 75.26 91.72C74.16 95.14 72.68 98.42 70.84 101.5H45.21C43.49 98.35 42 95.08 40.74 91.72Z" />
          <circle cx="58.15" cy="59.08" r="6.73" />
          <path d="M54.24 37.02H77.47" />
        </>
      )}
    </svg>
  );
}
