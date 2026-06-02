#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Disable engine on live (comment out mount div + module script)
sed -i '' 's|<div class="lune-engine-stage" data-lune-engine></div>|<!-- DISABLED: <div class="lune-engine-stage" data-lune-engine></div> -->|' lune-synth/index.html
sed -i '' 's|<script type="module" src="./lune-engine/index.js"></script>|<!-- DISABLED: <script type="module" src="./lune-engine/index.js"></script> -->|' lune-synth/index.html

# Stage + commit + push
git add lune-synth/index.html lune-synth/lune-engine
git commit -m "$(cat <<'EOF'
Add Phase 1 Neuro-Symbolic Engine animation (disabled on live)

Vanilla Three.js port of the engine animation brief. Mounts a stage
inside the engine section with a 7-beat scene graph driven by a single
timeline (neural / crossing / audit). Each beat is a stub placeholder
that fades over its slice; later phases replace them in place without
touching scene.js. Reduced-motion and no-WebGL2 routes render a static
SVG fallback. RAF loop pauses via IntersectionObserver when offscreen.

Live mount + module script are commented out so the engine ships to
the repo but doesn't render in production until staging exists. Search
for "DISABLED:" in lune-synth/index.html to re-enable.

Also folds in iPad metal-frame thinning, solid phone shell borders,
power button shifted clear of the rounded corner, and the engine
section bound to viewport-minus-header height.
EOF
)"
git push origin main
