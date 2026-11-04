/*
 * Handwriting carousel phone intros (2026-11-04).
 *
 * Each carousel question phone whose screenshot host carries
 * `data-intro-video` plays a short recording of that question screen
 * opening (its diagram drawing in) once, when its slide becomes active.
 * The clip's last frame is the host's screenshot, so when the clip ends the
 * video is removed and the still underneath takes over with no jump.
 *
 * - Only the active slide's clip and the next slide's are loaded.
 * - prefers-reduced-motion: no video at all, the still only.
 * - The carousel's pause button pauses the clip; play restarts the slide.
 * - The handwriting on the paper waits for `data-intro-ms` (the clip's
 *   length), see applied-response-slideshow.js / applied-handwriting-demo.js.
 */
(function () {
  var deck = document.querySelector("[data-response-slideshow]");
  if (!deck) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var probe = document.createElement("video");
  if (!probe.canPlayType || !probe.canPlayType('video/mp4; codecs="avc1.640028"')) return;

  var toggle = deck.querySelector("[data-response-toggle]");
  var inView = false;
  var playing = null; // { host, video }
  var pendingSlide = null;

  function papers() {
    return Array.prototype.slice.call(deck.querySelectorAll(".response-carousel__paper"));
  }

  function activePaper() {
    return deck.querySelector(".response-carousel__paper.is-active");
  }

  function introHost(paper) {
    return paper ? paper.querySelector(".phone-screenshot-host[data-intro-video]") : null;
  }

  function isPaused() {
    return !!toggle && toggle.getAttribute("aria-pressed") === "true";
  }

  function stillReady(host) {
    var img = host.querySelector("img.phone-screenshot--loaded");
    return !!(img && img.complete && img.naturalWidth);
  }

  // One element per host, created on demand and kept until its clip ends,
  // so preloading the next slide reuses the same request.
  function videoFor(host) {
    if (host._introVideo) return host._introVideo;
    var video = document.createElement("video");
    video.className = "phone-screenshot phone-intro-video";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.preload = "auto";
    video.poster = host.getAttribute("data-intro-poster") || "";
    video.src = host.getAttribute("data-intro-video");
    video.hidden = true;
    host.appendChild(video);
    host._introVideo = video;
    return video;
  }

  function release(host) {
    var video = host && host._introVideo;
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    if (video.parentNode) video.parentNode.removeChild(video);
    host._introVideo = null;
  }

  function finish(entry) {
    if (!entry || playing !== entry) return;
    playing = null;
    // The clip ends on the still's frame: hand off only once the still is
    // painted, holding the video's last frame until then.
    if (stillReady(entry.host)) {
      release(entry.host);
      return;
    }
    var img = entry.host.querySelector("img.phone-screenshot");
    var done = function () { release(entry.host); };
    if (img) {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
    window.setTimeout(done, 4000);
  }

  function stopPlaying() {
    if (!playing) return;
    var host = playing.host;
    playing = null;
    release(host);
  }

  function preloadNext(paper) {
    var list = papers();
    var next = list[(list.indexOf(paper) + 1) % list.length];
    var host = introHost(next);
    if (host && host !== (playing && playing.host)) videoFor(host);
  }

  function playFor(paper) {
    stopPlaying();
    // Drop preloaded clips that are neither this slide's nor the next one's.
    var list = papers();
    var keep = [introHost(paper), introHost(list[(list.indexOf(paper) + 1) % list.length])];
    list.forEach(function (other) {
      var host = introHost(other);
      if (host && keep.indexOf(host) === -1) release(host);
    });

    var host = introHost(paper);
    if (!host) {
      preloadNext(paper);
      return;
    }
    var video = videoFor(host);
    var entry = { host: host, video: video };
    playing = entry;
    video.hidden = false;
    try { video.currentTime = 0; } catch (error) { /* not loaded yet */ }
    video.onended = function () { finish(entry); };
    video.onerror = function () { if (playing === entry) { playing = null; release(host); } };
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        // Autoplay refused: show the still.
        if (playing === entry) {
          playing = null;
          release(host);
        }
      });
    }
    preloadNext(paper);
  }

  function onSlideChange() {
    var paper = activePaper();
    if (isPaused()) {
      stopPlaying();
      return;
    }
    if (!inView) {
      pendingSlide = paper;
      stopPlaying();
      return;
    }
    pendingSlide = null;
    playFor(paper);
  }

  document.addEventListener("coherascent:response-slide-change", onSlideChange);

  document.addEventListener("coherascent:response-pause", function () {
    if (playing) playing.video.pause();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) playing.video.pause();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var next = entries[entries.length - 1].isIntersecting;
      if (next === inView) return;
      inView = next;
      if (inView) {
        if (pendingSlide && pendingSlide === activePaper() && !isPaused()) playFor(pendingSlide);
        pendingSlide = null;
      } else if (playing) {
        // Leaving the viewport mid-clip: settle on the still.
        stopPlaying();
      }
    }, { threshold: 0.2 }).observe(deck);
  } else {
    inView = true;
  }

  // The slideshow may already have shown its first slide before this loaded.
  pendingSlide = activePaper();
})();
