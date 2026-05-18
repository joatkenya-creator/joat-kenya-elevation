import { motion } from "framer-motion";
import { Target, Eye, Award, TrendingUp } from "lucide-react";

const milestones = [
  { year: "1983", title: "Founded in Nairobi", text: "Born from a simple truth — the right person in the right role changes everything." },
  { year: "2005", title: "Pan-African Expansion", text: "Extended operations across East Africa, partnering with leading enterprises." },
  { year: "2018", title: "Talent Management House", text: "Launched representation services for creatives, athletes, and executives." },
  { year: "2022", title: "Digital Transformation", text: "Entered tech with EdTech, mobile apps, and gamified learning solutions." },
  { year: "2025", title: "Innovation Ecosystem", text: "A full-stack innovation platform: talent, tech, education and immersive experiences." },
];

const stats = [
  { v: "42+", l: "Years Experience" },
  { v: "10K+", l: "Placements Made" },
  { v: "300+", l: "Partner Organizations" },
  { v: "100%", l: "Compliance" },
];

export function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Our Story</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
            Built on relationships. <span className="gradient-text-gold">Powered by talent.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Jack of All Trades was founded on a simple truth: the right person in the right role
            changes everything. We saw organizations struggling to find professionals who could
            truly deliver — and talented individuals unable to reach the opportunities they
            deserved. We built JOAT to close that gap.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Today, we operate as a talent recruitment agency, a talent management house and a
            digital innovation studio — sourcing professionals, building products, and shaping
            Africa's next generation of innovators.
          </p>
        </motion.div>

        {/* Mission / Vision */}
        <div className="grid md:grid-cols-2 gap-6 mt-14">
          {[
            { icon: Target, title: "Our Mission", text: "Bridge talent, technology and opportunity to transform organizations and uplift communities across Africa." },
            { icon: Eye, title: "Our Vision", text: "To be Africa's most trusted innovation ecosystem — where talent, education and digital solutions converge." },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass rounded-2xl p-8 hover:border-[var(--joat-gold)]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--joat-red)]/15 flex items-center justify-center mb-4">
                <c.icon className="w-6 h-6 text-[var(--joat-gold)]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-5 h-5 text-gold" />
            <h3 className="text-2xl font-bold text-foreground">Growth Milestones</h3>
          </div>

          <div className="relative">
            <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--joat-gold)]/40 to-transparent" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex md:items-center gap-6 ${i % 2 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="absolute left-3 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--joat-gold)] ring-4 ring-[var(--joat-gold)]/20" />
                  <div className="md:w-1/2 pl-10 md:pl-0 md:px-10">
                    <div className="glass rounded-xl p-5">
                      <div className="text-[var(--joat-gold)] font-bold text-lg">{m.year}</div>
                      <div className="font-semibold text-foreground mt-1">{m.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{m.text}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
          {stats.map((s) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass rounded-xl p-6 text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold gradient-text-gold flex items-center justify-center gap-1">
                {s.v}
                <TrendingUp className="w-4 h-4 text-gold" />
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
