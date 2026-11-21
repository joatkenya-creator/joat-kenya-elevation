import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import amarePlanet from "@/assets/amare-planet.webp";
import joatLogo from "@/assets/joat-logo.png";
import { FALLBACK_SERVICES } from "@/data/services-catalog";
import { AMARE_SITE_URL, JOAT_SITE_URL } from "../config";
import { DraftNotice, Page, Section } from "../ui";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Ambassador resources | JOAT Global Partners" }] }),
  component: Resources,
});

const FIRST_WEEK = [
  "Sign in and open your dashboard. Check your details and add how you'd like to be paid.",
  "Create a referral link for each place you'll share: a page, a post or a campaign.",
  "Share it with people who genuinely need what you're recommending, with a clear disclosure.",
  "Follow your dashboard: referred sales appear once the payment is verified.",
];

const DISCLOSURES = [
  { label: "Short (social posts)", text: "#ad · I may earn a commission" },
  {
    label: "JOAT Global",
    text: "I'm a JOAT Global ambassador and may earn a commission if you buy through my link.",
  },
  {
    label: "Amare's Big Planet",
    text: "I'm an Amare's Big Planet ambassador and may earn a commission if you buy through my link.",
  },
  {
    label: "Spoken (videos and live streams)",
    text: "Quick note: I'm a brand ambassador, and I may earn a commission if you buy through my link.",
  },
];

const JOAT_POSTS = [
  "Running a small business and short on time? JOAT Global offers virtual assistants, AI and automation, marketing and lead generation, software development and media production. Tell them what you need: [your link]\n\nI'm a JOAT Global ambassador and may earn a commission if you buy through my link.",
  "If you've been putting off automating the repetitive parts of your business, JOAT Global can help with AI and automation. Start the conversation here: [your link]\n\n#ad · I may earn a commission",
  "Need help with marketing or finding new leads? JOAT Global does marketing and lead generation for businesses. Details: [your link]\n\n#ad · I may earn a commission",
];

const AMARE_POSTS = [
  "Parents: Amare's Big Planet has educational songs and videos for young children, plus an online shop. Have a look: [your link]\n\nI'm an Amare's Big Planet ambassador and may earn a commission if you buy through my link.",
  "Looking for a gift for a little one? The Amare's Big Planet shop is here: [your link]\n\n#ad · I may earn a commission",
];

const DOS = [
  "Disclose every time, next to the link, before anyone clicks.",
  "Recommend only to people the product or service genuinely suits.",
  "Describe services and products only as they appear on the official websites.",
  "Speak to parents and other adults about Amare's Big Planet.",
];

const DONTS = [
  "Don't promise or suggest any level of income, for you or anyone else.",
  "Don't send spam or unsolicited bulk messages.",
  "Don't make claims about results, prices or features that aren't on the official websites.",
  "Don't buy through your own link to earn commission. Self-referrals are flagged for review.",
  "Don't aim Amare's Big Planet links or sales messages at children, or place them in content made for children.",
  "Don't recruit other ambassadors for a reward: the programme pays only on your own referrals.",
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
      aria-label={`Copy: ${label}`}
      className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function CopyList({ items }: { items: { label: string; text: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((d) => (
        <li
          key={d.label}
          className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold">{d.label}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{d.text}</p>
          </div>
          <CopyButton text={d.text} label={d.label} />
        </li>
      ))}
    </ul>
  );
}

const asPosts = (posts: string[]) =>
  posts.map((text, i) => ({ label: `Sample post ${i + 1}`, text }));

function Resources() {
  return (
    <Page
      title="Ambassador resources"
      intro="Your welcome pack: how to get started, how to disclose, ready-to-use posts and brand assets."
    >
      <Section title="Welcome">
        <p>
          Thank you for joining. You earn commission only on verified sales to customers you refer
          yourself, and our team reviews every payout. Here's how to make your first week count.
        </p>
        <ol className="list-decimal space-y-1 pl-6">
          {FIRST_WEEK.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>
          <Link to="/dashboard" className="text-primary underline">
            Go to your dashboard
          </Link>
        </p>
      </Section>

      <Section title="Disclosure guide">
        <p>
          Every recommendation must clearly say that you're an ambassador and may earn a commission.
          This is required by the US Federal Trade Commission's endorsement rules.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Put the disclosure next to the link or claim, where people see it before they click.
          </li>
          <li>Don't hide it in a bio, behind "more", or among a block of hashtags.</li>
          <li>
            In videos and live streams, say it out loud in the content itself, not only in the
            description.
          </li>
          <li>Disclose on every post, even if you've disclosed before.</li>
        </ul>
        <CopyList items={DISCLOSURES} />
      </Section>

      <Section title="JOAT Global: talking points">
        <p>JOAT Global helps businesses with:</p>
        <ul className="list-disc space-y-1 pl-6">
          {FALLBACK_SERVICES.map((s) => (
            <li key={s.title}>
              <strong>{s.title}:</strong> {s.summary}
            </li>
          ))}
        </ul>
        <p>
          Commission is earned only when a business you referred becomes a client and pays its first
          invoice. Full descriptions are on the{" "}
          <a
            href={`${JOAT_SITE_URL}/services`}
            className="text-primary underline"
            rel="noopener"
            target="_blank"
          >
            JOAT Global website
          </a>
          .
        </p>
        <CopyList items={asPosts(JOAT_POSTS)} />
      </Section>

      <Section title="Amare's Big Planet: talking points">
        <p>
          Amare's Big Planet is a children's learning brand: educational songs and videos, the
          Drawalet letter-tracing app for Android and iOS, and an online shop. Commission is earned
          on eligible purchases from the Amare shop.
        </p>
        <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Speak to parents, not children.</strong> Aim all promotion at parents and other
          adults. Never direct referral links or sales messages at children, or place them inside
          content made for children.
        </p>
        <p>
          Current content and products are on the{" "}
          <a
            href={AMARE_SITE_URL}
            className="text-primary underline"
            rel="noopener"
            target="_blank"
          >
            Amare's Big Planet website
          </a>
          .
        </p>
        <CopyList items={asPosts(AMARE_POSTS)} />
      </Section>

      <Section title="Do and don't">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-emerald-800">Do</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {DOS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-red-800">Don't</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {DONTS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Brand assets">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              src: joatLogo,
              name: "JOAT Global logo",
              file: "joat-global-logo.png",
              bg: "bg-white",
            },
            {
              src: amarePlanet,
              name: "Amare's Big Planet logo",
              file: "amares-big-planet-logo.webp",
              bg: "bg-[#2a2a6e]",
            },
          ].map((a) => (
            <figure key={a.name} className="rounded-lg border border-border bg-card p-4">
              <div className={`flex h-32 items-center justify-center rounded-md ${a.bg}`}>
                <img src={a.src} alt={a.name} className="max-h-24 object-contain" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between text-sm">
                <span>{a.name}</span>
                <a href={a.src} download={a.file} className="text-primary underline">
                  Download
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>Use the logos as they are: don't stretch, recolour, crop or add effects.</li>
          <li>Keep the two brands separate; don't combine their logos into one design.</li>
          <li>Don't use the logos in a way that suggests you are the company or speak for it.</li>
        </ul>
      </Section>

      <Section title="Programme rules">
        <DraftNotice />
        <p>
          The full rules are in the{" "}
          <Link to="/terms" className="text-primary underline">
            programme terms
          </Link>{" "}
          and the{" "}
          <Link to="/faq" className="text-primary underline">
            FAQ
          </Link>
          .
        </p>
      </Section>
    </Page>
  );
}
