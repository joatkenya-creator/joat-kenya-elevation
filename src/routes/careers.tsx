import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Careers } from "@/components/site/Careers";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () => ({
    ...seo({
      title: "Careers at JOAT Kenya | Software, Marketing & Media Roles",
      description:
        "Build your career at JOAT Kenya. Apply through Majobo Kenya and create a BioBiz card. We hire engineers, designers, marketers and content creators.",
      path: "/careers",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Careers", "/careers")),
      },
    ],
  }),
});

function CareersPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <Careers />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
