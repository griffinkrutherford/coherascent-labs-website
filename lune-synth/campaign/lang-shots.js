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
    return "screenshots/applied/lang/" + screen + "-" + locale + ".webp?v=1";
  }

  function altFor(screen, locale) {
    var template = (SCREENS[screen] || SCREENS.home).alt;
    return template.replace("{lang}", localeNames[locale] || locale);
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
    var preloaded = {};
    var preloadStarted = false;

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
      var reduceMotion = prefersReducedMotion();

      idleLayer.onload = function () {
        activeLayer.classList.remove("is-active");
        idleLayer.classList.add("is-active");
        var swapLayer = activeLayer;
        activeLayer = idleLayer;
        idleLayer = swapLayer;
      };
      if (reduceMotion) {
        // Swap immediately -- no crossfade overlap.
        idleLayer.onload = null;
        activeLayer.classList.remove("is-active");
        idleLayer.src = nextSrc;
        idleLayer.alt = alt;
        idleLayer.classList.add("is-active");
        var swapped = activeLayer;
        activeLayer = idleLayer;
        idleLayer = swapped;
        return;
      }
      idleLayer.alt = alt;
      idleLayer.src = nextSrc;
      markLoaded(screen, locale);
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
