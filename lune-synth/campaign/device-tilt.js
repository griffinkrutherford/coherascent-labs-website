(function () {
  "use strict";
  var motion = window.matchMedia("(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!("IntersectionObserver" in window) || !CSS.supports("rotate", "0 1 0 34deg")) return;
  var buttonSelector = ".phone-shell-button, .feature-phone__button, .ipad-button, .voice-scene__ipad-button, .feature-ipad__button";
  var selector = ".phone-mock__frame, .feature-phone, .feature-ipad, .response-carousel__question-phone";
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-device-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function sync() {
    if (!motion.matches) {
      // Mobile scrolls through many device previews. Keep their original flat
      // shells and keys instead of compositing dozens of 3D layers per phone.
      document.querySelectorAll('.device-tilt').forEach(function (device) {
        observer.unobserve(device);
        device.classList.remove('device-tilt', 'is-device-revealed');
        device.querySelectorAll(':scope > .device-tilt__slice').forEach(function (slice) { slice.remove(); });
        device.parentElement.classList.remove('device-tilt-parent');
      });
      document.querySelectorAll('.device-key').forEach(function (button) {
        button.classList.remove('device-key', 'device-key--horizontal');
        button.querySelectorAll(':scope > .device-key__shell, :scope > .device-key__face').forEach(function (part) { part.remove(); });
      });
      return;
    }
    document.querySelectorAll(buttonSelector).forEach(function (button) {
      if (button.classList.contains("device-key")) return;
      button.classList.add("device-key");
      button.setAttribute("aria-hidden", "true");
      // Capsule cross-sections round the exposed edge through its full depth.
      // Tablet power keys run horizontally; phone keys and volume keys vertically.
      button.classList.toggle("device-key--horizontal", button.matches(
        ".ipad-button--power, .voice-scene__ipad-button--power, .feature-ipad__button--power"
      ));
      for (var layer = 0; layer < 12; layer++) {
        var shell = document.createElement("span");
        shell.className = "device-key__shell";
        shell.style.setProperty("--key-layer", layer / 11);
        button.appendChild(shell);
      }
      ["front", "back"].forEach(function (side) {
        var face = document.createElement("span");
        face.className = "device-key__face device-key__face--" + side;
        button.appendChild(face);
      });
    });
    document.querySelectorAll(selector).forEach(function (device) {
      if (device.classList.contains("device-tilt")) return;
      device.style.transition = "none";
      device.classList.add("device-tilt");
      device.parentElement.classList.add("device-tilt-parent");
      for (var i = 1; i <= 24; i++) {
        var slice = document.createElement("span");
        slice.className = "device-tilt__slice";
        slice.setAttribute("aria-hidden", "true");
        slice.style.setProperty("--slice", i);
        device.appendChild(slice);
      }
      // Commit the tilted pose before observing an already-visible hero.
      device.getBoundingClientRect();
      device.style.removeProperty("transition");
      observer.observe(device);
    });
  }
  sync();
  motion.addEventListener("change", sync);
  // Handwriting slides can be rebuilt after the initial page scripts run.
  new MutationObserver(function (records) {
    if (records.some(function (record) {
      return Array.from(record.addedNodes).some(function (node) {
        return node.nodeType === 1 && (node.matches(selector + ", " + buttonSelector) || node.querySelector(selector + ", " + buttonSelector));
      });
    })) sync();
  }).observe(document.body, { childList: true, subtree: true });
})();
