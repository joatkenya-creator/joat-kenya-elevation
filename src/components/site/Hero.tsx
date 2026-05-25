import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
// Globe graphic hidden per request — kept here for easy re-enabling.
// import { GlobeGraphic } from "./GlobeGraphic";

export function Hero() {
  return (
    <section id="home" className="relative pt-28 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* Globe graphic hidden per request */}

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Your Digital Transformation Partner
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] text-foreground"
          >
            Transforming the world through <span className="gradient-text-gold">Innovation</span>,{" "}
            <span className="gradient-text-red">Technology</span> &amp; Digital Solutions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            Empowering businesses, communities, and future innovators through cutting-edge
            technology, digital education, and immersive digital experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#products"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold glow-red hover:brightness-110 transition-all"
            >
              Explore Solutions{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
            >
              Partner With Us
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md glass text-foreground font-semibold hover:bg-white/8 transition-all"
            >
              Get Started
            </a>
          </motion.div>
        </div>

        {/* Floating orbital metrics card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="lg:col-span-5 relative hidden lg:block"
        >
          <div className="relative aspect-square max-w-md mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-(--joat-gold)/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-(--joat-red)/30"
            />
            <div className="absolute inset-16 rounded-full glass flex items-center justify-center text-center p-6">
              <div>
                <div className="text-5xl font-bold gradient-text-gold">42+</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                  Years building the digital future
                </div>
              </div>
            </div>

            {[
              { t: "AI & Cloud", x: "-10%", y: "10%" },
              { t: "EdTech", x: "85%", y: "20%" },
              { t: "Marketing", x: "-5%", y: "75%" },
              { t: "Media", x: "80%", y: "78%" },
            ].map((b, i) => (
              <motion.div
                key={b.t}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: [0, -8, 0] }}
                transition={{
                  delay: 0.6 + i * 0.15,
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                style={{ left: b.x, top: b.y }}
                className="absolute glass px-3 py-1.5 rounded-full text-xs font-semibold text-foreground"
              >
                {b.t}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
