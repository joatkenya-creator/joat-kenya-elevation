import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    seo({
      title: "Privacy Policy | JOAT KENYA",
      description:
        "How J.O.A.T. Kenya collects, uses, stores, and protects information shared through joatkenya.com and our products.",
      path: "/privacy",
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/5 bg-navy-deep">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to JOAT KENYA
          </Link>
          <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: 18 May 2026</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 lg:px-8 py-12 space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">1. Who we are</h2>
          <p>
            J.O.A.T. Kenya ("JOAT", "we", "us") is a Kenyan digital innovation studio operating
            from The Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya. This policy explains
            what we do with personal information we collect through joatkenya.com and our products
            (BioBiz, Majobo Kenya, and the Amare's Big Planet YouTube channel).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">2. What we collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Contact form submissions</strong>: your name, email, service area and message.
            </li>
            <li>
              <strong>Account & profile data</strong> for products you sign up for (BioBiz cards,
              Majobo applications, JOAT Academy enrolments).
            </li>
            <li>
              <strong>Technical data</strong>: IP address, browser, device type and basic analytics
              events to keep the site healthy.
            </li>
            <li>
              <strong>AI chat transcripts</strong>: questions you send to our website assistant
              (JACK) so we can answer them and improve the assistant.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">3. How we use it</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To respond to enquiries and route them to the right team within JOAT.</li>
            <li>To deliver products and services you've requested.</li>
            <li>To keep the platform safe, available and compliant with Kenyan law.</li>
            <li>
              To improve our products and content; never to sell your information to third parties.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">4. Who we share it with</h2>
          <p>
            We share information only with service providers that help us run the business
            (hosting, email, payments, analytics) and with authorities where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">5. How long we keep it</h2>
          <p>
            We keep contact-form enquiries (including any attached documents) for up to 24 months
            and AI chat transcripts for up to 90 days, unless you ask us to delete sooner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">6. Your rights</h2>
          <p>
            You can ask us to access, correct or delete your data, withdraw consent, or object to
            processing. Email{" "}
            <a className="text-gold hover:underline" href="mailto:joatkenya120@gmail.com">
              joatkenya120@gmail.com
            </a>{" "}
            and we'll respond within 14 days, in line with Kenya's Data Protection Act (2019).
          </p>
        </section>

        <section id="compliance">
          <h2 className="text-xl font-bold text-foreground mb-2">7. Compliance</h2>
          <p>JOAT KENYA holds the following certifications and registrations:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>ISO 9001: Quality management.</li>
            <li>NEMA NCA-1: Environmental compliance, Category 1.</li>
            <li>KRA Compliant: Kenya Revenue Authority tax compliance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">8. Contact</h2>
          <p>
            Privacy questions or requests:{" "}
            <a className="text-gold hover:underline" href="mailto:joatkenya120@gmail.com">
              joatkenya120@gmail.com
            </a>{" "}
            · +254 142 378150.
          </p>
        </section>
      </article>
    </div>
  );
}
