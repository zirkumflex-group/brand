// Turns a line of text into SVG path data, outlined from Inter 650 (opsz 32), 100 units to the em.
import * as fontkit from "fontkit";

export const F = 100;
const r = (n) => +n.toFixed(1);

export function outliner(fontPath) {
  const font = fontkit.openSync(fontPath).getVariation({ wght: 650, opsz: 32 });
  const k = F / font.unitsPerEm, track = -0.02 * F;
  const letters = { moveTo: "M", lineTo: "L", quadraticCurveTo: "Q", bezierCurveTo: "C", closePath: "Z" };
  // Returns the path and the x where the text ends.
  function text(str, x0, baseline) {
    const run = font.layout(str);
    let x = x0, d = "";
    run.glyphs.forEach((g, i) => {
      for (const c of g.path.commands) {
        const pts = [];
        for (let j = 0; j < c.args.length; j += 2) pts.push(r(x + c.args[j] * k), r(baseline - c.args[j + 1] * k));
        d += letters[c.command] + pts.join(" ");
      }
      x += run.positions[i].xAdvance * k + (i < run.glyphs.length - 1 ? track : 0);
    });
    return { d: d.replace(/ -/g, "-"), right: x };
  }
  return { text, cap: font.capHeight * k };
}

// An icon SVG's contents, ready to nest inside a lockup: ids prefixed so they can't clash.
export const iconBody = (svg) =>
  svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/\s*<!--[^>]*-->/g, "").replace(/\s*<title>[^<]*<\/title>/g, "")
    .replace(/id="([\w-]+)"/g, 'id="fx-$1"').replace(/url\(#([\w-]+)\)/g, "url(#fx-$1)").trim();

// The icon, centred on the cap height, then the name in currentColor. bounds is the part of the
// icon's 64-unit box the drawing covers; it is scaled until that part is the lockup's height.
// Flexspeak's round badge covers 3..61.
export function iconLockup({ text, cap }, iconSvg, name, comment, [x0, y0, x1, y1] = [3, 3, 61, 61]) {
  const d = 1.4 * F, baseline = (d - cap) / 2 + cap, gap = 0.32 * F;
  const k = d / (y1 - y0), box = 64 * k, view = iconSvg.match(/viewBox="([^"]+)"/)[1];
  const t = text(name, (x1 - x0) * k + gap, baseline);
  const w = Math.ceil(t.right), h = Math.ceil(d);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <!-- ${comment} -->
  <svg x="${r(-x0 * k)}" y="${r(-y0 * k)}" width="${r(box)}" height="${r(box)}" viewBox="${view}">
  ${iconBody(iconSvg).replace(/\n  /g, "\n    ")}
  </svg>
  <path d="${t.d}" fill="currentColor"/>
</svg>
`;
}

// A lockup in white and in ink, for use as plain images.
export const variants = (svg, ink) => ({
  "": svg,
  "-white": svg.replace("in currentColor", "in white").replaceAll("currentColor", "#ffffff"),
  "-ink": svg.replace("in currentColor", "in the light palette's text colour").replaceAll("currentColor", ink),
});
