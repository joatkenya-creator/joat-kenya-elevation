import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { News } from "@/components/site/News";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/news")({
  component: NewsPage,
  head: () => ({
    ...seo({
      title: "News & Insights — JOAT Kenya Digital Studio",
      description:
        "Insights from JOAT Kenya on technology, software, AI, digital marketing, media and the modern digital workplace.",
      path: "/news",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("News", "/news")),
      },
    ],
  }),
});

function NewsPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <News />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
