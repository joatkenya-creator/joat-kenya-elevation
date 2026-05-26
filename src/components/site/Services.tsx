import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Megaphone,
  Clapperboard,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Software Development",
    summary:
      "Custom mobile, web and AI products, designed, built and delivered end-to-end by our in-house engineering team.",
    detail:
      "From discovery to launch we build production-grade software (native mobile, web apps, AI integrations and edge backends) the way modern tech companies do.",
    industries: ["Mobile apps", "Web platforms", "AI integrations", "APIs & backends"],
    outcomes: [
      "Launch in weeks, not quarters",
      "Production-grade quality",
      "Scalable modern stacks",
    ],
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    summary: "Generative campaigns, content and ads that grow brands across every major platform.",
    detail:
      "We orchestrate AI and creative talent into brand-consistent campaigns, social content and paid ads, generated and optimized in hours rather than weeks.",
    industries: ["Social media", "Paid ads", "Brand campaigns", "Product launches"],
    outcomes: ["Faster creative cycles", "Multi-platform reach", "Performance-driven growth"],
  },
  {
    icon: Clapperboard,
    title: "Media & Content Production",
    summary:
      "Animation, video and visual content, from 3D in Blender to brand explainers, produced in-house.",
    detail:
      "Our media pipeline turns ideas into film-quality assets: character animation, motion graphics, explainers and content series that work across products, classrooms and brands.",
    industries: ["Animation & 3D", "Explainers", "Brand films", "Content series"],
    outcomes: ["Film-quality output", "Reusable asset libraries", "Consistent brand worlds"],
  },
  {
    icon: GraduationCap,
    title: "Children's Digital Education",
    summary: "Story-led educational content and learning experiences for young audiences.",
    detail:
      "We design and produce curriculum-aligned digital content (animated series, interactive activities and learning games) that make early learning joyful and effective.",
    industries: ["Animated series", "Interactive learning", "Learning games", "Curriculum content"],
    outcomes: ["Curriculum-aligned", "Engaging for ages 1–8", "Literacy & STEM outcomes"],
  },
  {
    icon: Sparkles,
    title: "AI Solutions",
    summary:
      "AI features and automations, transcription, translation and agents, built into real products.",
    detail:
      "We integrate Claude, OpenRouter and image models into production workflows: meeting summaries, live translation, content generation and agentic automation.",
    industries: ["AI features", "Automation", "Transcription & translation", "Agents"],
    outcomes: ["Smarter products", "Automated workflows", "Cutting-edge capabilities"],
  },
];

export function Services() {
  const [i, setI] = useState(0);
  const s = services[i];
  const Icon = s.icon;

  const next = () => setI((v) => (v + 1) % services.length);
  const prev = () => setI((v) => (v - 1 + services.length) % services.length);

  // Auto-rotate one service at a time, like the testimonials carousel.
  // Timer resets whenever `i` changes, so a manual click pauses-then-resumes.
  useEffect(() => {
    const id = setTimeout(() => {
      setI((v) => (v + 1) % services.length);
    }, 5000);
    return () => clearTimeout(id);
  }, [i]);

  return (
    <section id="services" className="relative py-14 lg:py-20 bg-navy-deep">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Services</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">What We Do</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            From software development and AI to digital marketing, media production and children's
            digital education, we design and deliver the products, content and campaigns that move
            modern brands forward.
          </p>
        </motion.div>

        {/* Single auto-rotating service card */}
        <div className="mt-10 sm:mt-14 relative glass rounded-3xl p-5 sm:p-8 lg:p-12 min-h-80 sm:min-h-96 bg-white/8 border border-(--joat-gold)/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-(--joat-red)/15 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-(--joat-gold)" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{s.summary}</p>
                </div>
              </div>

              <p className="mt-6 text-sm lg:text-base text-foreground/90 leading-relaxed">
                {s.detail}
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold mb-2">
                    Industries served
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.industries.map((x) => (
                      <span
                        key={x}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-foreground/80 border border-white/10"
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold mb-2">
                    Outcomes delivered
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    {s.outcomes.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous service"
              className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next service"
              className="w-10 h-10 rounded-full bg-(--joat-red) hover:brightness-110 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {services.map((sv, k) => (
            <button
              key={sv.title}
              aria-label={`Go to ${sv.title}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-8 bg-(--joat-gold)" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
