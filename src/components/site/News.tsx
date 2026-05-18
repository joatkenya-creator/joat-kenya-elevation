import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, Calendar } from "lucide-react";

const categories = ["All", "Company Updates", "Tech Insights", "Innovation Stories", "Educational Impact", "Product Announcements"];

const articles = [
  { cat: "Product Announcements", title: "Biobiz launches offline-first inventory for kiosks across Kenya", date: "May 12, 2026", read: "5 min", featured: true },
  { cat: "Innovation Stories", title: "Inside Amare's Big Planet: building African EdTech kids actually love", date: "May 4, 2026", read: "8 min" },
  { cat: "Tech Insights", title: "How AI is reshaping talent matching across East Africa", date: "Apr 28, 2026", read: "6 min" },
  { cat: "Educational Impact", title: "10,000 youth trained: a year of digital literacy programs", date: "Apr 12, 2026", read: "4 min" },
  { cat: "Company Updates", title: "JOAT KENYA joins Microsoft Africa Innovation Network", date: "Apr 2, 2026", read: "3 min" },
  { cat: "Tech Insights", title: "Roblox + classrooms: the new frontier of gamified learning", date: "Mar 22, 2026", read: "7 min" },
];

export function News() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => articles.filter((a) => (cat === "All" || a.cat === cat) && (q === "" || a.title.toLowerCase().includes(q.toLowerCase()))),
    [cat, q]
  );
  const featured = filtered.find((a) => a.featured) ?? filtered[0];
  const rest = filtered.filter((a) => a !== featured);

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10"
        >
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">News & Articles</div>
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground">Latest Insights</h2>
            <p className="mt-4 text-muted-foreground">
              Perspectives on talent, technology, education and Africa's innovation economy.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 rounded-md glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--joat-gold)]/50"
            />
          </div>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                cat === c ? "bg-[var(--joat-red)] text-primary-foreground" : "glass text-foreground/80 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {featured && (
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            href="#"
            className="block glass rounded-3xl p-8 lg:p-12 mb-8 group hover:border-[var(--joat-gold)]/40 transition-all"
          >
            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--joat-gold)] uppercase tracking-wider">
                  Featured · {featured.cat}
                </div>
                <h3 className="mt-3 text-2xl lg:text-4xl font-bold text-foreground leading-tight">
                  {featured.title}
                </h3>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featured.date}</span>
                  <span>{featured.read} read</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--joat-gold)] text-[var(--joat-navy-deep)] flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </motion.a>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((a, i) => (
            <motion.a
              key={a.title}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-[var(--joat-gold)]/40 transition-all group"
            >
              <div className="text-xs font-semibold text-[var(--joat-gold)] uppercase tracking-wider">{a.cat}</div>
              <h3 className="mt-3 text-lg font-bold text-foreground leading-snug group-hover:text-[var(--joat-gold)] transition-colors">
                {a.title}
              </h3>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.date} · {a.read} read</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
