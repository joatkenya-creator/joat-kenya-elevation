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
      title: "Products | Real Estate VA, AI Tools & BioBiz | JOAT Kenya",
      description:
        "JOAT Kenya products: a Real Estate Virtual Assistant with AI Inside Sales Agent and human VA tiers, AI chatbots and automation tools, plus BioBiz digital business cards.",
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
