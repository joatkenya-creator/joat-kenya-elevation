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
  {
    icon: Heart,
    title: "People First",
    text: "We invest in our engineers, designers and marketers, their growth, their craft and their well-being.",
  },
  { icon: Rocket, title: "Real Ownership", text: "Deliver work that touches millions of lives." },
  {
    icon: Coffee,
    title: "Hybrid by Design",
    text: "Modern offices in Thindigua + remote-friendly teams.",
  },
  {
    icon: Wrench,
    title: "Equipped for the Work",
    text: "A multi-skilled team of engineers, designers and digital marketers, armed with the tools and training to deliver any product, campaign or piece of content end-to-end.",
  },
];

const categories = [
  "Tech & Software",
  "Creative & Influencer",
  "Operations",
  "EdTech & Curriculum",
  "Internships",
];

export function Careers() {
  return (
    <section id="careers" className="relative py-14 lg:py-20 bg-navy-deep">
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
            wider market lives on one platform: Majobo Kenya.
          </p>
        </motion.div>

        {/* Live jobs CTA — links to Majobo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 relative overflow-hidden rounded-3xl border border-(--glass-border) glass p-4 sm:p-8 lg:p-12"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-(--joat-red)/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-(--joat-gold)/20 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-[1.4fr_1fr] gap-3 sm:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-gold mb-2 sm:mb-3">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                Live opportunities · Majobo Kenya
              </div>
              <h3 className="text-lg sm:text-2xl lg:text-4xl font-bold text-foreground leading-tight">
                1,000+ opportunities, refreshed daily.
              </h3>
              <p className="mt-2 sm:mt-4 text-[11px] sm:text-base text-muted-foreground leading-relaxed">
                Every open role flows through Majobo Kenya, where AI categorizes posts the moment
                they go live and matches them to nearby workers. Browse, filter and apply on Majobo.
              </p>

              <div className="mt-4 sm:mt-6 hidden sm:flex flex-wrap gap-2">
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

          {/* CTAs below the grid, side by side */}
          <div className="relative mt-6 sm:mt-8 flex flex-row flex-wrap justify-center gap-3">
            <a
              href="https://www.majobokenya.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md bg-(--joat-red) text-primary-foreground text-sm font-semibold glow-red hover:brightness-110 transition-all"
            >
              Browse jobs
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all"
            >
              Join Network
            </a>
          </div>
        </motion.div>

        {/* Culture */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">Why work with us</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {culture.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-5">
                <c.icon className="w-5 h-5 text-(--joat-gold) mb-3" />
                <div className="font-bold text-foreground">{c.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
