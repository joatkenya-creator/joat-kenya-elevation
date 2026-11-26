import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  HeadContent,
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import joatLogo from "@/assets/joat-logo.png";
import { useSession } from "@/lib/auth";
import { BRAND } from "../config";
import { IdleTimeout } from "../IdleTimeout";
import { NavLinks } from "../nav";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ title: "JOAT Global Partners" }] }),
  component: Root,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">That page doesn't exist on the partner portal.</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Back to the program home
      </Link>
    </div>
  ),
});

function Root() {
  const { queryClient } = Route.useRouteContext();
  const { session, loading } = useSession();
  // The landing page draws its own navbar and footer.
  const isLanding = useRouterState({ select: (s) => s.location.pathname === "/" });
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        {!isLanding && <Header />}
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        {!isLanding && <Footer />}
      </div>
      <Toaster position="bottom-center" />
      <IdleTimeout userId={session?.user.id} loading={loading} />
    </QueryClientProvider>
  );
}

const navLink = "rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground";
const navActive = "rounded px-2 py-1 text-sm font-medium text-foreground";

function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={joatLogo} alt="" className="h-9 w-9 object-contain" />
          <span className="font-semibold leading-tight">
            {BRAND.name} <span className="font-normal text-muted-foreground">Partners</span>
          </span>
        </Link>
        <nav
          aria-label="Main"
          className="-mx-2 flex w-full flex-wrap items-center gap-1 sm:mx-0 sm:w-auto"
        >
          <NavLinks
            linkClass={navLink}
            activeClass={navActive}
            applyClass="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {BRAND.legalName}. {BRAND.tagline}
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link to="/terms" className="hover:text-foreground">
            Program terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
