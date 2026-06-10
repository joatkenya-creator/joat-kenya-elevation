import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  Coffee,
  Rocket,
  Wrench,
  Sparkles,
  MapPin,
  Briefcase,
  Search,
  ArrowRight,
  Clock,
  Banknote,
} from "lucide-react";
import { openings, APPLY_EMAIL, type Opening } from "@/lib/openings";
import { JobDetailModal } from "./JobDetailModal";

const categories = ["All", ...Array.from(new Set(openings.map((o) => o.category)))];

const culture = [
  {
    icon: Heart,
    title: "People First",
    text: "We invest in our engineers, designers and marketers — their growth, their craft and their well-being.",
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
    text: "A multi-skilled team armed with the tools and training to deliver any product, campaign or piece of content end-to-end.",
  },
];

function applyEmailHref() {
  return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent("General application — JOAT Kenya")}`;
}

function OpeningCard({ job, onOpen }: { job: Opening; onOpen: (j: Opening) => void }) {
  return (
    <article className="group glass rounded-xl border border-(--glass-border) p-5 transition-colors hover:border-(--joat-gold)/40">
      <button
        type="button"
        onClick={() => onOpen(job)}
        className="w-full text-left flex items-start justify-between gap-4 cursor-pointer"
        aria-label={`View ${job.title} details`}
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
            <Briefcase className="w-3 h-3" />
            {job.category}
          </div>
          <h3 className="mt-1 text-lg lg:text-xl font-bold text-foreground group-hover:text-gold transition-colors">
            {job.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {job.type}
            </span>
            {job.pay && (
              <span className="inline-flex items-center gap-1.5 text-gold">
                <Banknote className="w-3.5 h-3.5" /> {job.pay}
              </span>
            )}
          </div>
          <p className="mt-2 hidden sm:block text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {job.mainPurpose}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold group-hover:brightness-110 transition-all">
          View &amp; apply
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </button>
    </article>
  );
}

/**
 * Careers. On the homepage it renders a compact teaser (a few featured roles +
 * a link to the full board). On the /careers route (`full`) it renders the
 * complete job board with keyword search and category filters. Clicking a role
 * opens a Deloitte-style detail modal with an embedded application form.
 */
export function Careers({ full = false }: { full?: boolean }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<Opening | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openings.filter((o) => {
      const inCategory = activeCategory === "All" || o.category === activeCategory;
      const inQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.mainPurpose.toLowerCase().includes(q) ||
        o.trades.some((t) => t.toLowerCase().includes(q));
      return inCategory && inQuery;
    });
  }, [query, activeCategory]);

  const visible = full ? filtered : openings.slice(0, 3);

  return (
    <section id="careers" className="relative py-14 lg:py-20 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Careers</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            Build your future <span className="gradient-text-gold">with J.O.A.T.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            We hire creative minds, problem solvers and innovators. Every open role lives right
            here — click a position to read the full job description and apply directly.
          </p>
        </m.div>

        {/* Search + filters (full board only) */}
        {full && (
          <div className="mt-10">
            <div className="flex items-center gap-2 rounded-xl glass border border-(--glass-border) px-4 py-3 max-w-xl">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles, e.g. developer, data, marketing…"
                aria-label="Search open roles"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === c
                      ? "bg-(--joat-gold) text-(--joat-navy-deep) border-transparent font-semibold"
                      : "glass border-(--glass-border) text-foreground/85 hover:border-(--joat-gold)/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-5 text-sm text-muted-foreground">
              {filtered.length} open {filtered.length === 1 ? "role" : "roles"}
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </div>
          </div>
        )}

        {/* Openings list */}
        <div className={`${full ? "mt-6" : "mt-10"} grid gap-3`}>
          {visible.length > 0 ? (
            visible.map((job) => <OpeningCard key={job.slug} job={job} onOpen={setSelected} />)
          ) : (
            <div className="glass rounded-xl border border-(--glass-border) p-8 text-center">
              <p className="text-foreground font-semibold">No roles match your search.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We hire year-round — send us a general application and we&apos;ll reach out when a
                role matches your skills.
              </p>
              <a
                href={applyEmailHref()}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all"
              >
                Send a general application <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Compact teaser → full board */}
        {!full && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-(--joat-red) text-primary-foreground text-sm font-semibold glow-red hover:brightness-110 transition-all"
            >
              View all open roles <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {openings.length} open {openings.length === 1 ? "role" : "roles"} — click any to read
              the full description and apply.
            </span>
          </div>
        )}

        {/* General application CTA (full board) */}
        {full && visible.length > 0 && (
          <div className="mt-8 relative overflow-hidden rounded-2xl border border-(--glass-border) glass p-6 lg:p-8">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-(--joat-gold)/15 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Don&apos;t see your role?
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                  We hire talented people year-round.
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  Send your CV and a short note about what you do best — we&apos;ll reach out when a
                  role matches your skills.
                </p>
              </div>
              <a
                href={applyEmailHref()}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all"
              >
                Send a general application <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

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

      <JobDetailModal job={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
