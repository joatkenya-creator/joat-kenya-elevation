import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Navbar } from "@/components/site/Navbar";
import { CourseSignUp } from "@/components/site/CourseSignUp";
import { Footer } from "@/components/site/Footer";
import { seo } from "@/lib/seo";

const searchSchema = z.object({
  tier: z.enum(["builder", "shipper", "pro"]).optional(),
});

export const Route = createFileRoute("/courses_/sign-up")({
  component: CourseSignUpPage,
  validateSearch: searchSchema,
  head: () => ({
    ...seo({
      title: "Register | JOAT Kenya Courses",
      description: "Create your account to register for the next JOAT Kenya course cohort.",
      path: "/courses/sign-up",
      noindex: true,
    }),
  }),
});

function CourseSignUpPage() {
  const { tier } = Route.useSearch();
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <CourseSignUp initialTier={tier} />
      </main>
      <Footer />
    </div>
  );
}
