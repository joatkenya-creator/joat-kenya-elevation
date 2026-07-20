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
            Today we operate as an elite virtual assistant, AI automation and lead-generation
            partner, staffing businesses with AI-run and human VAs, automating operations with AI,
            and running marketing that fills pipelines, backed by in-house software, media and
            education capabilities.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            We don't just deliver projects. We embed elite talent and AI into your operations,
            generate the leads that grow your business, and build the technology behind it all,
            delivered with the cadence of a modern tech company.
          </p>
        </m.div>

        {/* Mission / Vision */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-14">
          {[
            {
              icon: Target,
              title: "Our Mission",
              text: "Deliver elite virtual assistants, AI automation and lead generation that grow our clients' businesses, backed by world-class in-house software, media and education capabilities.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              text: "To be the trusted elite VA, AI automation and lead-generation partner for growing businesses worldwide.",
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
