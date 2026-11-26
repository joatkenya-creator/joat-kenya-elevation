import { createFileRoute } from "@tanstack/react-router";
import Hero from "../landing/HeaderMiles";
import { StatsVendo } from "../landing/StatsVendo";
import AboutMiles from "../landing/AboutMiles";
import ServicesMiles from "../landing/ServicesMiles";
import CaseStudyMiles from "../landing/CaseStudyMiles";
import ProcessMiles from "../landing/ProcessMiles";
import TestimonialMiles from "../landing/TestimonialMiles";
import { FaqLuxterra } from "../landing/FaqLuxterra";
import CTAMiles from "../landing/CTAMiles";
import { SiteFooter } from "../landing/FooterMiles";
import { TOP_FAQS } from "../faq-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Brand Ambassador Program | JOAT Global Partners" }] }),
  component: Home,
});

// Miles sections in template order; Portfolio (File 4) is left out: the repo has no product photos.
function Home() {
  return (
    <div className="bg-joat-black font-inter-tight text-joat-body antialiased">
      <Hero />
      <StatsVendo />
      <AboutMiles />
      <ServicesMiles />
      <CaseStudyMiles />
      <ProcessMiles />
      <TestimonialMiles />
      <FaqLuxterra items={TOP_FAQS} seeAll />
      <CTAMiles />
      <SiteFooter />
    </div>
  );
}
