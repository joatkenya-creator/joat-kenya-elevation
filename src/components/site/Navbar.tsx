import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
// Served from /public so it shares the same URL with the index.html preload
// and the favicon — single download instead of bundled-plus-favicon duplicate.
const logo = "/joat-logo.png";

// Top-level links stay visible; "Consultation" and "Company" group related
// pages behind dropdowns (hover on desktop, tap on touch) so the bar itself
// reads clean and premium instead of a wall of text.
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

// All three route to the same paid-consultation booking flow on /contact —
// `consult` just pre-fills the service area and message for that pillar.
const consultationLinks = [
  { label: "VA Consulting", href: "/contact?consult=va" },
  { label: "AI & Automation Consulting", href: "/contact?consult=ai" },
  { label: "Marketing & Lead Gen Consulting", href: "/contact?consult=marketing" },
];

/** Shared hover/click/outside-click/Escape dropdown behavior for desktop nav
 * menus. Callers control what renders inside via `children`. */
function NavDropdown({
  id,
  label,
  active,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  children: (opts: { close: () => void }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attr = `data-nav-menu-${id}`;

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Small delay before closing so the cursor can travel from the trigger to
  // the panel without the menu vanishing mid-move.
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`[${attr}]`)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, attr]);

  return (
    <li
      {...{ [attr]: true }}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
          active ? "text-gold" : "text-foreground/80 hover:text-gold"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 glass-solid rounded-xl border border-(--glass-border) p-2 shadow-[0_20px_40px_-20px_oklch(0_0_0/0.5)]"
        >
          {children({ close: () => setOpen(false) })}
        </ul>
      )}
    </li>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isCompanyActive = companyLinks.some((l) => l.to === currentPath);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

          <NavDropdown id="consultation" label="Consultation" active={false}>
            {({ close }) =>
              consultationLinks.map((l) => (
                <li key={l.href} role="none">
                  <a
                    href={l.href}
                    role="menuitem"
                    onClick={close}
                    className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-gold hover:bg-black/5 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))
            }
          </NavDropdown>

          <NavDropdown id="company" label="Company" active={isCompanyActive}>
            {({ close }) =>
              companyLinks.map((l) => (
                <li key={l.to} role="none">
                  <Link
                    to={l.to}
                    role="menuitem"
                    onClick={close}
                    activeProps={{ className: "text-gold" }}
                    activeOptions={{ exact: true }}
                    className="block px-3 py-2 rounded-lg text-sm text-foreground/80 hover:text-gold hover:bg-black/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))
            }
          </NavDropdown>

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
              Consultation
            </li>
            {consultationLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 pl-3 text-foreground/90 border-l border-(--glass-border)"
                >
                  {l.label}
                </a>
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
