# Learn Your Way calligraphic globe

## Update Log

- 2026-10-27: Generated one navigation-family-matched calligraphic globe through built-in ImageGen, preserved its source/prompt and checked exact alpha plus 28/36 px heading/menu readability. Website integration belongs to the website writer.

Use `final/globe.webp` at `/campaign/nav-icons/globe.webp` for both the Learn Your Way heading and hamburger entry. It is 192×192, matching the existing book/map/fountainPen family, with a 162 px significant-alpha silhouette span and transparent padding. The same art is intended as an alpha mask colored by existing CSS; do not add a separate colored planet, badge or illustration.

Runtime SHA256: `92a51638725f1a4a8491f5ea291e82d01b8e947b5ed46343b0571423eeaf89bd` (19,292 bytes). `raw/globe-original.png` preserves the exact selected built-in output. `final/globe-master.png` is the transparent 1254 px master. `prompts/globe.txt`, `references/` and `provenance.json` preserve the exact focused prompt, actual family inputs, hashes and original generated-image location. The tool-managed model version was not exposed; no CLI/API key was used.

Local processing removes alpha<=2/255 background noise, applies centered uniform padding to match family scale, and uses premultiplied resampling plus exact lossless WebP. No strokes were redrawn, added, cut into a new silhouette or replaced with vectors. The original image remains unchanged. The full final WebP RGBA matches both its pre-encoding array and macOS ImageIO/sips decoding through an independent Pillow comparison.

Opened `review/checker.png`, `review/family-mask-sizes.png` (actual book/map/fountainPen/globe masks at 28/36/64/128 px) and `review/mask-light-dark.png`. The globe perimeter, meridians and simplified continents remain clear at 28 and 36 px; corners and open interior spaces are transparent, with no baked square or key tint. See `review/acceptance.json` and `review/preparation.log`. These are offline CSS-mask simulations, not browser screenshots; the website writer owns final heading/menu browser verification and dated website logs.

No website or app source was changed by this asset handoff. The previously accepted twenty equipped-border family remains unchanged.
