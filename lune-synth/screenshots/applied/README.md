# Constellations Slideshow - iPad Screen Assets

The videos in this directory render inside the iPad Pro mockup of the
"Explore a Vast Study Universe" slideshow in `../../index.html`.

Each recording has a matching `*-thumb.jpg` loading image. The page displays
that thumbnail with a CSS blur until the corresponding video has decoded a
renderable frame.

## Notes

- File names must match the sources and `data-video-thumbnail` mapping in
  `../../index.html`.
- Step 2 has separate Big Bang, Retro, and Math Sky recordings and thumbnails.
- Videos and thumbnails use `object-fit: cover` and fill the portrait iPad screen.
