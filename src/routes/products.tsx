import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Products } from "@/components/site/Products";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    ...seo({
      title: "Products | BioBiz & Digital Solutions — JOAT Kenya",
      description:
        "JOAT Kenya products: BioBiz digital business cards with AI meeting notes, plus our software, AI marketing and animation studio work.",
      path: "/products",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Products", "/products")),
      },
    ],
  }),
});

function ProductsPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <Products />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
