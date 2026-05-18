import { motion } from "framer-motion";
import { Download, Users, GraduationCap, Rocket, Gamepad2, ArrowRight, Check } from "lucide-react";
import biobiz from "@/assets/biobiz-mock.jpg";
import amare from "@/assets/amare-planet.jpg";
import roblox from "@/assets/roblox-world.jpg";
import edu from "@/assets/education.jpg";
import talent from "@/assets/talent.jpg";

type Product = {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  image: string;
  reverse?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accent: "red" | "gold";
};

const products: Product[] = [
  {
    id: "biobiz",
    badge: "Biobiz App",
    title: "Empower African micro-businesses with a phone.",
    tagline: "Mobile commerce, inventory and customer tools — built for everyday entrepreneurs.",
    description:
      "Biobiz turns any smartphone into a complete business toolkit. Track inventory, log sales, manage customers, accept payments and grow — without spreadsheets or expensive software.",
    features: [
      "Offline-first inventory & sales tracking",
      "Built-in M-Pesa & card payment flows",
      "Customer profiles & loyalty",
      "Real-time business insights",
    ],
    cta: { label: "Download on Play Store", href: "#" },
    image: biobiz,
    icon: Rocket,
    accent: "gold",
  },
  {
    id: "majobo",
    badge: "Majobo Kenya · Talent Outsourcing",
    title: "Workforce solutions that scale with you.",
    tagline: "Pre-vetted talent and managed workforce solutions across East Africa.",
    description:
      "Majobo Kenya matches organizations with skilled, ready-to-deploy professionals — from short-term staffing to fully managed outsourced teams. Faster hires, lower overhead, total compliance.",
    features: [
      "AI-assisted talent matching",
      "Full compliance & payroll handling",
      "Industries: Tech, Healthcare, Logistics, Hospitality, Finance",
      "Flexible contracts: contract, temp, permanent",
    ],
    cta: { label: "Hire Talent", href: "#contact" },
    image: talent,
    reverse: true,
    icon: Users,
    accent: "red",
  },
  {
    id: "digital-edu",
    badge: "Digital Education",
    title: "Tech upskilling that turns talent into innovators.",
    tagline: "Training programs, corporate digital literacy and youth empowerment.",
    description:
      "From bootcamps for emerging developers to enterprise digital literacy and youth STEM programs, our learning platform combines mentorship, projects and certifications that employers actually trust.",
    features: [
      "Software engineering & data bootcamps",
      "Corporate digital transformation training",
      "Youth STEM & entrepreneurship programs",
      "Live mentorship + interactive dashboards",
    ],
    cta: { label: "Join a Program", href: "#contact" },
    image: edu,
    icon: GraduationCap,
    accent: "gold",
  },
  {
    id: "amare",
    badge: "Amare's Big Planet · Flagship EdTech",
    title: "A story-driven world where African kids learn to dream big.",
    tagline: "Immersive educational content for ages 4–12 celebrating African culture & curiosity.",
    description:
      "Amare's Big Planet is our flagship educational universe — a colorful, story-led world that turns reading, science and life skills into adventures. Built to reflect African identity and inspire the next generation of innovators.",
    features: [
      "Animated story episodes & books",
      "Interactive learning activities",
      "Targets ages 4–12, aligned to early-years curricula",
      "Outcomes: literacy, STEM curiosity, cultural pride",
    ],
    cta: { label: "Explore Amare's World", href: "#" },
    image: amare,
    reverse: true,
    icon: Rocket,
    accent: "red",
  },
  {
    id: "games",
    badge: "Game Development · Roblox",
    title: "Learning that plays like the games kids already love.",
    tagline: "Educational Roblox experiences and custom gamified learning systems.",
    description:
      "We design and ship Roblox-based learning worlds and custom gamified platforms for schools, NGOs and brands — meeting young learners where they already spend their time.",
    features: [
      "Educational Roblox experiences",
      "Custom game development (Unity, Roblox)",
      "Gamified learning & assessment systems",
      "Brand-activated immersive worlds",
    ],
    cta: { label: "Explore Interactive Worlds", href: "#contact" },
    image: roblox,
    icon: Gamepad2,
    accent: "gold",
  },
];

export function Products() {
  return (
    <section id="products" className="relative py-24 lg:py-32 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Products & Solutions</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            One ecosystem. <span className="gradient-text-gold">Five engines</span> of impact.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Technology, education, talent and immersive experiences — designed for African
            context, built to global standards.
          </p>
        </motion.div>

        <div className="space-y-24 lg:space-y-32">
          {products.map((p, i) => {
            const Icon = p.icon;
            const accentBg = p.accent === "red" ? "bg-[var(--joat-red)]" : "bg-[var(--joat-gold)] text-[var(--joat-navy-deep)]";
            const accentText = p.accent === "red" ? "text-[var(--joat-red)]" : "text-[var(--joat-gold)]";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  p.reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold glass ${accentText}`}>
                    <Icon className="w-3.5 h-3.5" /> {p.badge}
                  </div>
                  <h3 className="mt-5 text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-4 text-lg text-muted-foreground">{p.tagline}</p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${accentText}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <a
                      href={p.cta.href}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold ${accentBg} ${p.accent === "red" ? "text-primary-foreground glow-red" : "glow-gold"} hover:brightness-110 transition-all`}
                    >
                      {p.id === "biobiz" && <Download className="w-4 h-4" />}
                      {p.cta.label} <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[var(--joat-gold)]/20 via-transparent to-[var(--joat-red)]/20 blur-2xl" />
                  <div className="relative glass rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-[var(--shadow-card)]">
                    <img
                      src={p.image}
                      alt={`${p.badge} preview`}
                      loading="lazy"
                      width={1200}
                      height={900}
                      className="w-full h-auto object-cover aspect-[4/3]"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
