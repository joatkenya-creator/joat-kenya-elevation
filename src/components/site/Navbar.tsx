import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
// Served from /public so it shares the same URL with the index.html preload
// and the favicon — single download instead of bundled-plus-favicon duplicate.
const logo = "/joat-logo.png";

// Top-level links stay visible; "Company" groups the lower-traffic pages
// behind a dropdown (hover on desktop, tap on touch) so the bar itself reads
// clean and premium instead of an 8-item wall of text.
const links = [
  { label: "Home", to: "/" as const },
  { label: "Services", to: "/services" as const },
  { label: "Products", to: "/products" as const },
  { label: "Contact Us", to: "/contact" as const },
];

const companyLinks = [
  { label: "About Us", to: "/about" as const },
  { label: "Courses", to: "/courses" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "Articles", to: "/articles" as const },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isCompanyActive = companyLinks.some((l) => l.to === currentPath);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCompany = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCompanyOpen(true);
  };
  // Small delay before closing so the cursor can travel from the trigger to
  // the panel without the menu vanishing mid-move.
  const scheduleCloseCompany = () => {
    closeTimer.current = setTimeout(() => setCompanyOpen(false), 150);
  };

  // Close on outside click / Escape so the dropdown behaves like a normal menu
  // once it's opened by click (touch devices, keyboard users).
  useEffect(() => {
    if (!companyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompanyOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-company-menu]")) setCompanyOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [companyOpen]);

  return (
    // Framer-free (CSS entrance via .navbar-enter) so the Navbar — part of the
    // first viewport — carries no animation-library code on the critical path.
    <header
      className={`navbar-enter fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-solid shadow-[0_8px_30px_-15px_oklch(0_0_0/0.6)]" : ""
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 lg:gap-3 group min-w-0">
          <img
            src={logo}
            alt="JOAT KENYA"
            width="500"
            height="500"
            fetchPriority="high"
            decoding="async"
            className="h-9 lg:h-12 w-auto object-contain shrink-0"
          />
          <div className="leading-tight min-w-0">
            <div className="font-display font-bold text-base sm:text-lg md:text-2xl tracking-wide whitespace-nowrap">
              <span className="gradient-text-red">J.O.A.T</span>{" "}
              <span className="text-gold">Kenya</span>
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden lg:block">
              VA · AI Automation · Lead Gen
            </div>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {links.slice(0, 3).map((l) => (
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

          <li
            data-company-menu
            className="relative"
            onMouseEnter={openCompany}
            onMouseLeave={scheduleCloseCompany}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={companyOpen}
              onClick={() => setCompanyOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
                isCompanyActive ? "text-gold" : "text-foreground/80 hover:text-gold"
              }`}
            >
              Company
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${companyOpen ? "rotate-180" : ""}`}
              />
            </button>

            {companyOpen && (
              <ul
                role="menu"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-48 glass-solid rounded-xl border border-(--glass-border) p-2 shadow-[0_20px_40px_-20px_oklch(0_0_0/0.5)]"
              >
                {companyLinks.map((l) => (
                  <li key={l.to} role="none">
                    <Link
                      to={l.to}
                      role="menuitem"
                      onClick={() => setCompanyOpen(false)}
                      activeProps={{ className: "text-gold" }}
                      activeOptions={{ exact: true }}
                      className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-gold hover:bg-black/5 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {links.slice(3).map((l) => (
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
          <Link
            to="/work-with-us"
            className="px-4 py-2 rounded-md text-sm font-semibold text-(--joat-navy-deep) bg-(--joat-gold) hover:brightness-110 transition-all"
          >
            Work With Us
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md text-foreground"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden glass-panel border-t border-(--glass-border)">
          <ul className="px-5 py-4 space-y-2">
            {links.slice(0, 3).map((l) => (
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

            <li className="pt-2 pb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Company
            </li>
            {companyLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "block py-2 text-gold" }}
                  activeOptions={{ exact: true }}
                  className="block py-2 pl-3 text-foreground/90 border-l border-(--glass-border)"
                >
                  {l.label}
                </Link>
              </li>
            ))}

            {links.slice(3).map((l) => (
              <li key={l.to} className="pt-2">
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
    </header>
  );
}
