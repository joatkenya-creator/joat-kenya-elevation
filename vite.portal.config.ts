import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// Partner portal (partners.joatkenya.com): a second build of this repository
// with its own entry, route tree and output folder, deployed separately on
// Cloudflare Pages. The public site's vite.config.ts and dist/ are untouched.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "portal",
  envDir: repoRoot,
  resolve: {
    alias: [
      { find: "@", replacement: `${repoRoot}src` },
      // Dev server serves index.html's ../src/portal/main.tsx as /src/... under root (portal/); map it back.
      { find: /^\/src\//, replacement: `${repoRoot}src/` },
    ],
  },
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
      // Absolute: the plugin resolves relative paths against Vite's root (portal/).
      routesDirectory: `${repoRoot}src/portal/routes`,
      generatedRouteTree: `${repoRoot}src/portal/routeTree.gen.ts`,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: `${repoRoot}dist-portal`,
    emptyOutDir: true,
    sourcemap: false,
  },
  server: { port: 8081 },
});
