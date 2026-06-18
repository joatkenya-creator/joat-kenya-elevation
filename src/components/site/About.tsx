import { m } from "framer-motion";
import { Target, Eye } from "lucide-react";

export function About() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-(--joat-gold)" />
            Our Story
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
            Built to build. <span className="gradient-text-gold">Powered by technology.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Jack of All Trades began with a simple conviction: great technology, thoughtfully built,
            changes how people live, learn and do business. We set out to design and deliver digital
            products of genuine quality, from the ground up.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Today we operate as a digital innovation studio, developing software and products,
            creating children's digital education content, and powering brands with digital
            marketing and media.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            We don't just deliver projects. We build products people love, stories that teach, and
            campaigns that move, delivered with the cadence of a modern tech company.
          </p>
        </m.div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-14">
          {[
            {
              icon: Target,
              title: "Our Mission",
              text: "Build world-class software and digital products, create children's digital education content, and power brands with modern digital marketing and media.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              text: "To be a globally trusted technology studio where software, education and digital media converge to shape the future.",
            },
          ].map((c, i) => (
            <m.div
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
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
