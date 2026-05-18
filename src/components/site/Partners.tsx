import { motion } from "framer-motion";
import { ShieldCheck, Leaf, Receipt } from "lucide-react";
import m1 from "@/assets/partners/marquee1.jpg";
import m2 from "@/assets/partners/marquee2.png";
import m3 from "@/assets/partners/marquee3.jpeg";
import m4 from "@/assets/partners/marquee4.jpeg";
import m5 from "@/assets/partners/marquee5.jpeg";
import m6 from "@/assets/partners/marquee6.jpeg";
import m7 from "@/assets/partners/marquee7.jpeg";
import m8 from "@/assets/partners/marquee8.png";
import m9 from "@/assets/partners/marquee9.jpeg";

const partners: { src: string; alt: string }[] = [
  { src: m1, alt: "Partner 1" },
  { src: m2, alt: "Partner 2" },
  { src: m3, alt: "Partner 3" },
  { src: m4, alt: "Partner 4" },
  { src: m5, alt: "Partner 5" },
  { src: m6, alt: "Partner 6" },
  { src: m7, alt: "Partner 7" },
  { src: m8, alt: "Partner 8" },
  { src: m9, alt: "Partner 9" },
];

const certs = [
  {
    icon: ShieldCheck,
    title: "ISO 9001",
    text: "Quality management certified across recruitment and digital delivery.",
  },
  {
    icon: Leaf,
    title: "NEMA NCA-1",
    text: "Environmental compliance under Kenya's National Environment Management Authority (Category 1).",
  },
  {
    icon: Receipt,
    title: "KRA Compliant",
    text: "Fully compliant with Kenya Revenue Authority — tax-clean and audit-ready.",
  },
];

export function Partners() {
  return (
    <section className="relative py-20 lg:py-24 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Trusted Partners & Certifications
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Backed by Africa's leading organizations
          </h2>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-(--joat-navy) to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-(--joat-navy) to-transparent z-10" />
          <motion.div
            className="flex gap-10 whitespace-nowrap py-4 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          >
            {[...partners, ...partners].map((p, i) => (
              <div
                key={i}
                className="shrink-0 h-20 w-40 rounded-xl glass flex items-center justify-center p-3 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
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
              <div className="w-11 h-11 rounded-xl bg-(--joat-gold)/15 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-(--joat-gold)" />
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
