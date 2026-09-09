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

(function () {
  "use strict";
  var gallery = document.querySelector("[data-athletics]");
  if (!gallery) return;
  var photos = Array.from(gallery.querySelectorAll(".about-athletics__photo"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pause = gallery.querySelector("[data-athletics-pause]");
  var paused = false, visible = false, frame = null, last = null, angle = 0;
  function draw() {
    var radius = gallery.clientWidth * 0.30;
    photos.forEach(function (photo, i) {
      var phase = angle + i * Math.PI * 2 / photos.length;
      photo.style.transform = "translateX(" + Math.sin(phase) * radius + "px) scale(" + (0.78 + 0.22 * Math.cos(phase)) + ")";
      photo.style.opacity = 0.55 + 0.45 * ((Math.cos(phase) + 1) / 2);
      photo.style.zIndex = Math.round((Math.cos(phase) + 1) * 100);
      photo.setAttribute("aria-hidden", "false");
    });
  }
  function tick(time) {
    if (last !== null) angle += Math.min(time - last, 60) * Math.PI * 2 / 42000;
    last = time; draw(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); last = null;
    pause.hidden = reduced.matches;
    pause.textContent = paused ? "▶" : "❚❚";
    pause.setAttribute("aria-label", paused ? "Play photo carousel" : "Pause photo carousel");
    draw();
    if (visible && !document.hidden && !paused && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  pause.addEventListener("click", function () { paused = !paused; sync(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting; sync();
  }).observe(gallery);
  window.addEventListener("resize", draw);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  sync();
})();

// The shared footer also mentions the product in its model-name anecdote.
(function () {
  var note = document.querySelector(".site-footer__powered-by");
  if (!note) return;
  Array.from(note.childNodes).forEach(function (node) {
    if (node.nodeType !== 3 || !node.textContent.includes("Lune Synth")) return;
    var parts = node.textContent.split("Lune Synth");
    var fragment = document.createDocumentFragment();
    parts.forEach(function (part, i) {
      if (i) { var link = document.createElement("a"); link.href = "/"; link.textContent = "Lune Synth"; fragment.appendChild(link); }
      fragment.appendChild(document.createTextNode(part));
    });
    node.replaceWith(fragment);
  });
})();
