const SVG = `
<svg viewBox="0 0 480 270" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Static illustration of the Lune Synth grading engine: a verified lattice of reasoning steps with the tagline Truth, not probability.">
  <defs>
    <radialGradient id="lune-fb-glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="rgba(122,184,255,0.32)"/>
      <stop offset="60%" stop-color="rgba(122,184,255,0.04)"/>
      <stop offset="100%" stop-color="rgba(122,184,255,0)"/>
    </radialGradient>
    <linearGradient id="lune-fb-edge" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#d8b56a"/>
      <stop offset="100%" stop-color="#c98a4a"/>
    </linearGradient>
  </defs>
  <rect width="480" height="270" fill="transparent"/>
  <circle cx="240" cy="125" r="120" fill="url(#lune-fb-glow)"/>
  <g stroke="url(#lune-fb-edge)" stroke-width="1.4" fill="none" stroke-linecap="round">
    <path d="M120 175 L195 110"/>
    <path d="M195 110 L260 75"/>
    <path d="M260 75 L335 110"/>
    <path d="M335 110 L360 175"/>
    <path d="M195 110 L260 175"/>
    <path d="M260 75 L260 175"/>
    <path d="M260 175 L335 110"/>
  </g>
  <g fill="#d8b56a" stroke="rgba(8,12,22,0.75)" stroke-width="1">
    <circle cx="120" cy="175" r="5.5"/>
    <circle cx="195" cy="110" r="5.5"/>
    <circle cx="260" cy="75"  r="5.5"/>
    <circle cx="335" cy="110" r="5.5"/>
    <circle cx="360" cy="175" r="5.5"/>
    <circle cx="260" cy="175" r="5.5" fill="#e6a04a"/>
  </g>
  <text x="240" y="232" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500"
        fill="rgba(245, 240, 232, 0.92)" letter-spacing="0.02em">
    Truth, not probability.
  </text>
</svg>
`.trim();

export function renderFallback(root) {
  root.innerHTML = SVG;
  const svg = root.firstElementChild;
  if (svg) {
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
  }
}
