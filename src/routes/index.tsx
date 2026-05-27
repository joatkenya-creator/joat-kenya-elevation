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
  localBusinessJsonLd,
  organizationJsonLd,
  seo,
  servicesCatalogJsonLd,
} from "@/lib/seo";

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
