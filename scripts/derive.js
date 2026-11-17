// One product hue in, a product identity out: badge and ribbon colours, an accent for each palette,
// and the neutrals turned toward the hue. The identity page loads this file as a plain script and
// scripts/product.mjs imports it, so both give the same answer.
//
//   zxDerive(hue, palettes) -> { hue, near, logo, dark, light, checks }
//   hue       0-360, an OKLCH hue angle
//   palettes  { dark: {...}, light: {...} } from tokens.json's "color"
//   zxDerive.icon(kind, logo, what) -> the icon as SVG, in the group's colours or a product's;
//   what is "" (the plain caret), a letter, or { picture: name or markup }
(() => {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
  const lum = (hex) => { const [r, g, b] = rgbOf(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  const toOklch = (hex) => {
    const [r, g, b] = rgbOf(hex).map(lin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360];
  };
  const linearOf = (L, C, h) => {
    const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  };
  // OKLCH to hex. Out-of-gamut colours give up chroma, never hue or lightness.
  const oklch = (L, C, h) => {
    const fits = (c) => linearOf(L, c, h).every((v) => v >= -0.0005 && v <= 1.0005);
    if (!fits(C)) { let lo = 0, hi = C; for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; } C = lo; }
    return hexOf(linearOf(L, C, h).map(unlin));
  };
  // The lightness at which a hue and chroma reach a given relative luminance. Hex rounding can
  // land a hair off, so step to the safe side: never lighter in dark, never darker in light.
  const atLuminance = (Y, C, h, darker) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (lum(oklch(mid, C, h)) < Y) lo = mid; else hi = mid; }
    let L = (lo + hi) / 2;
    const safe = (hex) => (darker ? lum(hex) <= Y : lum(hex) >= Y);
    while (!safe(oklch(L, C, h)) && L > 0 && L < 1) L = Math.min(1, Math.max(0, L + (darker ? -0.0005 : 0.0005)));
    return oklch(L, C, h);
  };
  const hueGap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const alpha = (hex, a) => `rgb(${rgbOf(hex).map((v) => Math.round(v * 255)).join(" ")} / ${a})`;
  const over = (hex, a, bg) => hexOf(rgbOf(hex).map((v, i) => v * a + rgbOf(bg)[i] * (1 - a)));

  const panes = ["canvas", "stage", "chrome", "surface", "raised"];

  function zxDerive(hue, palettes) {
    const h = ((hue % 360) + 360) % 360;
    const out = {
      hue: h,
      // The badge is a deep version of the hue, the ribbon a pale one, so the mark always reads.
      logo: {
        "badge-top": oklch(0.5, 0.17, h), "badge-mid": oklch(0.34, 0.15, h), "badge-deep": oklch(0.23, 0.1, h),
        "ribbon-front": oklch(0.87, 0.07, h), "ribbon-back": oklch(0.79, 0.1, h), "ribbon-shade": oklch(0.6, 0.17, h),
      },
      checks: [],
    };
    for (const mode of ["dark", "light"]) {
      const base = palettes[mode], p = {};
      // Neutrals keep their luminance, so every text contrast in the default palette still holds.
      for (const k of panes) {
        const [, c] = toOklch(base[k]);
        p[k] = atLuminance(lum(base[k]), Math.min(0.022, c + 0.004), h, mode === "dark");
      }
      // The accent: as strong as the default's, measured on the pane where it is weakest.
      const dark = mode === "dark", chroma = dark ? 0.13 : 0.2, target = dark ? 5 : 5.3;
      let L = dark ? 0.6 : 0.62;
      for (let i = 0; i < 200; i++) {
        if (Math.min(...panes.map((k) => contrast(oklch(L, chroma, h), p[k]))) >= target) break;
        L += dark ? 0.004 : -0.004;
      }
      p.accent = oklch(L, chroma, h);
      p["on-accent"] = dark ? oklch(0.17, 0.03, h) : "#ffffff";
      const a = dark ? 0.16 : 0.12;
      p.wash = alpha(p.accent, a);
      out[mode] = p;
      const worst = panes.reduce((w, k) => (contrast(p.accent, p[k]) < contrast(p.accent, p[w]) ? k : w));
      out.checks.push(
        { mode, what: `accent on ${worst}`, ratio: contrast(p.accent, p[worst]), floor: 4.5 },
        { mode, what: "text on the accent", ratio: contrast(p["on-accent"], p.accent), floor: 4.5 },
        { mode, what: "accent on a selected row", ratio: contrast(p.accent, over(p.accent, a, p.surface)), floor: 4.5 },
      );
    }
    // A product hue close to a status colour is fine on a badge, but confusing as an accent.
    out.near = null;
    for (const k of ["good", "fair", "poor"]) {
      if (hueGap(h, toOklch(palettes.dark[k])[2]) < 22) out.near = k;
    }
    out.ok = out.checks.every((c) => c.ratio >= c.floor);
    return out;
  }

  // The identity as CSS: the overrides a product imports after tokens.css.
  zxDerive.css = (d, name = "Product") => {
    const block = (o, indent) => Object.entries(o).map(([k, v]) => `${indent}--zx-${k}: ${v};`).join("\n");
    const logo = Object.entries(d.logo).map(([k, v]) => `  --zx-logo-${k}: ${v};`).join("\n");
    return `/* ${name}: a Zirkumflex product palette, hue ${Math.round(d.hue)}. Import after tokens.css. */
:root {
${logo}
}

:root,
.dark,
[data-theme="dark"] {
${block(d.dark, "  ")}
}

.light,
[data-theme="light"] {
${block(d.light, "  ")}
}

@media (prefers-color-scheme: light) {
  [data-theme="system"] {
${block(d.light, "    ")}
  }
}
`;
  };

  // Pictures: one object with the caret in it, drawn for the tile's 64-unit box and kept within
  // 30 units of its centre. Colours are written as roles, {ribbon-back} and so on, so a picture
  // follows the product's hue; url(#front) is the front ribbon's gradient, url(#badge) the ground's.
  zxDerive.pictures = {
    // A computer file: a sheet with a folded corner, the caret printed on it.
    file: `<path d="M20 8 H36.5 L49 20.5 V52 a4 4 0 0 1 -4 4 H20 a4 4 0 0 1 -4 -4 V12 a4 4 0 0 1 4 -4 Z" fill="url(#front)"/>
  <path d="M36.5 8 V17.5 a3 3 0 0 0 3 3 H49 Z" fill="{ribbon-back}"/>
  <g transform="translate(18.1 24.63) scale(1.2)">
    <path d="M9.88 3.36 L14.94 3.36 L23.00 16.32 L17.95 16.32 Z" fill="{badge-top}"/>
    <path d="M1.00 20.64 L6.54 20.64 L14.94 3.36 L9.39 3.36 Z" fill="{badge-mid}"/>
  </g>`,
  };
  const pictureScale = { badge: 0.86, tile: 1, maskable: 0.8 };

  // A product icon as SVG, in a 64-unit box: "badge" (round), "tile" (square) or "maskable"
  // (full-bleed). A picture replaces the caret, since it carries its own. With a letter (needs scripts/glyphs.js loaded first) the caret moves up and the
  // letter sits under it, as a circumflex sits over a letter. Each row is the caret's scale and
  // top edge, then the letter's cap height and baseline. The maskable rows keep everything
  // inside the centre circle that is 80% of the width.
  const layout = {
    badge: { plain: [1.718, 17.16], letter: [1.15, 9.5, 20, 52] },
    tile: { plain: [1.8333, 16.16], letter: [1.25, 7, 23, 56] },
    maskable: { plain: [1.65, 17.74], letter: [1.05, 12, 18, 49] },
  };
  const n = (v) => +v.toFixed(2);
  zxDerive.letter = (ch) => { const c = String(ch ?? "").trim().toUpperCase()[0]; return c && globalThis.zxGlyphs?.[c] ? c : ""; };
  zxDerive.icon = (kind, logo, what = "", id = "") => {
    const picture = what && what.picture ? zxDerive.pictures[what.picture] ?? what.picture : "";
    const ch = picture ? "" : zxDerive.letter(what), [s, top, cap, base] = layout[kind][ch ? "letter" : "plain"];
    const round = kind === "badge", u = (name) => `url(#${id}${name})`;
    const stops = (...list) => list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? "" : ` stop-opacity="${a}"`}/>`).join("");
    const defs = [
      `<linearGradient id="${id}b" x1="0.2" y1="0" x2="0.8" y2="1">${stops([0, logo["badge-top"]], [0.55, logo["badge-mid"]], [1, logo["badge-deep"]])}</linearGradient>`,
      `<linearGradient id="${id}f" x1="0" y1="1" x2="0.4" y2="0">${stops([0, logo["ribbon-front"]], [1, "#ffffff"])}</linearGradient>`,
      round && `<linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1">${stops([0, logo["ribbon-back"]], [1, logo["ribbon-shade"]])}</linearGradient>`,
      round && `<radialGradient id="${id}s" cx="0.35" cy="0.12" r="0.7">${stops([0, "#ffffff", 0.22], [1, "#ffffff", 0])}</radialGradient>`,
      round && `<linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1">${stops([0, "#ffffff", 0.35], [1, "#ffffff", 0.04])}</linearGradient>`,
    ].filter(Boolean);
    const ground = {
      badge: `<circle cx="32" cy="32" r="29" fill="${u("b")}"/>\n  <circle cx="32" cy="32" r="29" fill="${u("s")}"/>\n  <circle cx="32" cy="32" r="28.75" fill="none" stroke="${u("r")}" stroke-width="0.5"/>`,
      tile: `<rect width="64" height="64" rx="14" fill="${u("b")}"/>\n  <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/>`,
      maskable: `<rect width="64" height="64" fill="${u("b")}"/>`,
    }[kind];
    let mark = `<g transform="translate(${n(32 - 12 * s)} ${n(top - 3.36 * s)}) scale(${s})">
    <path d="M9.88 3.36 L14.94 3.36 L23.00 16.32 L17.95 16.32 Z" fill="${round ? u("k") : logo["ribbon-back"]}"/>
    <path d="M1.00 20.64 L6.54 20.64 L14.94 3.36 L9.39 3.36 Z" fill="${u("f")}"/>
  </g>`;
    if (picture) {
      const k = pictureScale[kind], drawn = picture.replace(/\{([\w-]+)\}/g, (_, role) => logo[role]).replaceAll("url(#front)", u("f")).replaceAll("url(#badge)", u("b"));
      mark = k === 1 ? drawn : `<g transform="translate(${n(32 - 32 * k)} ${n(32 - 32 * k)}) scale(${k})">\n  ${drawn}\n  </g>`;
    } else if (ch) {
      const [w, d] = globalThis.zxGlyphs[ch], k = cap / 100;
      mark += `\n  <path transform="translate(${n(32 - w * k / 2)} ${base}) scale(${n(k)})" d="${d}" fill="${logo["ribbon-front"]}"/>`;
    }
    const px = kind === "tile" ? 64 : 1024;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}">
  <defs>
    ${defs.join("\n    ")}
  </defs>
  ${ground}
  ${mark}
</svg>
`;
  };

  zxDerive.hueOf = (hex) => toOklch(hex)[2];
  globalThis.zxDerive = zxDerive;
})();
