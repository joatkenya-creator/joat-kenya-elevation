import { Link, createFileRoute } from "@tanstack/react-router";
import amarePlanet from "@/assets/amare-planet.webp";
import joatLogo from "@/assets/joat-logo.png";
import { BRAND } from "../config";
import { usePrograms, type Program } from "../account";
import { ApplicationStatus } from "../ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Brand Ambassador Programme | JOAT Global Partners" }] }),
  component: Home,
});

const STEPS = [
  {
    title: "Apply",
    body: "Choose JOAT Global, Amare's Big Planet, or both. Joining is free and needs no purchase.",
  },
  {
    title: "Get approved",
    body: "Our team reviews each application. Each programme approves you separately.",
  },
  {
    title: "Share your links",
    body: "Recommend what you genuinely like, with a clear disclosure that you're an ambassador.",
  },
  {
    title: "Earn on verified sales",
    body: "Commission is earned only on your own referrals, once the payment is verified. Our team approves every payout.",
  },
];

function Home() {
  const { data: programs } = usePrograms();
  const byId = (id: string) => programs?.find((p) => p.id === id);

  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {BRAND.name} Brand Ambassador Programme
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Recommend brands you believe in. Earn on the sales you refer.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            One portal, two independent programmes. Free to join, no purchase required, and you earn
            only on your own verified referrals. There is no reward for recruiting other
            ambassadors.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {programs?.some((p) => p.accepting_applications) && (
              <Link
                to="/apply"
                className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply now
              </Link>
            )}
            <a
              href="#how-it-works"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              How it works
            </a>
            <Link
              to="/faq"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="programmes">
        <h2 id="programmes" className="text-2xl font-bold">
          The programmes
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ProgramCard
            program={byId("joat")}
            to="/programs/joat"
            logo={joatLogo}
            title="JOAT Global"
            body="Refer businesses to JOAT Global for virtual assistants, AI and automation, marketing and lead generation, software development and media production."
            basis="10% of the first invoice paid by each client you refer."
          />
          <ProgramCard
            program={byId("amare")}
            to="/programs/amare"
            logo={amarePlanet}
            title="Amare's Big Planet"
            body="Recommend Amare's Big Planet, a children's learning brand with songs, videos, the Drawalet letter-tracing app and an online shop, to parents and families."
            basis="10% of eligible net product sales from the Amare shop."
          />
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-lg border border-border bg-card p-5">
                <span className="text-sm font-semibold text-primary">Step {i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            We don't promise or guarantee any level of income. What you earn depends entirely on
            genuine sales to customers you refer. Full commission rules are on each programme page.
          </p>
        </div>
      </section>
    </>
  );
}

function ProgramCard(props: {
  program: Program | undefined;
  to: "/programs/joat" | "/programs/amare";
  logo: string;
  title: string;
  body: string;
  basis: string;
}) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <img src={props.logo} alt="" className="h-12 w-12 rounded-full object-contain" />
        <h3 className="text-xl font-semibold">{props.title}</h3>
      </div>
      <p className="mt-4 text-muted-foreground">{props.body}</p>
      <p className="mt-3 text-sm">{props.basis}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <ApplicationStatus program={props.program} />
        <Link
          to={props.to}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Programme details
        </Link>
      </div>
    </article>
  );
}
