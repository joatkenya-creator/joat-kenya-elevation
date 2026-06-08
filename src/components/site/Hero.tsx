import { ArrowRight, Sparkles } from "lucide-react";
// Globe graphic hidden per request — kept here for easy re-enabling.
// import { GlobeGraphic } from "./GlobeGraphic";

// The Hero is the LCP (Largest Contentful Paint) element. It is intentionally
// framer-free: the headline renders at full opacity immediately so the browser
// can record LCP the instant the markup paints — no JS animation library on the
// critical path, no opacity:0 entrance that would postpone LCP. The decorative
// orbital card (desktop only) uses pure-CSS keyframe animations, which run on
// the compositor thread and therefore don't add to INP (main-thread work).
export function Hero() {
  return (
    <section id="home" className="relative pt-28 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* Globe graphic hidden per request */}

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-gold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Your Digital Transformation Partner
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] text-foreground">
            Transforming the world through <span className="gradient-text-gold">Innovation</span>,{" "}
            <span className="gradient-text-red">Technology</span> &amp; Digital Solutions
          </h1>

          <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Empowering businesses, communities, and future innovators through cutting-edge
            technology, digital education, and immersive digital experiences.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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
          </div>
        </div>

        {/* Floating orbital metrics card — decorative, desktop only. All motion
            here is CSS (see .hero-spin / .hero-float in styles.css), so it never
            touches the JS main thread. */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="hero-spin absolute inset-0 rounded-full border border-(--joat-gold)/30" />
            <div className="hero-spin-reverse absolute inset-8 rounded-full border border-(--joat-red)/30" />
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
              <div
                key={b.t}
                style={{ left: b.x, top: b.y, animationDelay: `${i * 0.4}s` }}
                className="hero-float absolute glass px-3 py-1.5 rounded-full text-xs font-semibold text-foreground"
              >
                {b.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
