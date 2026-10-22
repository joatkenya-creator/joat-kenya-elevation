import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { KenyaConsultation } from "@/components/site/KenyaConsultation";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, faqPageJsonLd, seo } from "@/lib/seo";
import { CONSULTATIONS, CONSULTATION_FAQS } from "@/data/kenya-consultation";

const SITE_URL = "https://joatkenya.com";
const PATH = "/kenya-consultation";

/**
 * Service + offer catalog for the two consultation products. Prices are
 * deliberately absent: they are configuration (see data/kenya-consultation.ts)
 * and publishing a price we don't hold would be misleading structured data.
 */
const consultationServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Kenya market entry and relocation consulting",
  name: "Kenya Market Entry & Relocation Consultation",
  description:
    "One-on-one consulting for people considering moving to Kenya, starting a business in Kenya, expanding into the Kenyan market, investing, or building a team, delivered directly by the Director of J.O.A.T.",
  provider: {
    "@type": "Organization",
    name: "J.O.A.T.",
    url: SITE_URL,
    telephone: "+254142378150",
    email: "admin@joatkenya.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "The Brick Mall, 2nd Floor, Kiambu Road, Thindigua",
      addressLocality: "Kiambu",
      addressCountry: "KE",
    },
  },
  areaServed: [{ "@type": "Country", name: "Kenya" }, "Worldwide"],
  audience: {
    "@type": "Audience",
    audienceType:
      "International entrepreneurs, investors, expanding companies and professionals relocating to Kenya",
  },
  url: `${SITE_URL}${PATH}`,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Kenya consultation options",
    itemListElement: CONSULTATIONS.map((c, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: `${c.name} (${c.minutes} minutes)`,
        description: c.summary,
      },
    })),
  },
};

export const Route = createFileRoute("/kenya-consultation")({
  component: KenyaConsultationPage,
  head: () => ({
    ...seo({
      title: "Kenya Market Entry & Relocation Consultation | JOAT",
      description:
        "Moving to Kenya, starting a business, or expanding into the Kenyan market? Book a 1-hour discovery consultation or a 2-hour market entry strategy session with JOAT's Director.",
      path: PATH,
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Kenya Consultation", PATH)),
      },
      { type: "application/ld+json", children: JSON.stringify(consultationServiceJsonLd) },
      { type: "application/ld+json", children: JSON.stringify(faqPageJsonLd(CONSULTATION_FAQS)) },
    ],
  }),
});

function KenyaConsultationPage() {
  return (
    <div
      className="consult-page min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <KenyaConsultation />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
