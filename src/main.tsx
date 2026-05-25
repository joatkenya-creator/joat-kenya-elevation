import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css";

// The site uses a single dark-blue theme (no light/dark toggle). Lock it in
// before render so the deep-navy background is always applied.
(function applyTheme() {
  const root = document.documentElement;
  root.classList.add("dark");
  root.dataset.theme = "dark";
})();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
