# Mobile App Assets

This folder stores the reusable visual source files for the planned mobile app.

## Structure

- `tokens/`
  - shared design tokens that should map directly into the app theme layer
  - `colors.json`
  - `typography.json`
- `icons/categories/`
  - SVG category icons for pills, prompts, and metadata chips

## Usage

- Use these files as the source of truth for app implementation.
- Do not recreate icon geometry ad hoc in screen components.
- Keep icon stroke width, corner language, and color usage consistent with the existing files in this folder.
