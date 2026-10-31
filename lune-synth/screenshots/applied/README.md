# Native app preview media

This directory includes iPad recordings for the "Explore a Vast Study Universe" slideshow and Luna voice-call phone previews in `../../index.html`.

Each recording has a matching `*-thumb.jpg` loading image. The page displays
that thumbnail with a CSS blur until the corresponding video has decoded a
renderable frame.

## Update Log

- 2026-10-31: Added the cache-versioned smooth Luna voice-call sample and its same-take poster; older media remains available. Capture provenance and byte receipts live in `../../../docs/qa/2026-10-31-luna-smooth-voice/`.

## Notes

- File names must match the sources and `data-video-thumbnail` mapping in
  `../../index.html`.
- Step 1 has separate World recordings and thumbnails; the current options are
  Earth, Jupiter, Retro Arcade, and Math Space.
- Videos and thumbnails use `object-fit: cover` and fill the portrait iPad screen.
