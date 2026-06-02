# Constellations Slideshow — iPad Screen Assets

Drop your 5 screenshots/GIFs here. They render inside the iPad Pro mockup of the
"Explore a Vast Study Universe" slideshow in `../../index.html` (section
`#constellations`). Each file maps to one of the 5 slideshow steps and swaps
automatically when the matching step button (01–05) is clicked.

| File          | Step | Title                  |
|---------------|------|------------------------|
| `step-1.gif`  | 01   | Co-Create Your Cosmos  |
| `step-2.gif`  | 02   | Choose Your Sky Theme  |
| `step-3.gif`  | 03   | Missions               |
| `step-4.gif`  | 04   | Galaxy Gate            |
| `step-5.gif`  | 05   | Supercluster Capstone  |

## Notes

- **File names matter** — they must match the `src` in the `<img class="ipad-gif-target">`
  tags inside each `#previewStep-N` block in `index.html`.
- **PNG / JPG also work.** If you use a static image instead of a GIF, just change
  the extension in the corresponding `<img src="...">` tag (e.g. `step-1.png`).
- **Until a file exists**, the `onerror` handler hides the broken image and the
  original CSS/SVG fallback shows through, so the page never looks broken.
- **Aspect ratio:** images are `object-fit: cover` and fill the iPad screen, so use
  an 11" iPad Pro-ish landscape/portrait capture to avoid awkward cropping.
