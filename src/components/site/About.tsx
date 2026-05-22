import { motion } from "framer-motion";
import { Target, Eye, TrendingUp } from "lucide-react";

const stats = [
  { v: "40+", l: "Years Experience" },
  { v: "500+", l: "Placements Made" },
  { v: "50+", l: "Partner Organizations" },
  { v: "98%", l: "Client Retention" },
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
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-(--joat-gold)" />
            Our Story · Since 1983
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
            Built on relationships. <span className="gradient-text-gold">Powered by talent.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Jack of All Trades was founded on a simple truth: the right person in the right role
            changes everything. We saw organizations struggling to find professionals who could
            truly deliver, and talented individuals unable to reach the opportunities they deserved.
            We built JOAT to close that gap.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Today, we operate as a talent recruitment agency, a talent management house and a
            digital innovation studio, sourcing professionals, building products, and shaping
            Africa's next generation of innovators.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            At JOAT, we don't just fill roles. We build careers and transform organizations one
            great hire at a time.
          </p>
        </motion.div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-14">
          {[
            {
              icon: Target,
              title: "Our Mission",
              text: "Bridge talent, technology and opportunity to transform organizations and uplift communities across Africa.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              text: "To be Africa's most trusted innovation ecosystem, where talent, education and digital solutions converge.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass rounded-2xl p-4 sm:p-8 hover:border-(--joat-gold)/40 transition-colors"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-(--joat-red)/15 flex items-center justify-center mb-2 sm:mb-4">
                <c.icon className="w-5 h-5 sm:w-6 sm:h-6 text-(--joat-gold)" />
              </div>
              <h3 className="text-base sm:text-2xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-1.5 sm:mt-3 text-xs sm:text-base text-muted-foreground leading-relaxed">
                {c.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-14">
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
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
