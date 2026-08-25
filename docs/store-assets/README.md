# Store listing assets

## Update Log

### 2026-08-24

- Added shared native iPhone source captures and separate Google Play and iOS
  marketing exports.
- Standardized the store graphics on the website's existing phone mock: the
  same shell padding, corner radii, black gradient, inset edge stack, attached
  button rails, and shadows. Every app interface remains an untouched
  screenshot layer.

## Structure

- `play-source-screenshots/` contains original native screenshots shared by
  both store workflows. Do not crop, retouch, upscale, or add device frames to
  these files.
- `play-graphics/` contains six 1080×1920 Google Play screenshots, the
  1024×500 feature graphic, and the reusable generated background masters.
- `ios-graphics/` contains the same six-image story exported at 1290×2796 for
  App Store Connect's 6.9-inch iPhone slot.
- `play-icon-512.png` and `play-store-listing.md` contain the Play icon and
  listing copy.

Run `xcrun swift scripts/render-store-graphics.swift` from the repository root
to rebuild both screenshot sets and the Play feature graphic.

## Current screenshot order

1. Questions built from your material
2. Practice across subjects
3. Know what to fix
4. See every step
5. Your subjects, mapped
6. Progress in one place

The first frame uses the newest full-resolution statistics question-set capture
available in the website repository. The second uses the current multiple-choice
set capture, the third uses the current 90% Results Ready capture, and frames
four through six use the other current native captures in
`play-source-screenshots/`.

## Export constraints

- App UI must come only from a source screenshot.
- Scaling down, clipping to the display corners, and rotating the complete
  screenshot layer are allowed. Do not generate, redraw, extend, or retouch UI.
- Store exports must be opaque PNGs with no alpha channel.
- Captions must avoid outcome claims, ratings, awards, testimonials, and calls
  to action.
- Current iPad captures are not included. Add a separate current iPad source
  set before producing iPad App Store screenshots.
