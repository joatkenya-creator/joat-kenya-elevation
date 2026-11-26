import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { IdleTimeout } from "../IdleTimeout";
import { Navbar } from "../landing/Navbar";
import { SiteFooter, SlimFooter } from "../landing/FooterMiles";
import { Button } from "../landing/kit";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ title: "JOAT Global Partners" }] }),
  component: Root,
  notFoundComponent: () => (
    <section className="relative overflow-hidden bg-joat-black-alt px-5 py-24 text-center sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,color-mix(in_srgb,var(--color-joat-gold)_16%,transparent),transparent_70%)]"
      />
      <div className="relative">
        <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-joat-gold">404</p>
        <h1 className="mt-3 text-[44px] leading-[52px] sm:text-[60px] sm:leading-[68px]">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-joat-body">
          That page doesn't exist on the partner portal.
        </p>
        <div className="mt-8 flex justify-center">
          <Button to="/">Back to the program home</Button>
        </div>
      </div>
    </section>
  ),
});

/** App pages get a sticky navbar and a one-line footer; public pages get the Miles footer. */
const APP_PAGES = ["/dashboard", "/admin", "/apply", "/login"];

function Root() {
  const { queryClient } = Route.useRouteContext();
  const { session, loading } = useSession();
  const path = useRouterState({ select: (s) => s.location.pathname });
  // The landing page draws its own navbar (over the hero) and footer.
  const isLanding = path === "/";
  const isApp = APP_PAGES.some((p) => path === p || path.startsWith(`${p}/`));
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="flex min-h-screen flex-col bg-joat-black font-inter-tight text-joat-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-joat-gold focus:px-3 focus:py-2 focus:text-joat-black"
        >
          Skip to content
        </a>
        {!isLanding && <Navbar variant={isApp ? "sticky" : "static"} />}
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        {!isLanding && (isApp ? <SlimFooter /> : <SiteFooter />)}
      </div>
      <Toaster position="bottom-center" theme="dark" />
      <IdleTimeout userId={session?.user.id} loading={loading} />
    </QueryClientProvider>
  );
}
