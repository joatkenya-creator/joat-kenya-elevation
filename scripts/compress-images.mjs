#!/usr/bin/env node
/**
 * Compress the remaining images. WebP for content/photo images, optimized PNG
 * for the logo (kept as PNG so it stays compatible with every favicon and OG
 * crawler).
 *
 * Run from the project root:   node scripts/compress-images.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

// WebP conversions: source → destination, with a sensible max-width per image
// (screenshots wider, thumbnails smaller).
const WEBP_TASKS = [
  { in: "src/assets/amare-planet.jpg", out: "src/assets/amare-planet.webp", width: 400, q: 80 },
  { in: "src/assets/biobiz-mock.jpg", out: "src/assets/biobiz-mock.webp", width: 800, q: 82 },
  { in: "src/assets/biobiz-share.jpg", out: "src/assets/biobiz-share.webp", width: 800, q: 82 },
  {
    in: "src/assets/biobiz-features.jpg",
    out: "src/assets/biobiz-features.webp",
    width: 800,
    q: 82,
  },
  {
    in: "src/assets/biobiz-recordings.jpg",
    out: "src/assets/biobiz-recordings.webp",
    width: 800,
    q: 82,
  },
  { in: "src/assets/biobiz-logo.jpeg", out: "src/assets/biobiz-logo.webp", width: 192, q: 80 },
  { in: "src/assets/talent.jpg", out: "src/assets/talent.webp", width: 600, q: 78 },
  { in: "src/assets/roblox-world.jpg", out: "src/assets/roblox-world.webp", width: 600, q: 78 },
  { in: "src/assets/majobo-logo.jpeg", out: "src/assets/majobo-logo.webp", width: 192, q: 80 },
];

// PNG re-encoded in place (palette optimization + Zopfli-style deflate).
// joat-logo.png must remain a PNG: it's the favicon and the absolute-URL OG
// image, and a few older crawlers still mis-handle WebP OG images.
const PNG_TASKS = [
  { in: "src/assets/joat-logo.png", out: "src/assets/joat-logo.png" },
  { in: "public/joat-logo.png", out: "public/joat-logo.png" },
];

const ORPHAN_FILES = [
  "src/assets/Majobo.jpeg",
  "src/assets/biobiz.jpeg",
  "src/assets/education.jpg",
  "src/assets/hero-tech.jpg",
];

function fmtKB(n) {
  return `${(n / 1024).toFixed(1).padStart(7)} KB`;
}

let totalBefore = 0;
let totalAfter = 0;

console.log("=== WebP conversions ===");
for (const t of WEBP_TASKS) {
  const before = (await fs.stat(t.in).catch(() => null))?.size;
  if (!before) {
    console.log(`  (skip — not found) ${t.in}`);
    continue;
  }
  await sharp(t.in)
    .resize({ width: t.width, withoutEnlargement: true })
    .webp({ quality: t.q })
    .toFile(t.out);
  const after = (await fs.stat(t.out)).size;
  totalBefore += before;
  totalAfter += after;
  const drop = (1 - after / before) * 100;
  console.log(
    `  ${path.basename(t.in).padEnd(26)} ${fmtKB(before)} → ${fmtKB(after)}  (-${drop.toFixed(0)}%)`,
  );
}

console.log("\n=== PNG optimization (in place) ===");
for (const t of PNG_TASKS) {
  const before = (await fs.stat(t.in).catch(() => null))?.size;
  if (!before) {
    console.log(`  (skip — not found) ${t.in}`);
    continue;
  }
  // Re-encode to a temp file, then atomically replace.
  const tmp = `${t.out}.tmp`;
  await sharp(t.in)
    .resize({ width: 600, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toFile(tmp);
  await fs.rename(tmp, t.out);
  const after = (await fs.stat(t.out)).size;
  totalBefore += before;
  totalAfter += after;
  const drop = (1 - after / before) * 100;
  console.log(`  ${t.in.padEnd(26)} ${fmtKB(before)} → ${fmtKB(after)}  (-${drop.toFixed(0)}%)`);
}

console.log("\n=== Deleting orphan files (not imported anywhere) ===");
for (const file of ORPHAN_FILES) {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat) {
    console.log(`  (skip — not found) ${file}`);
    continue;
  }
  await fs.unlink(file);
  totalBefore += stat.size;
  console.log(`  deleted ${file.padEnd(34)} (-${fmtKB(stat.size)})`);
}

console.log(
  `\nTotal: ${(totalBefore / 1024).toFixed(1)} KB → ${(totalAfter / 1024).toFixed(1)} KB ` +
    `(saved ${((totalBefore - totalAfter) / 1024).toFixed(1)} KB / ` +
    `${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`,
);
