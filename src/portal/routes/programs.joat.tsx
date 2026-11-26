import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, Percent, Receipt } from "lucide-react";
import joatLogo from "@/assets/joat-logo.png";
import { FALLBACK_SERVICES } from "@/data/services-catalog";
import { JOAT_SITE_URL } from "../config";
import { usePrograms } from "../account";
import { TOP_FAQS } from "../faq-data";
import { ApplicationStatus, PageHero } from "../ui";
import AboutMiles from "../landing/AboutMiles";
import { ServiceDeck } from "../landing/ServicesMiles";
import ProcessMiles from "../landing/ProcessMiles";
import CaseStudyMiles from "../landing/CaseStudyMiles";
import { FaqLuxterra } from "../landing/FaqLuxterra";
import { CTABand } from "../landing/CTAMiles";
import { Button, focusRing } from "../landing/kit";

export const Route = createFileRoute("/programs/joat")({
  head: () => ({ meta: [{ title: "JOAT Global program | JOAT Global Partners" }] }),
  component: JoatProgram,
});

function WebsitePanel() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-5 rounded-[24px] border border-joat-border bg-joat-surface p-8 text-center">
      <img src={joatLogo} alt="JOAT Global logo" className="h-28 w-28 object-contain" />
      <p className="m-0 max-w-[360px] text-[17px] leading-[27px] text-joat-body">
        Full service descriptions are on the JOAT Global website. Describe services only as they
        appear there.
      </p>
      <a
        href={`${JOAT_SITE_URL}/services`}
        rel="noopener"
        target="_blank"
        className={`text-[16px] text-joat-gold underline underline-offset-4 hover:text-joat-gold-hover ${focusRing}`}
      >
        JOAT Global services
      </a>
    </div>
  );
}

function JoatProgram() {
  const { data: programs } = usePrograms();
  const program = programs?.find((p) => p.id === "joat");

  return (
    <>
      <PageHero
        eyebrow="Program"
        title="JOAT Global program"
        intro="Introduce businesses that need help to JOAT Global, and earn commission when a client you referred becomes a paying customer."
      >
        <div className="flex flex-wrap items-center gap-4">
          {program?.accepting_applications && <Button to="/apply">Apply now</Button>}
          <ApplicationStatus program={program} />
        </div>
      </PageHero>

      <AboutMiles
        content={{
          id: "about-joat",
          quote: (
            <>
              “Recommend only to people the product or service{" "}
              <span className="text-joat-gold">genuinely</span>{" "}
              <span className="font-glory leading-[0]">suits</span>.”
            </>
          ),
          title: (
            <>
              Refer <span className="text-joat-gold">businesses.</span>
            </>
          ),
          body: (
            <>
              JOAT Global helps businesses with virtual assistants, AI and automation, marketing and
              lead generation, software development and media production. Commission is earned only
              when a business you referred becomes a client and pays its first invoice.
            </>
          ),
          principles: [
            "Disclose every time, next to the link",
            "Describe services only as they appear on the website",
            "No reward for recruiting other ambassadors",
          ],
          button: { label: "Ambassador resources", to: "/resources" },
          aside: <WebsitePanel />,
        }}
      />

      <ServiceDeck
        id="recommend"
        badge="JOAT Global services"
        heading={
          <>
            What You Can <span className="font-glory leading-[0] text-joat-gold">Recommend.</span>
          </>
        }
        cards={FALLBACK_SERVICES.map((s) => ({ title: s.title, text: s.summary, icon: s.icon }))}
      />

      <ProcessMiles
        content={{
          id: "joat-steps",
          badge: "When a referral earns commission",
          heading: (
            <>
              Every Step <span className="font-glory leading-[0] text-joat-gold">Verified.</span>
            </>
          ),
          steps: [
            {
              title: "Contacts us",
              text: "The business contacts us through your referral link.",
            },
            {
              title: "Becomes a client",
              text: "It becomes a genuine client and agrees to an engagement with us.",
            },
            { title: "Invoice issued", text: "We issue an eligible invoice." },
            {
              title: "Payment confirmed",
              text: "The client pays, and we confirm the payment has been received. Unpaid invoices, proposals and inquiries do not earn commission.",
            },
          ],
        }}
      />

      <CaseStudyMiles
        content={{
          id: "joat-earnings",
          badge: "Commission",
          heading: (
            <>
              How You <span className="font-glory leading-[0] text-joat-gold">Earn.</span>
            </>
          ),
          rows: [
            {
              icon: Percent,
              label: "Rate",
              title: "8%, rising to 10%",
              text: "Move up to 10% within your first 6 months",
              tag: "01",
            },
            {
              icon: Receipt,
              label: "Basis",
              title: "First invoice only",
              text: "On the amount actually paid; later invoices don't earn",
              tag: "02",
            },
            {
              icon: BadgeCheck,
              label: "Payout",
              title: "30 days after payment",
              text: "Then approved for payout by our team",
              tag: "03",
            },
            {
              icon: Briefcase,
              label: "JOAT Global",
              title: "$2,000 first invoice",
              text: "Paid in full, earns $160 at 8% or $200 at 10%",
              tag: "Example",
            },
          ],
          note: (
            <>
              Everyone starts at 8%. We make{" "}
              <span className="text-joat-cream">no promise or guarantee of income</span>, and no
              reward is paid for recruiting other ambassadors.
            </>
          ),
        }}
      />

      <FaqLuxterra items={TOP_FAQS} seeAll />
      <CTABand />
    </>
  );
}
