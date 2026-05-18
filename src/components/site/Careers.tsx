import { motion } from "framer-motion";
import {
  Briefcase,
  Heart,
  Coffee,
  Rocket,
  Wrench,
  ExternalLink,
  Sparkles,
  MapPin,
  Search,
} from "lucide-react";

const culture = [
  { icon: Heart, title: "People First", text: "We invest in growth, mentorship, and well-being." },
  { icon: Rocket, title: "Real Ownership", text: "Ship work that touches millions of lives." },
  {
    icon: Coffee,
    title: "Hybrid by Design",
    text: "Modern offices in Thindigua + remote-friendly teams.",
  },
  {
    icon: Wrench,
    title: "Equipped for the Work",
    text: "A multi-skilled team — engineers, designers, marketers, recruiters — armed with the tools and training to ship any project end-to-end.",
  },
];

const skills = [
  { label: "Software Engineering", level: "Full-stack · mobile · AI" },
  { label: "Product Design", level: "UX · UI · brand systems" },
  { label: "Talent Acquisition", level: "Tech · creative · executive" },
  { label: "3D & Animation", level: "Blender · Roblox · motion" },
  { label: "AI Operations", level: "Claude · OpenRouter · agents" },
  { label: "Digital Marketing", level: "Generative · social · ads" },
  { label: "Game Development", level: "Roblox studio · live ops" },
  { label: "Compliance & Ops", level: "ISO · NEMA · KRA · payroll" },
];

const categories = [
  "Tech & Software",
  "Talent Outsourcing",
  "Creative & Influencer",
  "Operations",
  "EdTech & Curriculum",
  "Internships",
];

export function Careers() {
  return (
    <section id="careers" className="relative py-24 lg:py-32 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Join Our Team</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            Build your future <span className="gradient-text-gold">with J.O.A.T.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            We're always looking for creative minds, problem solvers and innovators who want to make
            a real impact across industries. Every open role at JOAT, our partners and the wider
            East African market lives on one platform — Majobo Kenya.
          </p>
        </motion.div>

        {/* Live jobs CTA — links to Majobo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 relative overflow-hidden rounded-3xl border border-(--glass-border) glass p-8 lg:p-12"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-(--joat-red)/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-(--joat-gold)/20 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Live opportunities · powered by Majobo Kenya
              </div>
              <h3 className="text-2xl lg:text-4xl font-bold text-foreground leading-tight">
                1,000+ opportunities across East Africa — refreshed daily.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Every open role flows through Majobo Kenya, where AI categorizes posts the moment
                they go live and matches them to nearby workers. Browse, filter and apply on Majobo.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass text-foreground/85"
                  >
                    <Briefcase className="w-3 h-3 text-gold" />
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="https://www.majobokenya.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold glow-red hover:brightness-110 transition-all"
                >
                  Browse jobs on Majobo
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold hover:brightness-110 transition-all"
                >
                  Join Talent Network
                </a>
              </div>
            </div>

            {/* Mock browser preview of Majobo */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-(--joat-gold)/25 via-transparent to-(--joat-red)/25 blur-2xl" />
              <div className="relative glass rounded-2xl overflow-hidden border border-(--glass-border)">
                <div className="px-3 py-2 bg-(--joat-navy-deep) flex items-center gap-1.5 border-b border-white/5">
                  <span className="w-2 h-2 rounded-full bg-(--joat-red)" />
                  <span className="w-2 h-2 rounded-full bg-(--joat-gold)" />
                  <span className="w-2 h-2 rounded-full bg-foreground/30" />
                  <span className="ml-2 text-[10px] text-muted-foreground">majobokenya.com</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-white/4 px-3 py-2 text-xs text-muted-foreground">
                    <Search className="w-3 h-3" /> Search 1,177 opportunities…
                  </div>
                  {[
                    { t: "Web Developer", loc: "Thindigua", tag: "Tech" },
                    { t: "Professional Photographer", loc: "Thindigua", tag: "Creative" },
                    { t: "Brand Ambassador", loc: "Nairobi", tag: "Marketing" },
                    { t: "House Cleaning Services", loc: "Nairobi", tag: "Services" },
                  ].map((j) => (
                    <div
                      key={j.t}
                      className="rounded-md bg-white/3 px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{j.t}</div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {j.loc}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gold">
                        {j.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Internships highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 glass rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6"
        >
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-2">
              <span className="w-2 h-2 rounded-full bg-(--joat-gold) animate-pulse" />
              Internships & talent network
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Whatever you do, we want to know you.
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Nurse, driver, developer, designer, accountant — no matter your field, submit your
              profile and let us connect you with the right opportunity across the JOAT ecosystem.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-semibold glow-red hover:brightness-110"
          >
            Join Talent Network
          </a>
        </motion.div>

        {/* Culture */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">Why work with us</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {culture.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-5">
                <c.icon className="w-5 h-5 text-(--joat-gold) mb-3" />
                <div className="font-bold text-foreground">{c.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills the team brings */}
        <div className="mt-16">
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Skills on the team
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Every discipline you need to ship.
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              We've built JOAT around the kind of multi-skilled team that the name promises — every
              project lands with the right specialists in the room.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skills.map((s) => (
              <div
                key={s.label}
                className="glass rounded-xl p-4 hover:border-(--joat-gold)/40 transition-colors"
              >
                <div className="font-semibold text-foreground text-sm">{s.label}</div>
                <div className="text-[11px] uppercase tracking-wider text-gold mt-1">{s.level}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
