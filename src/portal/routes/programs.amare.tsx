import { createFileRoute } from "@tanstack/react-router";
import amarePlanet from "@/assets/amare-planet.webp";
import { AMARE_SITE_URL } from "../config";
import { usePrograms } from "../account";
import { ApplicationStatus, Section } from "../ui";

export const Route = createFileRoute("/programs/amare")({
  head: () => ({ meta: [{ title: "Amare's Big Planet program | JOAT Global Partners" }] }),
  component: AmareProgram,
});

// Amare's Big Planet keeps its own identity: its own colours and artwork here,
// not JOAT Global's.
function AmareProgram() {
  const { data: programs } = usePrograms();
  const program = programs?.find((p) => p.id === "amare");

  return (
    <>
      <section className="bg-[#2a2a6e] text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
          <img
            src={amarePlanet}
            alt="Amare's Big Planet"
            className="h-24 w-24 rounded-full bg-white/10 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Amare's Big Planet program
            </h1>
            <p className="mt-3 max-w-2xl text-white/85">
              Recommend Amare's Big Planet to parents and families, and earn commission on eligible
              purchases from the Amare shop.
            </p>
            <div className="mt-4">
              <ApplicationStatus program={program} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6">
        <Section title="About the brand">
          <p>
            Amare's Big Planet is a children's learning brand: educational songs and videos, the
            Drawalet letter-tracing app for Android and iOS, and an online shop. See the{" "}
            <a
              href={AMARE_SITE_URL}
              className="text-primary underline"
              rel="noopener"
              target="_blank"
            >
              Amare's Big Planet website
            </a>{" "}
            for current content and products.
          </p>
        </Section>

        <Section title="Speak to parents, not children">
          <p>
            Amare's Big Planet is made for children, but your promotion must be aimed at parents and
            other adults. Don't direct referral links or sales messages at children, and don't place
            them inside content made for children.
          </p>
        </Section>

        <Section title="When a referral earns commission">
          <p>
            Commission is calculated on eligible net product revenue from orders placed through your
            referral, after the order is paid and verified with the shop. Shipping, taxes and
            discounts are excluded. If an order is canceled or refunded, the commission is reversed
            or reduced to match.
          </p>
          <p>
            <strong>Rate: 8%, rising to 10%</strong> of eligible net product revenue on each
            referred order. Everyone starts at 8%; ambassadors who grow their sales can move up to
            10% within their first 6 months. For example, a $59.29 order (after discounts, excluding
            shipping and tax) earns $4.74 at 8% or $5.93 at 10%. Commission can be approved for
            payout 30 days after the order is paid.
          </p>
        </Section>
      </div>
    </>
  );
}
