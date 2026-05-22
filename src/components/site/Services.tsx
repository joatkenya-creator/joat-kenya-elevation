import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  UsersRound,
  Crown,
  Megaphone,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const services = [
  {
    icon: Briefcase,
    title: "Talent Sourcing & Headhunting",
    summary:
      "Identify and attract top-tier professionals across industries, from entry-level to senior leadership.",
    detail:
      "Our regional sourcing engines and curated talent network give us unmatched reach. Every candidate is screened, referenced, and culturally matched before we present them.",
    industries: ["Tech & Engineering", "Healthcare", "Finance", "Hospitality", "Logistics"],
    outcomes: [
      "Time-to-hire under 21 days",
      "92% offer acceptance",
      "12-month retention guarantees",
    ],
  },
  {
    icon: Sparkles,
    title: "Talent Management & Representation",
    summary:
      "Manage and represent individual talent, connecting them with opportunities, partnerships and support.",
    detail:
      "We act as agents and managers, handling deals, brand alignment, career planning and PR for the professionals and creators we represent.",
    industries: ["Creative", "Media", "Sports", "Executive"],
    outcomes: [
      "Brand partnership pipelines",
      "Long-term career roadmaps",
      "Negotiated compensation uplift",
    ],
  },
  {
    icon: UsersRound,
    title: "Staffing & Workforce Solutions",
    summary:
      "Flexible staffing for short-term, contract, and permanent roles with pre-vetted, ready-to-deploy professionals.",
    detail:
      "From single contractors to fully managed teams, we handle sourcing, onboarding, payroll and compliance so you scale without overhead.",
    industries: ["BPO", "Field operations", "Project teams", "Seasonal workforce"],
    outcomes: [
      "Onboarding in 48 hours",
      "100% statutory compliance",
      "Single point of accountability",
    ],
  },
  {
    icon: Crown,
    title: "Executive Search",
    summary: "Specialized recruitment for C-suite, director, and senior leadership roles.",
    detail:
      "Confidential, research-led executive search powered by our deep regional networks and rigorous leadership assessment frameworks.",
    industries: ["Enterprise", "Family-owned business", "Government", "NGO"],
    outcomes: [
      "Confidential mandates",
      "Executive shortlists in 30 days",
      "12-month transition support",
    ],
  },
  {
    icon: Megaphone,
    title: "Creative & Influencer Management",
    summary:
      "Represent content creators, influencers, and media personalities, managing brand deals and growth strategy.",
    detail:
      "We grow audiences, structure deals, and protect brands. Our creators benefit from strategy, legal, finance and PR under one roof.",
    industries: ["Beauty & Lifestyle", "Sports", "Music", "Tech & Gaming"],
    outcomes: [
      "3x average revenue uplift",
      "Long-term brand partnerships",
      "Cross-platform audience growth",
    ],
  },
  {
    icon: GraduationCap,
    title: "Training & Career Development",
    summary:
      "Skills development, onboarding support and coaching so professionals thrive in their roles.",
    detail:
      "Bespoke learning journeys, leadership coaching and continuous upskilling for both the talent we place and corporate clients we serve.",
    industries: ["All sectors", "Tech upskilling", "Leadership development"],
    outcomes: ["Measurable skill uplift", "Onboarding success > 95%", "Career mobility programs"],
  },
];

export function Services() {
  const [i, setI] = useState(0);
  const s = services[i];
  const Icon = s.icon;

  const next = () => setI((v) => (v + 1) % services.length);
  const prev = () => setI((v) => (v - 1 + services.length) % services.length);

  // Auto-rotate one service at a time, like the testimonials carousel.
  // Timer resets whenever `i` changes, so a manual click pauses-then-resumes.
  useEffect(() => {
    const id = setTimeout(() => {
      setI((v) => (v + 1) % services.length);
    }, 5000);
    return () => clearTimeout(id);
  }, [i]);

  return (
    <section id="services" className="relative py-14 lg:py-20 bg-navy-deep">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Services</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">What We Do</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            From executive search and workforce staffing to talent representation and creative
            management, we match the right people with the right opportunities across East Africa.
          </p>
        </motion.div>

        {/* Single auto-rotating service card */}
        <div className="mt-10 sm:mt-14 relative glass rounded-3xl p-5 sm:p-8 lg:p-12 min-h-80 sm:min-h-96 bg-white/8 border border-(--joat-gold)/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-(--joat-red)/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-(--joat-gold)" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{s.summary}</p>
                </div>
              </div>

              <p className="mt-6 text-sm lg:text-base text-foreground/90 leading-relaxed">
                {s.detail}
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold mb-2">
                    Industries served
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.industries.map((x) => (
                      <span
                        key={x}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-foreground/80 border border-white/10"
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold mb-2">
                    Outcomes delivered
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {s.outcomes.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous service"
              className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next service"
              className="w-10 h-10 rounded-full bg-(--joat-red) hover:brightness-110 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {services.map((sv, k) => (
            <button
              key={sv.title}
              aria-label={`Go to ${sv.title}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-8 bg-(--joat-gold)" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
