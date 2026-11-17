# Zirkumflex Brand

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo/lockup-white.svg">
  <img src="logo/lockup-ink.svg" height="40" alt="Zirkumflex">
</picture>

The logo, colours and design tokens shared by zirkumflex-group projects: a starting point, not a rulebook. This repo is the source of truth. Projects, Flexspeak included, follow it.

**See it:** https://zirkumflex-group.github.io/brand/

## The group and its products

- **The mark** (the circumflex as a folded ribbon) and **the indigo** belong to Zirkumflex. Use them, with the name, for the group itself.
- **A badge** is a product's app icon: the mark on that product's colour. Flexspeak, the first product, wears the group's indigo. A new product keeps the mark and picks its own badge colour, and its own accent if it wants one.

## What's in it

| File | What it is |
| --- | --- |
| `tokens.json` | The source of truth: colours (dark and light), chart series, shadows, logo colours, fonts, type scale, radius, spacing, sizes, motion |
| `tokens.css` | The same as CSS custom properties, `--zx-*`. Generated |
| `shadcn.css` | shadcn/ui names (`--background`, `--primary`, `--chart-1` …) mapped onto `--zx-*`. Generated |
| `logo/mark.svg` | The mark in `currentColor`, for inlining |
| `logo/mark-white.svg`, `mark-ink.svg` | The mark for dark and for light backgrounds |
| `logo/mark-solid.svg` | The mark in one flat ink (`currentColor`), for print, stamps and embroidery |
| `logo/lockup.svg` | The mark and "Zirkumflex", outlined, in `currentColor` for inlining; `-white` and `-ink` for use as images |
| `logo/tile.svg` | The mark on a square tile, for favicons |
| `logo/flexspeak.svg`, `flexspeak.ico` | Flexspeak's round badge |
| `logo/lockup-flexspeak.svg` | Flexspeak's badge and name, outlined; `-white` and `-ink` as above |
| `logo/flexspeak-macos.icon/` | Flexspeak's layered macOS app icon |
| `index.html` | The identity page, built from `tokens.css` |

## Use it

Web projects (Bun, npm, pnpm):

```sh
bun add github:zirkumflex-group/brand
```

```css
@import "@zirkumflex/brand/tokens.css";
/* shadcn/ui or Tailwind v4 apps also: */
@import "@zirkumflex/brand/shadcn.css";
```

Dark is the default. Put `class="light"` or `data-theme="light"` on `<html>` for the light palette, or `data-theme="system"` to follow the OS. With shadcn/ui, set `class="dark"` or `class="light"` explicitly: its `dark:` variant looks for the class, not the default.

Swift, Rust and scripts read `tokens.json`. Agents in other repos can read any file without cloning:

```sh
gh api repos/zirkumflex-group/brand/contents/tokens.json -H "Accept: application/vnd.github.raw"
```

## Principles

Defaults, not laws. Bend them where a project's medium needs it, and keep the family resemblance.

- Colour carries meaning. The accent marks the main action, focus and selection; green, amber and red are for status, not decoration. Charts use the chart series.
- Structure before boxes. Space, a heading or a hairline first; a card when something really stands alone; shadows for things that float.
- Calm by default. Short, plain labels. Pick the density that suits the medium.
- Honest state. Stale or unknown data never looks healthy.
- Make it yours. A project can choose its own accent and tint the neutrals toward it, add a display face, or change radius and density. Keep the mark and what the status colours mean.

The defaults: Inter for interface text, radius 10 for cards and 6 for controls, 28 px controls on a desktop.

## Contrast

`bun run check` holds both palettes to these floors (WCAG 2 ratios). Text colours are checked on every panel and on controls (`raised`); status words and chart marks on the panels they appear on:

| Colour | Floor |
| --- | --- |
| `text` | 7:1 |
| `muted`, `accent`, text on the accent | 4.5:1 |
| Status colours, as words on panels (`poor` also on controls) | 4.5:1 |
| `faint` (timestamps, hints only) | 3:1 |
| `cpu`, `ram`, `chart-*` (marks, not text) | 3:1 |

`chart-1`…`chart-5` were chosen so neighbours stay apart under the common colour-vision deficiencies, in their listed order (worst adjacent pair ΔE 8.8 in light, 11.7 in dark, OKLab ×100). Assign series in that order rather than picking freely, and re-validate if you change one; the check above covers contrast only.

## Changing it

1. Edit `tokens.json` (or a file in `logo/`).
2. `node scripts/build.mjs` regenerates `tokens.css` and `shadcn.css`.
3. `bun run check` confirms the generated files are current, the contrast floors hold, and the logos use only token colours. CI runs the same check.
4. Tell the projects. Flexspeak's `src/ui/theme.rs` copies the default palette, so update it to match.

The lockups are outlined from Inter by `scripts/lockup.mjs`; rerun it if the mark or the lettering changes.

## Licence

Code and tokens are MIT. The names and logos are not: see [LICENSE](LICENSE).
