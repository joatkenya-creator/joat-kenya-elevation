import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "../faq-data";
import { FaqLuxterra } from "../landing/FaqLuxterra";
import { CTABand } from "../landing/CTAMiles";
import { PageHero } from "../ui";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ | JOAT Global Partners" }] }),
  component: Faq,
});

// FAQ entries carry no program or topic tags, so they're shown as one list.
function Faq() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        intro="Everything about joining, sharing, commission and payouts in one place."
      />
      <FaqLuxterra items={FAQS} className="bg-joat-black" />
      <CTABand />
    </>
  );
}
