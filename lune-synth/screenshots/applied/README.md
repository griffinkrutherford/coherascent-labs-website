# Constellations Slideshow - iPad Screen Assets

The videos in this directory render inside the iPad Pro mockup of the
"Explore a Vast Study Universe" slideshow in `../../index.html`.

Each recording has a matching `*-thumb.jpg` loading image. The page displays
that thumbnail with a CSS blur until the corresponding video has decoded a
renderable frame.

## Notes

- File names must match the sources and `data-video-thumbnail` mapping in
  `../../index.html`.
- Step 1 has separate World recordings and thumbnails; the current options are
  Big Bang, Retro Arcade, and Math Space.
- Videos and thumbnails use `object-fit: cover` and fill the portrait iPad screen.
