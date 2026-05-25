import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Globe,
  Share2,
  Workflow,
  BarChart3,
  Rocket,
  Star,
  Check,
  Clock,
  Layers,
  Phone,
  Sparkles,
} from "lucide-react";
import { openCalendly } from "@/lib/calendly";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/work-with-us")({
  component: WorkWithUsPage,
  head: () =>
    seo({
      title: "AI Automation Services in Kenya | Work With JOAT KENYA",
      description:
        "Run your business content from a single chat. JOAT Kenya connects your website and social channels to an AI-powered Telegram bot with flexible automation packages.",
      path: "/work-with-us",
  }),
});

const packages = [
  {
    name: "Foundation",
    tagline: "Run Your Website From a Chat",
    description:
      "For businesses that want their website to reflect real-time changes without touching a dashboard.",
    features: [
      "Dedicated Telegram bot",
      "Natural-language AI parsing",
      "CMS for products, prices, menus",
      "Page-section updates",
      "Website integration (existing or JOAT-built)",
      "60 CMS actions / month",
      "Change audit log",
      "30-minute onboarding",
    ],
    accent: "gold" as const,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    tagline: "CMS + Social, From One Conversation",
    description:
      "For businesses that want a consistent, active social presence without the daily effort.",
    features: [
      "Everything in Foundation",
      "Instagram posting",
      "AI-generated captions & hashtags",
      "Post approval flow",
      "Media library",
      "30 social posts / month",
      "100 CMS actions / month",
      "Monthly analytics report",
      "60-minute onboarding call",
    ],
    accent: "red" as const,
  },
  {
    name: "Scale",
    tagline: "Full Automation, Across Every Channel",
    description:
      "For businesses running multiple platforms and needing a fully managed, hands-off automation system.",
    features: [
      "Everything in Growth",
      "Multi-platform: IG, TikTok, LinkedIn, Facebook",
      "Unlimited CMS / social actions",
      "Custom AI workflows",
      "Advanced analytics dashboard",
      "Full website CMS maintenance",
      "4-hour priority support",
      "Dedicated account manager",
      "Quarterly strategy reviews",
    ],
    accent: "gold" as const,
  },
];

const services = [
  {
    icon: Bot,
    title: "AI-Powered Telegram Bot",
    text: "Dedicated bot, natural-language parsing via Llama 3.1 Nemotron 70B, confidence scoring, audit logs and instant Telegram confirmation on every action.",
  },
  {
    icon: Globe,
    title: "Website CMS Integration",
    text: "Live updates for products, menus, pricing and page sections. Works with JOAT-built sites or existing WordPress, Webflow and custom stacks.",
  },
  {
    icon: Share2,
    title: "Social Media Automation",
    text: "Photo and message posting to Instagram with AI-generated captions, an optional approval flow, and Scale-tier cross-posting across IG, TikTok, LinkedIn and Facebook.",
  },
  {
    icon: Workflow,
    title: "Custom Workflow Development",
    text: "Scale-exclusive. Order confirmations, customer follow-ups, inventory alerts, brand-voice training and bespoke automations tailored to how your team actually operates.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    text: "Activity logs across every tier, social metrics from Growth and an advanced dashboard on Scale with reach, engagement and content performance.",
  },
  {
    icon: Rocket,
    title: "Onboarding & Setup",
    text: "Bot creation, website integration, social connection and guided setup. Your system goes live in 3 to 5 business days.",
  },
];

const stats = [
  { v: "3–5", l: "Days to Live", icon: Clock },
  { v: "0", l: "Dashboards", icon: Layers },
  { v: "60%", l: "Time Saved Weekly", icon: BarChart3 },
  { v: "24/7", l: "Always On", icon: Sparkles },
];

const testimonials = [
  {
    name: "Samuel Kariuki",
    role: "CEO, Apex Logistics",
    quote:
      "We went from barely getting calls to having a consistent stream of new business inquiries every week. JOAT built us a real system, not just a website.",
  },
  {
    name: "Naomi Wanjiru",
    role: "Director, NovaBuild",
    quote:
      "The Google Ads campaign alone paid for itself in the first month. We signed two new corporate clients we would never have reached on our own.",
  },
];

const faqs = [
  {
    q: "Do I need any code or software knowledge?",
    a: "No. If you can use Telegram, you can run your business with us. Send a message; the bot handles the rest.",
  },
  {
    q: "Can my existing website connect?",
    a: "Yes. We connect to existing sites via REST API or webhook (WordPress, Webflow, custom) without rebuilding anything.",
  },
  {
    q: "What if the bot misunderstands me?",
    a: "Our AI confidence scoring catches uncertain commands and asks for clarification before publishing anything live.",
  },
  {
    q: "What's the contract commitment?",
    a: "Everything is month-to-month. No lock-in. Cancel or change packages whenever you like.",
  },
  {
    q: "Can I upgrade or downgrade packages?",
    a: "Yes. Changes take effect from your next billing cycle.",
  },
  {
    q: "Is this only available in Kenya?",
    a: "No. The platform is location-agnostic and we have clients globally. Onboarding is fully remote.",
  },
];

function WorkWithUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative pt-28 lg:pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to JOAT KENYA
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Work With Us · AI Automation Services
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] text-foreground"
          >
            Run Your Business Content From a <span className="gradient-text-gold">Single Chat</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            JOAT Kenya connects your website and social channels to an AI-powered Telegram bot.
            Update prices, publish posts, upload media; just send a message. We handle the rest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => void openCalendly()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold glow-red hover:brightness-110 transition-all cursor-pointer"
            >
              Book a Strategy Call
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
            >
              See All Packages
            </a>
          </motion.div>

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

      {/* Packages */}
      <section id="packages" className="relative py-24 bg-navy-deep">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
              Three Automation Packages
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Pick the tier that fits how you ship.
            </h2>
            <p className="mt-4 text-muted-foreground">
              All packages are month-to-month with no long-term contracts. Upgrade or downgrade from
              your next billing cycle.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {packages.map((p, i) => {
              const isPopular = p.badge === "Most Popular";
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative glass rounded-3xl p-7 lg:p-8 ${
                    isPopular
                      ? "border-(--joat-gold)/60 shadow-[0_30px_60px_-30px_oklch(0.78_0.10_80/0.45)]"
                      : ""
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {p.badge}
                    </div>
                  )}
                  <div
                    className={`text-xs uppercase tracking-widest mb-2 ${
                      p.accent === "red" ? "text-(--joat-red)" : "text-gold"
                    }`}
                  >
                    {p.tagline}
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{p.name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            p.accent === "red" ? "text-(--joat-red)" : "text-(--joat-gold)"
                          }`}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => void openCalendly()}
                    className={`mt-7 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-md font-semibold transition-all hover:brightness-110 cursor-pointer ${
                      isPopular
                        ? "bg-(--joat-gold) text-(--joat-navy-deep)"
                        : "glass text-foreground hover:bg-white/8"
                    }`}
                  >
                    Book Strategy Call
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            No long-term contracts · cancel anytime · 3–5 day setup
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">What We Do</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Six capabilities, one chat.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 hover:border-(--joat-gold)/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-(--joat-red)/15 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-(--joat-gold)" />
                </div>
                <h3 className="font-bold text-foreground text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-navy-deep">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
              From Real Clients
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Built for businesses that ship.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-7">
                <div className="flex gap-1 text-(--joat-gold) mb-3">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-foreground leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="mt-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-linear-to-br from-(--joat-red) to-(--joat-gold) flex items-center justify-center font-bold text-white">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
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
            {faqs.map((f, i) => (
              <motion.details
                key={i}
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
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-deep">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="relative overflow-hidden glass rounded-3xl p-10 lg:p-14 text-center">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-(--joat-red)/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-(--joat-gold)/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Book a free 30-minute strategy call.
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Walk through your current setup with our team. We'll map exactly what your
                automation system would look like, no obligation.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => void openCalendly()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all cursor-pointer"
                >
                  Book Free Strategy Call
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="tel:+254142378150"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md glass text-foreground font-semibold hover:bg-white/8 transition-all"
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
