import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/joat-logo.png";

const links = [
  { label: "Home", to: "/" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Services", to: "/services" as const },
  { label: "Products", to: "/products" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "Articles", to: "/articles" as const },
  { label: "Contact Us", to: "/contact" as const },
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
        scrolled ? "glass-solid shadow-[0_8px_30px_-15px_oklch(0_0_0/0.6)]" : ""
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 lg:gap-3 group min-w-0">
          <img src={logo} alt="JOAT KENYA" className="h-9 lg:h-12 w-auto object-contain shrink-0" />
          <div className="leading-tight min-w-0">
            <div className="font-display font-bold text-base sm:text-lg md:text-2xl tracking-wide whitespace-nowrap">
              <span className="gradient-text-red">J.O.A.T</span>{" "}
              <span className="text-gold">Kenya</span>
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden lg:block">
              Since 1983 • Software. Media. AI.
            </div>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: true }}
                className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-(--joat-gold) after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://www.majobokenya.com/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-(--joat-red) hover:brightness-110 transition-all glow-red"
          >
            Apply Now
          </a>
          <Link
            to="/work-with-us"
            className="px-4 py-2 rounded-md text-sm font-semibold text-(--joat-navy-deep) bg-(--joat-gold) hover:brightness-110 transition-all"
          >
            Work With Us
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md text-foreground"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-4 h-0.5 bg-current" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden glass-panel border-t border-(--glass-border)">
          <ul className="px-5 py-4 space-y-2">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "block py-2 text-gold" }}
                  activeOptions={{ exact: true }}
                  className="block py-2 text-foreground/90"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              <a
                href="https://www.majobokenya.com/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="text-center px-4 py-2 rounded-md text-sm font-semibold text-primary-foreground bg-(--joat-red)"
              >
                Apply Now
              </a>
              <Link
                to="/work-with-us"
                onClick={() => setOpen(false)}
                className="text-center px-4 py-2 rounded-md text-sm font-semibold text-(--joat-navy-deep) bg-(--joat-gold)"
              >
                Work With Us
              </Link>
            </li>
          </ul>
        </div>
      )}
    </motion.header>
  );
}
