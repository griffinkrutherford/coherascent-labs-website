# Lune Synth Landing-Page Medal Exports

This directory contains transparent 512×512 PNG renders of the first 10 Lune
Synth medal ranks across all 10 achievement categories.

- `01-paper/` through `10-diamond/` contain one PNG per category.
- `manifest.json` records rank, tier, category, dimensions, and relative path.
- `export-medals.mjs` is the repeatable capture script used for this export.

The images were rendered from the app's shared `AchievementMedal` component,
including the current tier palettes, category ribbons, grayscale emblem
duotone filters, and etched-in emblem treatment.
