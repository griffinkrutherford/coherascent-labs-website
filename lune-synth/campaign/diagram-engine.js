// Homepage diagram engine reel (2026-11-04). Loads nothing until the card is
// near the viewport, picks the landscape or vertical cut for the current
// layout, plays muted on a loop while visible and pauses off-screen.
// Reduced motion keeps the poster and never fetches the video.
(function () {
  'use strict';
  var root = document.querySelector('[data-diagram-engine]');
  if (!root) return;
  var video = root.querySelector('[data-diagram-reel]');
  if (!video) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 900px)');
  var inView = false;
  var current = '';

  function wantedSrc() {
    return narrow.matches ? video.getAttribute('data-src-portrait') : video.getAttribute('data-src-landscape');
  }

  function sync() {
    if (reduce.matches) {
      if (!video.paused) video.pause();
      root.classList.remove('is-playing');
      return;
    }
    if (!inView) {
      if (!video.paused) video.pause();
      return;
    }
    var src = wantedSrc();
    if (src && src !== current) {
      current = src;
      root.classList.remove('is-playing');
      video.src = src;
      video.load();
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(function () {});
  }

  video.muted = true;
  video.addEventListener('playing', function () { root.classList.add('is-playing'); });

  function onChange(query, handler) {
    if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
    else if (typeof query.addListener === 'function') query.addListener(handler);
  }
  onChange(reduce, sync);
  onChange(narrow, sync);

  if (!('IntersectionObserver' in window)) {
    inView = true;
    sync();
    return;
  }
  new IntersectionObserver(function (entries) {
    inView = entries.some(function (entry) { return entry.isIntersecting; });
    sync();
  }, { rootMargin: '300px 0px', threshold: 0 }).observe(root);
})();
