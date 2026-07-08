import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { CourseLogin } from "@/components/site/CourseLogin";
import { Footer } from "@/components/site/Footer";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/courses_/login")({
  component: CourseLoginPage,
  head: () => ({
    ...seo({
      title: "Log In | JOAT Kenya Courses",
      description: "Log in to your JOAT Kenya course account.",
      path: "/courses/login",
      noindex: true,
    }),
  }),
});

function CourseLoginPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground antialiased font-sans"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Navbar />
      <main className="pt-20">
        <CourseLogin />
      </main>
      <Footer />
    </div>
  );
}
