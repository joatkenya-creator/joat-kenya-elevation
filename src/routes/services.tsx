import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Services } from "@/components/site/Services";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo, servicesCatalogJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    ...seo({
      title: "Services | Virtual Assistants, AI Automation & Lead Generation | JOAT",
      description:
        "Elite virtual assistants, AI automation and lead-generation marketing from JOAT Kenya, backed by in-house software development, media production and children's digital education.",
      path: "/services",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Services", "/services")),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(servicesCatalogJsonLd),
      },
    ],
  }),
});

function ServicesPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <Services />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
