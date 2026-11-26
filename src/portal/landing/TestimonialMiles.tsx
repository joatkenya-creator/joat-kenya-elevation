/**
 * Ambassador stories (Jiro "Miles" File 7, "Testimonials"), recoloured.
 * Renders nothing until real quotes exist. The template's star ratings are dropped
 * (they'd be an unsupported score); photos are optional and must be local files (CSP).
 */
import { Artboard, Badge, Marquee, Reveal, Responsive, at } from "./kit";

// TODO(content): add real ambassador quotes here, with each person's written permission.
// Never add placeholder people. The section stays hidden while this list is empty.
const STORIES: { quote: string; name: string; role: string; photo?: string }[] = [];

const LEAD = "In their own words: ambassadors on recommending JOAT Global and Amare's Big Planet.";

function Heading({ className = "" }: { className?: string }) {
  return (
    <h2 className={`m-0 font-gilda font-normal capitalize text-joat-cream ${className}`}>
      Ambassador <span className="font-glory leading-[0] text-joat-gold">Stories.</span>
    </h2>
  );
}

type Story = (typeof STORIES)[number];

function Person({ name, role }: { name: string; role: string }) {
  return (
    <div>
      <p className="m-0 font-gilda text-[24px] leading-[31px] text-joat-cream">{name}</p>
      <p className="m-0 text-[16px] leading-[21px] text-joat-body">{role}</p>
    </div>
  );
}

function CardDesktop({ t }: { t: Story }) {
  return (
    <figure className="group relative m-0 flex h-[343px] w-[651px] shrink-0 overflow-hidden rounded-[20px] border border-joat-border bg-joat-surface">
      {t.photo && (
        <div className="h-full w-[301px] shrink-0 overflow-hidden">
          <img
            src={t.photo}
            alt={t.name}
            className="h-full w-full object-cover object-[50%_30%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-[24px]">
        <blockquote className="m-0 text-[18px] leading-[26px] text-joat-body">
          “{t.quote}”
        </blockquote>
        <figcaption>
          <Person name={t.name} role={t.role} />
        </figcaption>
      </div>
    </figure>
  );
}

function CardMobile({ t }: { t: Story }) {
  return (
    <figure className="m-0 flex w-[290px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-joat-border bg-joat-surface">
      <div className="flex flex-1 flex-col gap-[16px] p-[18px]">
        <blockquote className="m-0 text-[15px] leading-[21px] text-joat-body">
          “{t.quote}”
        </blockquote>
        <figcaption className="mt-auto">
          <Person name={t.name} role={t.role} />
        </figcaption>
      </div>
      {t.photo && (
        <img
          src={t.photo}
          alt={t.name}
          className="block h-[220px] w-full object-cover object-[50%_25%]"
        />
      )}
    </figure>
  );
}

// ── Desktop (≥1024px): fixed 1600 × 770 artboard ──────────────────
function TestimonialsDesktop() {
  return (
    <Artboard id="stories" height={770} className="bg-joat-black-alt">
      <Reveal style={at(80, 78)}>
        <Badge>Stories</Badge>
      </Reveal>
      <Reveal delay={200} style={at(80, 122, 568)}>
        <Heading className="text-[60px] leading-[74px] tracking-[-1.8px]" />
      </Reveal>
      <Reveal delay={300} style={at(1198, 180, 322)}>
        <p className="m-0 text-[20px] leading-[30px] text-joat-body">{LEAD}</p>
      </Reveal>
      <Reveal delay={200} style={at(0, 330, 1600, 343)}>
        <Marquee offset={-139} gap={20} duration={70} copies={2}>
          {STORIES.map((t) => (
            <CardDesktop key={t.name} t={t} />
          ))}
        </Marquee>
      </Reveal>
    </Artboard>
  );
}

// ── Mobile (<1024px) ───────────────────────────────────────────────
function TestimonialsMobile() {
  return (
    <section id="stories" className="bg-joat-black-alt py-[64px]">
      <div className="px-[20px] sm:px-[40px]">
        <Reveal>
          <Badge>Stories</Badge>
        </Reveal>
        <Reveal delay={200} className="mt-[14px]">
          <Heading className="text-[40px] leading-[48px] tracking-[-1.2px]" />
        </Reveal>
        <Reveal delay={300} className="mt-[14px]">
          <p className="m-0 text-[17px] leading-[26px] text-joat-body">{LEAD}</p>
        </Reveal>
      </div>
      <Marquee className="mt-[32px]" gap={14} duration={40} copies={3}>
        {STORIES.map((t) => (
          <CardMobile key={t.name} t={t} />
        ))}
      </Marquee>
    </section>
  );
}

export default function TestimonialMiles() {
  if (STORIES.length === 0) return null;
  return <Responsive desktop={<TestimonialsDesktop />} mobile={<TestimonialsMobile />} />;
}
