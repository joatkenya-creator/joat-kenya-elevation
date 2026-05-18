import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Clock, Heart, Coffee, Rocket, GraduationCap } from "lucide-react";

const jobs = [
  { title: "Senior Software Developer", dept: "Engineering", type: "Full-time", location: "Nairobi", level: "Senior" },
  { title: "Mobile Engineer (Flutter)", dept: "Engineering", type: "Full-time", location: "Remote · KE", level: "Mid" },
  { title: "Brand Ambassador", dept: "Marketing", type: "Contract", location: "Nairobi", level: "Entry" },
  { title: "Commercial / Print Model", dept: "Talent", type: "Project", location: "Multiple", level: "Entry" },
  { title: "Roblox Game Designer", dept: "EdTech", type: "Full-time", location: "Nairobi · Hybrid", level: "Mid" },
  { title: "Talent Acquisition Lead", dept: "People", type: "Full-time", location: "Nairobi", level: "Senior" },
  { title: "EdTech Curriculum Intern", dept: "Education", type: "Internship", location: "Nairobi", level: "Internship" },
  { title: "Customer Success Intern", dept: "Operations", type: "Internship", location: "Nairobi", level: "Internship" },
];

const culture = [
  { icon: Heart, title: "People First", text: "We invest in growth, mentorship, and well-being." },
  { icon: Rocket, title: "Real Ownership", text: "Ship work that touches millions of lives." },
  { icon: Coffee, title: "Hybrid by Design", text: "Modern offices in Thindigua + remote-friendly teams." },
  { icon: GraduationCap, title: "Continuous Learning", text: "Annual learning stipends and access to JOAT Academy." },
];

export function Careers() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");

  const depts = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.dept)))], []);
  const filtered = jobs.filter(
    (j) =>
      (dept === "All" || j.dept === dept) &&
      (q === "" || j.title.toLowerCase().includes(q.toLowerCase()) || j.location.toLowerCase().includes(q.toLowerCase()))
  );

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
            We're always looking for creative minds, problem solvers, and innovators who want to
            make a real impact across industries.
          </p>
        </motion.div>

        {/* Always-open panel */}
        <div className="mt-10 glass rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--joat-gold)] animate-pulse" /> Always Open
            </div>
            <h3 className="text-xl font-bold text-foreground">Whatever you do, we want to know you.</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Nurse, driver, developer, designer, accountant — no matter your field, submit your
              profile and let us connect you with the right opportunity.
            </p>
          </div>
          <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[var(--joat-red)] text-primary-foreground font-semibold glow-red hover:brightness-110">
            Join Talent Network
          </a>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search roles or locations…"
              className="w-full pl-10 pr-4 py-3 rounded-md glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--joat-gold)]/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                  dept === d
                    ? "bg-[var(--joat-gold)] text-[var(--joat-navy-deep)]"
                    : "glass text-foreground/80 hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Job cards */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {filtered.map((j, i) => (
            <motion.a
              key={j.title}
              href="#contact"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="glass rounded-2xl p-5 hover:border-[var(--joat-gold)]/40 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-gold">
                  <Briefcase className="w-3 h-3" /> {j.dept} · {j.level}
                </div>
                <div className="font-bold text-foreground mt-1">{j.title}</div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{j.type}</span>
                </div>
              </div>
              <span className="text-[var(--joat-gold)] opacity-0 group-hover:opacity-100 transition">Apply →</span>
            </motion.a>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 text-center text-muted-foreground py-10 glass rounded-2xl">
              No roles match — but we still want to know you. Submit your profile.
            </div>
          )}
        </div>

        {/* Culture */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-6">Why work with us</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {culture.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-5">
                <c.icon className="w-5 h-5 text-[var(--joat-gold)] mb-3" />
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
