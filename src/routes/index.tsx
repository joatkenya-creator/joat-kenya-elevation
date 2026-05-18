import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Services } from "@/components/site/Services";
import { Partners } from "@/components/site/Partners";
import { Testimonials } from "@/components/site/Testimonials";
import { Careers } from "@/components/site/Careers";
import { News } from "@/components/site/News";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <About />
        <Products />
        <WhyChoose />
        <Services />
        <Testimonials />
        <Careers />
        <section id="news"><News /></section>
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
