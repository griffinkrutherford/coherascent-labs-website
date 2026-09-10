(function () {
  "use strict";
  var section = document.querySelector('.section--handwriting');
  if (!section) return;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 48;
  var context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  var cache = new Map();
  var request = 0;
  var lastSource = '';
  var frame = 0;
  var displayed = [164, 123, 255];
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyColor(color) {
    cancelAnimationFrame(frame);
    var from = displayed.slice();
    var start = performance.now();
    function paint(now) {
      var progress = motion.matches ? 1 : Math.min(1, (now - start) / 650);
      var eased = 1 - Math.pow(1 - progress, 3);
      displayed = color.map(function (value, i) { return from[i] + (value - from[i]) * eased; });
      section.style.setProperty('--handwriting-accent', 'rgb(' + displayed.map(Math.round).join(', ') + ')');
      if (progress < 1) frame = requestAnimationFrame(paint);
    }
    paint(start);
  }

  function primaryColor(img) {
    context.drawImage(img, 0, 0, 48, 48);
    var pixels = context.getImageData(0, 0, 48, 48).data;
    var bins = Array.from({ length: 36 }, function () { return { weight: 0, hue: 0 }; });
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i] / 255, g = pixels[i + 1] / 255, b = pixels[i + 2] / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
      // Ignore white text, black bezels, and neutral UI chrome.
      if (max < 0.16 || delta / max < 0.25) continue;
      var hue = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue *= 60;
      var weight = delta / max;
      var bin = bins[Math.floor(hue / 10)];
      bin.weight += weight;
      bin.hue += hue * weight;
    }
    var dominant = bins.reduce(function (a, b) { return a.weight > b.weight ? a : b; });
    context.fillStyle = dominant.weight ? 'hsl(' + Math.round(dominant.hue / dominant.weight) + ' 70% 66%)' : '#a47bff';
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
  }

  function update() {
    var host = section.querySelector('.response-carousel__paper.is-active [data-screenshot-src]');
    if (!host) return;
    var src = host.dataset.screenshotSrc;
    if (src === lastSource) return;
    lastSource = src;
    var current = ++request;
    if (cache.has(src)) { applyColor(cache.get(src)); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var color = primaryColor(img);
        cache.set(src, color);
        if (current === request) applyColor(color);
      } catch (_) { /* Retain the readable fallback if sampling is unavailable. */ }
    };
    img.onerror = function () { if (current === request) lastSource = ''; };
    img.src = src;
  }
  document.addEventListener('coherascent:response-slide-change', update);
  new MutationObserver(function (records) {
    if (records.some(function (record) {
      return record.type === 'childList' || record.target.matches('.response-carousel__paper, [data-screenshot-src]');
    })) update();
  }).observe(section.querySelector('[data-response-slideshow]'), {
    subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-screenshot-src']
  });
  update();
})();
