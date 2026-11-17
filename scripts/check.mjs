// Checks that tokens.json keeps its promises:
//   1. every text and status colour meets its contrast floor on the surfaces it is drawn on;
//   2. the logo SVGs, and the product icons scripts/icons.js draws, use only the colours tokens.json names.
//   node scripts/check.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import "./icons.js";
import "./glyphs.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
const failures = [];

// WCAG 2 contrast. Translucent colours ("rgb(r g b / a)") are composited over the background first.
const parse = (c) => {
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  const rgb = c.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  throw new Error(`can't read colour ${c}`);
};
const over = (fg, bg) => {
  const [r, g, b, a] = parse(fg), [R, G, B] = parse(bg);
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fg, bg) => {
  const [x, y] = [lum(over(fg, bg)), lum(parse(bg))].sort((a, b) => b - a);
  return (x + 0.05) / (y + 0.05);
};

// What each colour is drawn on, and how much contrast it needs there.
const panes = ["canvas", "stage", "chrome", "surface", "raised"];
const textOn = ["canvas", "stage", "chrome", "surface"];
const floors = [
  [["text"], panes, 7],
  [["muted", "accent"], panes, 4.5],
  [["faint"], panes, 3], // tertiary text only: timestamps, hints
  [["good", "fair", "poor", "unknown", "live", "private"], textOn, 4.5], // status words
  [["poor"], ["raised"], 4.5], // "Disconnect" on a control
  [["cpu", "ram", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5"], ["canvas", "stage", "surface"], 3], // marks, not text
  [["on-accent"], ["accent", "poor"], 4.5], // text on the accent and on destructive buttons
];

let checked = 0;
for (const mode of ["dark", "light"]) {
  const c = t.color[mode];
  for (const [fgs, bgs, floor] of floors) {
    for (const fg of fgs) {
      for (const bg of bgs) {
        const ratio = contrast(c[fg], c[bg]);
        checked++;
        if (ratio < floor) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${floor}:1`);
      }
    }
  }
  // The selection wash sits on surfaces; the accent drawn on top of it must still read.
  for (const bg of ["canvas", "surface"]) {
    const washed = `rgb(${over(c.wash, c[bg]).map(Math.round).join(" ")})`;
    const ratio = contrast(c.accent, washed);
    checked++;
    if (ratio < 4.5) failures.push(`${mode}: accent on wash over ${bg} is ${ratio.toFixed(2)}:1, needs 4.5:1`);
  }
}

// Logo files may only use the logo colours, white, and the light palette's text (mark-ink).
const allowed = new Set([...Object.values(t.logo), "#ffffff", t.color.light.text].map((h) => h.toLowerCase()));
const svgs = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".svg")) svgs.push(p);
  }
};
walk(join(root, "logo"));
const colours = (name, src) => {
  if (/<style|style="/.test(src)) failures.push(`${name} uses CSS; set colours as fill, stroke or stop-color attributes`);
  for (const [, attr, value] of src.matchAll(/\b(fill|stroke|stop-color|color)="([^"]*)"/g)) {
    const v = value.trim();
    if (v === "none" || v === "currentColor" || /^url\(#[\w-]+\)$/.test(v)) continue;
    if (!allowed.has(v.toLowerCase())) failures.push(`${name} has ${attr}="${v}", which isn't a colour tokens.json names`);
  }
};
for (const p of svgs) colours(p.slice(root.length + 1).replace(/\\/g, "/"), readFileSync(p, "utf8"));
// Every built-in picture, and a letter, in both kinds of product icon.
const icons = [...Object.keys(zxIcons.pictures).map((picture) => [picture, { picture }]), ["letter F", "F"]];
for (const [label, what] of icons) {
  for (const kind of ["icon", "maskable"]) {
    const src = zxIcons.icon(kind, t.logo, what);
    colours(`the ${label} ${kind}`, src);
    if (/\{\w+\}/.test(src)) failures.push(`the ${label} ${kind} has an unfilled role: ${src.match(/\{\w+\}/)[0]}`);
  }
}
const badge = readFileSync(join(root, "logo", "flexspeak.svg"), "utf8").toLowerCase();
for (const [k, v] of Object.entries(t.logo)) {
  if (!badge.includes(v.toLowerCase())) failures.push(`logo/flexspeak.svg doesn't use logo.${k} ${v}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`${failures.length} problem(s).`);
  process.exit(1);
}
console.log(`Contrast holds (${checked} pairs); ${svgs.length} logo files and ${icons.length * 2} product icons use only token colours.`);
