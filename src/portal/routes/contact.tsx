import { createFileRoute } from "@tanstack/react-router";
import { JOAT_SITE_URL, SUPPORT_EMAIL } from "../config";
import { Page } from "../ui";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact | JOAT Global Partners" }] }),
  component: Contact,
});

function Contact() {
  return (
    <Page
      title="Contact the partner team"
      intro="Questions about the programme, your application or a commission? We're happy to help."
    >
      <div className="rounded-lg border border-border bg-card p-6">
        {SUPPORT_EMAIL ? (
          <p>
            Email us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline">
              {SUPPORT_EMAIL}
            </a>
            . Please include the email address you use for the portal.
          </p>
        ) : (
          <p>
            Use the{" "}
            <a
              href={`${JOAT_SITE_URL}/contact`}
              className="font-medium text-primary underline"
              rel="noopener"
              target="_blank"
            >
              contact form on the JOAT Global website
            </a>{" "}
            and mention the partner programme in your message.
          </p>
        )}
      </div>
    </Page>
  );
}
