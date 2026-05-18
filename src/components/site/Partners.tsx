import { motion } from "framer-motion";
import { ShieldCheck, Award, Globe } from "lucide-react";

const partners = [
  "Safaricom","KPMG East Africa","ICT Authority Kenya","Andela","KEPSA","UNDP","Microsoft Africa","Roblox EDU","Equity Group","Sama","Liquid Intelligent","African Union",
];

const certs = [
  { icon: ShieldCheck, title: "ISO 9001 Quality", text: "Quality management certified across recruitment and digital delivery." },
  { icon: Award, title: "NITA Approved Trainer", text: "Accredited training provider for Kenya's National Industrial Training Authority." },
  { icon: Globe, title: "Pan-African Network", text: "Active operations and partnerships across 5+ African markets." },
];

export function Partners() {
  return (
    <section className="relative py-20 lg:py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Trusted Partners & Certifications</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Backed by Africa's leading organizations</h2>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--joat-navy)] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--joat-navy)] to-transparent z-10" />
          <motion.div
            className="flex gap-12 whitespace-nowrap py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...partners, ...partners].map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-foreground/60 hover:text-gold transition-colors">
                <div className="w-8 h-8 rounded-md glass flex items-center justify-center text-xs font-bold text-gold">
                  {p.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <span className="text-sm font-semibold">{p}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {certs.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--joat-gold)]/15 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-[var(--joat-gold)]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
