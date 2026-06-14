(function () {
  var hosts = document.querySelectorAll("[data-screenshot-src]");

  var phoneSelector = [
    "[data-phone-mock]",
    ".capture-scene__phone",
    ".processing-scene__phone",
    ".feedback-scene__phone",
    ".voice-scene__phone",
    ".response-carousel__question-phone"
  ].join(", ");
  var openEase = "cubic-bezier(0.16, 1, 0.3, 1)";
  var closeEase = "cubic-bezier(0.32, 0, 0.67, 0)";
  var modal = null;
  var modalClose = null;
  var modalStage = null;
  var activeTrigger = null;
  var activeClone = null;
  var activeTransform = "";
  var isClosing = false;
  var hardwareMarkup = [
    '<div class="phone-shell-buttons" aria-hidden="true">',
    '  <span class="phone-shell-buttons__rail phone-shell-buttons__rail--left">',
    '    <span class="phone-shell-button phone-shell-button--volume"></span>',
    '    <span class="phone-shell-button phone-shell-button--volume phone-shell-button--volume-secondary"></span>',
    "  </span>",
    '  <span class="phone-shell-buttons__rail phone-shell-buttons__rail--right">',
    '    <span class="phone-shell-button phone-shell-button--power"></span>',
    "  </span>",
    "</div>"
  ].join("");

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initPhoneHardware() {
    Array.prototype.forEach.call(document.querySelectorAll(phoneSelector), function (phone) {
      phone.setAttribute("data-phone-mock", phone.getAttribute("data-phone-mock") || "");

      if (phone.querySelector(".phone-shell-buttons")) return;
      phone.insertAdjacentHTML("beforeend", hardwareMarkup);
    });
  }

  function getScreenshotLoadPriority(src, index) {
    var promptMatch = src.match(/\/question-prompts\/(\d+)\.png(?:$|\?)/);
    if (!promptMatch) {
      return {
        group: 1,
        order: index
      };
    }

    var promptNumber = parseInt(promptMatch[1], 10);
    return {
      group: promptNumber <= 3 ? 0 : 2,
      order: promptNumber
    };
  }

  var screenshotQueue = [];
  var activeScreenshotLoads = 0;
  var maxConcurrentScreenshotLoads = 6;

  function enqueueScreenshotLoads(items) {
    items.forEach(function (item) {
      if (item.queued || item.loaded) return;
      item.queued = true;
      screenshotQueue.push(item);
    });

    screenshotQueue.sort(function (a, b) {
      if (a.priority.group !== b.priority.group) {
        return a.priority.group - b.priority.group;
      }
      return a.priority.order - b.priority.order;
    });

    loadNextScreenshot();
  }

  function loadNextScreenshot() {
    while (activeScreenshotLoads < maxConcurrentScreenshotLoads && screenshotQueue.length) {
      startScreenshotLoad(screenshotQueue.shift());
    }
  }

  function startScreenshotLoad(item) {
    activeScreenshotLoads += 1;

    var finish = function () {
      activeScreenshotLoads = Math.max(0, activeScreenshotLoads - 1);
      loadNextScreenshot();
    };

    if (item.loaded) {
      finish();
      return;
    }

    var screenshot = item.screenshot;

    // Apply fetch priority directly to the image element
    if ("fetchPriority" in screenshot) {
      screenshot.fetchPriority = item.priority.group === 0 ? "high" : (item.priority.group === 2 ? "low" : "auto");
    }

    var handleLoad = function () {
      if (item.loaded) return;

      // Force a reflow before adding the loaded class to trigger transition.
      screenshot.getBoundingClientRect();
      screenshot.classList.remove("phone-screenshot--loading");
      screenshot.classList.add("phone-screenshot--loaded");
      item.host.setAttribute("data-screenshot-loaded", "true");
      item.host.setAttribute("data-screenshot-replacing", "true");
      item.loaded = true;

      setTimeout(function() {
        var low = item.host.querySelector(".phone-screenshot--low");
        if (low) low.remove();
      }, 1000);

      finish();
    };

    var handleError = function () {
      finish();
    };

    // If the image is already cached/complete, handle it immediately
    if (screenshot.complete && screenshot.naturalWidth) {
      handleLoad();
    } else {
      screenshot.onload = handleLoad;
      screenshot.onerror = handleError;
    }

    // Set src and append to DOM immediately to start download and progressive rendering
    if (!screenshot.src) {
      screenshot.src = item.src;
    }

    if (!screenshot.parentNode) {
      item.host.insertBefore(screenshot, item.host.firstChild);
    }
  }

  function lazyLoadScreenshots(items) {
    if (!items.length) return;

    var eagerItems = items.filter(function (item) {
      return item.priority.group === 0;
    });
    var deferredItems = items.filter(function (item) {
      return item.priority.group !== 0;
    });

    enqueueScreenshotLoads(eagerItems);

    if (!("IntersectionObserver" in window)) {
      enqueueScreenshotLoads(deferredItems);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var item = entry.target._coherascentScreenshotItem;
        if (item) {
          enqueueScreenshotLoads([item]);
        }
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "1000px 0px",
      threshold: 0.01
    });

    deferredItems.forEach(function (item) {
      item.host._coherascentScreenshotItem = item;
      observer.observe(item.host);
    });
  }

  function ensureModal() {
    if (modal) return;

    modal = document.createElement("div");
    modal.className = "phone-mock-lightbox";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Expanded phone mock");
    modal.innerHTML = [
      '<button class="phone-mock-lightbox__close" type="button" aria-label="Close phone mock">X</button>',
      '<div class="phone-mock-lightbox__stage" hidden></div>'
    ].join("");

    document.body.appendChild(modal);
    modalClose = modal.querySelector(".phone-mock-lightbox__close");
    modalStage = modal.querySelector(".phone-mock-lightbox__stage");

    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target === modalStage || event.target === modalClose) {
        closeModal();
      }
    });

    modalClose.addEventListener("click", closeModal);
  }

  function clearModalContent() {
    if (!modalStage) return;

    modalStage.hidden = true;
    modalStage.textContent = "";
    activeClone = null;
    activeTransform = "";
  }

  function stripCloneInteractivity(clone) {
    clone.classList.remove("phone-mock-trigger");
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("role");
    clone.removeAttribute("tabindex");
    clone.removeAttribute("aria-label");

    Array.prototype.forEach.call(clone.querySelectorAll("[tabindex], [role], [aria-label], .phone-mock-trigger"), function (node) {
      node.classList.remove("phone-mock-trigger");
      node.removeAttribute("tabindex");
      node.removeAttribute("role");
      node.removeAttribute("aria-label");
    });
  }

  function prepareFullscreenClone(clone) {
    if (clone.getAttribute("data-fullscreen-render") !== "mock") return;

    Array.prototype.forEach.call(clone.querySelectorAll(".phone-screenshot"), function (node) {
      node.remove();
    });

    Array.prototype.forEach.call(clone.querySelectorAll(".phone-screenshot-host"), function (host) {
      host.removeAttribute("data-screenshot-replacing");
      host.removeAttribute("data-screenshot-loaded");
    });
  }

  function isVisibleInClone(node, clone) {
    var current = node;
    while (current && current !== clone) {
      if (current.hidden || current.style.display === "none") {
        return false;
      }
      current = current.parentElement;
    }
    return true;
  }

  function getTargetTransform(sourceRect, clone) {
    var naturalWidth = clone.offsetWidth || sourceRect.width;
    var naturalHeight = clone.offsetHeight || sourceRect.height;
    var viewportPadding = Math.min(48, Math.max(24, window.innerWidth * 0.07));
    var maxWidth = Math.min(window.innerWidth - viewportPadding, 520);
    var maxHeight = Math.max(260, window.innerHeight - viewportPadding);
    var targetScale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
    var targetWidth = naturalWidth * targetScale;
    var targetHeight = naturalHeight * targetScale;
    var targetLeft = (window.innerWidth - targetWidth) / 2;
    var targetTop = (window.innerHeight - targetHeight) / 2;
    var sourceScaleX = sourceRect.width / naturalWidth;
    var sourceScaleY = sourceRect.height / naturalHeight;

    return {
      from: "translate3d(" + sourceRect.left + "px, " + sourceRect.top + "px, 0) scale(" + sourceScaleX + ", " + sourceScaleY + ")",
      to: "translate3d(" + targetLeft + "px, " + targetTop + "px, 0) scale(" + targetScale + ")"
    };
  }

  function animateElement(element, keyframes, options) {
    var lastFrame = keyframes[keyframes.length - 1];
    var applyLastFrame = function () {
      Object.keys(lastFrame).forEach(function (property) {
        element.style[property] = lastFrame[property];
      });
    };

    if (prefersReducedMotion() || !element.animate) {
      applyLastFrame();
      return Promise.resolve();
    }

    var animationOptions = {};
    Object.keys(options).forEach(function (key) {
      animationOptions[key] = options[key];
    });
    animationOptions.fill = "none";

    var animation = element.animate(keyframes, animationOptions);
    return animation.finished.then(function () {
      applyLastFrame();
      animation.cancel();
    }).catch(function () {});
  }

  function openModal(trigger) {
    if (isClosing) return;

    ensureModal();
    clearModalContent();

    activeTrigger = trigger;
    var sourceRect = trigger.getBoundingClientRect();
    var clone = trigger.cloneNode(true);

    // Swap images inside the clone to high resolution (high-res only in full screen view)
    var hostsWithHighRes = clone.querySelectorAll("[data-screenshot-high]");
    Array.prototype.forEach.call(hostsWithHighRes, function (host) {
      var highSrc = host.getAttribute("data-screenshot-high");
      if (!highSrc) return;
      var img = host.querySelector("img.phone-screenshot");
      if (img) {
        img.src = highSrc;
      }
    });

    var imgsWithHighRes = clone.querySelectorAll("img[data-screenshot-high]");
    Array.prototype.forEach.call(imgsWithHighRes, function (img) {
      var highSrc = img.getAttribute("data-screenshot-high");
      if (highSrc) {
        img.src = highSrc;
      }
    });

    stripCloneInteractivity(clone);
    prepareFullscreenClone(clone);
    clone.style.visibility = "hidden";
    clone.style.transform = "none";
    modalStage.appendChild(clone);

    // Start playing videos in the clone and add glassy play/pause control button
    var videos = clone.querySelectorAll("video");
    Array.prototype.forEach.call(videos, function (video) {
      if (!isVisibleInClone(video, clone)) return;

      video.play().catch(function() {});
      
      var parent = video.parentNode;
      if (parent) {
        var btn = document.createElement("button");
        btn.className = "ipad-video-control-btn";
        btn.setAttribute("type", "button");
        btn.setAttribute("aria-label", "Pause video");
        btn.innerHTML = '<svg class="ipad-video-control-icon" viewBox="0 0 24 24" width="18" height="18" style="display:block;"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>';
        parent.appendChild(btn);
        
        var togglePlay = function (e) {
          e.stopPropagation(); // prevent modal from closing when clicking control
          if (video.paused) {
            video.play();
            btn.innerHTML = '<svg class="ipad-video-control-icon" viewBox="0 0 24 24" width="18" height="18" style="display:block;"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>';
            btn.setAttribute("aria-label", "Pause video");
          } else {
            video.pause();
            btn.innerHTML = '<svg class="ipad-video-control-icon" viewBox="0 0 24 24" width="18" height="18" style="display:block;"><path fill="currentColor" d="M8,5V19L19,12L8,5Z"/></svg>';
            btn.setAttribute("aria-label", "Play video");
          }
        };
        
        btn.addEventListener("click", togglePlay);
        video.addEventListener("click", togglePlay);
        video.style.cursor = "pointer";
      }
    });

    modal.hidden = false;
    modalStage.hidden = false;
    document.body.classList.add("phone-lightbox-open");

    var transforms = getTargetTransform(sourceRect, clone);
    activeClone = clone;
    activeTransform = transforms.to;
    clone.style.visibility = "";
    clone.style.transform = transforms.from;

    animateElement(modal, [
      { opacity: "0" },
      { opacity: "1" }
    ], {
      duration: 260,
      easing: "ease-out",
      fill: "forwards"
    });

    animateElement(clone, [
      { transform: transforms.from },
      { transform: transforms.to }
    ], {
      duration: 620,
      easing: openEase,
      fill: "forwards"
    }).then(function () {
      if (activeClone === clone) {
        clone.style.transform = transforms.to;
      }
    });

    modalClose.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden || isClosing) return;

    isClosing = true;

    var clone = activeClone;
    var trigger = activeTrigger;
    var finish = function () {
      modal.hidden = true;
      modal.style.opacity = "";
      clearModalContent();
      document.body.classList.remove("phone-lightbox-open");
      isClosing = false;

      if (trigger && typeof trigger.focus === "function") {
        trigger.focus();
      }
      activeTrigger = null;
    };

    if (!clone || !trigger) {
      finish();
      return;
    }

    var sourceRect = trigger.getBoundingClientRect();
    var naturalWidth = clone.offsetWidth || sourceRect.width;
    var naturalHeight = clone.offsetHeight || sourceRect.height;
    var sourceScaleX = sourceRect.width / naturalWidth;
    var sourceScaleY = sourceRect.height / naturalHeight;
    var endTransform = "translate3d(" + sourceRect.left + "px, " + sourceRect.top + "px, 0) scale(" + sourceScaleX + ", " + sourceScaleY + ")";
    var startTransform = activeTransform || clone.style.transform;

    Promise.all([
      animateElement(modal, [
        { opacity: "1" },
        { opacity: "0" }
      ], {
        duration: 260,
        easing: "ease-in",
        fill: "forwards"
      }),
      animateElement(clone, [
        { transform: startTransform },
        { transform: endTransform }
      ], {
        duration: 460,
        easing: closeEase,
        fill: "forwards"
      })
    ]).then(finish);
  }

  document.addEventListener("keydown", function (event) {
    if (!modal || modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
    }
  });

  initPhoneHardware();

  Array.prototype.forEach.call(document.querySelectorAll(".voice-scene__ipad, .ipad-mockup"), function (ipad) {
    if (ipad.classList.contains("phone-mock-trigger")) return;
    ipad.classList.add("phone-mock-trigger");
    ipad.setAttribute("role", "button");
    ipad.setAttribute("tabindex", "0");
    if (!ipad.getAttribute("aria-label")) {
      ipad.setAttribute("aria-label", "Open iPad mock");
    }

    ipad.addEventListener("click", function () {
      openModal(ipad);
    });

    ipad.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(ipad);
    });
  });

  var screenshotItems = [];

  Array.prototype.forEach.call(hosts, function (host, index) {
    var src = host.getAttribute("data-screenshot-src");
    var lowSrc = host.getAttribute("data-screenshot-low");
    if (!src) return;

    var trigger = host.closest(phoneSelector) || host;
    trigger.classList.add("phone-mock-trigger");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", "Open phone mock");

    trigger.addEventListener("click", function () {
      openModal(trigger);
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(trigger);
    });

    // 1. Immediately inject low-quality placeholder if available.
    // Hosts with data-screenshot-low hide handcrafted fallback in CSS, so this is the first visible mock state.
    if (lowSrc) {
      var lowImg = document.createElement("img");
      lowImg.className = "phone-screenshot phone-screenshot--low";
      lowImg.alt = "";
      lowImg.setAttribute("aria-hidden", "true");
      lowImg.loading = index < 6 ? "eager" : "lazy";
      lowImg.decoding = "async";
      if ("fetchPriority" in lowImg) {
        lowImg.fetchPriority = index < 6 ? "high" : "low";
      }
      host.setAttribute("data-screenshot-replacing", "true");
      host.insertBefore(lowImg, host.firstChild);
      lowImg.src = lowSrc;
    }

    // 2. Prepare high-quality image (hidden initially)
    var screenshot = document.createElement("img");
    screenshot.className = "phone-screenshot phone-screenshot--loading";
    screenshot.alt = "";
    screenshot.setAttribute("aria-hidden", "true");
    screenshot.loading = "lazy";
    screenshot.decoding = "async";

    screenshotItems.push({
      host: host,
      src: src,
      screenshot: screenshot,
      priority: getScreenshotLoadPriority(src, index)
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll(phoneSelector), function (trigger) {
    if (trigger.classList.contains("phone-mock-trigger")) return;

    trigger.classList.add("phone-mock-trigger");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    if (!trigger.getAttribute("aria-label")) {
      trigger.setAttribute("aria-label", "Open phone mock");
    }

    trigger.addEventListener("click", function () {
      openModal(trigger);
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(trigger);
    });
  });

  lazyLoadScreenshots(screenshotItems);
})();
