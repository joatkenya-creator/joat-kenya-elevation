import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { RealEstateVA } from "@/components/site/RealEstateVA";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, faqPageJsonLd, seo } from "@/lib/seo";
import { realEstateVAFaqs } from "@/data/real-estate-va";

const SITE_URL = "https://joatkenya.com";

const realEstateVAServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Real Estate Virtual Assistant",
  name: "Real Estate Virtual Assistant Services",
  description:
    "AI-run and human virtual assistants for real estate agents, brokers and teams: instant AI lead response (ISA), MLS & CRM management, and transaction coordination.",
  provider: { "@type": "Organization", name: "J.O.A.T. Kenya", url: SITE_URL },
  areaServed: "Worldwide",
  audience: {
    "@type": "Audience",
    audienceType: "Real estate agents, brokers and teams",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Real Estate Virtual Assistant Plans",
    itemListElement: [
      {
        "@type": "Offer",
        position: 1,
        itemOffered: {
          "@type": "Service",
          name: "Real Estate VA · AI Starter (ISA)",
          description:
            "Fully AI-run Inside Sales Agent: sub-5-minute lead response, qualification and follow-up, 24/7, no human hours.",
        },
      },
      {
        "@type": "Offer",
        position: 2,
        itemOffered: {
          "@type": "Service",
          name: "Real Estate VA · Professional",
          description:
            "Dedicated human assistant for MLS listing entry, CRM management and lead follow-up, backed by AI.",
        },
      },
      {
        "@type": "Offer",
        position: 3,
        itemOffered: {
          "@type": "Service",
          name: "Real Estate VA · Executive",
          description:
            "Full-time senior assistant for contract-to-close transaction coordination and vendor/lender liaison.",
        },
      },
    ],
  },
};

export const Route = createFileRoute("/real-estate-virtual-assistant")({
  component: RealEstateVAPage,
  head: () => ({
    ...seo({
      title: "Real Estate Virtual Assistant Services | JOAT Kenya",
      description:
        "Hire a real estate virtual assistant that converts: a 24/7 AI ISA for sub-5-minute lead response, or a dedicated human VA for MLS, CRM, showings and transaction coordination.",
      path: "/real-estate-virtual-assistant",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd("Real Estate Virtual Assistant", "/real-estate-virtual-assistant"),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(realEstateVAServiceJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqPageJsonLd(realEstateVAFaqs)),
      },
    ],
  }),
});

function RealEstateVAPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <RealEstateVA />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
