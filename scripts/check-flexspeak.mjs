// Compares tokens.json with Flexspeak's default theme, so the two don't drift apart.
//   node scripts/check-flexspeak.mjs [path/to/flexspeak/src/ui/theme.rs]
// Without a path it reads ../flexspeak/src/ui/theme.rs, or downloads it from GitHub with `gh`.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8")).color;

function themeSource() {
  const given = process.argv[2];
  if (given) return readFileSync(given, "utf8");
  const sibling = join(root, "..", "flexspeak", "src", "ui", "theme.rs");
  if (existsSync(sibling)) return readFileSync(sibling, "utf8");
  return execFileSync(
    "gh",
    ["api", "repos/zirkumflex-group/flexspeak/contents/src/ui/theme.rs", "-H", "Accept: application/vnd.github.raw"],
    { encoding: "utf8" },
  );
}

const src = themeSource();
const between = (from, to) => {
  const a = src.indexOf(from);
  const b = a < 0 ? -1 : src.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`theme.rs no longer has "${from}" … "${to}"; update this script`);
  return src.slice(a + from.length, b);
};

const order = ["canvas", "chrome", "surface", "raised", "text", "muted", "faint", "accent", "on-accent"];
const neutrals = (dark) => {
  const block = between(`(ThemeName::Flexspeak, ${dark}) => p!(`, ")");
  const hex = [...block.matchAll(/0x([0-9a-fA-F]{6})/g)].map((m) => `#${m[1].toLowerCase()}`);
  return Object.fromEntries(order.map((k, i) => [k, hex[i]]));
};
const status = (block) =>
  Object.fromEntries(
    [...block.matchAll(/(good|fair|poor|unknown|live|private|cpu|ram): rgb\(0x([0-9a-fA-F]{6})\)/g)].map((m) => [
      m[1],
      `#${m[2].toLowerCase()}`,
    ]),
  );

const flexspeak = {
  dark: { ...neutrals(true), ...status(between("fn dark_status", "pub fn wash")) },
  light: { ...neutrals(false), ...status(between("pub fn new(", "pub fn extra")) },
};

let drift = 0;
for (const mode of ["dark", "light"]) {
  for (const [k, v] of Object.entries(flexspeak[mode])) {
    if (tokens[mode][k] !== v) {
      console.error(`${mode}.${k}: tokens.json ${tokens[mode][k]}, Flexspeak ${v}`);
      drift++;
    }
  }
}
if (drift) {
  console.error(`${drift} colour(s) differ from Flexspeak.`);
  process.exit(1);
}
console.log(`tokens.json matches Flexspeak (${Object.keys(flexspeak.dark).length * 2} colours checked).`);
