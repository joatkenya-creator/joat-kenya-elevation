import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/joat-logo.png";

const links = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Careers", href: "#careers" },
  { label: "Contact Us", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-[0_8px_30px_-15px_oklch(0_0_0/0.6)]" : ""
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="JOAT KENYA"
            className="h-10 w-10 lg:h-11 lg:w-11 object-contain drop-shadow-[0_0_12px_oklch(0.78_0.10_80/0.4)]"
          />
          <div className="leading-tight">
            <div className="font-semibold text-base lg:text-lg text-foreground">
              <span className="gradient-text-red">J.O.A.T</span>{" "}
              <span className="text-gold">KENYA</span>
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden lg:block">
              Since 1983 • Talent. Tech. Impact.
            </div>
          </div>
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[var(--joat-gold)] after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#careers"
            className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-[var(--joat-red)] hover:brightness-110 transition-all glow-red"
          >
            Apply Now
          </a>
          <a
            href="#contact"
            className="px-4 py-2 rounded-md text-sm font-semibold text-[var(--joat-navy-deep)] bg-[var(--joat-gold)] hover:brightness-110 transition-all"
          >
            Partner With Us
          </a>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-md text-foreground"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-4 h-0.5 bg-current" />
        </button>
      </nav>

      {open && (
        <div className="lg:hidden glass border-t border-[var(--glass-border)]">
          <ul className="px-5 py-4 space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-foreground/90"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="flex gap-2 pt-2">
              <a href="#careers" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-[var(--joat-red)]">Apply Now</a>
              <a href="#contact" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-md text-sm font-semibold text-[var(--joat-navy-deep)] bg-[var(--joat-gold)]">Partner</a>
            </li>
          </ul>
        </div>
      )}
    </motion.header>
  );
}
