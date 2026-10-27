(function () {
  "use strict";
  var root = document.querySelector("[data-lang-background]");
  if (!root) return;
  var videos = Array.prototype.slice.call(root.querySelectorAll("[data-lang-background-video]"));
  if (videos.length !== 2) return;
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fadeMs = 1000;
  var isVisible = false;
  var running = false;
  var active = 0;
  var transitioning = false;
  var generation = 0;
  var fadeTimer = null;
  var cycles = 0;

  function canPlay() { return isVisible && !document.hidden && !motion.matches; }
  function isCurrent(ticket) { return generation === ticket && running && canPlay(); }
  function reset() {
    generation += 1;
    running = false;
    transitioning = false;
    clearTimeout(fadeTimer);
    fadeTimer = null;
    active = 0;
    cycles = 0;
    root.dataset.langVideoState = "poster";
    root.dataset.langVideoCycles = "0";
    videos.forEach(function (video, index) {
      video.pause();
      video.classList.toggle("is-active", index === 0);
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.load(); // Release both decoders and restore the first-frame poster.
      }
    });
  }
  function play(video, ticket, onStarted) {
    var attempt = video.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(function () { if (isCurrent(ticket)) onStarted(); }).catch(function () {
        if (isCurrent(ticket)) reset();
      });
    } else if (isCurrent(ticket)) onStarted();
  }
  function crossfade() {
    if (!running || transitioning || !canPlay()) return;
    var ticket = generation;
    var next = 1 - active;
    var outgoing = videos[active];
    var incoming = videos[next];
    transitioning = true;
    if (incoming.readyState >= 1) incoming.currentTime = 0;
    play(incoming, ticket, function () {
      root.dataset.langVideoState = "crossfade";
      incoming.classList.add("is-active");
      outgoing.classList.remove("is-active");
      fadeTimer = setTimeout(function () {
        if (!isCurrent(ticket)) return;
        outgoing.pause();
        // Keep the last decoded frame until fully hidden; rewind only on its next reuse.
        active = next;
        transitioning = false;
        cycles += 1;
        root.dataset.langVideoCycles = String(cycles);
        root.dataset.langVideoState = "playing";
      }, fadeMs);
    });
  }
  function syncPlayback() {
    if (!canPlay()) { reset(); return; }
    if (running) return;
    running = true;
    generation += 1;
    var ticket = generation;
    videos.forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.src = video.getAttribute("data-src");
      video.load();
    });
    play(videos[active], ticket, function () { root.dataset.langVideoState = "playing"; });
  }
  videos.forEach(function (video, index) {
    video.muted = true;
    video.defaultMuted = true;
    // Media events drive one transition per clip; there is no animation-frame loop.
    video.addEventListener("timeupdate", function () {
      if (index === active && Number.isFinite(video.duration) && video.duration > 2 &&
          video.currentTime >= video.duration - fadeMs / 1000 - 0.2) crossfade();
    });
    video.addEventListener("ended", function () { if (index === active) crossfade(); });
    video.addEventListener("error", function () { if (running && index === active) reset(); });
  });
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { isVisible = entry.isIntersecting; });
      syncPlayback();
    }, { threshold: 0.08 });
    observer.observe(root);
  } else {
    reset(); // Without a visibility signal, keep the readable poster and no decoders.
  }
  document.addEventListener("visibilitychange", syncPlayback);
  window.addEventListener("pagehide", reset);
  window.addEventListener("pageshow", syncPlayback);
  if (motion.addEventListener) motion.addEventListener("change", syncPlayback);
  else if (motion.addListener) motion.addListener(syncPlayback);
})();
