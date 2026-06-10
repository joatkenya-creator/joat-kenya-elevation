import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    ...seo({
      title: "Contact JOAT Kenya | Software, Marketing, Media & AI",
      description:
        "Contact JOAT Kenya: email joatkenya120@gmail.com, call +254 142 378 150, or book a 30-min meeting. Worldwide software, marketing, media and AI studio.",
      path: "/contact",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Contact", "/contact")),
      },
    ],
  }),
});

function ContactPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
