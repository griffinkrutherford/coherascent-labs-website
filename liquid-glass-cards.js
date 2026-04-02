(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-liquid-glass]"));
  if (!cards.length) return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var defsHost = document.getElementById("coherascent-liquid-glass-defs");
  var defsNode;
  var resizeTimer;
  var scrollEndTimer;
  var scrollTicking = false;

  if (!defsHost) {
    defsHost = document.createElementNS(SVG_NS, "svg");
    defsHost.setAttribute("id", "coherascent-liquid-glass-defs");
    defsHost.setAttribute("class", "liquid-glass-defs");
    defsHost.setAttribute("aria-hidden", "true");
    defsHost.setAttribute("color-interpolation-filters", "sRGB");
    defsNode = document.createElementNS(SVG_NS, "defs");
    defsHost.appendChild(defsNode);
    document.body.appendChild(defsHost);
  } else {
    defsNode = defsHost.querySelector("defs");
    if (!defsNode) {
      defsNode = document.createElementNS(SVG_NS, "defs");
      defsHost.appendChild(defsNode);
    }
  }

  var SURFACE_FNS = {
    convex_squircle: function (x) {
      return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
    },
    convex_circle: function (x) {
      return Math.sqrt(1 - (1 - x) * (1 - x));
    },
    concave: function (x) {
      return 1 - Math.sqrt(1 - (1 - x) * (1 - x));
    },
    lip: function (x) {
      var convex = Math.pow(1 - Math.pow(1 - Math.min(x * 2, 1), 4), 0.25);
      var concave = 1 - Math.sqrt(1 - (1 - x) * (1 - x)) + 0.1;
      var t = 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
      return convex * (1 - t) + concave * t;
    }
  };

  function createSvgNode(name, attributes) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    return node;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getCardRadius(card) {
    var styles = window.getComputedStyle(card);
    return parseFloat(styles.borderTopLeftRadius) || parseFloat(styles.borderRadius) || 24;
  }

  function calculateRefractionProfile(glassThickness, bezelWidth, heightFn, ior, samples) {
    samples = samples || 128;

    var eta = 1 / ior;
    var profile = new Float64Array(samples);

    function refract(nx, ny) {
      var dot = ny;
      var k = 1 - eta * eta * (1 - dot * dot);
      var sq;

      if (k < 0) return null;

      sq = Math.sqrt(k);
      return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
    }

    for (var i = 0; i < samples; i += 1) {
      var x = i / samples;
      var y = heightFn(x);
      var dx = x < 1 ? 0.0001 : -0.0001;
      var y2 = heightFn(x + dx);
      var deriv = (y2 - y) / dx;
      var mag = Math.sqrt(deriv * deriv + 1);
      var ref = refract(-deriv / mag, -1 / mag);

      if (!ref) {
        profile[i] = 0;
        continue;
      }

      profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
    }

    return profile;
  }

  function generateDisplacementMap(w, h, radius, bezelWidth, profile, maxDisp) {
    var canvas = document.createElement("canvas");
    var ctx;
    var image;
    var data;
    var r = radius;
    var rSq = r * r;
    var r1Sq = Math.pow(r + 1, 2);
    var rBSq = Math.pow(Math.max(r - bezelWidth, 0), 2);
    var wB = w - r * 2;
    var hB = h - r * 2;
    var samples = profile.length;

    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    image = ctx.createImageData(w, h);
    data = image.data;

    for (var base = 0; base < data.length; base += 4) {
      data[base] = 128;
      data[base + 1] = 128;
      data[base + 2] = 0;
      data[base + 3] = 255;
    }

    for (var y1 = 0; y1 < h; y1 += 1) {
      for (var x1 = 0; x1 < w; x1 += 1) {
        var x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
        var y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
        var dSq = x * x + y * y;

        if (dSq > r1Sq || dSq < rBSq) continue;

        var dist = Math.sqrt(dSq);
        var fromSide = r - dist;
        var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));

        if (op <= 0 || dist === 0) continue;

        var cos = x / dist;
        var sin = y / dist;
        var bi = Math.min(((fromSide / bezelWidth) * samples) | 0, samples - 1);
        var disp = profile[bi] || 0;
        var dX = (-cos * disp) / maxDisp;
        var dY = (-sin * disp) / maxDisp;
        var idx = (y1 * w + x1) * 4;

        data[idx] = (128 + dX * 127 * op + 0.5) | 0;
        data[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
      }
    }

    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function generateSpecularMap(w, h, radius, bezelWidth, angle) {
    var canvas = document.createElement("canvas");
    var ctx;
    var image;
    var data;
    var r = radius;
    var rSq = r * r;
    var r1Sq = Math.pow(r + 1, 2);
    var rBSq = Math.pow(Math.max(r - bezelWidth, 0), 2);
    var wB = w - r * 2;
    var hB = h - r * 2;
    var sv = [Math.cos(angle), Math.sin(angle)];

    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");
    image = ctx.createImageData(w, h);
    data = image.data;
    data.fill(0);

    for (var y1 = 0; y1 < h; y1 += 1) {
      for (var x1 = 0; x1 < w; x1 += 1) {
        var x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
        var y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
        var dSq = x * x + y * y;

        if (dSq > r1Sq || dSq < rBSq) continue;

        var dist = Math.sqrt(dSq);
        var fromSide = r - dist;
        var op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));

        if (op <= 0 || dist === 0) continue;

        var cos = x / dist;
        var sin = -y / dist;
        var dot = Math.abs(cos * sv[0] + sin * sv[1]);
        var edge = Math.sqrt(Math.max(0, 1 - Math.pow(1 - fromSide, 2)));
        var coeff = dot * edge;
        var col = (255 * coeff) | 0;
        var alpha = (col * coeff * op) | 0;
        var idx = (y1 * w + x1) * 4;

        data[idx] = col;
        data[idx + 1] = col;
        data[idx + 2] = col;
        data[idx + 3] = alpha;
      }
    }

    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function createFilterDefinition(id) {
    var filter = createSvgNode("filter", {
      id: id,
      x: "0%",
      y: "0%",
      width: "100%",
      height: "100%",
      colorInterpolationFilters: "sRGB"
    });

    defsNode.appendChild(filter);
    return filter;
  }

  function ensureLayers(card, filterId) {
    if (card.dataset.liquidGlassReady === "true") return;

    var filterLayer = document.createElement("div");
    var overlayLayer = document.createElement("div");
    var fragment = document.createDocumentFragment();

    card.dataset.liquidGlassReady = "true";
    card.classList.add("liquid-glass-card");

    filterLayer.className = "liquid-glass-layer liquid-glass-filter";
    filterLayer.style.backdropFilter = "url(#" + filterId + ")";
    filterLayer.style.webkitBackdropFilter = "url(#" + filterId + ")";

    overlayLayer.className = "liquid-glass-layer liquid-glass-overlay";

    fragment.appendChild(filterLayer);
    fragment.appendChild(overlayLayer);
    card.insertBefore(fragment, card.firstChild);
  }

  function rebuildCard(card, index) {
    var width = Math.round(card.offsetWidth);
    var height = Math.round(card.offsetHeight);
    var radius = Math.round(getCardRadius(card));
    var minDim = Math.min(width, height);
    var clampedRadius;
    var bezelWidth;
    var glassThickness;
    var clampedBezel;
    var profile;
    var maxDisp;
    var dispUrl;
    var specUrl;
    var filterId = "coherascent-liquid-glass-filter-" + index;
    var filterNode = defsNode.querySelector("#" + filterId);

    if (width < 2 || height < 2) return;

    clampedRadius = Math.min(radius, Math.floor(minDim / 2) - 1);
    bezelWidth = clamp(Math.round(minDim * 0.3), 2, 60);
    glassThickness = clamp(Math.round(minDim * 0.4), 10, 200);
    clampedBezel = Math.min(bezelWidth, clampedRadius - 1, minDim / 2 - 1);

    if (clampedRadius < 2 || clampedBezel < 2) return;

    ensureLayers(card, filterId);

    if (!filterNode) {
      filterNode = createFilterDefinition(filterId);
    }

    profile = calculateRefractionProfile(
      glassThickness,
      clampedBezel,
      SURFACE_FNS.convex_squircle,
      3,
      128
    );

    maxDisp = Math.max.apply(
      null,
      Array.prototype.map.call(profile, function (value) {
        return Math.abs(value);
      })
    ) || 1;

    dispUrl = generateDisplacementMap(width, height, clampedRadius, clampedBezel, profile, maxDisp);
    specUrl = generateSpecularMap(width, height, clampedRadius, clampedBezel * 2.5, Math.PI / 3);

    filterNode.innerHTML = [
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="blurred_source"></feGaussianBlur>',
      '<feImage href="' + dispUrl + '" x="0" y="0" width="' + width + '" height="' + height + '" result="disp_map"></feImage>',
      '<feDisplacementMap in="blurred_source" in2="disp_map" scale="' + maxDisp + '" xChannelSelector="R" yChannelSelector="G" result="displaced"></feDisplacementMap>',
      '<feColorMatrix in="displaced" type="saturate" values="4" result="displaced_sat"></feColorMatrix>',
      '<feImage href="' + specUrl + '" x="0" y="0" width="' + width + '" height="' + height + '" result="spec_layer"></feImage>',
      '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked"></feComposite>',
      '<feComponentTransfer in="spec_layer" result="spec_faded"><feFuncA type="linear" slope="0.5"></feFuncA></feComponentTransfer>',
      '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat"></feBlend>',
      '<feBlend in="spec_faded" in2="with_sat" mode="normal"></feBlend>'
    ].join("");
  }

  function rebuildAll() {
    cards.forEach(function (card, index) {
      rebuildCard(card, index);
    });
  }

  function scheduleRebuild() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuildAll, 30);
  }

  function handleScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        rebuildAll();
        scrollTicking = false;
      });
    }

    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(rebuildAll, 90);
  }

  window.addEventListener("resize", scheduleRebuild);
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (typeof ResizeObserver !== "undefined") {
    var observer = new ResizeObserver(scheduleRebuild);
    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(rebuildAll);
  });
})();
