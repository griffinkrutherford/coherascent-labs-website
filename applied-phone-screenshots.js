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
  var modal = null;
  var modalImage = null;
  var modalClose = null;
  var modalFrame = null;
  var modalStage = null;
  var activeTrigger = null;

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
      '<div class="phone-mock-lightbox__frame" hidden>',
      '  <img class="phone-mock-lightbox__image" alt="">',
      "</div>",
      '<div class="phone-mock-lightbox__stage" hidden></div>'
    ].join("");

    document.body.appendChild(modal);
    modalFrame = modal.querySelector(".phone-mock-lightbox__frame");
    modalImage = modal.querySelector(".phone-mock-lightbox__image");
    modalClose = modal.querySelector(".phone-mock-lightbox__close");
    modalStage = modal.querySelector(".phone-mock-lightbox__stage");

    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target === modalClose) {
        closeModal();
      }
    });

    modalClose.addEventListener("click", closeModal);
  }

  function clearModalContent() {
    modalImage.removeAttribute("src");
    modalFrame.hidden = true;
    modalStage.hidden = true;
    modalStage.textContent = "";
  }

  function openModal(host, trigger) {
    ensureModal();
    activeTrigger = trigger;
    clearModalContent();

    if (host.getAttribute("data-screenshot-loaded") === "true") {
      modalImage.src = host.getAttribute("data-screenshot-src");
      modalFrame.hidden = false;
    } else {
      var clone = trigger.cloneNode(true);
      clone.classList.remove("phone-mock-trigger");
      clone.removeAttribute("role");
      clone.removeAttribute("tabindex");
      clone.removeAttribute("aria-label");
      modalStage.appendChild(clone);
      modalStage.hidden = false;
    }

    modal.hidden = false;
    document.body.classList.add("phone-lightbox-open");
    modalClose.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    clearModalContent();
    document.body.classList.remove("phone-lightbox-open");

    if (activeTrigger && typeof activeTrigger.focus === "function") {
      activeTrigger.focus();
    }
    activeTrigger = null;
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
      openModal(host, trigger);
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(host, trigger);
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
