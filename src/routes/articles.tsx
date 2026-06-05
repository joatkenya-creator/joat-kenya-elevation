import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { News } from "@/components/site/News";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
  head: () => ({
    ...seo({
      title: "News & Articles | JOAT KENYA",
      description:
        "Read JOAT Kenya insights on talent recruitment, work culture, digital business tools, AI automation, and the East African job market.",
      path: "/articles",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Articles", "/articles")),
      },
    ],
  }),
});

function ArticlesPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20 lg:pt-24">
        <News />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
