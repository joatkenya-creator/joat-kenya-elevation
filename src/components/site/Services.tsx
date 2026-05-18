import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles, UsersRound, Crown, Megaphone, GraduationCap, ChevronDown } from "lucide-react";

const services = [
  {
    icon: Briefcase,
    title: "Talent Sourcing & Headhunting",
    summary: "Identify and attract top-tier professionals across industries — from entry-level to senior leadership.",
    detail: "Our regional sourcing engines and curated talent network give us unmatched reach. Every candidate is screened, referenced, and culturally matched before we present them.",
    industries: ["Tech & Engineering", "Healthcare", "Finance", "Hospitality", "Logistics"],
    outcomes: ["Time-to-hire under 21 days", "92% offer acceptance", "12-month retention guarantees"],
  },
  {
    icon: Sparkles,
    title: "Talent Management & Representation",
    summary: "Manage and represent individual talent — connecting them with opportunities, partnerships and support.",
    detail: "We act as agents and managers — handling deals, brand alignment, career planning and PR for the professionals and creators we represent.",
    industries: ["Creative", "Media", "Sports", "Executive"],
    outcomes: ["Brand partnership pipelines", "Long-term career roadmaps", "Negotiated compensation uplift"],
  },
  {
    icon: UsersRound,
    title: "Staffing & Workforce Solutions",
    summary: "Flexible staffing for short-term, contract, and permanent roles with pre-vetted, ready-to-deploy professionals.",
    detail: "From single contractors to fully managed teams, we handle sourcing, onboarding, payroll and compliance so you scale without overhead.",
    industries: ["BPO", "Field operations", "Project teams", "Seasonal workforce"],
    outcomes: ["Onboarding in 48 hours", "100% statutory compliance", "Single point of accountability"],
  },
  {
    icon: Crown,
    title: "Executive Search",
    summary: "Specialized recruitment for C-suite, director, and senior leadership roles.",
    detail: "Confidential, research-led executive search powered by our deep regional networks and rigorous leadership assessment frameworks.",
    industries: ["Enterprise", "Family-owned business", "Government", "NGO"],
    outcomes: ["Confidential mandates", "Executive shortlists in 30 days", "12-month transition support"],
  },
  {
    icon: Megaphone,
    title: "Creative & Influencer Management",
    summary: "Represent content creators, influencers, and media personalities — managing brand deals and growth strategy.",
    detail: "We grow audiences, structure deals, and protect brands. Our creators benefit from strategy, legal, finance and PR under one roof.",
    industries: ["Beauty & Lifestyle", "Sports", "Music", "Tech & Gaming"],
    outcomes: ["3x average revenue uplift", "Long-term brand partnerships", "Cross-platform audience growth"],
  },
  {
    icon: GraduationCap,
    title: "Training & Career Development",
    summary: "Skills development, onboarding support and coaching so professionals thrive in their roles.",
    detail: "Bespoke learning journeys, leadership coaching and continuous upskilling for both the talent we place and corporate clients we serve.",
    industries: ["All sectors", "Tech upskilling", "Leadership development"],
    outcomes: ["Measurable skill uplift", "Onboarding success > 95%", "Career mobility programs"],
  },
];

export function Services() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="services" className="relative py-24 lg:py-32 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Services</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            What We Do
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            From executive search and workforce staffing to talent representation and creative
            management — we match the right people with the right opportunities across East Africa.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-2 gap-4">
          {services.map((s, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full p-6 flex items-start gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--joat-red)]/15 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5 text-[var(--joat-gold)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-[5.25rem] space-y-4">
                        <p className="text-sm text-foreground/90 leading-relaxed">{s.detail}</p>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-gold mb-2">Industries served</div>
                          <div className="flex flex-wrap gap-2">
                            {s.industries.map((x) => (
                              <span key={x} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-foreground/80 border border-white/10">{x}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-gold mb-2">Outcomes delivered</div>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            {s.outcomes.map((o) => <li key={o}>{o}</li>)}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
