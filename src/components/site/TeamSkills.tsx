import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const skills = [
  { label: "Software Engineering", level: "Full-stack · mobile · AI" },
  { label: "Product Design", level: "UX · UI · brand systems" },
  { label: "Talent Acquisition", level: "Tech · creative · executive" },
  { label: "3D & Animation", level: "Blender · Roblox · motion" },
  { label: "AI Operations", level: "Claude · OpenRouter · agents" },
  { label: "Digital Marketing", level: "Generative · social · ads" },
  { label: "Game Development", level: "Roblox studio · live ops" },
];

export function TeamSkills() {
  return (
    <section className="relative py-16 lg:py-24 bg-[oklch(0.96_0.012_85)] text-[oklch(0.18_0.035_265)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between gap-4 mb-6 sm:mb-8 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[oklch(0.55_0.18_27)] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Skills on the team
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
              Every discipline you need to ship.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[oklch(0.35_0.03_265)] max-w-md">
            We've built JOAT around the kind of multi-skilled team that the name promises; every
            project lands with the right specialists in the room.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {skills.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
              className="rounded-xl p-3 sm:p-4 bg-white border border-[oklch(0.18_0.035_265/0.1)] shadow-sm hover:border-[oklch(0.78_0.10_80)] transition-colors"
            >
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-[11px] uppercase tracking-wider text-[oklch(0.55_0.18_27)] mt-1">
                {s.level}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
