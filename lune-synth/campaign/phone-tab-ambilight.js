/*
 * Phone-tab Ambilight (2026-11-04): the Notes and Lune Graph cards glow with
 * the colours of whatever their phone is playing, like the constellation
 * section's iPad (see ipadAmbilight in index.html, same sampling recipe).
 *
 * Each ~11fps tick (~4fps on phones) the active tab's phone video is painted
 * into a tiny canvas; the average colour (saturation-boosted) becomes
 * --ambi-base and the pooled most vivid pixels become --ambi-accent, eased
 * frame to frame so the glow drifts instead of strobing. --ambi-x / --ambi-y
 * place the glow's origin at the phone. Only runs while a card is near the
 * viewport and the tab is visible; reduced motion keeps the seeded glow.
 */
(function phoneTabAmbilight() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SW = 16, SH = 34; // tiny phone-portrait sample buffer
  var ACCENT_POOL = 8;
  var ACCENT_BOOST = 1.5;
  var FALLBACK_BASE = [22, 34, 64];
  var FALLBACK_ACCENT = [100, 168, 255];
  var mobile = window.matchMedia("(max-width: 900px)");
  var lastScroll = -Infinity;
  window.addEventListener("scroll", function () { lastScroll = performance.now(); }, { passive: true });

  function writeStyle(el, prop, value) {
    if (el.style.getPropertyValue(prop) !== value) el.style.setProperty(prop, value);
  }

  function boostSat(r, g, b, mult) {
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn === 0) return [r, g, b];
    var mid = (mx + mn) / 2;
    var f = Math.min(255 / (mx || 1), mult);
    return [Math.round(mid + (r - mid) * f), Math.round(mid + (g - mid) * f), Math.round(mid + (b - mid) * f)];
  }

  function ease(cur, target, t) {
    for (var i = 0; i < 3; i++) cur[i] += (target[i] - cur[i]) * t;
  }

  function attach(card) {
    var cv = document.createElement("canvas");
    cv.width = SW; cv.height = SH;
    var ctx = cv.getContext("2d", { willReadFrequently: true });
    var base = FALLBACK_BASE.slice();
    var accent = FALLBACK_ACCENT.slice();
    var sampledOnce = false;
    var last = 0, rafId = 0, running = false;

    function activePanel() {
      return card.querySelector(".luna-tab-panel.is-active");
    }

    function activeVideo(panel) {
      var vids = panel ? panel.querySelectorAll("video") : [];
      for (var i = 0; i < vids.length; i++) if (vids[i].offsetParent !== null && !vids[i].paused) return vids[i];
      for (var j = 0; j < vids.length; j++) if (vids[j].offsetParent !== null) return vids[j];
      return null;
    }

    function updateOrigin(panel) {
      var phone = panel && panel.querySelector(".luna-phone");
      if (!phone) return;
      var r = phone.getBoundingClientRect();
      var c = card.getBoundingClientRect();
      if (!c.width || !c.height) return;
      writeStyle(card, "--ambi-x", (((r.left + r.width / 2) - c.left) / c.width * 100).toFixed(1) + "%");
      writeStyle(card, "--ambi-y", (((r.top + r.height / 2) - c.top) / c.height * 100).toFixed(1) + "%");
    }

    function tick(ts) {
      if (!running) { rafId = 0; return; }
      if ((mobile.matches && ts - lastScroll < 200) || ts - last < (mobile.matches ? 250 : 90)) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      last = ts;
      var panel = activePanel();
      updateOrigin(panel);
      var tBase = sampledOnce ? base.slice() : FALLBACK_BASE;
      var tAccent = sampledOnce ? accent.slice() : FALLBACK_ACCENT;
      var v = activeVideo(panel);
      if (v && v.videoWidth && v.readyState >= 2) {
        try {
          ctx.drawImage(v, 0, 0, SW, SH);
          var d = ctx.getImageData(0, 0, SW, SH).data;
          var r = 0, g = 0, b = 0, n = 0, top = [];
          for (var i = 0; i < d.length; i += 4) {
            var R = d[i], G = d[i + 1], B = d[i + 2];
            r += R; g += G; b += B; n++;
            var mx = Math.max(R, G, B), mn = Math.min(R, G, B);
            var score = (mx - mn) * 0.7 + mx * 0.3;
            if (top.length < ACCENT_POOL) {
              top.push([score, R, G, B]);
              if (top.length === ACCENT_POOL) top.sort(function (p, q) { return p[0] - q[0]; });
            } else if (score > top[0][0]) {
              top[0] = [score, R, G, B];
              top.sort(function (p, q) { return p[0] - q[0]; });
            }
          }
          sampledOnce = true;
          tBase = boostSat(r / n, g / n, b / n, 1.6);
          if (top.length) {
            var ar = 0, ag = 0, ab = 0;
            for (var k = 0; k < top.length; k++) { ar += top[k][1]; ag += top[k][2]; ab += top[k][3]; }
            tAccent = boostSat(ar / top.length, ag / top.length, ab / top.length, ACCENT_BOOST);
          }
        } catch (_) { /* decoding or tainted: keep the last colour this frame */ }
      }
      var t = mobile.matches ? 0.12 : 0.07;
      ease(base, tBase, t);
      ease(accent, tAccent, t);
      writeStyle(card, "--ambi-base", "rgb(" + (base[0] | 0) + ", " + (base[1] | 0) + ", " + (base[2] | 0) + ")");
      writeStyle(card, "--ambi-accent", "rgb(" + (accent[0] | 0) + ", " + (accent[1] | 0) + ", " + (accent[2] | 0) + ")");
      rafId = requestAnimationFrame(tick);
    }

    function setRunning(next) {
      if (running === next) return;
      running = next;
      if (running && !rafId) rafId = requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) { setRunning(true); return; }
    var visible = false;
    new IntersectionObserver(function (entries) {
      visible = entries.some(function (e) { return e.isIntersecting; });
      setRunning(visible && document.visibilityState !== "hidden");
    }, { rootMargin: mobile.matches ? "0px" : "400px 0px", threshold: 0.05 }).observe(card);
    document.addEventListener("visibilitychange", function () {
      setRunning(visible && document.visibilityState !== "hidden");
    });
  }

  function start() {
    var cards = document.querySelectorAll(".section--phone-tabs .luna-card");
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
