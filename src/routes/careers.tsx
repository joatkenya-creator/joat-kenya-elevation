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
        "Explore open roles at JOAT Kenya and apply directly: sales, IT support, accounting and more. Read the full job description and submit your application online.",
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
        <Careers full />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
