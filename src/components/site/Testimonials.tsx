import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Play } from "lucide-react";

const testimonials = [
  {
    initials: "DB",
    name: "Donnel Blackman",
    role: "CEO, NairobiItalianice",
    quote:
      "J.O.A.T. Kenya placed three exceptional hires for us within two weeks. The quality of candidates and speed of delivery was unlike any agency we've worked with.",
  },
  {
    initials: "ER",
    name: "Ericca J. Ricketts",
    role: "Founder, JustRightJerk",
    quote:
      "JOAT didn't just find me a job — they managed my entire career transition. Their representation opened doors I didn't even know existed.",
  },
  {
    initials: "MK",
    name: "Michael Kamau",
    role: "Managing Director, Apex Ltd",
    quote:
      "We've used several agencies across East Africa. JOAT is the only one that truly understands what a great executive hire looks like — and delivers.",
  },
  {
    initials: "AN",
    name: "Amara Njoroge",
    role: "Content Creator & Influencer",
    quote:
      "As a creative, finding the right representation felt impossible — until JOAT. They understood my brand, negotiated better deals, and actually cared about my growth.",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const next = () => setI((v) => (v + 1) % testimonials.length);
  const prev = () => setI((v) => (v - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[i];

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Testimonials</div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">What Our Clients Say</h2>
        </div>

        <div className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          {/* Main quote */}
          <div className="lg:col-span-3 relative glass rounded-3xl p-8 lg:p-12 min-h-[280px]">
            <div className="absolute top-6 left-8 text-7xl font-serif text-(--joat-gold)/30 select-none">
              "
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="flex items-center gap-1 mb-4 text-(--joat-gold)">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl lg:text-2xl text-foreground leading-relaxed font-medium">
                  {t.quote}
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-(--joat-red) to-(--joat-gold) flex items-center justify-center font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="w-10 h-10 rounded-full bg-(--joat-red) hover:brightness-110 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Video testimonial placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass rounded-3xl p-6 flex items-center gap-5"
          >
            <div className="relative w-32 h-20 rounded-xl bg-linear-to-br from-(--joat-navy-deep) to-(--joat-red)/40 flex items-center justify-center shrink-0">
              <Play className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <div className="font-bold text-foreground">Watch client stories</div>
              <div className="text-sm text-muted-foreground">
                Video testimonials from partners across East Africa — coming soon.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, k) => (
            <button
              key={k}
              aria-label={`Go to testimonial ${k + 1}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-(--joat-gold)" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
