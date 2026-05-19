import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css";

// Apply theme before render so users don't see a flash of light theme.
(function applyInitialTheme() {
  try {
    const stored = localStorage.getItem("joat-theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "dark";
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.dataset.theme = theme;
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
