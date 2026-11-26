/**
 * Navbar pill from the Jiro "Miles" hero (File 1), shared by every portal page.
 *  - overlay: sits on the landing hero and scrolls away with it (the template's behaviour)
 *  - static:  in the page flow on public pages
 *  - sticky:  stays at the top on app pages (apply, sign in, dashboard, admin)
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import joatLogo from "@/assets/joat-logo.png";
import { NavLinks } from "../nav";
import { focusRing, useDesignScale, useIsDesktop } from "./kit";

export function Navbar({ variant }: { variant: "overlay" | "static" | "sticky" }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const s = useDesignScale();
  const close = () => setOpen(false);
  const link = `inline-flex min-h-[40px] items-center bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat py-[6px] text-left text-[16px] text-joat-cream no-underline transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-joat-gold ${focusRing}`;

  const bar = (
    <div
      className={`relative rounded-[8px] border border-joat-border bg-joat-surface transition-shadow duration-300 ${
        open ? "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]" : ""
      }`}
    >
      <div className="flex h-[42px] items-center justify-between px-[14px]">
        <Link
          to="/"
          className={`flex items-center gap-[8px] text-joat-cream no-underline ${focusRing}`}
          onClick={close}
        >
          <img src={joatLogo} alt="" className="h-[24px] w-[24px] object-contain" />
          <span className="font-gilda text-[16px] leading-none">JOAT Global Partners</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
          className={`group relative -mr-[7px] flex h-[44px] w-[44px] cursor-pointer flex-col items-end justify-center gap-[5px] border-0 bg-transparent px-[7px] ${focusRing}`}
        >
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-[24px] translate-y-[7px] rotate-45" : "w-[28px]"
            }`}
          />
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-0 opacity-0" : "w-[23px] group-hover:w-[28px]"
            }`}
          />
          <span
            className={`block h-[2px] rounded-[10px] bg-joat-cream transition-all duration-300 ${
              open ? "w-[24px] -translate-y-[7px] -rotate-45" : "w-[17px] group-hover:w-[28px]"
            }`}
          />
        </button>
      </div>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        {/* inert while closed so the hidden links aren't tabbable */}
        <nav id="site-menu" aria-label="Main" className="overflow-hidden" inert={!open}>
          <div className="flex flex-col items-start gap-[2px] px-[14px] pb-[14px] pt-[4px]">
            <NavLinks
              linkClass={link}
              activeClass={`${link} text-joat-gold`}
              applyClass={`${link} font-medium text-joat-gold`}
              onNavigate={close}
            />
          </div>
        </nav>
      </div>
    </div>
  );

  if (variant === "overlay") {
    if (isDesktop)
      return (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center font-inter-tight">
          <div
            className="pointer-events-auto w-[384px]"
            style={{ marginTop: 21 * s, transform: `scale(${s})`, transformOrigin: "top center" }}
          >
            {bar}
          </div>
        </div>
      );
    return (
      <div className="absolute left-[20px] right-[20px] top-[14px] z-50 font-inter-tight">
        {bar}
      </div>
    );
  }

  // In the page flow: a 70px band; the pill opens over the content below it.
  return (
    <header
      className={`relative z-50 h-[70px] border-b border-joat-border font-inter-tight ${
        variant === "sticky" ? "sticky top-0 bg-joat-black/90 backdrop-blur" : "bg-joat-black"
      }`}
    >
      <div className="absolute left-[20px] right-[20px] top-[14px] mx-auto max-w-[384px]">
        {bar}
      </div>
    </header>
  );
}
