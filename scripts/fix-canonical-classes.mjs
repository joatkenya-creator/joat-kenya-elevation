// One-off codemod: rewrite Tailwind v4 non-canonical class names to their canonical forms.
// Run with: node scripts/fix-canonical-classes.mjs

import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../src/", import.meta.url));

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(p);
  }
  return out;
}

// Each rule is [regex, replacement]. Replacement may be a string (native $1 backrefs)
// or a function (receives match + capture groups directly).
const rules = [
  // [var(--foo)] -> (--foo). Native string replacement preserves $1 backref.
  { pattern: /\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: "($1)" },
  // bg-gradient-to-X -> bg-linear-to-X
  { pattern: /\bbg-gradient-to-/g, replacement: "bg-linear-to-" },
  // bg-white/[0.NN] -> bg-white/N (Tailwind v4 percentage scale: 0.04 -> 4)
  {
    pattern:
      /\b(bg-(?:white|black|foreground|primary|secondary|accent|muted|destructive))\/\[0\.0?(\d{1,2})\]/g,
    replacement: (_m, util, n) => `${util}/${parseInt(n, 10)}`,
  },
  // z-[60] -> z-60
  { pattern: /\bz-\[(\d+)\]/g, replacement: "z-$1" },
  // h-[30rem] -> h-120 (30rem at 0.25rem per spacing unit)
  { pattern: /\bh-\[30rem\]/g, replacement: "h-120" },
];

let totalFiles = 0;
let totalReplacements = 0;

for (const file of walk(ROOT)) {
  const original = readFileSync(file, "utf8");
  let updated = original;
  for (const { pattern, replacement } of rules) {
    if (typeof replacement === "string") {
      // Native string replacement — native $1/$2 backrefs apply
      updated = updated.replace(pattern, replacement);
    } else {
      updated = updated.replace(pattern, replacement);
    }
  }
  if (updated !== original) {
    // Count actual occurrences changed by re-running each rule against the original
    let fileHits = 0;
    for (const { pattern } of rules) {
      const matches = original.match(pattern);
      if (matches) fileHits += matches.length;
    }
    writeFileSync(file, updated);
    totalFiles++;
    totalReplacements += fileHits;
    console.log(`  ${file.replace(ROOT, "")}: ${fileHits}`);
  }
}

console.log(`\nRewrote ${totalReplacements} occurrence(s) across ${totalFiles} file(s).`);
