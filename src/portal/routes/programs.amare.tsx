import { createFileRoute } from "@tanstack/react-router";
import amarePlanet from "@/assets/amare-planet.webp";
import { AMARE_SITE_URL } from "../config";
import { usePrograms } from "../account";
import { ApplicationStatus, Section } from "../ui";

export const Route = createFileRoute("/programs/amare")({
  head: () => ({ meta: [{ title: "Amare's Big Planet programme | JOAT Global Partners" }] }),
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
              Amare's Big Planet programme
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
            discounts are excluded. If an order is cancelled or refunded, the commission is reversed
            or reduced to match.
          </p>
          <p>The commission rate will be published here before applications open.</p>
        </Section>
      </div>
    </>
  );
}
