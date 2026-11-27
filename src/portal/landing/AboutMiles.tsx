/**
 * About (Jiro "Miles" File 2): quote + intro + principles + button, recoloured.
 * Removed, per the brief: the metrics marquee, "Trusted by 30+ brands", the client-logo
 * marquee and the image strip (fake numbers / brands, no matching photos). The portrait
 * slot shows the two real brand marks instead. Reused on the program pages via props.
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import amarePlanet from "@/assets/amare-planet.webp";
import joatLogo from "@/assets/joat-logo.png";
import { BRAND } from "../config";
import { Artboard, Button, Reveal, Responsive, at, focusRing } from "./kit";

type InternalPath = "/terms" | "/apply" | "/faq" | "/resources";

export type AboutContent = {
  id?: string;
  quote: ReactNode;
  title: ReactNode;
  body: ReactNode;
  principles: string[];
  button: { label: string; to: InternalPath };
  /** Right-hand panel; defaults to the two brand marks. */
  aside?: ReactNode;
};

const LANDING: AboutContent = {
  id: "about",
  quote: (
    <>
      “Recommend brands you <span className="text-joat-gold">believe in</span>, with a clear{" "}
      <span className="font-glory leading-[0]">disclosure</span> that you're an ambassador.”
    </>
  ),
  title: (
    <>
      One program, <span className="text-joat-gold">two brands.</span>
    </>
  ),
  body: (
    <>
      The {BRAND.name} Brand Ambassador Program is run by {BRAND.legalName}. It has two independent
      programs, <span className="text-joat-cream">JOAT Global</span> and{" "}
      <span className="text-joat-cream">Amare's Big Planet</span>, each with its own approval,
      commission rules and resources. Refer businesses that need help to JOAT Global, or recommend
      Amare's Big Planet to parents and families.
    </>
  ),
  principles: [
    "Free to join, no purchase required",
    "Earn only on your own verified referrals",
    "No reward for recruiting other ambassadors",
  ],
  button: { label: "Read the program terms", to: "/terms" },
};

function BrandPanel() {
  const tile = `group flex flex-1 flex-col items-center justify-center gap-4 rounded-[18px] border border-joat-border bg-joat-black p-6 text-center no-underline transition-colors duration-300 hover:border-joat-gold ${focusRing}`;
  return (
    <div className="flex size-full gap-4 rounded-[24px] border border-joat-border bg-joat-surface p-4">
      <Link to="/programs/joat" className={tile}>
        <img
          src={joatLogo}
          alt=""
          className="h-24 w-24 object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <span className="font-gilda text-[22px] text-joat-cream">JOAT Global</span>
      </Link>
      <Link to="/programs/amare" className={tile}>
        <img
          src={amarePlanet}
          alt=""
          className="h-24 w-24 rounded-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <span className="font-gilda text-[22px] text-joat-cream">Amare's Big Planet</span>
      </Link>
    </div>
  );
}

function Quote({ c, className = "" }: { c: AboutContent; className?: string }) {
  return (
    <blockquote className={`m-0 font-gilda capitalize text-joat-cream ${className}`}>
      {c.quote}
    </blockquote>
  );
}

function Intro({ c, mobile = false }: { c: AboutContent; mobile?: boolean }) {
  return (
    <>
      <Reveal>
        <h2
          className={`m-0 font-gilda font-normal capitalize text-joat-cream ${
            mobile
              ? "text-[40px] leading-[48px] tracking-[-1.2px]"
              : "text-[60px] leading-[74px] tracking-[-1.8px]"
          }`}
        >
          {c.title}
        </h2>
      </Reveal>
      <Reveal delay={200} className={mobile ? "mt-[16px]" : "mt-[23px]"}>
        <p
          className={`m-0 text-joat-body ${mobile ? "text-[17px] leading-[27px]" : "text-[20px] leading-[30px]"}`}
        >
          {c.body}
        </p>
      </Reveal>
      <Reveal delay={300} className={mobile ? "mt-[20px]" : "mt-[30px]"}>
        <ul className="m-0 list-none p-0">
          {c.principles.map((p) => (
            <li
              key={p}
              className="flex items-center gap-[10px] text-[16px] leading-[30px] text-joat-body"
            >
              <span className="block size-[8px] shrink-0 rounded-full bg-joat-gold" />
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={380} className={mobile ? "mt-[28px]" : "mt-[55px]"}>
        <Button to={c.button.to}>{c.button.label}</Button>
      </Reveal>
    </>
  );
}

// ── Desktop (≥1024px): fixed 1600 × 1000 artboard ─────────────────
function AboutDesktop({ c }: { c: AboutContent }) {
  return (
    <Artboard id={c.id} height={1000} className="bg-joat-black-alt">
      <Reveal style={at(300, 100, 1000)}>
        <Quote c={c} className="text-center text-[60px] leading-[74px] tracking-[-1.8px]" />
      </Reveal>
      <div style={at(60, 440, 667)}>
        <Intro c={c} />
      </div>
      <Reveal delay={150} style={at(911, 440, 629, 440)}>
        {c.aside ?? <BrandPanel />}
      </Reveal>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function AboutMobile({ c }: { c: AboutContent }) {
  return (
    <section id={c.id} className="bg-joat-black-alt pb-[56px]">
      <div className="px-[20px] pt-[56px] text-center sm:px-[40px]">
        <Reveal>
          <Quote c={c} className="text-[30px] leading-[38px] tracking-[-0.9px]" />
        </Reveal>
      </div>
      <div className="px-[20px] pt-[56px] sm:px-[40px]">
        <Intro c={c} mobile />
        <Reveal delay={150} className="mt-[32px]">
          {c.aside ?? <BrandPanel />}
        </Reveal>
      </div>
    </section>
  );
}

export default function AboutMiles({ content = LANDING }: { content?: AboutContent }) {
  return <Responsive desktop={<AboutDesktop c={content} />} mobile={<AboutMobile c={content} />} />;
}
