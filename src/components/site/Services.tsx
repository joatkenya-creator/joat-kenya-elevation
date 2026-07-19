import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ICONS, FALLBACK_SERVICES, type SvcItem } from "@/data/services-catalog";

export function Services() {
  const [list, setList] = useState<SvcItem[]>(FALLBACK_SERVICES);
  const [i, setI] = useState(0);
  const s = list[i];
  const Icon = s.icon;

  const next = () => setI((v) => (v + 1) % list.length);
  const prev = () => setI((v) => (v - 1 + list.length) % list.length);

  // Fetch services from Supabase on mount. Falls back silently to the
  // hard-coded list if the network call fails or the table is empty.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("services")
      .select(
        "name, short_summary, full_description, icon_name, outcomes, industries, display_order",
      )
      .eq("published", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        setList(
          data.map((row) => ({
            icon: ICONS[row.icon_name] ?? ICONS.Sparkles,
            title: row.name,
            summary: row.short_summary,
            detail: row.full_description,
            industries: row.industries ?? [],
            outcomes: row.outcomes ?? [],
          })),
        );
        setI(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-rotate one service at a time, like the testimonials carousel.
  // Timer resets whenever `i` changes, so a manual click pauses-then-resumes.
  useEffect(() => {
    const id = setTimeout(() => {
      setI((v) => (v + 1) % list.length);
    }, 11000);
    return () => clearTimeout(id);
  }, [i, list.length]);

  return (
    <section id="services" className="relative py-14 lg:py-20 bg-navy-deep">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <m.div
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
        </m.div>

        {/* Single auto-rotating service card */}
        <div className="mt-10 sm:mt-14 relative glass rounded-3xl p-5 sm:p-8 lg:p-12 min-h-80 sm:min-h-96 border border-(--joat-gold)/20">
          <AnimatePresence mode="wait">
            <m.div
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
                        className="text-xs px-2.5 py-1 rounded-full bg-black/5 text-foreground/80 border border-(--border)"
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
            </m.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous service"
              className="w-10 h-10 rounded-full glass hover:bg-black/5 flex items-center justify-center"
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
          {list.map((sv, k) => (
            <button
              key={sv.title}
              aria-label={`Go to ${sv.title}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-8 bg-(--joat-gold)" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
