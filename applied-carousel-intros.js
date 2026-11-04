/*
 * Handwriting carousel intro manifest (2026-11-04).
 *
 * Every question screenshot in the carousel that has a recorded intro clip,
 * by screenshot name, with the clip's length in ms. A slide's clip, poster
 * and still are all derived from its name, so slides injected at load
 * (applied-response-slides.js) get intros exactly like the static ones.
 *
 * Each clip was recorded from the app's website-set showcase and ends on
 * the frame its v7 still was cut from, so the clip -> still hand-off is
 * seamless. Used by applied-response-slides.js, applied-phone-intro.js,
 * applied-response-slideshow.js and applied-handwriting-demo.js, and by
 * test/carousel-intros.test.js (Node), hence the CommonJS export.
 */
(function (root) {
  var VERSION = "7";
  var DIR = "carousel-v7/";
  var INTRO_MS = {
    "1-sin": 2900, "2": 2800, "3": 3000, "4": 2783, "5": 2800, "6": 2967, "7": 2800,
    "8": 2817, "9": 2783, "10": 2767, "11": 2817, "12": 2783, "13": 2800,
    "14": 2783, "15": 2817, "16": 2950, "17": 2800, "18": 3000, "19-stats": 3000,
    "20": 2800, "21": 2817, "22": 2817, "23": 3000, "24": 2950, "25": 2850, "26": 2800,
    "5b-toc": 2917, "es-preterite": 2783, "lit-frost": 2700, "study-cs-code-trace": 2967
  };

  /** The screenshot name a `data-screenshot-src` points at (v6 or v7 path), or "". */
  function imageFromSrc(src) {
    var match = /question-prompts\/(?:carousel-v7\/)?([^/?]+?)-mid\.webp/.exec(src || "");
    return match ? match[1] : "";
  }

  function has(image) {
    return Object.prototype.hasOwnProperty.call(INTRO_MS, image);
  }

  /**
   * URLs for an image with an intro, relative to `base` (the
   * `.../question-prompts/` directory as the page references it), or null.
   */
  function assetsFor(image, base) {
    if (!has(image)) return null;
    var stem = base + DIR + image;
    var q = "?v=" + VERSION;
    return {
      image: image,
      ms: INTRO_MS[image],
      video: stem + "-intro.mp4" + q,
      poster: stem + "-intro-poster.webp" + q,
      still: stem + "-mid.webp" + q,
      high: stem + ".webp" + q,
      low: stem + "-low.webp" + q
    };
  }

  /** The question-prompts directory a `data-screenshot-src` lives in. */
  function baseFromSrc(src) {
    var at = (src || "").indexOf("question-prompts/");
    return at === -1 ? "" : src.slice(0, at + "question-prompts/".length);
  }

  /**
   * Points a screenshot host at its v7 still and intro (no-op for an image
   * without one). Returns the assets, or null.
   */
  function applyToHost(host) {
    if (!host || !host.getAttribute) return null;
    var src = host.getAttribute("data-screenshot-src") || "";
    var assets = assetsFor(imageFromSrc(src), baseFromSrc(src));
    if (!assets) return null;
    host.setAttribute("data-screenshot-src", assets.still);
    host.setAttribute("data-screenshot-high", assets.high);
    host.setAttribute("data-screenshot-low", assets.low);
    host.setAttribute("data-intro-video", assets.video);
    host.setAttribute("data-intro-poster", assets.poster);
    host.setAttribute("data-intro-ms", String(assets.ms));
    return assets;
  }

  var api = {
    VERSION: VERSION,
    INTRO_MS: INTRO_MS,
    imageFromSrc: imageFromSrc,
    baseFromSrc: baseFromSrc,
    assetsFor: assetsFor,
    applyToHost: applyToHost,
    has: has
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LuneCarouselIntros = api;
})(typeof window !== "undefined" ? window : this);
