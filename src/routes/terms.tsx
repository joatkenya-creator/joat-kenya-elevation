import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () =>
    seo({
      title: "Terms of Use | JOAT KENYA",
      description:
        "The terms under which you may use joatkenya.com and the products offered by J.O.A.T. Kenya.",
      path: "/terms",
    }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-(--border) bg-navy-deep">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to JOAT KENYA
          </Link>
          <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-foreground">Terms of Use</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: 18 May 2026</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 lg:px-8 py-12 space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">1. Agreement</h2>
          <p>
            By accessing joatkenya.com or any of the products offered by J.O.A.T. Kenya (Jack of All
            Trades Kenya, "JOAT", "we"), you agree to these terms. If you don't agree, please stop
            using the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">2. Our services</h2>
          <p>
            JOAT provides software development, digital marketing, media and animation production,
            AI solutions and children's digital education content, plus our own products (BioBiz and
            Majobo Kenya) and partnered content (Amare's Big Planet). Specific products may have
            additional terms surfaced at sign-up.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">3. Acceptable use</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Don't impersonate anyone or misrepresent your affiliation.</li>
            <li>Don't disrupt the site or attempt unauthorised access.</li>
            <li>
              Don't submit content that's unlawful, defamatory, infringing, hateful or otherwise
              objectionable.
            </li>
            <li>
              Don't use scraping, automation or AI agents to extract data without our written
              permission.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">4. Intellectual property</h2>
          <p>
            All content on this site (text, design, code, logos, illustrations and the J.O.A.T.
            Kenya brand) belongs to JOAT or our licensors and is protected by Kenyan and
            international copyright law. You may not reuse, redistribute or train AI models on this
            material without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">5. AI assistant</h2>
          <p>
            Our website assistant (JACK) is an AI-powered tool that can make mistakes. Treat its
            responses as informational; for binding commitments, contact a member of our team
            directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">6. Disclaimers</h2>
          <p>
            The site and its content are provided "as is" without warranties of any kind. We don't
            guarantee uninterrupted availability or that the information is always current.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">7. Limitation of liability</h2>
          <p>
            To the extent permitted by law, JOAT is not liable for indirect, incidental,
            consequential or punitive damages arising from your use of the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">8. Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of Kenya. Disputes will be resolved
            in the courts of Nairobi unless we agree otherwise in writing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">9. Contact</h2>
          <p>
            Questions about these terms:{" "}
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
