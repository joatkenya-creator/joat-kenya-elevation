import { m } from "framer-motion";
import { Globe2, Layers, Users2, Briefcase, BadgeCheck, HeartHandshake } from "lucide-react";

const reasons = [
  {
    icon: Globe2,
    title: "Global Innovation Leadership",
    text: "Solutions engineered to global standards and built for worldwide ambition, delivered with the cadence of a modern tech company.",
  },
  {
    icon: Layers,
    title: "Scalable Digital Solutions",
    text: "From startups to enterprises, our platforms grow with you, built on modern, resilient stacks.",
  },
  {
    icon: Users2,
    title: "Youth Empowerment Focus",
    text: "Every product invests in the next generation through education, opportunity and representation.",
  },
  {
    icon: Briefcase,
    title: "Industry Expertise",
    text: "Cross-disciplinary depth in software, digital marketing, media and education, with networks that span markets.",
  },
  {
    icon: BadgeCheck,
    title: "Global Standards",
    text: "Enterprise compliance, security and design quality benchmarked to international SaaS leaders.",
  },
  {
    icon: HeartHandshake,
    title: "Impact-Driven Technology",
    text: "We measure success by lives uplifted, businesses scaled, and futures unlocked.",
  },
];

export function WhyChoose() {
  return (
    <section className="relative py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Why JOAT KENYA</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            Built to deliver. <span className="gradient-text-red">Trusted to scale.</span>
          </h2>
        </m.div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {reasons.map((r, i) => (
            <m.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative glass rounded-2xl p-4 sm:p-6 hover:border-(--joat-gold)/40 transition-all hover:-translate-y-1"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-(--joat-red)/30 to-(--joat-gold)/20 flex items-center justify-center mb-2 sm:mb-4">
                <r.icon className="w-5 h-5 sm:w-6 sm:h-6 text-(--joat-gold)" />
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-foreground leading-tight">
                {r.title}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                {r.text}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
