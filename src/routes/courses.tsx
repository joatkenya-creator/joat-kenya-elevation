import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Courses } from "@/components/site/Courses";
import { Footer } from "@/components/site/Footer";
import { Chatbot } from "@/components/site/Chatbot";
import { BackToTop } from "@/components/site/BackToTop";
import { breadcrumbJsonLd, faqPageJsonLd, seo } from "@/lib/seo";

const faqs = [
  {
    q: "Do I need to know how to code already?",
    a: "Basic familiarity helps, but we start from how to structure and build. Motivated beginners are welcome.",
  },
  {
    q: "Is it online or in person?",
    a: "Live and in person in Nairobi — that's the point, you build alongside a mentor.",
  },
  {
    q: "What do I leave with?",
    a: "3 deployed apps, a portfolio site, and the workflow to keep building.",
  },
  {
    q: "Can my parent pay for me?",
    a: "Yes. Pay in full, installments, or a parent-pays M-Pesa option are all available.",
  },
  {
    q: "How big is the class?",
    a: "Small: 8–12 people, so you get real attention from the mentor.",
  },
];

export const Route = createFileRoute("/courses")({
  component: CoursesPage,
  head: () => ({
    ...seo({
      title: "Courses | JOAT Kenya Live Cohort — Ship 3 Real Apps in 8 Weeks",
      description:
        "A live, in-person cohort in Nairobi for IT/tech grads who have the certificate but can't build. Ship 3 real apps with AI — deployment and M-Pesa included.",
      path: "/courses",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd("Courses", "/courses")),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqPageJsonLd(faqs)),
      },
    ],
  }),
});

function CoursesPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <Courses />
      </main>
      <Footer />
      <Chatbot />
      <BackToTop />
    </div>
  );
}
