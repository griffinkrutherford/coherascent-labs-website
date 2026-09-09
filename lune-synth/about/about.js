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
  var surface = gallery.querySelector(".about-athletics__photos");
  var pointer = null, previousX = 0, previousTime = 0, velocity = 0;
  var autoSpeed = Math.PI * 2 / 42000;
  photos.forEach(function (photo) { photo.draggable = false; });
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
    var dt = last === null ? 0 : Math.min(time - last, 60);
    var target = paused ? 0 : autoSpeed;
    angle += velocity * dt;
    // Time-based friction gives the same coast at different refresh rates.
    velocity = target + (velocity - target) * Math.exp(-dt / 650);
    last = time; draw();
    if (!paused || Math.abs(velocity) > 0.00001) frame = requestAnimationFrame(tick);
    else { velocity = 0; frame = null; }
  }
  function sync() {
    cancelAnimationFrame(frame); frame = null; last = null;
    pause.hidden = reduced.matches;
    pause.textContent = paused ? "▶" : "❚❚";
    pause.setAttribute("aria-label", paused ? "Play photo carousel" : "Pause photo carousel");
    draw();
    if (visible && !document.hidden && pointer === null && !reduced.matches && (!paused || Math.abs(velocity) > 0.00001)) frame = requestAnimationFrame(tick);
  }
  surface.addEventListener("pointerdown", function (event) {
    if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId;
    previousX = event.clientX; previousTime = event.timeStamp; velocity = 0;
    surface.setPointerCapture(pointer);
    surface.classList.add("is-dragging");
    sync();
  });
  surface.addEventListener("pointermove", function (event) {
    if (event.pointerId !== pointer) return;
    var delta = (event.clientX - previousX) * Math.PI * 2 / Math.max(surface.clientWidth, 1);
    var dt = Math.max(event.timeStamp - previousTime, 1);
    angle += delta;
    velocity = Math.max(-0.012, Math.min(0.012, delta / dt));
    previousX = event.clientX; previousTime = event.timeStamp;
    draw();
  });
  function release(event) {
    if (event.pointerId !== pointer) return;
    var id = pointer; pointer = null;
    if (event.type !== "pointerup" || event.timeStamp - previousTime > 120 || reduced.matches) velocity = 0;
    surface.classList.remove("is-dragging");
    if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
    sync();
  }
  surface.addEventListener("pointerup", release);
  surface.addEventListener("pointercancel", release);
  surface.addEventListener("lostpointercapture", release);
  surface.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    angle += (event.key === "ArrowRight" ? 1 : -1) * Math.PI * 2 / photos.length;
    velocity = 0; paused = true; sync();
  });
  pause.addEventListener("click", function () { paused = !paused; velocity = paused ? 0 : autoSpeed; sync(); });
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
