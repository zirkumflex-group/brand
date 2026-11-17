# Zirkumflex Brand

<img src="logo/flexspeak.svg" width="96" alt="Flexspeak logo">

The logo, colours and design tokens shared by zirkumflex-group projects. Flexspeak is the reference product: everything here comes from its default theme (`src/ui/theme.rs` in [zirkumflex-group/flexspeak](https://github.com/zirkumflex-group/flexspeak)).

**See it:** https://zirkumflex-group.github.io/brand/

## What's in it

| File | What it is |
| --- | --- |
| `tokens.json` | The source of truth: colours (dark and light), logo colours, fonts, type scale, radius, sizes, motion |
| `tokens.css` | The same as CSS custom properties, `--zx-*`. Generated |
| `shadcn.css` | shadcn/ui names (`--background`, `--primary`, `--border` …) mapped onto `--zx-*`. Generated |
| `logo/flexspeak.svg`, `flexspeak.ico` | The round badge |
| `logo/tile.svg` | The mark on a square tile, for favicons |
| `logo/mark.svg` | The mark alone in `currentColor`, for inlining |
| `logo/mark-white.svg`, `mark-ink.svg` | The mark for dark and for light backgrounds |
| `logo/flexspeak-macos.icon/` | The layered macOS app icon |
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

Dark is the default. Put `class="light"` or `data-theme="light"` on `<html>` for the light palette, or `data-theme="system"` to follow the OS.

Swift, Rust and scripts read `tokens.json`. Agents in other repos can read any file without cloning:

```sh
gh api repos/zirkumflex-group/brand/contents/tokens.json -H "Accept: application/vnd.github.raw"
```

## Rules

- Colour means state. Accent for the default action, focus, selection and where you are; green, amber and red only for health; one red.
- Panels and hairlines before boxes. No drop shadows on content.
- Inter for interface text. A product may add one display face for headlines.
- Radius 10 for cards, 6 for controls. Controls 28 px high.
- A product may choose its own accent and tint the neutrals toward it. It keeps the surfaces, type, radius and status colours.

## Changing it

1. Edit `tokens.json` (or a file in `logo/`).
2. `node scripts/build.mjs` regenerates `tokens.css` and `shadcn.css`.
3. `bun run check` confirms the generated files are current and that the colours still match Flexspeak. CI runs the same check.

When Flexspeak's palette changes, update `tokens.json` to match; the check names every colour that differs.
