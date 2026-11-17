// Gives a product its icon: a picture of what it is for, in the group's indigo with the caret on it.
// Every product keeps the group's palette, so there is no CSS to write. Writes into the product's
// repo, never into this one.
//   node scripts/product.mjs --name "Files" --picture file --out ../files/brand
//       a built-in picture by name
//   node scripts/product.mjs --name "Product" --picture drawing.svg --out ../product/brand
//       the product's own drawing, painted by role as the README describes
//   node scripts/product.mjs --name "Docs" --letter D --out ../docs/brand
//       the caret over the product's letter, on the indigo tile, until a picture fits
// Add --font path/to/Inter[opsz,wght].ttf (and run with bun, after `bun install`) to also get
// the outlined lockup.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, sep } from "node:path";
import "./icons.js";
import "./glyphs.js";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? undefined : process.argv[i + 1]; };
const fail = (msg) => { console.error(msg); process.exit(1); };
const name = arg("name"), out = arg("out"), font = arg("font");
const tokens = JSON.parse(readFileSync(join(repo, "tokens.json"), "utf8"));
const logo = tokens.logo;

if (["hue", "colour", "color"].some((k) => arg(k) !== undefined)) {
  fail("Products share the group's palette and indigo; the icon's picture is what sets one apart. Drop --hue/--colour.");
}
const letter = zxIcons.letter(arg("letter"));
if (!name || !out || (arg("letter") !== undefined && !letter)) {
  fail('usage: node scripts/product.mjs --name "Product" (--picture name-or-file.svg | --letter A-Z or 0-9) --out dir [--font Inter.ttf]');
}

// A picture is a built-in name or a 64-unit SVG file painted by role: url(#body) for the object,
// url(#front) for the caret's front leg, and the logo colours for the rest.
let picture = arg("picture");
if (picture && !zxIcons.pictures[picture]) {
  let svg;
  try { svg = readFileSync(picture, "utf8"); } catch { svg = ""; }
  if (!/<svg[^>]*viewBox="0 0 64 64"/.test(svg)) fail(`--picture takes ${Object.keys(zxIcons.pictures).join(", ")} or an SVG file with viewBox="0 0 64 64".`);
  if (/<(defs|linearGradient|radialGradient|style)\b|style="/.test(svg)) {
    fail("Paint the drawing by role instead of with its own gradients or CSS: url(#body), url(#front), and the logo colours ribbon-back and ribbon-shade.");
  }
  const role = {
    [logo["badge-top"]]: "url(#body)", [logo["badge-mid"]]: "url(#body)", [logo["badge-deep"]]: "url(#body)",
    [logo["ribbon-front"]]: "url(#front)", [logo["ribbon-back"]]: "{back}", [logo["ribbon-shade"]]: "{fold}",
  };
  const unfilled = svg.match(/<(path|circle|ellipse|rect|polygon|polyline)\b(?![^>]*\bfill=)[^>]*>/);
  if (unfilled && !/<g\b[^>]*\bfill=/.test(svg)) fail(`A <${unfilled[1]}> has no fill, so it would draw black. Give every shape a role, or fill="none".`);
  picture = svg.replace(/<\?xml[^>]*>|<!--[\s\S]*?-->|<title>[\s\S]*?<\/title>|<\/?svg[^>]*>/g, "").trim()
    .replace(/\b(fill|stroke)="([^"]*)"/g, (all, attr, v) => {
      const r = role[v.toLowerCase()];
      if (r) return `${attr}="${r}"`;
      if (v === "none" || v === "url(#body)" || v === "url(#front)") return all;
      fail(`${attr}="${v}" isn't a role. Use url(#body), url(#front), ${logo["ribbon-back"]} (the caret's back leg) or ${logo["ribbon-shade"]} (folds and details).`);
    });
}
const what = picture ? { picture } : letter;
if (!what) fail("Give the product a --picture, or a --letter until one fits: the plain caret on indigo is the group's, and Flexspeak's.");
if ((resolve(out) + sep).startsWith(resolve(repo) + sep)) fail("--out must be outside this repo: a product's files live with the product.");

const esc = (t) => t.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/--/g, "- -");
const icon = (kind, comment) => zxIcons.icon(kind, logo, what).replace(/<svg[^>]*>/, (tag) => `${tag}\n  <title>${esc(name)}</title>\n  <!-- ${esc(comment)} -->`);
const drawn = picture ? "its picture in the Zirkumflex indigo with the caret on it" : `the Zirkumflex caret over ${letter} on the indigo tile`;
const files = {
  "icon.svg": icon("icon", `${name}: ${drawn}. ${picture ? "No ground of its own: launchers and tab strips draw theirs. " : ""}For the favicon, app icons and the header.`),
  // Maskable icons get cropped to any shape, so the square is full-bleed and the picture stays
  // inside the centre circle that is 80% of the width. iOS fills transparency with black, so the
  // touch icon comes from this file too.
  "maskable.svg": icon("maskable", `${name}: full-bleed, for "purpose": "maskable" and the Apple touch icon.`),
};
if (font) {
  const { outliner, iconLockup, variants } = await import("./outline.mjs");
  // A drawing of your own is placed as if it fills the 64-unit square; the built-ins know their bounds.
  const lockup = iconLockup(outliner(font), files["icon.svg"], name, esc(`The ${name} icon and name outlined in Inter 650; the name is in currentColor.`), zxIcons.bounds(what));
  for (const [suffix, body] of Object.entries(variants(lockup, tokens.color.light.text))) files[`lockup${suffix}.svg`] = body;
}

mkdirSync(out, { recursive: true });
for (const [file, body] of Object.entries(files)) writeFileSync(join(out, file), body);
console.log(`${name}, ${picture ? "a picture" : `letter ${letter}`}: wrote ${Object.keys(files).join(", ")} to ${out}`);
if (!picture) console.log("  a letter holds the place; draw a picture of what the product is for when one fits.");
if (!font) console.log("  no --font given, so no lockup was written.");
