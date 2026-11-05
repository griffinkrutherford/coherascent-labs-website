/*
 * Phone screen videos for static phone mocks (2026-11-04, "How grading
 * works"). A `.phone-screenshot-host` with `data-phone-video` keeps its
 * usual hi/mid/low still (applied-phone-screenshots.js); this layers a muted,
 * inline video over it once the phone is near the viewport, and shows the
 * video only once it is actually playing. The still is the video's first
 * frame, so the swap is invisible.
 *
 * - `data-phone-video-mode="loop"`: a seamless loop.
 * - `data-phone-video-mode="hold"`: plays once, holds its last frame for
 *   `data-phone-video-hold-ms`, then plays again from the start.
 * - Plays only while at least a third of the phone is on screen.
 * - prefers-reduced-motion, or no H.264 support: the still only.
 */
(function () {
  var hosts = Array.prototype.slice.call(document.querySelectorAll(".phone-screenshot-host[data-phone-video]"));
  if (!hosts.length) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var probe = document.createElement("video");
  if (!probe.canPlayType || !probe.canPlayType('video/mp4; codecs="avc1.640028"')) return;

  function setup(host) {
    if (host._phoneVideo) return host._phoneVideo;
    var video = document.createElement("video");
    video.className = "phone-screenshot phone-screen-video";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.preload = "auto";
    video.loop = host.getAttribute("data-phone-video-mode") === "loop";
    var poster = host.getAttribute("data-phone-video-poster");
    if (poster) video.poster = poster;
    video.style.opacity = "0";
    video.style.transition = "none";
    video.src = host.getAttribute("data-phone-video");
    video.addEventListener("playing", function () {
      video.style.opacity = "1";
    });
    if (!video.loop) {
      var holdMs = parseInt(host.getAttribute("data-phone-video-hold-ms") || "3000", 10);
      video.addEventListener("ended", function () {
        window.clearTimeout(host._phoneVideoTimer);
        host._phoneVideoTimer = window.setTimeout(function () {
          if (!host._phoneVideoVisible) return;
          try { video.currentTime = 0; } catch (error) { /* not seekable yet */ }
          play(host);
        }, holdMs);
      });
    }
    video.addEventListener("error", function () {
      if (video.parentNode) video.parentNode.removeChild(video);
      host._phoneVideo = null;
    });
    host.appendChild(video);
    host._phoneVideo = video;
    return video;
  }

  function play(host) {
    var video = setup(host);
    if (!video.loop && video.ended) {
      try { video.currentTime = 0; } catch (error) { /* ignore */ }
    }
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function () { /* autoplay refused: the still stays */ });
  }

  function pause(host) {
    window.clearTimeout(host._phoneVideoTimer);
    if (host._phoneVideo) host._phoneVideo.pause();
  }

  if (!("IntersectionObserver" in window)) {
    hosts.forEach(function (host) { host._phoneVideoVisible = true; play(host); });
    return;
  }

  // Load ahead of the viewport; play only while visible.
  var nearObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      setup(entry.target);
      nearObserver.unobserve(entry.target);
    });
  }, { rootMargin: "600px 0px" });

  var visibleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var host = entry.target;
      var visible = entry.isIntersecting && entry.intersectionRatio >= 0.33;
      if (visible === host._phoneVideoVisible) return;
      host._phoneVideoVisible = visible;
      if (visible) play(host);
      else pause(host);
    });
  }, { threshold: [0, 0.33, 0.66] });

  hosts.forEach(function (host) {
    nearObserver.observe(host);
    visibleObserver.observe(host);
  });

  document.addEventListener("visibilitychange", function () {
    hosts.forEach(function (host) {
      if (document.hidden) pause(host);
      else if (host._phoneVideoVisible) play(host);
    });
  });
})();
