// Build-time prerender. Two jobs:
//
//  1. Per-route HTML — for every non-home route, write a static <route>.html
//     (about.html, services.html, …) that carries THAT route's own <title>,
//     description, canonical and OG/Twitter tags. The values are pulled from the
//     route's own head() so they can't drift from the app. Served by a fail-safe
//     .htaccess rewrite. This fixes the SPA SEO problem where every route was
//     served the same index.html and therefore shared the homepage's canonical
//     and title (Ahrefs: "non-canonical / duplicate-title page in sitemap").
//
//  2. Hero — inject the framer-free Hero into the homepage (dist/index.html) so
//     it paints before the JS bundle (LCP) and crawlers get real content.
//
// The per-route loop is non-fatal: any route that can't be read is logged and
// skipped (it still works via the SPA shell), so the build never breaks.

import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve("dist");
const INDEX = resolve(DIST, "index.html");

// Non-home routes to prerender. Names map 1:1 to src/routes/<name>.tsx and the
// public URL /<name>.
const ROUTES = [
  "about",
  "services",
  "products",
  "courses",
  "articles",
  "careers",
  "contact",
  "work-with-us",
  "privacy",
  "terms",
];

const escAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escText = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Pull the SEO fields out of a route's head() return value (shape from seo()).
function extractSeo(head) {
  const meta = head?.meta ?? [];
  const links = head?.links ?? [];
  const m = (pred) => meta.find(pred);
  return {
    title: m((x) => "title" in x)?.title,
    description: m((x) => x.name === "description")?.content,
    canonical: links.find((l) => l.rel === "canonical")?.href,
    ogTitle: m((x) => x.property === "og:title")?.content,
    ogDescription: m((x) => x.property === "og:description")?.content,
    ogUrl: m((x) => x.property === "og:url")?.content,
    twTitle: m((x) => x.name === "twitter:title")?.content,
    twDescription: m((x) => x.name === "twitter:description")?.content,
  };
}

// Swap the homepage head tags in the shell for a route's own values.
// Whitespace is matched with \s+ because some meta tags in index.html span
// multiple lines (e.g. <meta\n  name="description"\n  content="…" />).
function applySeo(shell, s) {
  let html = shell;
  const rep = (re, val, fmt) => {
    if (val != null) html = html.replace(re, fmt(val));
  };
  const metaName = (name) => new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`);
  const metaProp = (prop) => new RegExp(`<meta\\s+property="${prop}"\\s+content="[^"]*"\\s*/?>`);

  rep(/<title>[\s\S]*?<\/title>/, s.title, (v) => `<title>${escText(v)}</title>`);
  rep(metaName("description"), s.description, (v) => `<meta name="description" content="${escAttr(v)}" />`);
  rep(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, s.canonical, (v) => `<link rel="canonical" href="${escAttr(v)}" />`);
  rep(metaProp("og:title"), s.ogTitle, (v) => `<meta property="og:title" content="${escAttr(v)}" />`);
  rep(metaProp("og:description"), s.ogDescription, (v) => `<meta property="og:description" content="${escAttr(v)}" />`);
  rep(metaProp("og:url"), s.ogUrl, (v) => `<meta property="og:url" content="${escAttr(v)}" />`);
  rep(metaName("twitter:title"), s.twTitle, (v) => `<meta name="twitter:title" content="${escAttr(v)}" />`);
  rep(metaName("twitter:description"), s.twDescription, (v) => `<meta name="twitter:description" content="${escAttr(v)}" />`);
  return html;
}

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
  logLevel: "warn",
  optimizeDeps: { noDiscovery: true },
});

try {
  // The built shell: homepage head + the generic #root crawler fallback. Read
  // once; the per-route files and the hero injection all derive from it.
  const shell = readFileSync(INDEX, "utf8");

  // 1. Per-route static HTML.
  let count = 0;
  for (const route of ROUTES) {
    try {
      const mod = await vite.ssrLoadModule(`/src/routes/${route}.tsx`);
      const headFn = mod?.Route?.options?.head ?? mod?.Route?.head;
      const seo = extractSeo(typeof headFn === "function" ? headFn() : undefined);
      if (!seo.canonical && !seo.title) {
        console.warn(`  ⚠ ${route}: no head() SEO data found — skipped`);
        continue;
      }
      writeFileSync(resolve(DIST, `${route}.html`), applySeo(shell, seo), "utf8");
      count++;
    } catch (err) {
      console.warn(`  ⚠ ${route}: ${err.message} — skipped`);
    }
  }
  console.log(`✓ Prerendered ${count}/${ROUTES.length} per-route HTML files`);

  // 2. Hero into the homepage.
  const { Hero } = await vite.ssrLoadModule("/src/components/site/Hero.tsx");
  const heroHtml = renderToStaticMarkup(React.createElement(Hero));

  const rootMatch = shell.match(/<div id="root">([\s\S]*)<\/div>(\s*<\/body>)/);
  if (!rootMatch) {
    throw new Error('Could not locate <div id="root"> in dist/index.html');
  }
  const originalInner = rootMatch[1];
  const h2Index = originalInner.indexOf("<h2");
  const crawlerBlock = h2Index === -1 ? "" : `<div hidden>${originalInner.slice(h2Index)}</div>`;
  const newInner = `${heroHtml}${crawlerBlock}`;
  const homeHtml = shell.replace(
    /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/,
    (_m, closing) => `<div id="root">${newInner}</div>${closing}`,
  );
  writeFileSync(INDEX, homeHtml, "utf8");
  const kb = (Buffer.byteLength(heroHtml, "utf8") / 1024).toFixed(1);
  console.log(`✓ Prerendered Hero into dist/index.html (${kb} KB of static markup)`);
} finally {
  await vite.close();
}
