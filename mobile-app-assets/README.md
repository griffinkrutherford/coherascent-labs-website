# Mobile App Assets

This folder stores the reusable visual source files for the planned mobile app.

## Update Log

- 2026-10-27: Preserved the Learn Your Way calligraphic-globe authoring bundle, including the exact ImageGen output, prompt, reference family and transparent master. The website loads only the 192px runtime WebP at `/campaign/nav-icons/globe.webp`; authoring originals and review images are not referenced by browser code.

## Structure

- `tokens/`
  - shared design tokens that should map directly into the app theme layer
  - `colors.json`
  - `typography.json`
- `icons/categories/`
  - SVG category icons for pills, prompts, and metadata chips
- `authoring/calligraphic-globe-20261027/`
  - source, prompt, references, transparent master and offline alpha/mask review for the website's calligraphic globe

## Usage

- Use these files as the source of truth for app implementation.
- Do not recreate icon geometry ad hoc in screen components.
- Keep icon stroke width, corner language, and color usage consistent with the existing files in this folder.
