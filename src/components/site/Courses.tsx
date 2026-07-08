import { Link } from "@tanstack/react-router";
import { m } from "framer-motion";
import type { Tier } from "@/lib/auth";

// Small, consistent marker for brief facts JOAT leadership hasn't signed off
// on yet (course name, dates, venue, prices, paybill). Keeps unconfirmed
// values visibly distinct from the rest of the copy instead of reading as
// final.
function Confirm({ children }: { children: string }) {
  return (
    <span className="ml-1.5 inline-block whitespace-nowrap rounded border border-(--joat-red)/40 bg-(--joat-red)/10 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-(--joat-red)">
      {children}
    </span>
  );
}

const promises = [
  "3 real, deployed apps anyone can open and use",
  "A portfolio site built to get callbacks",
  "M-Pesa payments working in a real app you built",
  "The workflow to keep building on your own, with AI",
];

const curriculum = [
  {
    weeks: "Weeks 1–2",
    title: "Foundations of building with AI",
    body: "How to structure an app idea into a buildable plan, the modern AI toolchain, and setting up your dev environment.",
    ship: "Ship: App #1 — a simple working web app, deployed live.",
  },
  {
    weeks: "Weeks 3–4",
    title: "Real apps, real data",
    body: "Databases, authentication, connecting frontend to backend, and fixing what AI gets wrong.",
    ship: "Ship: App #2 — a full-stack app with user accounts, deployed.",
  },
  {
    weeks: "Weeks 5–6",
    title: "Payments and going live in Kenya",
    body: "Deploying for real users, and M-Pesa (Daraja) integration so your app can actually take money.",
    ship: "Ship: App #3 — an app that accepts M-Pesa payments.",
  },
  {
    weeks: "Weeks 7–8",
    title: "Portfolio and job-readiness",
    body: "Polish the 3 apps, build a portfolio site, and learn how to present shipped work to employers or clients.",
    ship: "Outcome: 3 deployed apps, a portfolio site, and next steps into freelance work or a junior role.",
  },
];

const tiers: {
  id: Tier;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  deposit: string;
  popular?: boolean;
}[] = [
  {
    id: "builder",
    name: "Builder",
    price: "KES 24,900",
    blurb: "4-week evening track",
    features: ["Ship 1 real, deployed app", "Group cohort"],
    deposit: "Deposit: KES 5,000",
  },
  {
    id: "shipper",
    name: "Shipper",
    price: "KES 44,900",
    blurb: "Full 8-week cohort",
    features: [
      "Ship 3 apps, including M-Pesa",
      "Portfolio site",
      "Deployment",
      "Job-readiness coaching",
    ],
    deposit: "Deposit: KES 10,000",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "KES 79,900",
    blurb: "Shipper, plus 1-on-1 mentorship",
    features: [
      "Everything in Shipper",
      "Build and deploy your own idea",
      "Priority support",
      "Freelance-gig referral",
    ],
    deposit: "Deposit: KES 15,000",
  },
];

const faqs = [
  {
    q: "Do I need to know how to code already?",
    a: "Basic familiarity helps, but we start from how to structure and build. Motivated beginners are welcome.",
  },
  {
    q: "Is it online or in person?",
    a: "Live and in person in Nairobi — that's the point, you build alongside a mentor.",
  },
  {
    q: "What do I leave with?",
    a: "3 deployed apps, a portfolio site, and the workflow to keep building.",
  },
  {
    q: "Can my parent pay for me?",
    a: "Yes. Pay in full, installments, or a parent-pays M-Pesa option are all available.",
  },
  {
    q: "Will this get me a job?",
    a: "We give you the portfolio and skills employers ask for, and the tech market pays roughly KES 50,000–200,000 a month for developers. We don't promise placement.",
  },
  {
    q: "How big is the class?",
    a: "Small: 8–12 people, so you get real attention from the mentor.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{eyebrow}</div>
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground">{title}</h2>
    </div>
  );
}

export function Courses() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              A JOAT Kenya Live Cohort · Nairobi
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Working title: "Zero to Shipped" — AI App Builder Cohort
              <Confirm>Name not final</Confirm>
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground">
              Finished IT but can't actually build anything? In 8 weeks, ship 3 real apps.
            </h1>
            <p className="mt-6 text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              A small, live, in-person cohort in Nairobi. Learn to build and ship real apps with AI
              — deployment, M-Pesa payments and all — taught by a team that ships to the app stores
              for a living.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/courses/sign-up"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
              >
                Register for the next cohort
              </Link>
              <a
                href="#curriculum"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md glass text-foreground font-semibold hover:bg-black/5 transition-all"
              >
                See what you'll build
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Small cohort · 8–12 spots · Next intake:
              <Confirm>Date not set</Confirm>
            </p>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 lg:py-24 bg-navy">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp} className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              The degree wasn't the problem. Nobody taught you to build.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              You did the course. You have the certificate. But every job wants a portfolio and real
              projects, and you've got nothing shipped. You've watched the tutorials, maybe
              half-finished a bootcamp, and you still don't know where to start. You're not behind
              because you're not smart. You're behind because school taught theory, and the market
              pays for shipped work.
            </p>
            <blockquote className="mt-6 border-l-2 border-(--joat-gold) pl-4 text-base text-foreground">
              "How do I build a real app when my IT degree taught me nothing practical?"
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              It's not just you. Youth unemployment in Kenya runs at roughly two-thirds for people
              aged 15–34, and over a million young people enter the job market every year without
              skills that get them hired. Meanwhile developer salaries here run KES 50,000–200,000 a
              month, for people who can prove they can build.
            </p>
          </m.div>
        </div>
      </section>

      {/* The promise */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading
              eyebrow="What You Walk Out With"
              title="In 8 weeks, you walk out with proof."
            />
            <ul className="mt-10 max-w-2xl divide-y divide-(--border)">
              {promises.map((p) => (
                <li
                  key={p}
                  className="py-4 border-l-2 border-(--joat-gold) pl-4 text-base text-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </m.div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-20 lg:py-24 bg-navy">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading
              eyebrow="What You'll Build"
              title="Three real apps, built one at a time."
            />
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Draft curriculum
              <Confirm>Pending final sign-off</Confirm> — structured around shipping 3 real apps.
            </p>
          </m.div>
          <div className="mt-10 max-w-3xl space-y-10">
            {curriculum.map((block) => (
              <div key={block.weeks} className="border-l-2 border-(--border) pl-6">
                <div className="text-xs uppercase tracking-[0.2em] text-gold">{block.weeks}</div>
                <h3 className="mt-1 text-xl font-bold text-foreground">{block.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{block.body}</p>
                <p className="mt-3 text-sm font-medium text-foreground">{block.ship}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JoatKenya */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading
              eyebrow="Why JOAT Kenya"
              title="We teach the way we ship, not what school taught us."
            />
            <p className="mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed">
              JOAT Kenya doesn't teach coding theory. We teach you to ship the way our own team
              ships production apps like{" "}
              <a
                href="https://biobiz.app"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-gold"
              >
                Biobiz
              </a>{" "}
              and{" "}
              <a
                href="https://www.majobokenya.com"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-gold"
              >
                Majobo
              </a>
              : a structured AI-build method, real deployment, and live M-Pesa payments. Where
              bootcamps hand you a certificate, we hand you a portfolio of deployed apps and the
              workflow to keep building. Taught live, in a small group, by people who do this for
              money.
            </p>

            <div className="mt-10 max-w-2xl space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  We've made the exact leap you need to make.{" "}
                </span>
                JOAT Kenya's team came up through practical building, from client websites to
                shipping full products, so we teach the jump from "I have a certificate" to "I can
                build" because we've lived it.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  We teach what the market actually rewards.{" "}
                </span>
                Schools teach syntax and theory. The skill that gets callbacks in 2026 is
                structuring an AI build with a proper method, shipping it, deploying it, and wiring
                up payments with M-Pesa.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">We ship for a living. </span>
                Biobiz is a digital business-card app live on Google Play and the App Store. Majobo
                is a jobs-board platform. You'll learn the same workflow we use to ship them.
              </p>
            </div>
          </m.div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-20 lg:py-24 bg-navy">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading eyebrow="Fit Check" title="Who this is for." />
          </m.div>
          <div className="mt-10 grid md:grid-cols-2 gap-10 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                This is for you if
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>You finished an IT or tech course but can't build on your own yet.</li>
                <li>You've applied to dev jobs and gotten no callbacks.</li>
                <li>You want a real portfolio, not another certificate.</li>
                <li>You learn better live, alongside other people, than alone from videos.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Not for you if
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>You want a purely online, self-paced course.</li>
                <li>You want a certificate without doing the work.</li>
                <li>You're already shipping production apps on your own.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading
              eyebrow="Pricing"
              title="Three tiers, depending on how far you want to go."
            />
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Pay in full, in installments, or have a parent pay by M-Pesa.
            </p>
          </m.div>

          <div className="mt-10 grid lg:grid-cols-3 gap-5">
            {tiers.map((t) => (
              <div
                key={t.id}
                className={`rounded-2xl border p-7 flex flex-col ${
                  t.popular ? "border-(--joat-gold)" : "border-(--border)"
                }`}
              >
                {t.popular && (
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-3">
                    Most popular
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{t.blurb}</div>
                <h3 className="mt-1 text-2xl font-bold text-foreground">{t.name}</h3>
                <div className="mt-3 flex items-center">
                  <span className="text-3xl font-bold text-foreground">{t.price}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm text-foreground/90 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="border-l-2 border-(--border) pl-3">
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-muted-foreground">{t.deposit}</p>
                <Link
                  to="/courses/sign-up"
                  search={{ tier: t.id }}
                  className={`mt-5 inline-flex items-center justify-center px-5 py-3 rounded-md font-semibold transition-all ${
                    t.popular
                      ? "bg-(--joat-gold) text-(--joat-navy-deep) hover:brightness-110"
                      : "glass text-foreground hover:bg-black/5"
                  }`}
                >
                  Choose {t.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real story */}
      <section className="py-20 lg:py-24 bg-navy">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp} className="max-w-2xl">
            <SectionHeading eyebrow="A Real Story" title="Why we built this course." />
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              This course exists because of a real conversation: a parent reached out to us because
              their graduate had finished an IT course with a certificate but no technical skills,
              and no job. After working with our team, that graduate was building real things with
              AI. We're running this cohort so more grads in that position get the same shot.
            </p>
          </m.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <m.div {...fadeUp}>
            <SectionHeading eyebrow="FAQ" title="Questions, answered." />
          </m.div>
          <div className="mt-10 divide-y divide-(--border) border-t border-b border-(--border)">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-foreground">
                  <span>{f.q}</span>
                  <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
            <details className="group py-4">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-foreground">
                <span>
                  Is there a job guarantee?
                  <Confirm>Language pending</Confirm>
                </span>
                <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We haven't finalized what, if any, job-support language we can commit to. We'll
                update this once JOAT leadership confirms it.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <m.div {...fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              In 8 weeks, ship 3 real apps and build a portfolio that gets callbacks.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Register your interest below. We'll follow up on WhatsApp or email with next steps.
            </p>
            <div className="mt-8">
              <Link
                to="/courses/sign-up"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
              >
                Register for the next cohort
              </Link>
            </div>
          </m.div>
        </div>
      </section>
    </div>
  );
}
