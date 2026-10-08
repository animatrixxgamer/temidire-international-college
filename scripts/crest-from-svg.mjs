#!/usr/bin/env node
// Usage: node scripts/crest-from-svg.mjs <crest.svg> [src/components/motion/Crest.tsx]
//
// Reads every <path d="..."> from the SVG, computes a transform that fits the
// artwork into a 240×290 box (centred, aspect ratio kept), and rewrites the block
// between `// <crest-strokes>` and `// </crest-strokes>` in Crest.tsx.
//
// Mark the shield outline in your SVG with id="shield" (or data-shield) so the
// preloader knows which path to fill with gold at 13% opacity.
//
// Limits: only <path> elements are read. Transforms on groups are not applied.
// Convert circles/rects to paths and "Apply transforms" in Inkscape/Illustrator first.

import { readFileSync, writeFileSync } from "node:fs";

const [, , input, target = "src/components/motion/Crest.tsx"] = process.argv;
if (!input) {
  console.error("Usage: node scripts/crest-from-svg.mjs <crest.svg> [Crest.tsx]");
  process.exit(1);
}

const svg = readFileSync(input, "utf8");

// Source box: viewBox first, then width/height.
let minX = 0, minY = 0, w, h;
const vb = svg.match(/viewBox\s*=\s*"([^"]+)"/i)?.[1]?.trim().split(/[\s,]+/).map(Number);
if (vb && vb.length === 4 && vb.every(Number.isFinite)) {
  [minX, minY, w, h] = vb;
} else {
  w = parseFloat(svg.match(/\swidth\s*=\s*"([\d.]+)/i)?.[1]);
  h = parseFloat(svg.match(/\sheight\s*=\s*"([\d.]+)/i)?.[1]);
}
if (!Number.isFinite(w) || !Number.isFinite(h)) {
  console.error("Could not read a viewBox or width/height from the SVG.");
  process.exit(1);
}

const W = 240, H = 290;
const scale = Math.min(W / w, H / h);
const tx = (W - w * scale) / 2 - minX * scale;
const ty = (H - h * scale) / 2 - minY * scale;
const r = (n) => Number(n.toFixed(4));
const fit = `translate(${r(tx)} ${r(ty)}) scale(${r(scale)})`;

const strokes = [];
for (const tag of svg.match(/<path\b[^>]*>/gi) ?? []) {
  const d = tag.match(/\sd\s*=\s*"([^"]+)"/i)?.[1]?.replace(/\s+/g, " ").trim();
  if (!d) continue;
  const shield = /\sid\s*=\s*"shield"/i.test(tag) || /\sdata-shield\b/i.test(tag);
  strokes.push({ d, shield });
}

if (strokes.length === 0) {
  console.error("No <path d=...> found. Convert shapes to paths and try again.");
  process.exit(1);
}
if (!strokes.some((s) => s.shield)) {
  console.warn('Warning: no path is marked id="shield", so nothing will fill with gold.');
}
if (/<(circle|rect|ellipse|line|polyline|polygon|text)\b/i.test(svg)) {
  console.warn("Warning: non-path shapes or text were skipped. Convert them to paths first.");
}
if (/<g\b[^>]*transform=/i.test(svg)) {
  console.warn("Warning: a group has a transform. It was NOT applied; flatten it first.");
}

const lines = strokes.map(
  (s) => `  { d: ${JSON.stringify(s.d)}${s.shield ? ", shield: true" : ""} },`,
);

const block = `// <crest-strokes>
// Generated from ${input.split(/[\\/]/).pop()} by scripts/crest-from-svg.mjs
export const CREST_FIT = ${JSON.stringify(fit)};

export const CREST_STROKES: CrestStroke[] = [
${lines.join("\n")}
];
// </crest-strokes>`;

const file = readFileSync(target, "utf8");
if (!/\/\/ <crest-strokes>[\s\S]*?\/\/ <\/crest-strokes>/.test(file)) {
  console.error(`Markers not found in ${target}.`);
  process.exit(1);
}
writeFileSync(
  target,
  file.replace(/\/\/ <crest-strokes>[\s\S]*?\/\/ <\/crest-strokes>/, () => block),
);
console.log(`Wrote ${strokes.length} strokes to ${target} (fit: ${fit}).`);
