/* Subtle background parallax for the full-bleed sections (Luna, Notes, Lune
   Graph, Engine). Each `[data-parallax-root]` element is a background layer
   (Luna's video band, the Notes/Lune Graph gradient band, or the Engine
   panel's accent ::before) that CSS already renders oversized and clipped
   by its ancestor's `overflow: hidden`. This script only ever sets a single
   CSS custom property, `--parallax-shift`, which the matching CSS rule
   consumes as `transform: translate3d(0, var(--parallax-shift, 0px), 0)`.

   - No work happens off-screen: an IntersectionObserver turns tracking on
     only while a root is near the viewport, and the scroll/resize
     listeners are only attached while at least one root is active.
   - Updates are coalesced into a single requestAnimationFrame per tick, not
     one per element.
   - Disabled entirely under prefers-reduced-motion. If this script never
     runs (reduced motion, JS disabled, or an error elsewhere), every
     consumer CSS rule's `var(--parallax-shift, 0px)` fallback keeps the
     background exactly where it already sits -- the static look is
     unchanged. */
(function () {
  "use strict";

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    return;
  }

  var roots = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax-root]")
  );
  if (!roots.length) return;

  var narrowQuery =
    window.matchMedia && window.matchMedia("(max-width: 720px)");

  // Max travel of the background layer, in px, before the per-root factor
  // is applied. Smaller on phones per the brief ("keep it subtle on
  // phones"); the matching CSS overscan margins (.luna__bg,
  // .engine-panel--unified::before) are kept comfortably larger than this
  // so no edge is ever exposed.
  function amplitude() {
    return narrowQuery && narrowQuery.matches ? 50 : 110;
  }

  var items = roots.map(function (el) {
    var factor = parseFloat(el.getAttribute("data-parallax-factor"));
    if (!(factor > 0)) factor = 0.35;
    return { el: el, factor: factor, active: false };
  });

  var activeCount = 0;
  var ticking = false;
  var listenersBound = false;

  function update() {
    ticking = false;
    if (activeCount === 0) return;

    var vh = window.innerHeight;
    var amp = amplitude();

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.active) continue;

      var rect = item.el.getBoundingClientRect();
      var total = rect.height + vh;
      if (total <= 0) continue;

      // Normalized scroll progress of this element through the viewport:
      // -1 when it is just entering from the bottom, 0 when centered,
      // +1 when it has just fully exited the top.
      var progress = ((vh - rect.top) / total) * 2 - 1;
      if (progress < -1) progress = -1;
      else if (progress > 1) progress = 1;

      var shift = progress * amp * item.factor;
      item.el.style.setProperty("--parallax-shift", shift.toFixed(1) + "px");
    }
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function bindListeners() {
    if (listenersBound) return;
    listenersBound = true;
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
  }

  function unbindListeners() {
    if (!listenersBound) return;
    listenersBound = false;
    window.removeEventListener("scroll", requestTick, { passive: true });
    window.removeEventListener("resize", requestTick, { passive: true });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].el === entry.target) {
            item = items[i];
            break;
          }
        }
        if (!item) return;

        if (entry.isIntersecting && !item.active) {
          item.active = true;
          activeCount++;
        } else if (!entry.isIntersecting && item.active) {
          item.active = false;
          activeCount = Math.max(0, activeCount - 1);
          // Settle back to resting position so a section revisited later
          // (before the next scroll/resize tick) still looks correct.
          item.el.style.setProperty("--parallax-shift", "0px");
        }
      });

      if (activeCount > 0) {
        bindListeners();
        requestTick();
      } else {
        unbindListeners();
      }
    },
    { rootMargin: "20% 0px 20% 0px", threshold: 0 }
  );

  items.forEach(function (item) {
    observer.observe(item.el);
  });
})();
