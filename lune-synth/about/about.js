(function () {
  "use strict";
  var video = document.querySelector("[data-about-luna-video]");
  if (!video || !("IntersectionObserver" in window)) return;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
})();
