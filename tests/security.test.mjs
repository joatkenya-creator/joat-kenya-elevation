// Security regression tests. Run with `npm run test:security`.
// Static checks only — nothing here talks to Supabase or the live site
// (see scripts/security-check-live.mjs for that).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const htaccess = read("public/.htaccess");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

test("CSP allows exactly the inline scripts index.html ships", () => {
  const csp = htaccess.match(/Content-Security-Policy(?:-Report-Only)? "([^"]+)"/)[1];
  const scriptSrc = csp.split(";").find((d) => d.trim().startsWith("script-src"));
  assert.ok(!scriptSrc.includes("'unsafe-inline'"), "script-src must not allow 'unsafe-inline'");
  const allowed = [...scriptSrc.matchAll(/'(sha256-[^']+)'/g)].map((m) => m[1]);

  // read() normalizes CRLF to LF, as browsers do before hashing an inline script.
  const inline = [...read("index.html").matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(inline.length > 0);
  for (const body of inline) {
    const hash = "sha256-" + createHash("sha256").update(body).digest("base64");
    assert.ok(allowed.includes(hash), `inline script ${hash} is not in the CSP — update .htaccess`);
  }
});

test("HTTPS redirect runs before the SPA fallback", () => {
  const redirect = htaccess.indexOf("RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]");
  const fallback = htaccess.indexOf("RewriteRule ^ index.html [L]");
  assert.ok(redirect > -1, "HTTPS redirect missing");
  assert.ok(!/^\s*#\s*RewriteRule \^ https/m.test(htaccess), "HTTPS redirect is commented out");
  assert.ok(redirect < fallback, "HTTPS redirect must come before the SPA fallback");
});

test("hardening headers and directives are present", () => {
  assert.match(htaccess, /^\s*Header always set Strict-Transport-Security "max-age=\d+/m);
  assert.match(htaccess, /^\s*Header always set X-Content-Type-Options "nosniff"/m);
  assert.match(htaccess, /frame-ancestors 'self'/);
  assert.match(htaccess, /^Options -Indexes/m);
});

test("no privileged Supabase key in source or build output", () => {
  const dirs = ["src", "public", "dist"].filter(existsSync);
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      if (!/\.(m?[jt]sx?|html|json|txt|map)$/.test(file)) continue;
      const text = readFileSync(file, "utf8");
      assert.ok(!/sb_secret_[\w-]{16,}/.test(text), `${file} contains an sb_secret_ key`);
      for (const [, payload] of text.matchAll(/eyJ[\w-]+\.(eyJ[\w-]+)\.[\w-]+/g)) {
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
        assert.equal(claims.role, "anon", `${file} embeds a "${claims.role}" JWT`);
      }
    }
  }
});

test("every dangerouslySetInnerHTML is sanitized", () => {
  for (const file of walk("src")) {
    if (!/\.tsx$/.test(file)) continue;
    for (const [, expr] of read(file).matchAll(
      /dangerouslySetInnerHTML=\{\{\s*__html:\s*([^}]+)\}\}/g,
    )) {
      assert.match(expr, /^DOMPurify\.sanitize\(/, `${file}: unsanitized __html: ${expr.trim()}`);
    }
  }
});
