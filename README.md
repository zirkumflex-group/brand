# Zirkumflex Brand

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="logo/lockup-white.svg">
  <img src="logo/lockup-ink.svg" height="40" alt="Zirkumflex">
</picture>

The logo, colours and design tokens shared by zirkumflex-group projects: a starting point, not a rulebook. This repo is the source of truth. Projects, Flexspeak included, follow it.

**See it:** https://zirkumflex-group.github.io/brand/

## The group and its products

- **The mark** (the circumflex as a folded ribbon) and **the indigo** belong to Zirkumflex. Use them unchanged, with the name, for the group itself. Flexspeak, the first product, wears the plain mark on its round badge.
- **One palette.** Every product uses `tokens.css` as it is: the same neutrals, the same accent, the same status colours, in both modes. No product hue, no per-item colours on controls.
- **Its own icon.** What sets a product apart is a picture of what it is for, drawn in the group's indigo with the caret printed on it in the ribbon's pale colours.

## A new product

A separate website or app gets an icon drawn for it. From a checkout of this repo:

```sh
# A built-in picture by name (so far: file, speaker), or the product's own drawing.
node scripts/product.mjs --name "Files" --picture file --out ../files/brand
node scripts/product.mjs --name "Product" --picture drawing.svg --out ../product/brand
# No picture yet: the product's letter under the caret, on the indigo tile.
node scripts/product.mjs --name "Docs" --letter D --out ../docs/brand
# Add the outlined lockup:
bun scripts/product.mjs --name "Product" --picture drawing.svg --font path/to/Inter.ttf --out ../product/brand
```

Drawing a picture:

- One object the product is for (a file for a place that keeps files, a speaker for one that plays music), centred.
- The caret is on the object: printed on it, or doing a job in it (a roof, an arrow, a fold). It keeps its shape and slant. A picture set beside the caret is two icons, each half the size; merge them.
- Deep object, pale caret. The object is the badge's indigo, the caret the ribbon's pale front and back; details on the object (a folded corner) take the ribbon's shade.
- The object is the icon: no square or circle behind it. Launchers and tab strips draw their own, so a tile of its own shows as a tile inside a tile.
- The file is an SVG with `viewBox="0 0 64 64"`, drawn inside the circle that touches the square's edges, with no part thinner than 4. Paint it by role, with no gradients or CSS of its own:

  | Part | Paint |
  | --- | --- |
  | The object | `url(#body)`, or the flat `badge-mid` (`#2a2585`) |
  | The caret's front leg | `url(#front)`, or the flat `ribbon-front` (`#c3cdff`) |
  | The caret's back leg | `ribbon-back` (`#9fb2ff`) |
  | Folds and details | `ribbon-shade` (`#6575f0`) |

  The tool fills in the gradients, and turns the picture round for the full-bleed versions: a pale object and a deep caret on the indigo. Run it with `--picture file` to see a finished one, or open a drawing on the [identity page](https://zirkumflex-group.github.io/brand/#yours).
- Judge it at 16 px beside its siblings, on light and dark (the identity page's tab strips do this). If it blurs or two look alike, simplify.

Until a picture fits, the product's letter (A to Z or a digit) sits under the caret on the indigo tile, the way a circumflex sits over a letter. It is a placeholder: it says nothing about the product, so swap it for a picture when one fits. The tool refuses to write the plain caret on indigo: that is the group's, and Flexspeak's.

It writes `icon.svg` and `maskable.svg`, plus the lockups when `--font` is given. A drawing of your own sits in the lockup as if it fills the 64-unit square, so draw it edge to edge. The palette is the group's, so there is no CSS to write.

| | Rule |
| --- | --- |
| Keep | The palette, accent included, in both modes; the indigo and the caret in every icon; what the status colours mean; the contrast floors; Inter for interface text |
| Every product changes | Its icon: a picture of what it is for, with the caret on it. Its lockup (its icon with its name). The plain caret on indigo is for the group's own pages, never a product's icon |
| Change if it helps | A display face for the product's name and top heading; radius and density |

Things to check in a product:

- `tokens.css` is imported unchanged (or vendored with the commit it came from), and the product's own colour names map onto it. No product hue.
- Its favicon and header icon are its own `icon.svg`, not `logo/tile.svg` from this repo, and on no ground.
- The accent fills one main action per view and marks selection and focus. Labels that repeat down a list are `muted`; a second button is a plain one.
- One accent on every control. An item's own colour (a track, a user) may tint its artwork, never a button, a slider or a progress bar.
- Green, amber and red appear only as status. Decorative icons use text colours or `chart-*`.
- A display face sets the product's name and the top heading only. Section headings, buttons and data stay in Inter.
- `theme-color` and the manifest's colours are `canvas`, per mode where the platform allows it.
- Icon links carry a version (`?v=` and a hash of the icon files), so installed apps and caches pick up a new drawing.

Icon files by place:

| Place | File | Mind |
| --- | --- | --- |
| Browser tab | `icon.svg` as the favicon | Has to hold at 16 px, on light and dark |
| Beside the name | `lockup.svg`, or its `-white` / `-ink` file | Don't rebuild it from live text |
| Installed web app | 192 and 512 px PNGs from `icon.svg`, one from `maskable.svg` | The `icon.svg` PNGs keep their transparency, for `"purpose": "any"`. The maskable one is cropped to the platform's shape; use it for `"purpose": "maskable"` alone |
| iPhone home screen | A 180 px `apple-touch-icon.png` from `maskable.svg` | iOS fills transparency with black, so this one needs the indigo ground |
| Windows app | `.ico` from `icon.svg` | At least 16, 24, 32, 48 and 256 px |
| macOS app | A layered icon, as in `logo/flexspeak-macos.icon` | The object and the caret's legs as separate layers |

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
| `scripts/product.mjs`, `scripts/icons.js` | The product icon tool and the recipe and pictures it draws with |
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
- Make it yours. Every product has its own icon: a picture of what it is for, in the group's indigo with the caret on it. The palette is everyone's; a display face, radius and density are a product's to change.

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
4. Tell the projects. Every product uses the palette as it is, so each one catches up; Flexspeak's `src/ui/theme.rs` copies the default palette, so update it to match.

The lockups are outlined from Inter by `scripts/lockup.mjs`; rerun it if the mark or the lettering changes. `scripts/icons.js` holds the product icon recipe and the built-in pictures that `scripts/product.mjs`, `scripts/check.mjs` and the identity page all use, so change them in one place. The letters in `scripts/glyphs.js` are outlined from Inter by `scripts/glyphs.mjs`.

## Licence

Code and tokens are MIT. The names and logos are not: see [LICENSE](LICENSE).
