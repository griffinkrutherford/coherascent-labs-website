# Native app preview media

This directory includes iPad recordings for the "Explore a Vast Study Universe" slideshow and Luna voice-call phone previews in `../../index.html`.

Each recording has a matching `*-thumb.jpg` loading image. The page displays
that thumbnail with a CSS blur until the corresponding video has decoded a
renderable frame.

## Update Log

- 2026-10-31: Added stable-20261031 voice movie/poster URLs from the corrected native helmet/head recording. Earlier preview files remain available; see `../../../docs/qa/2026-10-31-luna-helmet-stability/` for provenance and checks.

- 2026-10-31: Added the cache-versioned smooth-v2 voice-call movie and same-take poster, correcting the visible alpha-compositing flicker. Original previews remain available; see `../../../docs/qa/2026-10-31-luna-voice-flicker/` for comparison and media receipts.

- 2026-10-31: Added the cache-versioned smooth Luna voice-call sample and its same-take poster; older media remains available. Capture provenance and byte receipts live in `../../../docs/qa/2026-10-31-luna-smooth-voice/`.

## Notes

- File names must match the sources and `data-video-thumbnail` mapping in
  `../../index.html`.
- Step 1 has separate World recordings and thumbnails; the current options are
  Earth, Jupiter, Retro Arcade, and Math Space.
- Videos and thumbnails use `object-fit: cover` and fill the portrait iPad screen.
