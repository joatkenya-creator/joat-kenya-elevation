import { ArrowRight } from "lucide-react";

// Light, centered hero (Seamless-IT style). Background is the uploaded image at
// /hero-bg.png under a translucent warm-white wash, so the geometric pattern
// reads softly behind the content. Framer-free so the headline (LCP element)
// paints immediately; if the image file isn't present yet, the warm-white wash
// gracefully shows the page background.
const stats = [
  { value: "42+", label: "Years in business" },
  { value: "5", label: "Service lines" },
  { value: "3", label: "In-house products" },
  { value: "100%", label: "Delivered in-house" },
];

export function Hero() {
  return (
    <section id="home" className="relative pt-32 lg:pt-44 pb-20 lg:pb-28 overflow-hidden">
      {/* Uploaded geometric background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        aria-hidden="true"
      />
      {/* Translucent warm-white wash over the image */}
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.975 0.01 85 / 0.25)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-5 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-card px-4 py-1.5 text-xs font-medium text-gold mb-6">
          Digital Innovation Studio
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] text-foreground">
          Transforming Ideas into <span className="text-(--joat-red)">Digital Reality</span>
        </h1>

        <p className="mt-5 text-lg lg:text-2xl font-semibold text-foreground/90">
          Software, AI, Media &amp; Digital Marketing, built in-house by J.O.A.T. Kenya.
        </p>

        <p className="mt-4 text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We deliver software development, AI solutions, media production and digital marketing that
          drive real growth for businesses across Kenya and beyond.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold hover:brightness-110 transition-all"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-(--border) bg-card text-foreground font-semibold hover:border-(--joat-red)/40 transition-all"
          >
            Explore Services
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl lg:text-4xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
