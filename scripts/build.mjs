// Builds tokens.css and shadcn.css from tokens.json.
//   node scripts/build.mjs           write the files
//   node scripts/build.mjs --check   fail if they are out of date
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
const header = "/* Generated from tokens.json by scripts/build.mjs. Don't edit by hand. */\n";

const colours = (palette, indent = "  ") =>
  Object.entries(palette).map(([k, v]) => `${indent}--zx-${k}: ${v};`).join("\n");

const px = (n) => (n === 999 ? "999px" : `${n}px`);

const shared = [
  `  --zx-font-sans: ${t.font.sans};`,
  `  --zx-font-mono: ${t.font.mono};`,
  ...Object.entries(t.logo).map(([k, v]) => `  --zx-logo-${k}: ${v};`),
  ...Object.entries(t.radius).map(([k, v]) => `  --zx-radius-${k}: ${px(v)};`),
  ...Object.entries(t.size).map(([k, v]) => `  --zx-size-${k}: ${px(v)};`),
  ...Object.entries(t.type).flatMap(([k, v]) => [
    `  --zx-text-${k}: ${v.size}px;`,
    `  --zx-weight-${k}: ${v.weight};`,
    ...(v.tracking ? [`  --zx-tracking-${k}: ${v.tracking}px;`] : []),
  ]),
  ...Object.entries(t.motion)
    .filter(([k]) => !k.startsWith("$"))
    .map(([k, v]) => `  --zx-motion-${k}: ${v.css};`),
].join("\n");

const tokensCss = `${header}
/* Dark is the default. Pick a palette with class="dark" / class="light", or
   data-theme="dark" | "light" | "system" on <html>. */
:root {
${shared}
}

:root,
.dark,
[data-theme="dark"] {
  color-scheme: dark;
${colours(t.color.dark)}
}

.light,
[data-theme="light"] {
  color-scheme: light;
${colours(t.color.light)}
}

@media (prefers-color-scheme: light) {
  [data-theme="system"] {
    color-scheme: light;
${colours(t.color.light, "    ")}
  }
}

/* Numbers that change in place line up. */
.zx-tabular {
  font-variant-numeric: tabular-nums;
}
`;

// shadcn/ui names, mapped onto the tokens. Declared on every selector that switches palette,
// so the aliases resolve against the palette of the element that carries the class.
const shadcnCss = `${header}
/* Import after tokens.css in a shadcn/ui or Tailwind app. */
:root,
.dark,
.light,
[data-theme] {
  --background: var(--zx-canvas);
  --foreground: var(--zx-text);
  --card: var(--zx-surface);
  --card-foreground: var(--zx-text);
  --popover: var(--zx-surface);
  --popover-foreground: var(--zx-text);
  --primary: var(--zx-accent);
  --primary-foreground: var(--zx-on-accent);
  --secondary: var(--zx-raised);
  --secondary-foreground: var(--zx-text);
  --muted: var(--zx-chrome);
  --muted-foreground: var(--zx-muted);
  --accent: var(--zx-raised);
  --accent-foreground: var(--zx-text);
  --destructive: var(--zx-poor);
  --destructive-foreground: var(--zx-on-accent);
  --success: var(--zx-good);
  --warning: var(--zx-fair);
  --border: var(--zx-hairline);
  --input: var(--zx-hairline);
  --ring: var(--zx-accent);
  --radius: var(--zx-radius-card);
  --sidebar: var(--zx-chrome);
  --sidebar-foreground: var(--zx-text);
  --sidebar-primary: var(--zx-accent);
  --sidebar-primary-foreground: var(--zx-on-accent);
  --sidebar-accent: var(--zx-raised);
  --sidebar-accent-foreground: var(--zx-text);
  --sidebar-border: var(--zx-hairline);
  --sidebar-ring: var(--zx-accent);
  --chart-1: var(--zx-accent);
  --chart-2: var(--zx-cpu);
  --chart-3: var(--zx-ram);
  --chart-4: var(--zx-good);
  --chart-5: var(--zx-fair);
  --font-sans: var(--zx-font-sans);
  --font-mono: var(--zx-font-mono);
}
`;

const outputs = { "tokens.css": tokensCss, "shadcn.css": shadcnCss };
const check = process.argv.includes("--check");
let stale = [];
for (const [name, body] of Object.entries(outputs)) {
  const path = join(root, name);
  if (check) {
    let current = "";
    try { current = readFileSync(path, "utf8"); } catch {}
    if (current.replace(/\r\n/g, "\n") !== body) stale.push(name);
  } else {
    writeFileSync(path, body);
    console.log(`wrote ${name}`);
  }
}
if (stale.length) {
  console.error(`out of date: ${stale.join(", ")}. Run: node scripts/build.mjs`);
  process.exit(1);
}
