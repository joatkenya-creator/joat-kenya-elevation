import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" control. Sits bottom-left (the chatbot owns bottom-right)
 * and fades in once the user has scrolled past the first viewport, then smooth-
 * scrolls to the top of the page on click.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-6 left-6 z-60 w-12 h-12 rounded-full glass-solid border border-(--joat-gold)/40 flex items-center justify-center text-(--joat-gold) shadow-2xl transition-all duration-300 hover:bg-black/5 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
