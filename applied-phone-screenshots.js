(function () {
  var hosts = document.querySelectorAll("[data-screenshot-src]");
  if (!hosts.length) return;

  var phoneSelector = [
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

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    stripCloneInteractivity(clone);
    clone.style.visibility = "hidden";
    clone.style.transform = "none";
    modalStage.appendChild(clone);

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

  Array.prototype.forEach.call(hosts, function (host) {
    var src = host.getAttribute("data-screenshot-src");
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

    var probe = new Image();

    probe.onload = function () {
      if (host.querySelector(".phone-screenshot")) return;

      var screenshot = document.createElement("img");
      screenshot.className = "phone-screenshot";
      screenshot.src = src;
      screenshot.alt = "";
      screenshot.setAttribute("aria-hidden", "true");
      screenshot.loading = "lazy";
      screenshot.decoding = "async";
      host.insertBefore(screenshot, host.firstChild);
      host.setAttribute("data-screenshot-loaded", "true");
    };

    probe.src = src;
  });
})();
