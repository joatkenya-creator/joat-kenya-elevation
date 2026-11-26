/**
 * Footer (Jiro "Miles" File 9), recoloured: the template's red-orange band becomes gold with
 * near-black text. Public pages get this footer; app pages get SlimFooter.
 */
import type { CSSProperties, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AMARE_SITE_URL, BRAND, JOAT_SITE_URL, SUPPORT_EMAIL } from "../config";
import { Artboard, Reveal, Responsive, at, focusRing } from "./kit";

// TODO(content): confirm partners@joatkenya.com receives mail. docs/partners/portal-deploy.md
// uses it as the send-only FROM address, with replies going to a separate team inbox.
const EMAIL = SUPPORT_EMAIL || "partners@joatkenya.com";

const VALUES = ["Free to join", "No purchase required", "Single-level", "Paid on verified sales"];
const PITCH = [
  "One portal, two independent programs.",
  "Recommend brands you believe in,",
  "and earn on the sales you refer.",
];
type Item = { label: string; to?: string; href?: string };
const QUICK_LINKS: Item[] = [
  { label: "Home", to: "/" },
  { label: "JOAT Global", to: "/programs/joat" },
  { label: "Amare's Big Planet", to: "/programs/amare" },
  { label: "FAQ", to: "/faq" },
  { label: "Resources", to: "/resources" },
];
const MORE_LINKS: Item[] = [
  { label: "Program terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
];
const SITES: Item[] = [
  { label: "joatkenya.com", href: JOAT_SITE_URL },
  { label: "Amare's Big Planet website", href: AMARE_SITE_URL },
  { label: EMAIL, href: `mailto:${EMAIL}` },
];

const linkClass = `bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat text-joat-black no-underline transition-[background-size] duration-300 hover:bg-[length:100%_2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-black`;

function ItemLink({ item, className }: { item: Item; className: string }) {
  return item.to ? (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  ) : (
    <a
      href={item.href}
      className={className}
      {...(item.href?.startsWith("http") ? { rel: "noopener", target: "_blank" } : {})}
    >
      {item.label}
    </a>
  );
}

function LinkRow({ links, small = false }: { links: Item[]; small?: boolean }) {
  return (
    <ul
      className={`m-0 flex list-none flex-wrap items-center p-0 ${small ? "gap-x-[12px] gap-y-[4px]" : "gap-[16px]"}`}
    >
      {links.map((l, i) => (
        <li key={l.label} className={`flex items-center ${small ? "gap-[12px]" : "gap-[16px]"}`}>
          {i > 0 && <span className="block size-[8px] rounded-full bg-joat-black" />}
          <ItemLink
            item={l}
            className={`${linkClass} font-medium tracking-[0.01em] ${small ? "text-[18px] leading-[1.5]" : "text-[24px] leading-[1.5]"}`}
          />
        </li>
      ))}
    </ul>
  );
}

/** Near-black pill: brown fill sweeps in from the left, label rolls up, pill lifts. */
function PillButton({ children }: { children: ReactNode }) {
  return (
    <Link
      to="/apply"
      className="group relative inline-flex min-h-11 items-center overflow-hidden rounded-full bg-joat-black px-[20px] py-[12px] text-[16px] leading-[26px] text-joat-gold no-underline transition-[transform,box-shadow,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:text-joat-cream hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-black active:scale-[0.97]"
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-joat-brown transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      <span className="relative block overflow-hidden whitespace-nowrap">
        <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute left-0 top-full block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
        >
          {children}
        </span>
      </span>
    </Link>
  );
}

const wordmarkStyle: CSSProperties = {
  color: "rgba(14,11,8,0.12)",
  WebkitTextStroke: "6px rgba(14,11,8,0.12)",
  paintOrder: "stroke fill",
};

const year = new Date().getFullYear();

// ── Desktop (≥1024px): fixed 1600 × 1061 artboard ─────────────────
function FooterDesktop() {
  return (
    <Artboard id="footer" height={1061} className="bg-joat-gold text-joat-black">
      <Reveal
        className="flex justify-between px-[64px] text-[22px] font-semibold leading-[27px]"
        style={at(0, 80, 1600)}
      >
        {VALUES.map((v) => (
          <p key={v} className="m-0 whitespace-nowrap">
            {v}
          </p>
        ))}
      </Reveal>
      <div className="bg-joat-black/15" style={at(0, 131, 1600, 2)} />

      <Reveal delay={150} style={at(483, 221, 634)}>
        <p className="m-0 text-center text-[24px] font-medium leading-[1.5]">
          {PITCH.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </Reveal>
      <Reveal delay={250} className="flex justify-center" style={at(0, 361, 1600)}>
        <PillButton>Apply now</PillButton>
      </Reveal>

      <div className="bg-joat-black/15" style={at(0, 466, 1600, 2)} />

      <div className="flex items-start justify-between px-[64px]" style={at(0, 500, 1600)}>
        <Reveal>
          <p className="m-0 font-gilda text-[30px] uppercase leading-[28px]">Quick Links</p>
          <nav aria-label="Footer" className="mt-[10px]">
            <LinkRow links={QUICK_LINKS} />
          </nav>
        </Reveal>
        <Reveal delay={120} className="flex flex-col items-end">
          <p className="m-0 font-gilda text-[30px] uppercase leading-[28px]">Program</p>
          <nav aria-label="Program information" className="mt-[10px]">
            <LinkRow links={MORE_LINKS} />
          </nav>
        </Reveal>
      </div>

      <Reveal delay={200} style={at(9, 574, 1590, 430)}>
        <p
          aria-hidden
          className="m-0 select-none whitespace-nowrap text-center font-gilda text-[523px] uppercase leading-[523px]"
          style={wordmarkStyle}
        >
          JOAT
        </p>
      </Reveal>

      <div
        className="flex items-center justify-between px-[64px] text-[18px]"
        style={at(0, 1000, 1600)}
      >
        <p className="m-0">
          © {year} {BRAND.legalName}
        </p>
        <LinkRow links={SITES} small />
      </div>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function FooterMobile() {
  return (
    <div id="footer" className="overflow-hidden bg-joat-gold pt-[48px] text-joat-black">
      <div className="grid grid-cols-2 gap-y-[10px] px-[20px] text-[18px] font-semibold sm:px-[40px]">
        {VALUES.map((v) => (
          <p key={v} className="m-0">
            {v}
          </p>
        ))}
      </div>
      <div className="mt-[24px] h-[2px] bg-joat-black/15" />
      <div className="px-[20px] py-[40px] text-center">
        <Reveal>
          <p className="m-0 text-[19px] font-medium leading-[1.5]">{PITCH.join(" ")}</p>
        </Reveal>
        <Reveal delay={150} className="mt-[24px] flex justify-center">
          <PillButton>Apply now</PillButton>
        </Reveal>
      </div>
      <div className="h-[2px] bg-joat-black/15" />
      <div className="flex flex-col gap-[28px] px-[20px] pt-[32px] sm:px-[40px]">
        <div>
          <p className="m-0 font-gilda text-[24px] uppercase leading-[28px]">Quick Links</p>
          <nav aria-label="Footer" className="mt-[8px]">
            <LinkRow links={QUICK_LINKS} small />
          </nav>
        </div>
        <div>
          <p className="m-0 font-gilda text-[24px] uppercase leading-[28px]">Program</p>
          <nav aria-label="Program information" className="mt-[8px]">
            <LinkRow links={[...MORE_LINKS, ...SITES]} small />
          </nav>
        </div>
      </div>
      <p
        aria-hidden
        className="m-0 mt-[16px] select-none whitespace-nowrap text-center font-gilda text-[30vw] uppercase leading-[1]"
        style={{ ...wordmarkStyle, WebkitTextStroke: "2px rgba(14,11,8,0.12)" }}
      >
        JOAT
      </p>
      <p className="m-0 px-[20px] pb-[28px] text-[15px] sm:px-[40px]">
        © {year} {BRAND.legalName}
      </p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Responsive desktop={<FooterDesktop />} mobile={<FooterMobile />} />
    </footer>
  );
}

/** One-line footer for app pages (apply, sign in, dashboard, admin). */
export function SlimFooter() {
  const link = `hover:text-joat-gold ${focusRing}`;
  return (
    <footer className="border-t border-joat-border bg-joat-black font-inter-tight">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-6 text-sm text-joat-body sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="m-0">
          © {year} {BRAND.legalName}
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/terms" className={link}>
            Program terms
          </Link>
          <Link to="/privacy" className={link}>
            Privacy
          </Link>
          <Link to="/contact" className={link}>
            Contact
          </Link>
          <a href={`mailto:${EMAIL}`} className={link}>
            {EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  );
}
