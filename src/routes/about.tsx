import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { About } from "@/components/site/About";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    ...seo({
      title: "About | JOAT Kenya: Elite VA, AI Automation & Lead Generation",
      description:
        "JOAT Kenya is an elite virtual assistant, AI automation and lead-generation partner, backed by in-house software, media and children's digital education capabilities.",
      path: "/about",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("About", "/about")),
      },
    ],
  }),
});

function AboutPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <About />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
