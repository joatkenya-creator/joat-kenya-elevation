import { useEffect } from "react";
import { m } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  AUDIENCES,
  COMPARISON,
  CONSULTATIONS,
  CONSULTATION_FAQS,
  DIRECTOR,
  PHONE_DISPLAY,
  PHONE_HREF,
  TRUST_POINTS,
  whatsappLink,
} from "@/data/kenya-consultation";
import { ConsultationBooking } from "./ConsultationBooking";
import { startBooking } from "@/lib/booking";
import { track } from "@/lib/analytics";

const DECIDING_QUESTIONS = [
  "Should I move to Kenya?",
  "Should I start my business in Kenya?",
  "Is there a market here for my idea?",
  "What would it actually take to operate here?",
  "What opportunities should I investigate?",
  "What challenges should I prepare for?",
  "Should I establish locally or enter through a partner?",
  "What should I know before committing significant time or money?",
];

export function KenyaConsultation() {
  useEffect(() => {
    track("consultation_page_view");
  }, []);

  return (
    <div className="consult-page pb-20 lg:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 lg:pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-card px-4 py-1.5 text-xs font-medium text-gold mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Kenya Market Entry &amp; Relocation Consulting
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-[1.08] text-foreground">
            Considering moving to Kenya or starting a business?{" "}
            <span className="gradient-text-gold">Talk to a Kenya market expert.</span>
          </h1>
          <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Before you make a major move or investment, speak directly with someone who understands
            the Kenyan business environment. Get practical, personalised guidance on relocating,
            entering the Kenyan market, starting a business here, or exploring opportunities across
            East Africa.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => startBooking(60)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all"
            >
              Book a Kenya Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={PHONE_HREF}
              onClick={() => track("phone_cta_clicked", { location: "hero" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-(--border) bg-card text-foreground font-semibold hover:border-(--joat-gold)/50 transition-colors"
            >
              <Phone className="w-4 h-4 text-(--joat-gold)" />
              Call J.O.A.T.
            </a>
          </div>
          {whatsappLink && (
            <div className="mt-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("whatsapp_clicked", { location: "hero" })}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Ask about a consultation on WhatsApp
              </a>
            </div>
          )}

          <div className="mt-12 grid grid-cols-3 gap-3 max-w-3xl mx-auto">
            {TRUST_POINTS.map((t) => (
              <div key={t.label} className="glass rounded-xl p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{t.stat}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Still deciding ───────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-navy-deep">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Still deciding</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Not sure whether Kenya is right for you?
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Most people who reach this page are somewhere in the middle of a decision. You have
              read the articles, watched the videos, maybe visited once, and you still cannot tell
              which parts apply to your situation. Country guides are written for everyone, which
              means they are written for nobody in particular, and the questions that actually keep
              you awake are specific to you.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A consultation replaces months of scattered research with one focused conversation
              about your plans, with someone who runs a business in this market every day.
            </p>
          </div>

          <ul className="mt-10 grid sm:grid-cols-2 gap-3">
            {DECIDING_QUESTIONS.map((q) => (
              <li key={q} className="glass rounded-xl px-5 py-4 text-sm text-foreground">
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => startBooking(60)}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-bold hover:brightness-110 transition-all"
          >
            Talk to the Director
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Who this is for</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Built for people weighing a real decision about Kenya.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIENCES.map((a, i) => (
              <m.div
                key={a.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-(--joat-red)/15 flex items-center justify-center mb-4">
                  <a.icon className="w-5 h-5 text-(--joat-gold)" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.text}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The two sessions ─────────────────────────────────────────────── */}
      <section id="sessions" className="py-16 lg:py-24 bg-navy-deep scroll-mt-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              Two ways to work with us
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              One hour to decide. Two hours to plan.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Both sessions are a direct conversation with the Director of J.O.A.T. The
              difference is depth: the first helps you decide whether Kenya belongs in your plans,
              the second pulls your plan apart and puts it back together with local reality applied.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {CONSULTATIONS.map((c) => (
              <div key={c.minutes} className="glass rounded-3xl p-6 sm:p-8 flex flex-col">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
                  <Clock className="w-3.5 h-3.5" />
                  {c.eyebrow}
                </div>
                <h3 className="mt-3 text-2xl font-bold text-foreground">{c.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.summary}</p>
                <div className="mt-5 text-xs uppercase tracking-widest text-gold">
                  What we cover
                </div>
                <ul className="mt-3 space-y-2 flex-1">
                  {c.covers.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-(--joat-gold) shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-sm font-semibold text-foreground">
                  {c.price ?? "Fee shared when we confirm your booking"}
                </div>
                <button
                  type="button"
                  onClick={() => startBooking(c.minutes)}
                  className={`mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold transition-all hover:brightness-110 ${
                    c.minutes === 60
                      ? "bg-(--joat-gold) text-(--joat-navy-deep)"
                      : "bg-(--joat-red) text-primary-foreground"
                  }`}
                >
                  {c.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-160 border-collapse text-sm">
              <caption className="sr-only">
                Comparison of the 1-hour Kenya discovery consultation and the 2-hour market entry
                strategy session
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left p-4 text-foreground font-bold w-1/2 border-b border-(--border)"
                  >
                    1-Hour Discovery Consultation
                  </th>
                  <th
                    scope="col"
                    className="text-left p-4 text-foreground font-bold w-1/2 border-b border-(--border)"
                  >
                    2-Hour Market Entry Strategy Session
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.hour}>
                    <td className="p-4 align-top text-muted-foreground border-b border-(--border)">
                      {row.hour}
                    </td>
                    <td className="p-4 align-top text-muted-foreground border-b border-(--border)">
                      {row.strategy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Booking ──────────────────────────────────────────────────────── */}
      <ConsultationBooking />

      {/* ── Depth: what we actually talk about ───────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
            What the conversation covers
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            The Kenya questions that decide whether this works.
          </h2>

          <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-xl font-bold text-foreground">Moving to Kenya</h3>
              <p className="mt-3">
                Relocating is rarely one decision. It is a stack of smaller ones: where you base
                yourself, what your monthly costs realistically look like, how you bank and move
                money, whether your work travels with you, what schooling looks like if you have
                children, how you get around, and how quickly you can build a circle of people you
                trust. Nairobi, Kiambu, Mombasa, Nakuru and Kisumu are different propositions in
                cost, pace and community, and the version of Kenya you experience depends heavily on
                which one you pick and how you live.
              </p>
              <p className="mt-3">
                What we can do is talk through the practical realities, the sequence most people
                follow, and where newcomers lose time and money in the first year. What we do not do
                is handle immigration filings or advise on permit categories: those must go to an
                immigration professional licensed to give that advice, and a good consultation tells
                you exactly when you have reached that point.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Starting a business in Kenya</h3>
              <p className="mt-3">
                Setting up a company here is not the hard part. Registration, a tax PIN, licences
                and a bank account are a process with a known shape, and professionals handle it
                every week. The hard part is everything that follows: finding customers who will
                actually pay, pricing for a market that negotiates, hiring people you can rely on,
                and keeping cashflow steady when payment terms stretch.
              </p>
              <p className="mt-3">
                Foreign founders often arrive with a model that assumes card payments, fixed prices,
                fast collections and expensive labour. Kenya inverts several of those assumptions.
                Mobile money is dominant, relationships drive procurement, price sensitivity is real
                even at the top of the market, and skilled talent is available at a very different
                cost base than in Europe or North America. Those differences can work strongly in
                your favour, but only if the business is designed around them rather than against
                them.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                Entering the Kenyan market as an existing company
              </h3>
              <p className="mt-3">
                If you already have a business elsewhere, the question is not whether Kenya is
                interesting; it is which route in gives you a real read on demand for the least
                capital. Register a local entity and hire? Appoint a distributor or reseller?
                Partner with an established local business? Serve the market remotely first and let
                early revenue tell you whether to commit? Each route has a different cost, speed,
                control profile and exit cost, and the wrong one can burn a year before you learn
                anything useful.
              </p>
              <p className="mt-3">
                Kenya is also frequently treated as the entry point to East Africa, with Uganda,
                Tanzania, Rwanda and the wider region reachable from a Nairobi base. That is often
                true, but the regional story only holds if the Kenyan operation itself stands up.
                Getting the sequence right matters more than the ambition.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Understanding Kenyan customers</h3>
              <p className="mt-3">
                Kenyan buyers are mobile-first, price-aware and heavily influenced by referral. A
                recommendation from someone they know outperforms almost any advertisement. Business
                buyers expect to meet you, negotiate, and see a track record before they commit, and
                will often start with a small trial rather than a full contract. Consumer buyers
                move fast on social platforms but abandon anything that adds friction to payment.
              </p>
              <p className="mt-3">
                The practical implication is that market entry usually needs a local face, a payment
                path that feels native, and patience through a trust-building period that many
                foreign entrants under-budget. In a session we map that against your specific
                product: who buys it, what they compare it to, what they will pay, and how long the
                cycle runs.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                Operations: what running things here really involves
              </h3>
              <p className="mt-3">
                Day-to-day operations are where plans meet reality. Premises and rent vary sharply
                by area. Traffic shapes how much a person can get done in a day, and delivery
                timelines with it. Power and connectivity are generally good in commercial areas but
                worth planning backups for. Imports move through clearance steps that take longer
                than the schedule you wrote at home. Suppliers are capable but need managing, and
                the ones you find on your first week are rarely the ones you keep.
              </p>
              <p className="mt-3">
                None of this is a reason to stay away. It is a reason to build a timeline with slack
                in it, and to know before you land which of these will actually touch your business.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Hiring and building a team</h3>
              <p className="mt-3">
                Kenya has a large, young, English-speaking workforce with strong depth in customer
                support, sales, finance, administration, software and creative work. For many
                international businesses this is the single most compelling reason to be here: you
                can build a capable team at a cost base that changes what your business can afford
                to do.
              </p>
              <p className="mt-3">
                The difficulty is selection and management rather than availability. Applications
                arrive in volume, references need checking properly, and remote-managed teams need
                clear structure, supervision and a route for people to grow. J.O.A.T. staffs
                and manages teams for international clients as a core service line, so this part of
                the conversation comes from direct experience rather than theory. You can see how we
                do it on our{" "}
                <a href="/services" className="text-gold hover:underline">
                  services page
                </a>{" "}
                and in the{" "}
                <a href="/real-estate-virtual-assistant" className="text-gold hover:underline">
                  real estate virtual assistant
                </a>{" "}
                line built on the same model.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Partners, and how to judge them</h3>
              <p className="mt-3">
                A good local partner shortens your learning curve dramatically. A bad one costs you
                a year and sometimes your market position. The usual failure is choosing on
                enthusiasm: the first person who says yes, is well connected and is available.
                Better filters are whether they have delivered something comparable, whether their
                incentives stay aligned once revenue arrives, whether they will put commitments in
                writing, and what happens to your customers and brand if the relationship ends.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                Marketing and getting to customers
              </h3>
              <p className="mt-3">
                Kenya is a mobile, social, WhatsApp-heavy market. Instagram, TikTok, Facebook and
                LinkedIn all work in their own segments, and paid distribution is comparatively
                affordable, but attention alone converts poorly without a fast, human response.
                Speed of reply is often the deciding factor: the business that answers within
                minutes wins the enquiry that the slower competitor eventually loses.
              </p>
              <p className="mt-3">
                Marketing and lead generation is one of our own service lines, so we can be specific
                about what channels cost, what response systems look like, and what a realistic
                pipeline looks like in your category. Details are on the{" "}
                <a href="/services" className="text-gold hover:underline">
                  services
                </a>{" "}
                and{" "}
                <a href="/products" className="text-gold hover:underline">
                  products
                </a>{" "}
                pages.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Technology and systems</h3>
              <p className="mt-3">
                Whatever you build here has to work on a phone, accept mobile money, and survive
                intermittent connectivity. Local payment integration is usually the first technical
                requirement international businesses discover, followed by a CRM that the team will
                actually use and automation that covers the hours nobody is working. We build
                software, AI automation and internal tooling in-house, so we can tell you what is
                straightforward, what is genuinely hard, and what it typically costs to build here
                rather than abroad.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Challenges worth planning for</h3>
              <p className="mt-3">
                Honest market entry planning names the friction as clearly as the opportunity.
                Collections can be slow, so cashflow planning matters more than in markets with
                tight payment discipline. Competition on price is intense in commodity categories.
                Regulatory and licensing steps take time and vary by sector. Building trust as an
                outsider takes longer than most business plans assume. And there are sectors where
                the practical barriers are high enough that a different route, or a different
                country, is the better answer.
              </p>
              <p className="mt-3">
                We would rather tell you that in the first hour than watch you find it out in year
                two. If Kenya is not the right market for what you are describing, that is a useful
                outcome for a consultation, not a failed one.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">
                Why one conversation saves months
              </h3>
              <p className="mt-3">
                Research online gives you the average. Your decision is not average: it depends on
                your capital, your sector, your risk appetite, your timeline and whether you intend
                to be here in person. A focused session with someone operating in the market gets
                you to the questions that matter for your case, removes the ones that do not apply,
                and gives you a shortlist of things to verify before spending real money. Most
                people leave with a shorter, sharper plan than the one they arrived with.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Director ─────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-navy-deep">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="glass rounded-3xl p-6 sm:p-10 grid lg:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="mx-auto lg:mx-0">
              {DIRECTOR.photo ? (
                <img
                  src={DIRECTOR.photo}
                  alt={
                    DIRECTOR.name
                      ? `${DIRECTOR.name}, ${DIRECTOR.title}`
                      : "The Director of J.O.A.T."
                  }
                  width="160"
                  height="160"
                  loading="lazy"
                  decoding="async"
                  className="w-40 h-40 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-(--joat-gold)/15 flex items-center justify-center">
                  <UserRound className="w-14 h-14 text-(--joat-gold)" />
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
                Your consultation
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Speak directly with the Director
              </h2>
              {DIRECTOR.name && (
                <div className="mt-2 font-semibold text-foreground">
                  {DIRECTOR.name} · {DIRECTOR.title}
                </div>
              )}
              <p className="mt-4 text-muted-foreground leading-relaxed">
                This is not a generic information session or a sales call handed to an account
                manager. Your consultation is a direct conversation with the Director of J.O.A.T.
                Kenya, focused on your specific plans, questions, business idea or move.
              </p>
              {DIRECTOR.bio ? (
                DIRECTOR.bio.map((para) => (
                  <p key={para} className="mt-3 text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))
              ) : (
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  J.O.A.T. has been building and running businesses from Kiambu for over 12
                  years, staffing teams, building software and running marketing for clients in
                  Kenya and abroad. That is the experience the conversation draws on: what it takes
                  to operate here, hire here and sell here, day to day.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startBooking(120)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all"
                >
                  Discuss your plans for Kenya
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={PHONE_HREF}
                  onClick={() => track("phone_cta_clicked", { location: "director" })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:border-(--joat-gold)/50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-(--joat-gold)" />
                  Prefer to talk first? Call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              Why J.O.A.T.
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              A working business here, not a consultancy about here.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              J.O.A.T. (Jack Urban Services Ltd) operates from The Brick Mall on Kiambu Road,
              Thindigua. We provide virtual assistants, AI automation and lead generation, backed by
              in-house software development, media production and children&apos;s digital education
              capabilities, for clients in Kenya and worldwide. Every view you get in a consultation
              comes from running that business in this market.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {TRUST_POINTS.map((t) => (
              <div key={t.label} className="glass rounded-2xl p-6">
                <div className="text-3xl font-bold text-foreground">{t.stat}</div>
                <div className="text-xs uppercase tracking-widest text-gold mt-1">{t.label}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-gold mb-3">
              If you decide to move forward
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A consultation carries no obligation. If it turns out you want help executing, the
              same team can support it: read about our{" "}
              <a href="/services" className="text-gold hover:underline">
                services for staffing, AI automation and lead generation
              </a>
              , our{" "}
              <a href="/products" className="text-gold hover:underline">
                in-house products and software capabilities
              </a>
              , the{" "}
              <a href="/work-with-us" className="text-gold hover:underline">
                engagement packages we work through
              </a>
              , or{" "}
              <a href="/about" className="text-gold hover:underline">
                the story of the company
              </a>
              . For general enquiries that are not consultation bookings, use the{" "}
              <a href="/contact" className="text-gold hover:underline">
                contact page
              </a>
              , and our{" "}
              <a href="/articles" className="text-gold hover:underline">
                insights and articles
              </a>{" "}
              cover how we build and run this work.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-navy-deep">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">FAQ</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Kenya consultation questions, answered.
            </h2>
          </div>
          <div className="space-y-3">
            {CONSULTATION_FAQS.map((f) => (
              <details key={f.q} className="glass rounded-2xl group">
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 font-semibold text-foreground">
                  <span>{f.q}</span>
                  <span className="w-7 h-7 shrink-0 rounded-full bg-(--joat-gold)/20 text-(--joat-gold) flex items-center justify-center text-sm transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-(--border) p-5">
            <ShieldCheck className="w-5 h-5 text-(--joat-gold) shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              These consultations provide strategic and commercial guidance about the Kenyan market.
              They are not legal, immigration, tax, accounting or regulated investment advice, and
              nothing discussed is a guarantee of business success, profitability, investment
              return, or of any permit, visa or licensing outcome. For regulated matters, engage a
              professional licensed in Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="glass rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Explore Kenya with someone who works here.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Bring your plans, your idea, or just your questions. One session is usually enough to
              know whether Kenya belongs in your future, and what to do next if it does.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startBooking(60)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all"
              >
                Book a Kenya Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={PHONE_HREF}
                onClick={() => track("phone_cta_clicked", { location: "footer_cta" })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:border-(--joat-gold)/50 transition-colors"
              >
                <Phone className="w-4 h-4 text-(--joat-gold)" />
                {PHONE_DISPLAY}
              </a>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("whatsapp_clicked", { location: "footer_cta" })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:border-(--joat-gold)/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-(--joat-gold)" />
                  Ask on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile sticky CTA ────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-(--border) bg-card px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
        <a
          href={PHONE_HREF}
          onClick={() => track("phone_cta_clicked", { location: "sticky" })}
          className="inline-flex items-center justify-center gap-2 py-3 rounded-md border border-(--border) text-foreground font-semibold"
        >
          <Phone className="w-4 h-4 text-(--joat-gold)" />
          Call Us
        </a>
        <button
          type="button"
          onClick={() => startBooking(60)}
          className="inline-flex items-center justify-center gap-2 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold"
        >
          Book Consultation
        </button>
      </div>
    </div>
  );
}
