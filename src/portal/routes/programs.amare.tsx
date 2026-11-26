import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Percent, RotateCcw, ShoppingBag } from "lucide-react";
import amarePlanet from "@/assets/amare-planet.webp";
import { AMARE_SITE_URL } from "../config";
import { usePrograms } from "../account";
import { TOP_FAQS } from "../faq-data";
import { ApplicationStatus, PageHero } from "../ui";
import AboutMiles from "../landing/AboutMiles";
import ProcessMiles from "../landing/ProcessMiles";
import CaseStudyMiles from "../landing/CaseStudyMiles";
import { FaqLuxterra } from "../landing/FaqLuxterra";
import { CTABand } from "../landing/CTAMiles";
import { Button, focusRing } from "../landing/kit";

export const Route = createFileRoute("/programs/amare")({
  head: () => ({ meta: [{ title: "Amare's Big Planet program | JOAT Global Partners" }] }),
  component: AmareProgram,
});

// The brief puts every page on the JOAT palette; Amare's Big Planet keeps its own artwork
// (the planet) rather than its own background colours.
function ParentsPanel() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-5 rounded-[24px] border border-joat-border bg-joat-surface p-8 text-center">
      <img
        src={amarePlanet}
        alt="Amare's Big Planet"
        className="h-28 w-28 rounded-full object-contain"
      />
      <h3 className="m-0 font-gilda text-[26px] font-normal text-joat-cream">
        Speak to parents, not children
      </h3>
      <p className="m-0 max-w-[400px] text-[16px] leading-[26px] text-joat-body">
        Amare's Big Planet is made for children, but your promotion must be aimed at parents and
        other adults. Don't direct referral links or sales messages at children, and don't place
        them inside content made for children.
      </p>
    </div>
  );
}

function AmareProgram() {
  const { data: programs } = usePrograms();
  const program = programs?.find((p) => p.id === "amare");

  return (
    <>
      <PageHero
        eyebrow="Program"
        title="Amare's Big Planet program"
        intro="Recommend Amare's Big Planet to parents and families, and earn commission on eligible purchases from the Amare shop."
      >
        <div className="flex flex-wrap items-center gap-4">
          {program?.accepting_applications && <Button to="/apply">Apply now</Button>}
          <ApplicationStatus program={program} />
        </div>
      </PageHero>

      <AboutMiles
        content={{
          id: "about-amare",
          quote: (
            <>
              “Speak to <span className="text-joat-gold">parents</span>, not{" "}
              <span className="font-glory leading-[0]">children</span>.”
            </>
          ),
          title: (
            <>
              About The <span className="text-joat-gold">Brand.</span>
            </>
          ),
          body: (
            <>
              Amare's Big Planet is a children's learning brand. See the{" "}
              <a
                href={AMARE_SITE_URL}
                rel="noopener"
                target="_blank"
                className={`text-joat-gold underline underline-offset-4 hover:text-joat-gold-hover ${focusRing}`}
              >
                Amare's Big Planet website
              </a>{" "}
              for current content and products.
            </>
          ),
          principles: [
            "Educational songs and videos",
            "The Drawalet letter-tracing app for Android and iOS",
            "An online shop",
          ],
          button: { label: "Ambassador resources", to: "/resources" },
          aside: <ParentsPanel />,
        }}
      />

      <ProcessMiles
        content={{
          id: "amare-steps",
          badge: "When a referral earns commission",
          heading: (
            <>
              From Order To <span className="font-glory leading-[0] text-joat-gold">Payout.</span>
            </>
          ),
          steps: [
            {
              title: "Order placed",
              text: "A customer places an order through your referral.",
            },
            {
              title: "Paid and verified",
              text: "The order is paid and verified with the shop.",
            },
            {
              title: "Commission calculated",
              text: "On eligible net product revenue. Shipping, taxes and discounts are excluded.",
            },
            {
              title: "Approved for payout",
              text: "Commission can be approved for payout 30 days after the order is paid.",
            },
          ],
        }}
      />

      <CaseStudyMiles
        content={{
          id: "amare-earnings",
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
              icon: BadgeCheck,
              label: "Basis",
              title: "Eligible net product revenue",
              text: "After discounts, excluding shipping and tax",
              tag: "02",
            },
            {
              icon: RotateCcw,
              label: "Refunds",
              title: "Canceled or refunded",
              text: "Commission is reversed or reduced to match",
              tag: "03",
            },
            {
              icon: ShoppingBag,
              label: "Amare shop",
              title: "$59.29 order",
              text: "Earns $4.74 at 8% or $5.93 at 10%",
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
