(function () {
  "use strict";

  var instanceCount = 0;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readConfig(host) {
    var source = host.querySelector('script[type="application/json"]');
    if (!source) return {};
    try {
      return JSON.parse(source.textContent || "{}");
    } catch (error) {
      return {};
    }
  }

  function pushEvent(name, config, detail) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({
      event: name,
      feature_name: config.featureName,
      campaign_variant: config.variant,
      landing_path: window.location.pathname
    }, detail || {}));
  }

  function observeSection(host, config) {
    var seen = false;
    if (!("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      if (seen || !entries.some(function (entry) { return entry.isIntersecting; })) return;
      seen = true;
      pushEvent("feature_section_view", config);
      observer.disconnect();
    }, { threshold: 0.22 });
    observer.observe(host);
  }

  function syncVideoNearHost(host, videos) {
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function setPlaying(shouldPlay) {
      videos.forEach(function (video) {
        if (!video) return;
        if (!shouldPlay || reduced || document.hidden) {
          video.pause();
          return;
        }
        var promise = video.play();
        if (promise && promise.catch) promise.catch(function () {});
      });
    }

    if (!("IntersectionObserver" in window)) {
      setPlaying(true);
      return function () {};
    }

    var near = false;
    var observer = new IntersectionObserver(function (entries) {
      near = entries.some(function (entry) { return entry.isIntersecting; });
      setPlaying(near);
    }, { rootMargin: "280px 0px", threshold: 0.01 });
    observer.observe(host);
    document.addEventListener("visibilitychange", function () { setPlaying(near); });
    return function () { setPlaying(near); };
  }

  class LuneQuickMissions extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      var config = readConfig(this);
      config.featureName = "quick-missions";
      var id = "quick-missions-" + (++instanceCount);

      this.innerHTML = `
        <section class="campaign-feature" aria-labelledby="${id}-title" data-feature="quick-missions">
          <h2 class="campaign-feature__title" id="${id}-title">${escapeHtml(config.sectionTitle)}</h2>
          <div class="feature-quick">
            <video class="feature-quick__backdrop" loop muted playsinline preload="none" aria-hidden="true">
              <source src="/screenshots/applied/quick-mission-video.mp4" type="video/mp4">
            </video>
            <div class="feature-quick__veil" aria-hidden="true"></div>
            <div class="feature-quick__content">
              <div class="feature-quick__copy" data-reveal>
                <p class="campaign-feature__eyebrow">${escapeHtml(config.eyebrow)}</p>
                <h3 class="feature-quick__headline">${escapeHtml(config.headline)}</h3>
                <p class="feature-quick__lede">${escapeHtml(config.body)}</p>
                <div class="feature-quick__chips" aria-label="Quick Mission characteristics">
                  <span>2–6 minutes</span>
                  <span>${escapeHtml(config.skillChip)}</span>
                  <span>Immediate next step</span>
                </div>
              </div>
              <div class="feature-quick__device" data-reveal>
                <div class="feature-phone" aria-label="${escapeHtml(config.mediaAlt)}">
                  <span class="feature-phone__buttons" aria-hidden="true">
                    <span class="feature-phone__rail feature-phone__rail--left">
                      <span class="feature-phone__button feature-phone__button--volume"></span>
                      <span class="feature-phone__button feature-phone__button--volume-secondary"></span>
                    </span>
                    <span class="feature-phone__rail feature-phone__rail--right">
                      <span class="feature-phone__button feature-phone__button--power"></span>
                    </span>
                  </span>
                  <div class="feature-phone__screen">
                    <video loop muted playsinline preload="none" poster="/screenshots/applied/quick-mission-screen-poster.png">
                      <source src="/screenshots/applied/quick-mission-screen.mp4" type="video/mp4">
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>`;

      var videos = Array.prototype.slice.call(this.querySelectorAll("video"));
      syncVideoNearHost(this, videos);
      observeSection(this, config);
    }
  }

  var worldAssets = {
    earth: {
      label: "Earth",
      icon: "/lune-synth/images/world-icons/earth.png",
      poster: "/screenshots/applied/step-1-earth-world-thumb.jpg",
      video: "/screenshots/applied/step-1-earth-world.mp4"
    },
    jupiter: {
      label: "Jupiter",
      icon: "/lune-synth/images/world-icons/jupiter.png",
      poster: "/screenshots/applied/step-1-jupiter-world-thumb.jpg",
      video: "/screenshots/applied/step-1-jupiter-world.mp4"
    },
    retro: {
      label: "Retro Arcade",
      icon: "/lune-synth/images/world-icons/retro-arcade.png",
      poster: "/screenshots/applied/step-1-retro-arcade-world-thumb.jpg",
      video: "/screenshots/applied/step-1-retro-arcade-world.mp4"
    },
    math: {
      label: "Math Space",
      icon: "/lune-synth/images/world-icons/math-space.png",
      poster: "/screenshots/applied/step-1-math-space-world-thumb.jpg",
      video: "/screenshots/applied/step-1-math-space-world.mp4"
    }
  };

  var stepAssets = {
    2: { poster: "/screenshots/applied/step-1-thumb.jpg", video: "/screenshots/applied/step-1.mp4" },
    3: { poster: "/screenshots/applied/step-3-thumb.jpg", video: "/screenshots/applied/step-3.mp4" },
    4: { poster: "/screenshots/applied/step-4-thumb.jpg", video: "/screenshots/applied/step-4.mp4" },
    5: { poster: "/screenshots/applied/step-5-thumb.jpg", video: "/screenshots/applied/step-5.mp4" }
  };

  function constellationSteps(config) {
    return [
      {
        label: "Worlds",
        title: "Explore Your Learning Worlds",
        body: "Choose a visual World that makes " + config.topic + " practice feel like a place worth returning to."
      },
      {
        label: "Choose / Create",
        title: "Build Your " + config.topic + " Constellation",
        body: "Start with " + config.goal + ". Lune Synth turns the larger goal into connected skills you can work through one at a time."
      },
      {
        label: "Skill Missions",
        title: "Move From Asteroids to Stars",
        body: "Progress from focused skill checks toward missions that combine more of the reasoning " + config.topic + " requires."
      },
      {
        label: "Galaxy Tests",
        title: "Test Connected Skill Groups",
        body: "Galaxy missions check whether related skills hold together before you move to the final cumulative challenge."
      },
      {
        label: "Supercluster",
        title: "Complete the Larger Goal",
        body: "Finish with a cumulative Supercluster that asks you to synthesize the full " + config.topic + " path."
      }
    ];
  }

  class LuneConstellations extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      var config = readConfig(this);
      config.featureName = "constellations";
      var id = "constellations-" + (++instanceCount);
      var steps = constellationSteps(config);
      var defaultWorld = worldAssets[config.defaultWorld] ? config.defaultWorld : "earth";

      var stepButtons = steps.map(function (step, index) {
        return `<button class="feature-step${index === 0 ? " is-active" : ""}" type="button" role="tab" id="${id}-tab-${index + 1}" aria-selected="${index === 0 ? "true" : "false"}" aria-controls="${id}-panel" data-step="${index + 1}">
          <span class="feature-step__number">${String(index + 1).padStart(2, "0")}</span>
          <span class="feature-step__label">${escapeHtml(step.label)}</span>
        </button>`;
      }).join("");

      var worldItems = Object.keys(worldAssets).map(function (key) {
        var world = worldAssets[key];
        var isActive = key === defaultWorld;
        return `<button class="feature-world-item${isActive ? " is-active" : ""}" type="button" role="option" data-world="${key}" aria-selected="${isActive ? "true" : "false"}">
          <img src="${world.icon}" alt="" width="24" height="24">
          <span class="feature-world-item__label">${escapeHtml(world.label)}</span>
          <svg class="feature-world-item__check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5 6.5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>`;
      }).join("");

      var worldDropdown = `
        <div class="feature-world-dropdown" aria-label="Select World">
          <button class="feature-world-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Select Learning World">
            <span class="feature-world-trigger__current">
              <img class="feature-world-trigger__icon" src="${worldAssets[defaultWorld].icon}" alt="" width="24" height="24">
              <span class="feature-world-trigger__label">${escapeHtml(worldAssets[defaultWorld].label)}</span>
            </span>
            <svg class="feature-world-chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="feature-world-popup" role="listbox" aria-label="Learning Worlds">${worldItems}</div>
        </div>`;

      this.innerHTML = `
        <section class="campaign-feature" aria-labelledby="${id}-title" data-feature="constellations">
          <h2 class="campaign-feature__title" id="${id}-title">${escapeHtml(config.sectionTitle)}</h2>
          <div class="feature-constellation">
            <div class="feature-constellation__header" data-reveal>
              <p class="campaign-feature__eyebrow">${escapeHtml(config.eyebrow)}</p>
              <h3 class="feature-constellation__headline">${escapeHtml(config.headline)}</h3>
              <p class="feature-constellation__lede">${escapeHtml(config.body)}</p>
            </div>
            <div class="feature-constellation__layout">
              <div class="feature-constellation__controls" data-reveal>
                <div class="feature-steps" role="tablist" aria-label="Constellation stages">${stepButtons}</div>
                <div class="feature-step-copy" id="${id}-panel" role="tabpanel" aria-live="polite" aria-labelledby="${id}-tab-1">
                  <span class="feature-step-copy__badge">Step 01</span>
                  <h4>${escapeHtml(steps[0].title)}</h4>
                  <p>${escapeHtml(steps[0].body)}</p>
                  ${worldDropdown}
                </div>
              </div>
              <div class="feature-ipad-wrap" data-reveal>
                <div class="feature-ipad" aria-label="${escapeHtml(config.mediaAlt)}">
                  <span class="feature-ipad__button feature-ipad__button--power" aria-hidden="true"></span>
                  <span class="feature-ipad__button feature-ipad__button--volume feature-ipad__button--volume-up" aria-hidden="true"></span>
                  <span class="feature-ipad__button feature-ipad__button--volume feature-ipad__button--volume-down" aria-hidden="true"></span>
                  <span class="feature-ipad__camera" aria-hidden="true"></span>
                  <div class="feature-ipad__screen">
                    <div class="feature-ipad__screen-content">
                      <img class="feature-ipad__poster" src="${worldAssets[defaultWorld].poster}" alt="${escapeHtml(config.mediaAlt)}">
                      <video class="feature-ipad__media" loop muted playsinline preload="none">
                        <source src="${worldAssets[defaultWorld].video}" type="video/mp4">
                      </video>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>`;

      var panel = this.querySelector(".feature-step-copy");
      var poster = this.querySelector(".feature-ipad__poster");
      var video = this.querySelector(".feature-ipad__media");
      var source = video.querySelector("source");
      var activeStep = 1;
      var activeWorld = defaultWorld;
      var syncNear = syncVideoNearHost(this, [video]);

      function loadMedia(asset) {
        video.classList.remove("is-ready");
        poster.classList.remove("is-hidden");
        poster.src = asset.poster;
        source.src = asset.video;
        video.load();
      }

      video.addEventListener("loadeddata", function () {
        video.classList.add("is-ready");
        poster.classList.add("is-hidden");
        syncNear();
      });

      var dropdown = this.querySelector(".feature-world-dropdown");
      var trigger = this.querySelector(".feature-world-trigger");
      var triggerIcon = this.querySelector(".feature-world-trigger__icon");
      var triggerLabel = this.querySelector(".feature-world-trigger__label");

      if (trigger && dropdown) {
        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          var isOpen = dropdown.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        document.addEventListener("click", function (e) {
          if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
          }
        });

        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && dropdown.classList.contains("is-open")) {
            dropdown.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
            trigger.focus();
          }
        });
      }

      this.querySelectorAll(".feature-step").forEach(function (button) {
        button.addEventListener("click", function () {
          activeStep = Number(button.dataset.step);
          var step = steps[activeStep - 1];
          this.querySelectorAll(".feature-step").forEach(function (item) {
            var active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
          });
          panel.setAttribute("aria-labelledby", button.id);
          panel.querySelector(".feature-step-copy__badge").textContent = "Step " + String(activeStep).padStart(2, "0");
          panel.querySelector("h4").textContent = step.title;
          panel.querySelector("p").textContent = step.body;
          if (dropdown) dropdown.hidden = activeStep !== 1;
          loadMedia(activeStep === 1 ? worldAssets[activeWorld] : stepAssets[activeStep]);
          pushEvent("constellation_step_change", config, { constellation_step: activeStep });
        }.bind(this));
      }, this);

      this.querySelectorAll(".feature-world-item").forEach(function (button) {
        button.addEventListener("click", function () {
          activeWorld = button.dataset.world;
          this.querySelectorAll(".feature-world-item").forEach(function (item) {
            var active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
          });
          if (triggerIcon && worldAssets[activeWorld]) triggerIcon.src = worldAssets[activeWorld].icon;
          if (triggerLabel && worldAssets[activeWorld]) triggerLabel.textContent = worldAssets[activeWorld].label;
          if (dropdown) dropdown.classList.remove("is-open");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
          if (activeStep === 1) loadMedia(worldAssets[activeWorld]);
          pushEvent("constellation_world_change", config, { constellation_world: activeWorld });
        }.bind(this));
      }, this);

      observeSection(this, config);
    }
  }

  if (!customElements.get("lune-quick-missions")) customElements.define("lune-quick-missions", LuneQuickMissions);
  if (!customElements.get("lune-constellations")) customElements.define("lune-constellations", LuneConstellations);
})();
