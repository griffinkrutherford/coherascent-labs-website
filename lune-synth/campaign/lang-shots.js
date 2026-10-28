(function () {
  "use strict";

  // "Learn in your language" preview on the Language & Accessibility section
  // (lune-synth/index.html#language-accessibility). A phone mockup shows a
  // real app screenshot; a <select> of the 9 shipped locales and a Home/Shop
  // toggle swap which screenshot is shown, with a short crossfade. No-JS
  // visitors see the static English Home screenshot already in the markup --
  // this script only enhances it.

  var LOCALES = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "pt-BR", name: "Português (Brasil)" },
    { code: "zh-Hans", name: "简体中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "hi", name: "हिन्दी" }
  ];

  var SCREENS = {
    home: {
      alt: "Lune Synth home screen with Quick Missions, shown in {lang}"
    },
    shop: {
      alt: "Lune Synth's Item Shop screen, shown in {lang}"
    }
  };

  var localeNames = {};
  LOCALES.forEach(function (locale) {
    localeNames[locale.code] = locale.name;
  });

  function imageSrc(screen, locale) {
    return "screenshots/applied/lang/" + screen + "-" + locale + ".webp?v=3";
  }

  function altFor(screen, locale) {
    var template = (SCREENS[screen] || SCREENS.home).alt;
    return template.replace("{lang}", localeNames[locale] || locale);
  }

  function initHost(host) {
    var select = host.querySelector("[data-lang-shot-select]");
    var toggle = host.querySelector("[data-lang-shot-screen-toggle]");
    var layerA = host.querySelector('[data-lang-shot-layer="a"]');
    var layerB = host.querySelector('[data-lang-shot-layer="b"]');
    if (!select || !layerA || !layerB) return;

    var activeLayer = layerA; // matches the is-active layer already in the markup
    var idleLayer = layerB;
    var currentScreen = "home";
    var selectionVersion = 0;
    var preloaded = {};
    var preloadStarted = false;
    activeLayer.setAttribute("aria-hidden", "false");
    idleLayer.setAttribute("aria-hidden", "true");
    host.setAttribute("aria-busy", "false");

    function markLoaded(screen, locale) {
      preloaded[screen + ":" + locale] = true;
    }
    markLoaded("home", "en");

    function preloadOne(screen, locale) {
      var key = screen + ":" + locale;
      if (preloaded[key]) return;
      preloaded[key] = true;
      var img = new Image();
      img.decoding = "async";
      img.src = imageSrc(screen, locale);
    }

    function preloadAll() {
      if (preloadStarted) return;
      preloadStarted = true;
      LOCALES.forEach(function (locale) {
        preloadOne("home", locale.code);
        preloadOne("shop", locale.code);
      });
    }

    // Preload only on interaction or idle -- never eagerly on page load.
    var idleHandle = null;
    function scheduleIdlePreload() {
      if (idleHandle !== null) return;
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(preloadAll, { timeout: 4000 });
      } else {
        idleHandle = window.setTimeout(preloadAll, 2500);
      }
    }
    if ("IntersectionObserver" in window) {
      var seen = false;
      var io = new IntersectionObserver(function (entries) {
        if (seen || !entries.some(function (entry) { return entry.isIntersecting; })) return;
        seen = true;
        scheduleIdlePreload();
        io.disconnect();
      }, { rootMargin: "200px" });
      io.observe(host);
    }
    ["pointerenter", "focusin"].forEach(function (eventName) {
      host.addEventListener(eventName, preloadAll, { once: true, passive: true });
    });

    function showImage(screen, locale) {
      var nextSrc = imageSrc(screen, locale);
      var alt = altFor(screen, locale);
      var requestVersion = ++selectionVersion;
      var targetLayer = idleLayer;
      var expectedHref = new URL(nextSrc, document.baseURI).href;
      var committed = false;
      host.setAttribute("aria-busy", "true");
      // Every locale uses the same full-frame native iPhone 16 Plus capture.
      targetLayer.width = 1290;
      targetLayer.height = 2796;

      function activateCurrentImage() {
        // Bind completion to both the initiating selection and its exact
        // layer. An old load (including locale/tab A→B→A) cannot swap the
        // current layers or publish a previous language a second time.
        if (committed || requestVersion !== selectionVersion) return;
        if (!targetLayer.complete || !targetLayer.naturalWidth || targetLayer.currentSrc !== expectedHref) return;
        committed = true;
        targetLayer.onload = null;
        targetLayer.onerror = null;
        activeLayer.classList.remove("is-active");
        activeLayer.setAttribute("aria-hidden", "true");
        targetLayer.classList.add("is-active");
        targetLayer.setAttribute("aria-hidden", "false");
        var swapLayer = activeLayer;
        activeLayer = targetLayer;
        idleLayer = swapLayer;
        host.setAttribute("aria-busy", "false");
        markLoaded(screen, locale);
      }

      // CSS removes the opacity transition for reduced motion. Both paths
      // wait for real loaded pixels rather than exposing an empty layer.
      targetLayer.onload = activateCurrentImage;
      targetLayer.onerror = function () {
        if (requestVersion === selectionVersion && targetLayer.complete && !targetLayer.naturalWidth) {
          host.setAttribute("aria-busy", "false");
        }
      };
      targetLayer.alt = alt;
      targetLayer.src = nextSrc;
      activateCurrentImage(); // Cached images may already be complete.
    }

    function currentLocale() {
      return select.value || "en";
    }

    select.addEventListener("change", function () {
      showImage(currentScreen, currentLocale());
    });

    if (toggle) {
      var buttons = Array.prototype.slice.call(toggle.querySelectorAll("[data-lang-shot-screen]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var screen = button.getAttribute("data-lang-shot-screen");
          if (!screen || screen === currentScreen) return;
          currentScreen = screen;
          buttons.forEach(function (other) {
            var isActive = other === button;
            other.classList.toggle("is-active", isActive);
            other.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
          showImage(currentScreen, currentLocale());
        });
      });
    }
  }

  function init() {
    var hosts = document.querySelectorAll("[data-lang-shot]");
    Array.prototype.forEach.call(hosts, initHost);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
