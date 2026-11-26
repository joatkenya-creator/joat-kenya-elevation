/**
 * Landing page sections below the hero, in the Jiro "Miles" visual language
 * (serif headings, Reveal on scroll, gold buttons) and the JOAT palette.
 * All copy comes from the existing portal pages (index, programs, terms, FAQ).
 */
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Gift, Layers, Link2, ShieldCheck, Wallet } from "lucide-react";
import amarePlanet from "@/assets/amare-planet.webp";
import joatLogo from "@/assets/joat-logo.png";
import { BRAND, JOAT_SITE_URL, AMARE_SITE_URL, SUPPORT_EMAIL } from "../config";
import { usePrograms, type Program } from "../account";
import { Button, Heading, Reveal, focusRing } from "./kit";

const wrap = "mx-auto max-w-[1200px]";
const band = "px-[20px] py-[72px] sm:px-[40px] lg:py-[110px]";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 mb-[12px] text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
      {children}
    </p>
  );
}

function IconChip({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-joat-gold text-joat-black [&_svg]:h-5 [&_svg]:w-5"
    >
      {children}
    </span>
  );
}

// ── Trust bar (Vendo stats section) ─────────────────────────────
// Live counts (ambassadors, verified sales) aren't readable by anonymous
// visitors under RLS, and RLS stays as it is, so these are fixed facts.
const FACTS = [
  { icon: <Gift />, value: "Free to join", label: "No purchase required, ever" },
  { icon: <Layers />, value: "2 brands, 1 portal", label: "JOAT Global and Amare's Big Planet" },
  {
    icon: <ShieldCheck />,
    value: "Paid on verified sales only",
    label: "Single-level: no rewards for recruiting",
  },
];

export function TrustBar() {
  return (
    <section
      aria-label="Program at a glance"
      className="bg-joat-black px-[20px] pb-[56px] sm:px-[40px]"
    >
      <ul className={`${wrap} m-0 grid list-none gap-[16px] p-0 md:grid-cols-3`}>
        {FACTS.map((f, i) => (
          <li key={f.value}>
            <Reveal
              delay={i * 100}
              className="flex h-full items-center gap-[16px] rounded-[16px] border border-joat-border bg-joat-surface p-[22px]"
            >
              <IconChip>{f.icon}</IconChip>
              <div>
                <p className="m-0 font-gilda text-[22px] leading-[28px] text-joat-cream">
                  {f.value}
                </p>
                <p className="m-0 mt-[2px] text-[14px] leading-[20px] text-joat-body">{f.label}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── About ────────────────────────────────────────────────────────
const PRINCIPLES = [
  "Free to join, no purchase required",
  "Earn only on your own verified referrals",
  "A clear disclosure on every recommendation",
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className={`bg-joat-black-alt ${band}`}>
      <div className={wrap}>
        <Reveal>
          <blockquote className="m-0 mx-auto max-w-[900px] text-center font-gilda text-[30px] leading-[38px] tracking-[-0.9px] text-joat-cream sm:text-[48px] sm:leading-[60px] sm:tracking-[-1.4px]">
            “Recommend what you <span className="text-joat-gold">genuinely</span> like, with a clear{" "}
            <span className="font-glory leading-[0]">disclosure</span> that you're an ambassador.”
          </blockquote>
        </Reveal>
        <div className="mt-[64px] grid gap-[40px] lg:mt-[96px] lg:grid-cols-2 lg:gap-[80px]">
          <Reveal>
            <Eyebrow>About the program</Eyebrow>
            <Heading id="about-title">
              One program, <span className="text-joat-gold">two brands.</span>
            </Heading>
          </Reveal>
          <div>
            <Reveal delay={150}>
              <p className="m-0 text-[17px] leading-[28px] text-joat-body sm:text-[19px] sm:leading-[30px]">
                The {BRAND.name} Brand Ambassador Program is run by {BRAND.legalName}. It has two
                independent programs, <span className="text-joat-cream">JOAT Global</span> and{" "}
                <span className="text-joat-cream">Amare's Big Planet</span>, each with its own
                approval, commission rules and resources. Refer businesses that need help to JOAT
                Global, or recommend Amare's Big Planet to parents and families.
              </p>
            </Reveal>
            <Reveal delay={250} className="mt-[24px]">
              <ul className="m-0 list-none p-0">
                {PRINCIPLES.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-[10px] text-[16px] leading-[32px] text-joat-body"
                  >
                    <span className="block size-[8px] shrink-0 rounded-full bg-joat-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={330} className="mt-[32px]">
              <Button to="/terms" outline>
                Read the program terms
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── The programs (Services) ─────────────────────────────────────
function Status({ program }: { program: Program | undefined }) {
  if (!program) return <span />;
  return program.accepting_applications ? (
    <span className="rounded-full bg-joat-gold px-[12px] py-[3px] text-[13px] font-medium text-joat-black">
      Accepting applications
    </span>
  ) : (
    <span className="rounded-full border border-joat-border px-[12px] py-[3px] text-[13px] text-joat-body">
      Applications open soon
    </span>
  );
}

function ProgramCard(props: {
  program: Program | undefined;
  to: "/programs/joat" | "/programs/amare";
  logo: string;
  title: string;
  body: string;
  basis: string;
  delay: number;
}) {
  return (
    <Reveal delay={props.delay} className="h-full">
      <article className="group flex h-full flex-col rounded-[20px] border border-joat-border bg-joat-surface p-[28px] transition-colors duration-300 hover:border-joat-gold sm:p-[36px]">
        <div className="flex items-center gap-[14px]">
          <img
            src={props.logo}
            alt=""
            className="size-[56px] rounded-full bg-joat-black object-contain p-[6px]"
          />
          <h3 className="m-0 font-gilda text-[28px] font-normal leading-[34px] text-joat-cream">
            {props.title}
          </h3>
        </div>
        <p className="m-0 mt-[20px] text-[16px] leading-[26px] text-joat-body">{props.body}</p>
        <p className="m-0 mt-[14px] text-[16px] leading-[26px] text-joat-cream">{props.basis}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-[12px] pt-[28px]">
          <Status program={props.program} />
          <Link
            to={props.to}
            className={`inline-flex items-center gap-[6px] text-[15px] font-medium text-joat-gold hover:text-joat-gold-hover ${focusRing}`}
          >
            Program details
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[3px]"
              aria-hidden
            />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export function Programs() {
  const { data: programs } = usePrograms();
  const byId = (id: string) => programs?.find((p) => p.id === id);
  return (
    <section id="programs" aria-labelledby="programs-title" className={`bg-joat-black ${band}`}>
      <div className={wrap}>
        <Reveal>
          <Eyebrow>Choose one or both</Eyebrow>
          <Heading id="programs-title">
            The <span className="text-joat-gold">programs</span>
          </Heading>
        </Reveal>
        <div className="mt-[40px] grid gap-[20px] md:grid-cols-2">
          <ProgramCard
            delay={0}
            program={byId("joat")}
            to="/programs/joat"
            logo={joatLogo}
            title="JOAT Global"
            body="Refer businesses to JOAT Global for virtual assistants, AI and automation, marketing and lead generation, software development and media production."
            basis="8% of the first invoice paid by each client you refer, rising to 10% as you grow."
          />
          <ProgramCard
            delay={120}
            program={byId("amare")}
            to="/programs/amare"
            logo={amarePlanet}
            title="Amare's Big Planet"
            body="Recommend Amare's Big Planet, a children's learning brand with songs, videos, the Drawalet letter-tracing app and an online shop, to parents and families."
            basis="8% of eligible net product sales from the Amare shop, rising to 10% as you grow."
          />
        </div>
      </div>
    </section>
  );
}

// ── How earnings work (Case Study) ───────────────────────────────
const FLOW = [
  {
    icon: <Link2 />,
    title: "Referral link or code",
    body: "A customer reaches us through your personal referral link or uses your code.",
  },
  {
    icon: <BadgeCheck />,
    title: "Verified purchase",
    body: "The customer pays and we confirm the payment. Unpaid invoices, proposals and inquiries don't count.",
  },
  {
    icon: <ShieldCheck />,
    title: "Commission",
    body: "8% to start, up to 10% within your first 6 months, in US dollars. Refunds reduce or reverse it.",
  },
  {
    icon: <Wallet />,
    title: "Payout",
    body: "After a 30-day hold our team reviews and approves it. Payouts are monthly, by M-Pesa or bank transfer.",
  },
];

export function Earnings() {
  return (
    <section id="earnings" aria-labelledby="earnings-title" className={`bg-joat-black-alt ${band}`}>
      <div className={wrap}>
        <Reveal>
          <Eyebrow>Worked example</Eyebrow>
          <Heading id="earnings-title">
            How <span className="text-joat-gold">earnings</span> work
          </Heading>
        </Reveal>
        <ol className="m-0 mt-[40px] grid list-none gap-[16px] p-0 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.title}>
              <Reveal
                delay={i * 100}
                className="h-full rounded-[16px] border border-joat-border bg-joat-surface p-[24px]"
              >
                <IconChip>{s.icon}</IconChip>
                <h3 className="m-0 mt-[18px] font-gilda text-[22px] font-normal leading-[28px] text-joat-cream">
                  {s.title}
                </h3>
                <p className="m-0 mt-[8px] text-[15px] leading-[24px] text-joat-body">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal delay={150} className="mt-[24px] grid gap-[16px] md:grid-cols-2">
          <div className="rounded-[16px] border border-joat-border p-[24px]">
            <p className="m-0 text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
              JOAT Global
            </p>
            <p className="m-0 mt-[10px] text-[16px] leading-[26px] text-joat-body">
              A first invoice of <span className="text-joat-cream">$2,000</span>, paid in full,
              earns <span className="text-joat-cream">$160</span> at 8% or{" "}
              <span className="text-joat-cream">$200</span> at 10%. Later invoices to the same
              client don't earn commission.
            </p>
          </div>
          <div className="rounded-[16px] border border-joat-border p-[24px]">
            <p className="m-0 text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
              Amare's Big Planet
            </p>
            <p className="m-0 mt-[10px] text-[16px] leading-[26px] text-joat-body">
              A <span className="text-joat-cream">$59.29</span> order (after discounts, excluding
              shipping and tax) earns <span className="text-joat-cream">$4.74</span> at 8% or{" "}
              <span className="text-joat-cream">$5.93</span> at 10%.
            </p>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <p className="m-0 mt-[24px] max-w-[820px] text-[16px] leading-[26px] text-joat-body">
            <span className="text-joat-cream">
              No commission or reward is paid for recruiting other ambassadors
            </span>
            , and there are no recruitment quotas. We don't promise or guarantee any level of
            income. What you earn depends entirely on genuine sales to customers you refer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── How it works (Process) ───────────────────────────────────────
const STEPS = [
  {
    title: "Apply",
    body: "Choose JOAT Global, Amare's Big Planet, or both. Joining is free and needs no purchase.",
  },
  {
    title: "Get approved",
    body: "Our team reviews each application. Each program approves you separately.",
  },
  {
    title: "Share your link & code",
    body: "Recommend what you genuinely like, with a clear disclosure that you're an ambassador.",
  },
  {
    title: "Earn on verified sales",
    body: "Commission is earned only on your own referrals, once the payment is verified. Our team approves every payout.",
  },
];

export function Process() {
  return (
    <section id="how-it-works" aria-labelledby="process-title" className={`bg-joat-black ${band}`}>
      <div className={wrap}>
        <Reveal>
          <Eyebrow>Four steps</Eyebrow>
          <Heading id="process-title">
            How it <span className="font-glory leading-[0] text-joat-gold">works</span>
          </Heading>
        </Reveal>
        <ol className="m-0 mt-[40px] grid list-none gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal
                delay={i * 100}
                className="h-full border-t border-joat-border pr-[24px] pt-[24px] pb-[32px]"
              >
                <span className="font-gilda text-[44px] leading-none text-joat-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="m-0 mt-[16px] font-gilda text-[24px] font-normal leading-[30px] text-joat-cream">
                  {s.title}
                </h3>
                <p className="m-0 mt-[8px] text-[15px] leading-[24px] text-joat-body">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal>
          <p className="m-0 mt-[8px] max-w-[760px] text-[15px] leading-[24px] text-joat-body">
            Full commission rules are on each program page.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Ambassador stories (Testimonial) ─────────────────────────────
// TODO(content): add real ambassador quotes here (with their permission). The
// section stays hidden while this is empty. Never add placeholder people.
const STORIES: { quote: string; name: string; program: string }[] = [];

export function Stories() {
  if (STORIES.length === 0) return null;
  return (
    <section id="stories" aria-labelledby="stories-title" className={`bg-joat-black-alt ${band}`}>
      <div className={wrap}>
        <Reveal>
          <Heading id="stories-title">
            Ambassador <span className="text-joat-gold">stories</span>
          </Heading>
        </Reveal>
        <ul className="m-0 mt-[40px] grid list-none gap-[20px] p-0 md:grid-cols-2">
          {STORIES.map((s, i) => (
            <li key={s.name}>
              <Reveal
                delay={i * 100}
                className="h-full rounded-[16px] border border-joat-border bg-joat-surface p-[28px]"
              >
                <blockquote className="m-0 font-gilda text-[22px] leading-[32px] text-joat-cream">
                  “{s.quote}”
                </blockquote>
                <p className="m-0 mt-[16px] text-[15px] text-joat-body">
                  {s.name} · {s.program}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Apply CTA ─────────────────────────────────────────────────────
export function Cta() {
  const { data: programs } = usePrograms();
  const open = programs?.some((p) => p.accepting_applications);
  return (
    <section aria-labelledby="cta-title" className={`bg-joat-black-alt ${band}`}>
      <Reveal
        className={`${wrap} rounded-[24px] border border-joat-border bg-joat-surface px-[24px] py-[56px] text-center sm:px-[56px] lg:py-[80px]`}
      >
        <Heading id="cta-title">
          Ready to <span className="font-glory leading-[0] text-joat-gold">start?</span>
        </Heading>
        <p className="m-0 mx-auto mt-[16px] max-w-[560px] text-[17px] leading-[27px] text-joat-body">
          Free to join, no purchase required. Each program reviews your application separately.
        </p>
        <div className="mt-[32px] flex flex-wrap justify-center gap-[12px]">
          {open && <Button to="/apply">Apply now</Button>}
          <Button to="/login" outline>
            Sign in
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
export function Footer() {
  const link = `text-[15px] text-joat-body no-underline hover:text-joat-gold ${focusRing}`;
  return (
    <footer className="border-t border-joat-border bg-joat-black px-[20px] py-[56px] font-inter-tight sm:px-[40px]">
      <div className={`${wrap} grid gap-[40px] md:grid-cols-[1.4fr_1fr_1fr]`}>
        <div>
          <Link
            to="/"
            className={`flex items-center gap-[10px] text-joat-cream no-underline ${focusRing}`}
          >
            <img src={joatLogo} alt="" className="size-[32px] object-contain" />
            <span className="font-gilda text-[20px]">JOAT Global Partners</span>
          </Link>
          <p className="m-0 mt-[14px] max-w-[360px] text-[15px] leading-[24px] text-joat-body">
            {BRAND.tagline}
          </p>
          <p className="m-0 mt-[14px] text-[15px] text-joat-body">
            {SUPPORT_EMAIL ? (
              <a href={`mailto:${SUPPORT_EMAIL}`} className={`${link} text-joat-gold`}>
                {SUPPORT_EMAIL}
              </a>
            ) : (
              <Link to="/contact" className={`${link} text-joat-gold`}>
                Contact the partner team
              </Link>
            )}
          </p>
        </div>
        <nav aria-label="Portal">
          <p className="m-0 mb-[12px] text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
            Portal
          </p>
          <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
            <li>
              <Link to="/programs/joat" className={link}>
                JOAT Global program
              </Link>
            </li>
            <li>
              <Link to="/programs/amare" className={link}>
                Amare's Big Planet program
              </Link>
            </li>
            <li>
              <Link to="/faq" className={link}>
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/resources" className={link}>
                Resources
              </Link>
            </li>
            <li>
              <Link to="/apply" className={link}>
                Apply
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="m-0 mb-[12px] text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">
            More
          </p>
          <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
            <li>
              <a href={JOAT_SITE_URL} className={link} rel="noopener" target="_blank">
                JOAT Global website
              </a>
            </li>
            <li>
              <a href={AMARE_SITE_URL} className={link} rel="noopener" target="_blank">
                Amare's Big Planet website
              </a>
            </li>
            <li>
              <Link to="/terms" className={link}>
                Program terms
              </Link>
            </li>
            <li>
              <Link to="/privacy" className={link}>
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/contact" className={link}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p
        className={`${wrap} m-0 mt-[48px] border-t border-joat-border pt-[24px] text-[14px] text-joat-muted`}
      >
        © {new Date().getFullYear()} {BRAND.legalName}.
      </p>
    </footer>
  );
}
