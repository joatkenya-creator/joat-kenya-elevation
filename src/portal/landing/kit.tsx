/**
 * Helpers shared by the landing sections (from the Jiro "Miles" template, which
 * copied them into every section file; kept once here instead).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export const DESIGN_W = 1600;

export function useViewportWidth() {
  const [w, setW] = useState(() =>
    typeof document === "undefined" ? DESIGN_W : document.documentElement.clientWidth,
  );
  useEffect(() => {
    const on = () => setW(document.documentElement.clientWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

export function useDesignScale() {
  return useViewportWidth() / DESIGN_W;
}

// The template switches to the scaled 1600px artboard at 768px, where its 20px
// body text renders under 10px. Start the artboard at 1024px instead.
export function useIsDesktop() {
  return useViewportWidth() >= 1024;
}

export function at(left: number, top: number, width?: number, height?: number): CSSProperties {
  return { position: "absolute", left, top, width, height };
}

export function Artboard({
  height,
  id,
  className = "",
  children,
}: {
  height: number;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const s = useDesignScale();
  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: height * s }}
    >
      <div
        className="absolute left-0 top-0"
        style={{ width: DESIGN_W, height, transform: `scale(${s})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </section>
  );
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fades / lifts / un-blurs its children every time they scroll into view (replays on re-entry). */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduce] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  const shown = reduce || visible;
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(64px) scale(0.96)",
        filter: shown ? "none" : "blur(12px)",
        transition: reduce
          ? undefined
          : `opacity 1100ms ${ease} ${delay}ms, transform 1100ms ${ease} ${delay}ms, filter 1100ms ${ease} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-joat-gold";

type InternalPath = "/" | "/apply" | "/faq" | "/terms" | "/login" | "/dashboard" | "/resources";

/** Gold button: lighter fill sweeps in from the left, label rolls up, button lifts. */
export function Button({
  children,
  to,
  href,
  outline = false,
  className = "",
}: {
  children: ReactNode;
  to?: InternalPath;
  href?: string;
  outline?: boolean;
  className?: string;
}) {
  const cls = `group relative inline-flex items-center overflow-hidden rounded-[10px] border px-[20px] py-[10px] text-[18px] font-medium leading-[26px] no-underline transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.8)] active:scale-[0.97] ${focusRing} ${
    outline
      ? "border-joat-border bg-transparent text-joat-cream"
      : "border-joat-gold bg-joat-gold text-joat-black"
  } ${className}`;
  const inner = (
    <>
      <span
        className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 ${
          outline ? "bg-joat-surface" : "bg-joat-gold-hover"
        }`}
      />
      <span className="relative block overflow-hidden whitespace-nowrap">
        <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute left-0 top-full block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
        >
          {children}
        </span>
      </span>
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

/** Section heading in the template's serif, with an optional gold-accented word. */
export function Heading({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`m-0 font-gilda text-[36px] font-normal leading-[44px] tracking-[-1px] text-joat-cream sm:text-[52px] sm:leading-[62px] sm:tracking-[-1.5px] ${className}`}
    >
      {children}
    </h2>
  );
}

/** Renders the desktop artboard or the mobile layout (switches at 1024px, see useIsDesktop). */
export function Responsive({ desktop, mobile }: { desktop: ReactNode; mobile: ReactNode }) {
  const isDesktop = useIsDesktop();
  return (
    <div className="font-inter-tight text-joat-body antialiased">
      {isDesktop ? desktop : mobile}
    </div>
  );
}

/** Small section label: ■ Label ■ (gold squares). */
export function Badge({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-[5px]">
      <span
        className={`block size-[8px] rounded-[2px] ${dark ? "bg-joat-black" : "bg-joat-gold"}`}
      />
      <p
        className={`m-0 whitespace-nowrap text-[18px] capitalize leading-[24px] ${dark ? "text-joat-black" : "text-joat-cream"}`}
      >
        {children}
      </p>
      <span
        className={`block size-[8px] rounded-[2px] ${dark ? "bg-joat-black" : "bg-joat-gold"}`}
      />
    </div>
  );
}

/** Infinite horizontal loop (Web Animations API). Children are repeated `copies` times; pauses on hover. */
export function Marquee({
  children,
  copies = 2,
  duration = 40,
  reverse = false,
  gap = 0,
  offset = 0,
  className = "",
}: {
  children: ReactNode;
  copies?: number;
  duration?: number;
  reverse?: boolean;
  gap?: number;
  offset?: number;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const anim = el.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(-${100 / copies}%)` }],
      {
        duration: duration * 1000,
        iterations: Infinity,
        direction: reverse ? "reverse" : "normal",
      },
    );
    const pause = () => anim.pause();
    const play = () => anim.play();
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", play);
    return () => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", play);
      anim.cancel();
    };
  }, [copies, duration, reverse]);
  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max" style={{ marginLeft: offset }}>
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            inert={i > 0}
            className="flex shrink-0 items-stretch"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
