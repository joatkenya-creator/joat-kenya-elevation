import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { TeamSkills } from "@/components/site/TeamSkills";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Services } from "@/components/site/Services";
import { Partners } from "@/components/site/Partners";
import { Testimonials } from "@/components/site/Testimonials";
import { Careers } from "@/components/site/Careers";
import { News } from "@/components/site/News";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
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
  { author_name: "Sarah Mitchell", quote: "BioBiz quietly replaced half my networking tools.", rating: 5 },
  { author_name: "Jacqueline Wanjiru", quote: "BioBiz changed how I network.", rating: 5 },
  { author_name: "Marcus Reynolds", quote: "Their AI-driven marketing work reshaped how we launch products.", rating: 5 },
  { author_name: "Brian Mwangi", quote: "BioBiz QR scans transformed how my team works.", rating: 5 },
  { author_name: "Amelia Carter", quote: "Amare's Big Planet is the rare show I'm happy to let my kids watch.", rating: 5 },
  { author_name: "Joseph Otieno", quote: "Amare's Big Planet is a brilliant teaching companion.", rating: 5 },
  { author_name: "Faith Achieng", quote: "My kids will skip cartoons to watch Amare.", rating: 5 },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    ...seo({
      title: "JOAT Kenya | Software, Digital Marketing, Media & AI Studio",
      description:
        "J.O.A.T. Kenya is a digital innovation studio delivering software development, digital marketing, media production, AI solutions and children's digital education for clients worldwide.",
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
        <Hero />
        <Partners />
        <About />
        <TeamSkills />
        <Products />
        <WhyChoose />
        <Services />
        <Testimonials />
        <Careers />
        <section id="news">
          <News />
        </section>
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
