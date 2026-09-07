// Static route for prefers-reduced-motion and for browsers without WebGL2.
// The comparison has to survive without motion, so the end states are drawn
// side by side: patchy thin sheath above, complete thick sheath below.

const SEGMENTS = 9;
const X0 = 96;
const X1 = 452;
const GAP = 7;
const SEG_W = (X1 - X0 - GAP * (SEGMENTS - 1)) / SEGMENTS;

function row(y, thick, presentMask, cls) {
  let out = "";
  for (let i = 0; i < SEGMENTS; i++) {
    if (!presentMask[i]) continue;
    const x = X0 + i * (SEG_W + GAP);
    const h = thick;
    out += `<rect class="${cls}" x="${x.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${SEG_W.toFixed(1)}" height="${h}" rx="${(h / 2).toFixed(1)}"/>`;
  }
  return out;
}

const FULL = Array(SEGMENTS).fill(1);
const PATCHY = [0, 1, 0, 0, 1, 0, 0, 1, 0];

const SVG = `
<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Two axons compared. Above, a copied answer leaves the axon thinly and patchily insulated. Below, repeated handwritten practice builds a thick even myelin sheath along the whole axon.">
  <g class="neuro-fb__axon-line">
    <line x1="88" y1="96" x2="466" y2="96"/>
    <line x1="88" y1="212" x2="466" y2="212"/>
  </g>
  <circle class="neuro-fb__soma" cx="62" cy="96" r="26"/>
  <circle class="neuro-fb__soma" cx="62" cy="212" r="26"/>
  ${row(96, 9, PATCHY, "neuro-fb__sheath neuro-fb__sheath--unbuilt")}
  ${row(212, 21, FULL, "neuro-fb__sheath neuro-fb__sheath--earned")}
  <circle class="neuro-fb__pulse neuro-fb__pulse--unbuilt" cx="150" cy="96" r="7"/>
  <circle class="neuro-fb__pulse neuro-fb__pulse--earned" cx="430" cy="212" r="9"/>
  <text class="neuro-fb__label" x="62" y="52">Copied answer</text>
  <text class="neuro-fb__sub" x="62" y="70">thin, patchy — barely conducts</text>
  <text class="neuro-fb__label" x="62" y="264">Worked by hand, repeatedly</text>
  <text class="neuro-fb__sub" x="62" y="282">insulated end to end — fast</text>
</svg>
`.trim();

export function renderFallback(root) {
  root.insertAdjacentHTML("afterbegin", SVG);
  const svg = root.firstElementChild;
  if (svg) {
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.classList.add("neuro-viz__fallback");
  }
}
