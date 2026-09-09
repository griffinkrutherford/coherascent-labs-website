(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-about-luna-video], [data-about-highlight-video]").forEach(function (video) {
    var visible = false;
    var userPaused = false;
    var automaticPause = false;
    function sync() {
      if (!visible || document.hidden || reducedMotion.matches) {
        if (!video.paused) {
          automaticPause = true;
          video.pause();
        }
      } else if (!userPaused) {
        video.play().catch(function () { /* Native controls remain available. */ });
      }
    }
    video.addEventListener("pause", function () {
      if (automaticPause) automaticPause = false;
      else userPaused = true;
    });
    video.addEventListener("play", function () { userPaused = false; });
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.25 }).observe(video);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
  });
})();
