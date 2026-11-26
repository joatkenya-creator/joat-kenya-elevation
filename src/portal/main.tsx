import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "../styles.css";
import { isIdleExpired } from "./idle";
import { secureSignOut } from "./IdleTimeout";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element in portal/index.html");

// Back/forward cache can restore a page from before sign-out; reload it so the
// auth and idle checks run again instead.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});

// Reloaded (or a background tab woke up) after 30+ idle minutes: sign out
// before anything renders, so no protected data flashes up.
if (isIdleExpired(sessionStorage)) {
  void secureSignOut("idle");
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
