import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import joatLogo from "@/assets/joat-logo.png";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { BRAND } from "../config";
import { useAccount } from "../account";

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
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

const navLink = "rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground";
const navActive = { className: "rounded px-2 py-1 text-sm font-medium text-foreground" };

function Header() {
  const { session } = useSession();
  const { data: account } = useAccount(session?.user.id);
  const isStaff = (account?.staff.length ?? 0) > 0;

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
          <Link to="/programs/joat" className={navLink} activeProps={navActive}>
            JOAT Global
          </Link>
          <Link to="/programs/amare" className={navLink} activeProps={navActive}>
            Amare's Big Planet
          </Link>
          <Link to="/faq" className={navLink} activeProps={navActive}>
            FAQ
          </Link>
          <Link to="/resources" className={navLink} activeProps={navActive}>
            Resources
          </Link>
          {session ? (
            <>
              <Link to="/dashboard" className={navLink} activeProps={navActive}>
                Dashboard
              </Link>
              {isStaff && (
                <Link to="/admin" className={navLink} activeProps={navActive}>
                  Admin
                </Link>
              )}
              <button
                type="button"
                className={navLink}
                onClick={() => void supabase.auth.signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink} activeProps={navActive}>
                Sign in
              </Link>
              <Link
                to="/apply"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply
              </Link>
            </>
          )}
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
