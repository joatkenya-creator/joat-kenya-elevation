import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TESTIMONIALS_STALE_TIME = 5 * 60 * 1000;

type TItem = { initials: string; name: string; role: string; quote: string };

// Hard-coded fallback — used if the Supabase fetch fails or returns empty so
// the carousel never goes blank for a visitor.
const FALLBACK_TESTIMONIALS: TItem[] = [
  {
    initials: "SM",
    name: "Sarah Mitchell",
    role: "Product Lead, Crestline Ventures · San Francisco",
    quote:
      "BioBiz quietly replaced half my networking tools. I drop a QR and forget about it. Leads always reach me, and the AI meeting summaries hand me action items before I've even closed my laptop. It's become the one app I open every day.",
  },
  {
    initials: "JW",
    name: "Jacqueline Wanjiru",
    role: "Founder, Heri Health · Nairobi",
    quote:
      "BioBiz changed how I network. The digital card means I never miss a follow-up, and the AI meeting notes keep me sharp in every client conversation. It's the small upgrade that has quietly grown my practice.",
  },
  {
    initials: "MR",
    name: "Marcus Reynolds",
    role: "Marketing Director, Northbound Apparel · New York",
    quote:
      "Their AI-driven marketing work reshaped how we launch products. We're now producing more brand-consistent creative in a week than we used to in a quarter.",
  },
  {
    initials: "BM",
    name: "Brian Mwangi",
    role: "Sales Director, Tatu Capital · Nairobi",
    quote:
      "My team swapped paper cards for BioBiz QR scans and the difference is huge. We see who saved our card, the AI summarizes every meeting, and we close leads we used to lose. It's the most useful tool I've added all year.",
  },
  {
    initials: "AC",
    name: "Amelia Carter",
    role: "Mom of two · Atlanta",
    quote:
      "Amare's Big Planet is the rare show I'm happy to let my kids watch. The stories make learning the alphabet, kindness and curiosity feel like an adventure. My five-year-old asks for it by name and remembers what he learned the next day.",
  },
  {
    initials: "JO",
    name: "Joseph Otieno",
    role: "Primary Teacher, Kilimani Academy · Nairobi",
    quote:
      "I show Amare's Big Planet to my Grade 1 class and the engagement is instant. The lessons are clear, the characters are lovable, and the children come back excited about reading. It's a brilliant teaching companion.",
  },
  {
    initials: "FA",
    name: "Faith Achieng",
    role: "Mother of three · Nakuru",
    quote:
      "My kids will skip cartoons to watch Amare. The content is warm, educational and grounded in the values I want them to grow up with. As a parent it's a relief to have something this good made for them.",
  },
];

function makeInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatRole(row: {
  author_role: string | null;
  company: string | null;
  location: string | null;
}) {
  const left = [row.author_role, row.company].filter(Boolean).join(", ");
  return [left, row.location].filter(Boolean).join(" · ");
}

// If the network call fails or the table is empty, returns null so the
// hard-coded fallback stays in place and the section is never blank.
async function fetchTestimonials(): Promise<TItem[] | null> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("author_name, author_role, company, location, quote, display_order")
    .eq("featured", true)
    .order("display_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return data.map((d) => ({
    initials: makeInitials(d.author_name),
    name: d.author_name,
    role: formatRole(d),
    quote: d.quote,
  }));
}

export function Testimonials() {
  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    staleTime: TESTIMONIALS_STALE_TIME,
  });
  const list = data ?? FALLBACK_TESTIMONIALS;
  const [i, setI] = useState(0);
  const next = () => setI((v) => (v + 1) % list.length);
  const prev = () => setI((v) => (v - 1 + list.length) % list.length);
  const t = list[i] ?? list[0];

  // Jump back to the first testimonial once the live list replaces the fallback.
  useEffect(() => {
    if (data && data.length > 0) setI(0);
  }, [data]);

  // Auto-rotate one testimonial at a time. Timer resets on manual interaction.
  useEffect(() => {
    const id = setTimeout(() => {
      setI((v) => (v + 1) % list.length);
    }, 11000);
    return () => clearTimeout(id);
  }, [i, list.length]);

  return (
    <section className="relative py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Testimonials</div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">What Our Clients Say</h2>
        </div>

        <div className="relative">
          {/* Main quote */}
          <div className="relative glass rounded-3xl p-8 lg:p-12 min-h-[280px]">
            <div className="absolute top-6 left-8 text-7xl font-serif text-(--joat-gold)/30 select-none">
              "
            </div>
            <AnimatePresence mode="wait">
              <m.div
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
                  <div className="w-12 h-12 rounded-full bg-(--joat-red) flex items-center justify-center font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </m.div>
            </AnimatePresence>

            <div className="absolute bottom-6 right-6 flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-10 h-10 rounded-full glass hover:bg-black/5 flex items-center justify-center"
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
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {list.map((_, k) => (
            <button
              key={k}
              aria-label={`Go to testimonial ${k + 1}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-(--joat-gold)" : "w-1.5 bg-foreground/20"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
