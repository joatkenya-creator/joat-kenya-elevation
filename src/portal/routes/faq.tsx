import { createFileRoute } from "@tanstack/react-router";
import { FAQS, FaqSection } from "../landing/Faq";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ | JOAT Global Partners" }] }),
  component: () => <FaqSection items={FAQS} headingLevel={1} />,
});
