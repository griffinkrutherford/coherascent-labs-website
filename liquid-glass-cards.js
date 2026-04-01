(function () {
  var selectors = [
    ".hero-card",
    ".pillar",
    ".methodology-card",
    ".card",
    ".timeline-item",
    ".note-card",
    ".platform-showcase",
    ".processing-flow",
    ".processing-card",
    ".voice-flow",
    ".voice-flow__feature",
    ".detail-card",
    ".voice-scene__transcript-card"
  ];

  var cards = Array.prototype.slice.call(document.querySelectorAll(selectors.join(", ")));
  if (!cards.length) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var svgNamespace = "http://www.w3.org/2000/svg";
  var defsHost = document.getElementById("coherascent-liquid-glass-defs");
  var defsNode;

  if (!defsHost) {
    defsHost = document.createElementNS(svgNamespace, "svg");
    defsHost.setAttribute("id", "coherascent-liquid-glass-defs");
    defsHost.setAttribute("class", "liquid-glass-defs");
    defsHost.setAttribute("aria-hidden", "true");
    defsNode = document.createElementNS(svgNamespace, "defs");
    defsHost.appendChild(defsNode);
    document.body.appendChild(defsHost);
  } else {
    defsNode = defsHost.querySelector("defs");
  }

  function createSvgNode(name, attributes) {
    var node = document.createElementNS(svgNamespace, name);
    Object.keys(attributes).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    return node;
  }

  function createFilter(id) {
    var filter = createSvgNode("filter", {
      id: id,
      x: "-12%",
      y: "-12%",
      width: "124%",
      height: "124%",
      "color-interpolation-filters": "sRGB"
    });
    var turbulence = createSvgNode("feTurbulence", {
      type: "turbulence",
      baseFrequency: "0.008 0.012",
      numOctaves: "2",
      seed: String(12 + id.length),
      result: "noise"
    });
    var displacement = createSvgNode("feDisplacementMap", {
      in: "SourceGraphic",
      in2: "noise",
      scale: "77",
      xChannelSelector: "R",
      yChannelSelector: "B"
    });
    filter.appendChild(turbulence);
    filter.appendChild(displacement);
    return {
      filter: filter,
      displacement: displacement
    };
  }

  function makeLayer(className) {
    var layer = document.createElement("div");
    layer.className = className;
    return layer;
  }

  function activateCard(card, x, y) {
    card.classList.add("is-liquid-glass-active");
    card.style.setProperty("--liquid-glass-specular-x", x + "px");
    card.style.setProperty("--liquid-glass-specular-y", y + "px");
  }

  function resetCard(card, displacement) {
    card.classList.remove("is-liquid-glass-active");
    card.style.removeProperty("--liquid-glass-specular-x");
    card.style.removeProperty("--liquid-glass-specular-y");
    displacement.setAttribute("scale", "77");
  }

  cards.forEach(function (card, index) {
    if (card.dataset.liquidGlassReady === "true") return;
    card.dataset.liquidGlassReady = "true";
    card.classList.add("liquid-glass-card");

    var filterId = "coherascent-liquid-glass-filter-" + index;
    var filterParts = createFilter(filterId);
    defsNode.appendChild(filterParts.filter);

    var filterLayer = makeLayer("liquid-glass-layer liquid-glass-filter");
    filterLayer.style.filter = "url(#" + filterId + ") saturate(120%) brightness(1.15)";
    var distortionLayer = makeLayer("liquid-glass-layer liquid-glass-distortion-overlay");
    var overlayLayer = makeLayer("liquid-glass-layer liquid-glass-overlay");
    var specularLayer = makeLayer("liquid-glass-layer liquid-glass-specular");

    var fragment = document.createDocumentFragment();
    fragment.appendChild(filterLayer);
    fragment.appendChild(distortionLayer);
    fragment.appendChild(overlayLayer);
    fragment.appendChild(specularLayer);
    card.insertBefore(fragment, card.firstChild);

    if (reducedMotion) return;

    card.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var scaleX = (x / rect.width) * 100;
      var scaleY = (y / rect.height) * 100;
      var dynamicScale = Math.min(scaleX, scaleY);

      activateCard(card, x, y);
      filterParts.displacement.setAttribute("scale", dynamicScale.toFixed(1));
    });

    card.addEventListener("pointerleave", function () {
      resetCard(card, filterParts.displacement);
    });

    card.addEventListener("pointercancel", function () {
      resetCard(card, filterParts.displacement);
    });

    card.addEventListener("focusin", function () {
      var rect = card.getBoundingClientRect();
      activateCard(card, rect.width * 0.5, rect.height * 0.28);
      filterParts.displacement.setAttribute("scale", "77");
    });

    card.addEventListener("focusout", function (event) {
      if (card.contains(event.relatedTarget)) return;
      resetCard(card, filterParts.displacement);
    });
  });
})();
