(function () {
  "use strict";
  var root = document.querySelector("[data-lang-background]");
  if (!root) return;
  var video = root.querySelector("[data-lang-background-video]");
  if (!video) return;
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isNear = false;
  video.muted = true;
  video.defaultMuted = true;

  function syncPlayback() {
    if (motion.matches) {
      video.pause();
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.load(); // Release the decoder and return to the static poster.
      }
      return;
    }
    if (document.hidden || !isNear) {
      video.pause();
      return;
    }
    if (!video.hasAttribute("src")) {
      video.src = video.getAttribute("data-src");
      video.load();
    }
    var playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(function () {});
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { isNear = entry.isIntersecting; });
      syncPlayback();
    }, { threshold: 0.08, rootMargin: window.matchMedia("(max-width: 900px)").matches ? "0px" : "300px 0px" });
    observer.observe(root);
  } else {
    isNear = true;
    syncPlayback();
  }
  document.addEventListener("visibilitychange", syncPlayback);
  if (motion.addEventListener) motion.addEventListener("change", syncPlayback);
  else if (motion.addListener) motion.addListener(syncPlayback);
})();
