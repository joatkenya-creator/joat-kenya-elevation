import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { CourseAccount } from "@/components/site/CourseAccount";
import { Footer } from "@/components/site/Footer";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/courses_/account")({
  component: CourseAccountPage,
  head: () => ({
    ...seo({
      title: "My Account | JOAT Kenya Courses",
      description: "Your JOAT Kenya course registration.",
      path: "/courses/account",
      noindex: true,
    }),
  }),
});

function CourseAccountPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <CourseAccount />
      </main>
      <Footer />
    </div>
  );
}
