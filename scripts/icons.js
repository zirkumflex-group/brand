// The product icon recipe. Every product shares the group's palette; what tells products apart is the
// icon: a picture of what the product is for, drawn in the group's indigo, with the caret on it in
// the ribbon's pale colours. The identity page loads this file as a plain script and
// scripts/product.mjs imports it, so both draw the same icons.
//
//   zxIcons.icon(kind, logo, what, id) -> the icon as SVG, in a 64-unit box
//   kind  "icon"      the picture alone, on no ground: favicon, app icons, the header
//         "maskable"  full-bleed indigo with the picture reversed (pale object, deep caret) inside
//                     the centre circle that is 80% of the width: Android's maskable icon and the
//                     iPhone home screen, which fill transparency with black
//   logo  the logo colours from tokens.json
//   what  { picture: a name from zxIcons.pictures, or markup } or a letter (needs scripts/glyphs.js)
//   id    a prefix for gradient ids, when several icons share a page
(() => {
  // The caret: the group's folded ribbon, front leg and back leg, scaled and moved.
  const caret = (x, y, s, front, back) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M9.88 3.36 L14.94 3.36 L23.00 16.32 L17.95 16.32 Z" fill="${back}"/>
    <path d="M1.00 20.64 L6.54 20.64 L14.94 3.36 L9.39 3.36 Z" fill="${front}"/>
  </g>`;

  // Pictures paint by role, so the same drawing works on no ground and reversed on the indigo:
  //   url(#body)   the object: the badge's indigo, or pale on the indigo ground
  //   url(#front)  the caret's front leg: pale, or the badge's indigo on the ground
  //   {back}       the caret's back leg
  //   {fold}       folds and details on the object
  // Each is drawn inside the circle that touches the square's edges (32 units from the centre), so
  // the maskable version stays inside its safe zone. bounds is what the drawing covers, for lockups.
  const pictures = {
    // A file: a compact sheet with a folded corner, the caret printed on it.
    file: {
      bounds: [8, 5.5, 56, 58.5],
      art: `<path d="M18 5.5 H41 L56 20.5 V48.5 a10 10 0 0 1 -10 10 H18 a10 10 0 0 1 -10 -10 V15.5 a10 10 0 0 1 10 -10 Z" fill="url(#body)"/>
  <path d="M41 5.5 V16 a4.5 4.5 0 0 0 4.5 4.5 H56 Z" fill="{fold}"/>
  ${caret(14.6, 19.1, 1.45, "url(#front)", "{back}")}`,
    },
    // A speaker: the caret on the cone, one ring of sound around it.
    speaker: {
      bounds: [0.04, 0.04, 63.96, 63.96],
      art: `<circle cx="32" cy="32" r="29.24" fill="none" stroke="url(#body)" stroke-width="5.44"/>
  <circle cx="32" cy="32" r="19.72" fill="url(#body)"/>
  ${caret(17.64, 19.55, 1.196, "url(#front)", "{back}")}`,
    },
  };

  // Letters hold the place until a picture fits. A letter has no object to carry it, so it sits
  // under the caret on the indigo tile, as a circumflex sits over a letter. Each row is the caret's
  // scale and top edge, then the letter's cap height and baseline.
  const letterLayout = { icon: [1.25, 7, 23, 56], maskable: [1.05, 12, 18, 49] };
  const n = (v) => +v.toFixed(2);
  const letter = (ch) => { const c = String(ch ?? "").trim().toUpperCase()[0]; return c && globalThis.zxGlyphs?.[c] ? c : ""; };

  function icon(kind, logo, what, id = "") {
    const picture = what && what.picture ? pictures[what.picture]?.art ?? what.picture : "";
    const ch = picture ? "" : letter(what);
    if (!picture && !ch) throw new Error("A product icon needs a picture or a letter: the plain caret on indigo is the group's.");
    const ground = kind === "maskable" || !picture, reversed = kind === "maskable" && picture;
    const u = (name) => `url(#${id}${name})`;
    const grad = (name, [x1, y1, x2, y2], ...stops) =>
      `<linearGradient id="${id}${name}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
    const down = [0, 0, 0.35, 1], up = [0, 1, 0.4, 0];
    const defs = [
      ground && grad("ground", [0.2, 0, 0.8, 1], [0, logo["badge-top"]], [0.55, logo["badge-mid"]], [1, logo["badge-deep"]]),
      reversed ? grad("body", down, [0, "#ffffff"], [1, logo["ribbon-front"]]) : picture && grad("body", down, [0, logo["badge-top"]], [1, logo["badge-mid"]]),
      reversed ? grad("front", up, [0, logo["badge-mid"]], [1, logo["badge-top"]]) : grad("front", up, [0, logo["ribbon-front"]], [1, "#ffffff"]),
    ].filter(Boolean);
    const groundArt = !ground ? "" : kind === "maskable"
      ? `<rect width="64" height="64" fill="${u("ground")}"/>`
      : `<rect width="64" height="64" rx="14" fill="${u("ground")}"/>
  <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/>`;
    let art;
    if (picture) {
      const roles = reversed ? { back: logo["ribbon-shade"], fold: logo["ribbon-back"] } : { back: logo["ribbon-back"], fold: logo["ribbon-shade"] };
      art = picture.replace(/\{(back|fold)\}/g, (_, r) => roles[r]).replaceAll("url(#body)", u("body")).replaceAll("url(#front)", u("front"));
      if (kind === "maskable") art = `<g transform="translate(6.4 6.4) scale(0.8)">\n  ${art}\n  </g>`;
    } else {
      const [s, top, cap, base] = letterLayout[kind], [w, d] = globalThis.zxGlyphs[ch], k = cap / 100;
      art = `${caret(n(32 - 12 * s), n(top - 3.36 * s), s, u("front"), logo["ribbon-back"])}
  <path transform="translate(${n(32 - w * k / 2)} ${base}) scale(${n(k)})" d="${d}" fill="${logo["ribbon-front"]}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    ${defs.join("\n    ")}
  </defs>
  ${groundArt ? groundArt + "\n  " : ""}${art}
</svg>
`;
  }

  // What the drawing covers in the 64-unit box, for placing it beside a name.
  const bounds = (what) => (what && what.picture ? pictures[what.picture]?.bounds ?? [0, 0, 64, 64] : [0, 0, 64, 64]);

  globalThis.zxIcons = { pictures, icon, letter, bounds };
})();
