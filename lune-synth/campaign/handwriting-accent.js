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
    return dominant.weight ? 'hsl(' + Math.round(dominant.hue / dominant.weight) + ' 70% 66%)' : '#a47bff';
  }

  function update() {
    var host = section.querySelector('.response-carousel__paper.is-active [data-screenshot-src]');
    if (!host) return;
    var src = host.dataset.screenshotSrc;
    var current = ++request;
    if (cache.has(src)) { section.style.setProperty('--handwriting-accent', cache.get(src)); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var color = primaryColor(img);
        cache.set(src, color);
        if (current === request) section.style.setProperty('--handwriting-accent', color);
      } catch (_) { /* Retain the readable fallback if sampling is unavailable. */ }
    };
    img.src = src;
  }
  document.addEventListener('coherascent:response-slide-change', update);
  update();
})();
