#!/usr/bin/env node
/**
 * Compress the partner-marquee images to WebP for better Core Web Vitals.
 * Partner logos in the scrolling marquee don't need to be larger than ~360px
 * even on retina displays, so we resize down and re-encode as WebP @ q80.
 *
 * Run from the project root:   node scripts/compress-marquees.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.resolve("src/assets/partners");
const MAX_WIDTH = 360;
const WEBP_QUALITY = 80;

const files = (await fs.readdir(SRC_DIR)).filter(
  (f) => /\.(png|jpe?g)$/i.test(f) && !f.endsWith(".webp"),
);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files.sort()) {
  const srcPath = path.join(SRC_DIR, file);
  const dstPath = path.join(SRC_DIR, file.replace(/\.(png|jpe?g)$/i, ".webp"));
  const beforeStat = await fs.stat(srcPath);
  await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(dstPath);
  const afterStat = await fs.stat(dstPath);
  totalBefore += beforeStat.size;
  totalAfter += afterStat.size;
  const drop = (1 - afterStat.size / beforeStat.size) * 100;
  console.log(
    `${file.padEnd(16)} ${(beforeStat.size / 1024).toFixed(1).padStart(7)} KB → ` +
      `${(afterStat.size / 1024).toFixed(1).padStart(6)} KB  (-${drop.toFixed(0)}%)`,
  );
}

console.log(
  `\nTotal: ${(totalBefore / 1024).toFixed(1)} KB → ${(totalAfter / 1024).toFixed(1)} KB ` +
    `(-${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`,
);
