// The slider updates a still comparison for reduced motion and no WebGL.
import { computeTransfer } from "./timeline.js";
function cells(earned, level = 0) {
  return [0, 1, 2, 3].map(i => {
    const x = 54 + i * 116;
    const y = earned ? 213 : [100, 88, 112, 94][i];
    const height = 3 + 13 * level;
    const sheaths = earned && level > 0 ? [0, 1, 2, 3].map(j => `<rect x="${x + 20 + j * 17}" y="${y - height / 2}" width="13" height="${height}" rx="5" class="neuro-fb__sheath--earned"/>`).join("") : "";
    return `<g>
      <path d="M${x-23} ${y-21} L${x-9} ${y-7} M${x-28} ${y+16} L${x-9} ${y+5} M${x} ${y} H${x+101}" class="neuro-fb__axon-line" fill="none"/>
      <circle cx="${x}" cy="${y}" r="12" class="neuro-fb__soma"/>${sheaths}
    </g>`;
  }).join("");
}
function backgroundCells(y) {
  return `<g aria-hidden="true">${Array.from({ length: 18 }, (_, i) => {
    const layer = Math.floor(i / 6);
    const x = 40 + (i % 6) * 80 + Math.sin(i * 2.1) * 12;
    const dy = (i % 2 ? -1 : 1) * (17 + layer * 7);
    const width = 68 - layer * 6;
    return `<image href="/lune-synth/neuro-viz/assets/background-neuron-${i % 3 + 1}.png"
      x="${x - width / 2}" y="${y + dy - width / 4}" width="${width}" height="${width / 2}"
      opacity="${0.13 - layer * 0.025}" style="filter: brightness(0.65)"/>`;
  }).join("")}</g>`;
}
function svgMarkup(level) {
  const transfer = computeTransfer(0.4, level);
  return `
<svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg" role="img"
 aria-label="Two networks of four neurons. Above, an amber dashed route zigzags and doubles back: slower, uncertain recall. Below, a precise blue route connects four myelinated neurons: faster, clearer recall. Route shapes are conceptual.">
  <text class="neuro-fb__label" x="260" y="30" text-anchor="middle" style="font-size:18px;fill:#ffb16b">Using AI to cheat<tspan x="260" dy="21">on your assignments</tspan></text>
  ${backgroundCells(100)}
  ${cells(false)}
  <path d="M54 100 L84 72 L114 122 L102 96 L144 76 L170 88 L200 118 L228 84 L217 104 L259 128 L286 112 L320 80 L348 116 L335 94 L376 72 L402 94 L442 119 L430 88 L484 100" fill="none" stroke="#d58a42" stroke-width="2" stroke-dasharray="5 4"/>
  <circle cx="200" cy="118" r="5" fill="#d58a42"/>
  <text class="neuro-fb__sub" x="26" y="151">Detours + backtracking · still travelling</text>
  <text class="neuro-fb__label" x="260" y="180" text-anchor="middle" style="font-size:18px;fill:#72b9ff">Step-by-step practice with Lune Synth</text>
  ${backgroundCells(213)}
  ${cells(true, level)}
  <path d="M54 213 H484" fill="none" stroke="#579de8" stroke-width="2"/>
  <circle cx="${54 + 430 * transfer.earned}" cy="213" r="5" fill="#579de8"/>
  <text class="neuro-fb__sub" x="26" y="270">${transfer.earned >= 1 ? "Arrived." : "Still travelling."}</text>
</svg>`;
}

export function renderFallback(root) {
  const section = root.closest(".section--neuro") || root;
  const slider = section.querySelector("[data-neuro-practice]");
  function render() {
    const level = Number(slider?.value ?? 50) / 100;
    root.querySelector(".neuro-viz__fallback")?.remove();
    root.insertAdjacentHTML("afterbegin", svgMarkup(level));
    const svg = root.firstElementChild;
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.classList.add("neuro-viz__fallback");

  }
  render();
  slider?.addEventListener("input", render);
  return { destroy() { slider?.removeEventListener("input", render); root.innerHTML = ""; } };
}
