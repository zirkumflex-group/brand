// Gives a product its own icon inside the family, and optionally its own palette. Writes into
// the product's repo, never into this one.
//   node scripts/product.mjs --name "Files" --picture file --out ../files/brand
//       the group's colours, a picture with the caret in it: a built-in one by name, or the
//       path of an SVG drawn as the README describes
//   node scripts/product.mjs --name "Docs" --letter D --out ../docs/brand
//       the group's colours, the caret over the product's letter: for sites that share one look
//   node scripts/product.mjs --name "Product" --hue 350 --out ../product/brand
//   node scripts/product.mjs --name "Product" --colour "#b0266a" --letter P --out ../product/brand
//       its own colour too: icons in that hue, and product.css with the palette to match
// Add --font path/to/Inter[opsz,wght].ttf (and run with bun, after `bun install`) to also get
// the outlined lockup. The hue is an OKLCH hue angle; --colour takes the hue of any colour.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, sep } from "node:path";
import "./derive.js";
import "./glyphs.js";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? undefined : process.argv[i + 1]; };
const name = arg("name"), out = arg("out"), colour = arg("colour") ?? arg("color"), font = arg("font");
const own = colour !== undefined || arg("hue") !== undefined;
const hue = colour ? zxDerive.hueOf(colour) : Number(arg("hue"));
const letter = zxDerive.letter(arg("letter"));
const tokens = JSON.parse(readFileSync(join(repo, "tokens.json"), "utf8"));
// A picture is a built-in name or a 64-unit SVG file drawn in the group's logo colours.
let picture = arg("picture");
if (picture && !zxDerive.pictures[picture]) {
  let svg;
  try { svg = readFileSync(picture, "utf8"); } catch { svg = ""; }
  if (!/<svg[^>]*viewBox="0 0 64 64"/.test(svg)) {
    console.error(`--picture takes ${Object.keys(zxDerive.pictures).join(", ")} or an SVG file with viewBox="0 0 64 64".`);
    process.exit(1);
  }
  picture = svg.replace(/<\?xml[^>]*>|<!--[\s\S]*?-->|<\/?svg[^>]*>/g, "").trim();
  for (const [k, v] of Object.entries(tokens.logo)) picture = picture.replaceAll(new RegExp(v, "gi"), `{${k}}`);
}
const what = picture ? { picture } : letter;
if (!name || !out || (own && Number.isNaN(hue)) || (colour && !/^#[0-9a-f]{6}$/i.test(colour)) || (arg("letter") !== undefined && !letter)) {
  console.error('usage: node scripts/product.mjs --name "Product" [--picture name-or-file.svg | --letter A-Z or 0-9] [--hue 0-360 | --colour "#rrggbb"] --out dir [--font Inter.ttf]');
  process.exit(1);
}
if (!own && !what) {
  console.error("Give the product a --picture, a --letter or a --hue: the plain caret on indigo is the group's, and Flexspeak's.");
  process.exit(1);
}
if ((resolve(out) + sep).startsWith(resolve(repo) + sep)) {
  console.error("--out must be outside this repo: a product's files live with the product.");
  process.exit(1);
}

const d = own ? zxDerive(hue, tokens.color) : null, logo = d ? d.logo : tokens.logo;
const icon = (kind, comment) => zxDerive.icon(kind, logo, what).replace(/(<svg[^>]*>)/, `$1
  <!-- ${comment} -->`);
const mark = picture ? "its own picture around the Zirkumflex caret" : letter ? `the Zirkumflex caret over ${letter}` : "the Zirkumflex mark";
const files = {
  "badge.svg": icon("badge", `${name}: ${mark}, on ${d ? "this product's colour" : "the group's indigo"}. For desktop app icons.`),
  "tile.svg": icon("tile", `${name}: the square tile, for favicons.`),
  // Maskable icons get cropped to any shape, so the square is full-bleed and the mark stays
  // inside the centre circle that is 80% of the width.
  "maskable.svg": icon("maskable", `${name}: full-bleed icon for a web app manifest with "purpose": "maskable".`),
};
if (d) files["product.css"] = zxDerive.css(d, name);
if (font) {
  const { outliner, badgeLockup, variants } = await import("./outline.mjs");
  const lockup = badgeLockup(outliner(font), files["badge.svg"], name, `The ${name} badge and name outlined in Inter 650; the name is in currentColor.`);
  for (const [suffix, body] of Object.entries(variants(lockup, tokens.color.light.text))) files[`lockup${suffix}.svg`] = body;
}

mkdirSync(out, { recursive: true });
for (const [file, body] of Object.entries(files)) writeFileSync(join(out, file), body);
console.log(`${name}${picture ? ", a picture" : letter ? `, letter ${letter}` : ""}, ${d ? `hue ${Math.round(d.hue)}` : "the group's colours"}: wrote ${Object.keys(files).join(", ")} to ${out}`);
for (const c of d?.checks ?? []) console.log(`  ${c.ratio >= c.floor ? "ok  " : "FAIL"} ${c.mode}: ${c.what} ${c.ratio.toFixed(2)}:1 (needs ${c.floor}:1)`);
if (d?.near) console.log(`  note: this hue sits close to the "${d.near}" status colour. Fine for the badge; as an accent it can read as status, so consider keeping the default accent.`);
if (!d) console.log("  no hue given, so the palette stays the group's and no product.css was written.");
if (!font) console.log("  no --font given, so no lockup was written.");
if (d && !d.ok) process.exit(1);
