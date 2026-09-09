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
  var captions = ["Strength training", "Race day", "Out on the trail"];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pause = gallery.querySelector("[data-athletics-pause]");
  var index = 0, timer = null, visible = false, userPaused = reduced.matches;
  function show(next) {
    index = (next + photos.length) % photos.length;
    photos.forEach(function (photo, i) {
      photo.classList.toggle("is-active", i === index);
      photo.setAttribute("aria-hidden", String(i !== index));
    });
    gallery.querySelector("[data-athletics-caption]").textContent = captions[index];
  }
  function sync() {
    clearInterval(timer);
    var paused = userPaused || reduced.matches;
    pause.textContent = paused ? "Play" : "Pause";
    pause.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
    pause.hidden = reduced.matches;
    if (visible && !document.hidden && !paused) timer = setInterval(function () { show(index + 1); }, 5500);
  }
  gallery.querySelector("[data-athletics-prev]").addEventListener("click", function () { userPaused = true; show(index - 1); sync(); });
  gallery.querySelector("[data-athletics-next]").addEventListener("click", function () { userPaused = true; show(index + 1); sync(); });
  pause.addEventListener("click", function () { userPaused = !userPaused; sync(); });
  gallery.addEventListener("focusin", function (event) {
    if (event.target !== pause) { userPaused = true; sync(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(gallery);
  }
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
