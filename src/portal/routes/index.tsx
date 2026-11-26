import { createFileRoute } from "@tanstack/react-router";
import Hero from "../landing/HeaderMiles";
import { FaqSection, TOP_FAQS } from "../landing/Faq";
import {
  About,
  Cta,
  Earnings,
  Footer,
  Process,
  Programs,
  Stories,
  TrustBar,
} from "../landing/sections";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Brand Ambassador Program | JOAT Global Partners" }] }),
  component: Home,
});

function Home() {
  return (
    <div className="bg-joat-black font-inter-tight text-joat-body antialiased selection:bg-joat-gold selection:text-joat-black">
      <Hero />
      <TrustBar />
      <About />
      <Programs />
      <Earnings />
      <Process />
      <Stories />
      <FaqSection items={TOP_FAQS} seeAll />
      <Cta />
      <Footer />
    </div>
  );
}
