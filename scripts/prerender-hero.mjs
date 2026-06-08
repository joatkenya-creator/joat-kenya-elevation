// Build-time prerender of the above-the-fold Hero into dist/index.html.
//
// Why: this is a client-rendered SPA, so without this the browser shows a blank
// page until the full JS bundle downloads + executes — on a slow mobile
// connection that is the cause of the ~19s LCP. The Hero is the LCP element and
// is intentionally framer-free / data-free / window-free, so it renders to
// deterministic static HTML. Injected into #root, it paints at HTML-parse time,
// seconds before the JS runs.
//
// The client still boots with createRoot() and re-renders the full app; because
// the prerendered Hero markup is identical to what React produces, the swap is
// visually seamless and the early paint is what the browser records as LCP.
//
// Only the Hero is prerendered on purpose: the below-the-fold sections animate
// in with framer-motion's whileInView (initial opacity:0), so prerendering them
// would bake in an invisible state. They stay client-rendered.

import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const INDEX = resolve("dist/index.html");

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
  logLevel: "warn",
  // We only SSR-load one component, so skip the dependency pre-bundling scan.
  // It runs async and, when the server is closed right after, logs a spurious
  // "Request is outdated [vite:dep-scan]" error. noDiscovery avoids it.
  optimizeDeps: { noDiscovery: true },
});

try {
  const { Hero } = await vite.ssrLoadModule("/src/components/site/Hero.tsx");
  const heroHtml = renderToStaticMarkup(React.createElement(Hero));

  let html = readFileSync(INDEX, "utf8");

  // Capture the current #root fallback so we can keep its crawler-facing nav
  // links + contact details (the part from the first <h2> onward, which has no
  // <h1> and so won't duplicate the Hero's headline). It is rendered hidden:
  // out of the layout (no LCP/CLS impact) but still in the DOM for non-JS
  // crawlers. React replaces all of #root on mount, so JS users never see it.
  // Vite injects the entry <script> into <head>, so #root is the last element
  // before </body>. Anchor on that to capture #root's full inner content.
  const rootMatch = html.match(/<div id="root">([\s\S]*)<\/div>(\s*<\/body>)/);
  if (!rootMatch) {
    throw new Error("Could not locate <div id=\"root\"> in dist/index.html");
  }
  const originalInner = rootMatch[1];
  const h2Index = originalInner.indexOf("<h2");
  const crawlerBlock =
    h2Index === -1 ? "" : `<div hidden>${originalInner.slice(h2Index)}</div>`;

  // Function replacer so any `$` in the Hero markup is treated literally.
  const newInner = `${heroHtml}${crawlerBlock}`;
  html = html.replace(
    /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/,
    (_match, closing) => `<div id="root">${newInner}</div>${closing}`,
  );

  writeFileSync(INDEX, html, "utf8");
  const kb = (Buffer.byteLength(heroHtml, "utf8") / 1024).toFixed(1);
  console.log(`✓ Prerendered Hero into dist/index.html (${kb} KB of static markup)`);
} finally {
  await vite.close();
}
