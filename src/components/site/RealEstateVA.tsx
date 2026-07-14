import { m } from "framer-motion";
import { ArrowRight, Zap, Clock, Home, Users, Search, Phone } from "lucide-react";
import { openCalendly } from "@/lib/calendly";
import { ProductCard } from "./Products";
import { realEstateVAProducts, realEstateVAFaqs } from "@/data/real-estate-va";

const stats = [
  { icon: Zap, v: "<5 min", l: "AI Lead Response" },
  { icon: Clock, v: "24/7", l: "ISA Coverage" },
  { icon: Home, v: "MLS + CRM", l: "Ready" },
  { icon: Users, v: "3", l: "VA Tiers" },
];

const whyCards = [
  {
    icon: Zap,
    title: "Speed-to-lead, built in",
    text: "Leads contacted in the first 5 minutes convert far more often than those left waiting. Our AI Starter ISA responds to every new lead instantly, day or night, so none of them go cold.",
  },
  {
    icon: Search,
    title: "Every source, one assistant",
    text: "Zillow, Realtor.com, Facebook/Instagram ads and your website inquiries all route to one assistant that responds, qualifies and logs everything straight into your CRM.",
  },
  {
    icon: Users,
    title: "Grows with your pipeline",
    text: "Start AI-only for instant lead response, then add a dedicated human VA for MLS updates, listing management and transaction coordination as your volume grows.",
  },
];

export function RealEstateVA() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 lg:pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-6"
          >
            <Home className="w-3.5 h-3.5" />
            Real Estate Virtual Assistant · ISA, Listings & Transaction Support
          </m.div>
          <m.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-foreground"
          >
            Real Estate Virtual Assistant <span className="gradient-text-gold">Services</span>
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Hire a real estate virtual assistant built to convert leads faster: a 24/7 AI Inside
            Sales Agent (ISA) for sub-5-minute lead response, or a dedicated human VA for MLS
            listings, CRM management and transaction coordination. Built for agents, brokers and
            teams, wherever your leads come from.
          </m.p>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold glow-red hover:brightness-110 transition-all"
            >
              Talk to Us
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
            >
              See All Plans
            </a>
          </m.div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.l} className="glass rounded-xl p-4 text-center">
                <s.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{s.v}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              Why Agents & Brokers Hire a Real Estate VA
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Fast lead response wins listings.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyCards.map((c, i) => (
              <m.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 hover:border-(--joat-gold)/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-(--joat-red)/15 flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5 text-(--joat-gold)" />
                </div>
                <h3 className="font-bold text-foreground text-lg">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="relative py-24 bg-navy-deep">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              Real Estate VA Plans
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Choose your Real Estate VA plan.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start AI-only for instant lead response, or bring in a dedicated human VA as your
              pipeline grows.
            </p>
          </div>

          <div className="space-y-28 lg:space-y-36">
            {realEstateVAProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">FAQ</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Questions, answered.</h2>
          </div>
          <div className="space-y-3">
            {realEstateVAFaqs.map((f, i) => (
              <m.details
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="glass rounded-2xl group"
              >
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 font-semibold text-foreground">
                  <span>{f.q}</span>
                  <span className="w-7 h-7 rounded-full bg-(--joat-gold)/20 text-(--joat-gold) flex items-center justify-center text-sm transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              </m.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-deep">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="relative overflow-hidden glass rounded-3xl p-10 lg:p-14 text-center">
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Stop losing leads to a slow reply.
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Tell us about your pipeline and we'll recommend the right Real Estate VA plan, no
                obligation.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void openCalendly()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all cursor-pointer"
                >
                  Book a Free Call
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="tel:+254142378150"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md glass text-foreground font-semibold hover:bg-black/5 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  +254 142 378 150
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
