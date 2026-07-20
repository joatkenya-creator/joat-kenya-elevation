import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
// The Hero (LCP element) and Navbar are framer-free, so the first viewport
// paints without the animation library on the critical path. The near-fold
// sections are imported eagerly too — they're small and keeping them in the
// route chunk avoids a Suspense flash just below the hero.
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Partners } from "@/components/site/Partners";
import { About } from "@/components/site/About";
import { TeamSkills } from "@/components/site/TeamSkills";

// The heavier, fully below-the-fold block is code-split into its own chunks so
// the browser parses far less JS before first interaction. These stream in
// afterwards; they sit below the fold, so their late insertion never moves
// visible content — CLS stays at 0.
const Products = lazy(() =>
  import("@/components/site/Products").then((m) => ({ default: m.Products })),
);
const WhyChoose = lazy(() =>
  import("@/components/site/WhyChoose").then((m) => ({ default: m.WhyChoose })),
);
const Services = lazy(() =>
  import("@/components/site/Services").then((m) => ({ default: m.Services })),
);
const Testimonials = lazy(() =>
  import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials })),
);
const Contact = lazy(() =>
  import("@/components/site/Contact").then((m) => ({ default: m.Contact })),
);
const Footer = lazy(() => import("@/components/site/Footer").then((m) => ({ default: m.Footer })));
// Chatbot and BackToTop are decorative UI that don't need to block first paint
// or initial interaction. Lazy-loading frees ~40KB from the initial bundle.
const Chatbot = lazy(() =>
  import("@/components/site/Chatbot").then((m) => ({ default: m.Chatbot })),
);
const BackToTop = lazy(() =>
  import("@/components/site/BackToTop").then((m) => ({ default: m.BackToTop })),
);
import {
  aggregateRatingJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  seo,
  servicesCatalogJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Static seed of testimonials used purely for the AggregateRating JSON-LD on
// the initial HTML render. Mirrors what's seeded in the Supabase `testimonials`
// table so the schema stays accurate even when crawlers don't run JS.
const HOMEPAGE_REVIEW_SEED = [
  {
    author_name: "Sarah Mitchell",
    quote: "BioBiz quietly replaced half my networking tools.",
    rating: 5,
  },
  { author_name: "Jacqueline Wanjiru", quote: "BioBiz changed how I network.", rating: 5 },
  {
    author_name: "Marcus Reynolds",
    quote: "Their AI-driven marketing work reshaped how we launch products.",
    rating: 5,
  },
  {
    author_name: "Brian Mwangi",
    quote: "BioBiz QR scans transformed how my team works.",
    rating: 5,
  },
  {
    author_name: "Amelia Carter",
    quote: "Amare's Big Planet is the rare show I'm happy to let my kids watch.",
    rating: 5,
  },
  {
    author_name: "Joseph Otieno",
    quote: "Amare's Big Planet is a brilliant teaching companion.",
    rating: 5,
  },
  { author_name: "Faith Achieng", quote: "My kids will skip cartoons to watch Amare.", rating: 5 },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    ...seo({
      title: "JOAT Kenya | Elite Virtual Assistants, AI Automation & Lead Generation",
      description:
        "JOAT Kenya delivers elite virtual assistants, AI automation and lead-generation marketing for growing businesses, backed by in-house software, media and education capabilities.",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(servicesCatalogJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(aggregateRatingJsonLd(HOMEPAGE_REVIEW_SEED)),
      },
    ],
  }),
});

function Index() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main>
        {/* Landing (hero) — warm white with the geometric background image. */}
        <Hero />
        {/* Dark brand sections. */}
        <div className="dark bg-background text-foreground">
          <Partners />
          <About />
        </div>
        {/* Team skills — the second warm-white section. */}
        <TeamSkills />
        {/* Remaining dark sections. Heavier below-the-fold block streams in from
            its own chunks; the min-height keeps page height stable while loading. */}
        <div className="dark bg-background text-foreground">
          <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
            <Products />
          </Suspense>
        </div>
        {/* Why JOAT Kenya — warm-white section (grids unchanged). */}
        <Suspense fallback={null}>
          <WhyChoose />
        </Suspense>
        <div className="dark bg-background text-foreground">
          <Suspense fallback={null}>
            <Services />
            <Testimonials />
            <Contact />
          </Suspense>
        </div>
      </main>
      <div className="dark bg-background text-foreground">
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <Chatbot />
        <BackToTop />
      </Suspense>
    </div>
  );
}
