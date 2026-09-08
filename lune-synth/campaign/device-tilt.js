(function () {
  "use strict";
  var motion = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  if (!("IntersectionObserver" in window) || !CSS.supports("rotate", "0 1 0 34deg")) return;
  var selector = ".phone-mock__frame, .feature-phone, .feature-ipad, .response-carousel__question-phone";
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-device-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function sync() {
    document.querySelectorAll(selector).forEach(function (device) {
      if (!motion.matches || device.classList.contains("device-tilt")) return;
      device.style.transition = "none";
      device.classList.add("device-tilt");
      device.parentElement.classList.add("device-tilt-parent");
      for (var i = 1; i <= 16; i++) {
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
        return node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector));
      });
    })) sync();
  }).observe(document.body, { childList: true, subtree: true });
})();
