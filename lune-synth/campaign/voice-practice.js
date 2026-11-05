(function () {
  "use strict";

  // "Practice speaking <language> with Luna" phones (campaign/voice-practice.css).
  // The clips use preload="none", so nothing downloads until a phone scrolls
  // near the viewport; each plays only while visible. With reduced motion the
  // poster stays and the clip is never fetched.
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-voice-practice]"));
  if (!videos.length) return;
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function play(video) {
    if ((reduced && reduced.matches) || document.hidden) return;
    var promise = video.play();
    if (promise && promise.catch) promise.catch(function () { /* poster stays */ });
  }

  if (!("IntersectionObserver" in window)) return;
  var visible = new Set();
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { visible.add(entry.target); play(entry.target); }
      else { visible.delete(entry.target); entry.target.pause(); }
    });
  }, { rootMargin: "200px 0px", threshold: 0.01 });
  videos.forEach(function (video) { observer.observe(video); });

  document.addEventListener("visibilitychange", function () {
    visible.forEach(function (video) { if (document.hidden) video.pause(); else play(video); });
  });
  if (reduced && reduced.addEventListener) {
    reduced.addEventListener("change", function () {
      visible.forEach(function (video) { if (reduced.matches) video.pause(); else play(video); });
    });
  }
})();
