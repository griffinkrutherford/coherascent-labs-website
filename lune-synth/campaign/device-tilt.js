(function () {
  "use strict";
  var motion = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  if (!("IntersectionObserver" in window) || !CSS.supports("rotate", "0 1 0 34deg")) return;
  var isCampaign = !!document.querySelector(".campaign-main");
  var selector = ".phone-mock__frame, .feature-phone, .feature-ipad, .response-carousel__question-phone";
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-device-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function sync() {
    document.querySelectorAll(".ipad-button--volume, .voice-scene__ipad-button--volume, .feature-ipad__button--volume").forEach(function (button) {
      if (button.classList.contains("tablet-volume-key")) return;
      button.classList.add("tablet-volume-key");
      // Capsule cross-sections extruded out from the tablet's side rail.
      for (var j = 0; j <= 8; j++) {
        var face = document.createElement("span");
        face.className = "tablet-volume-key__slice";
        face.setAttribute("aria-hidden", "true");
        face.style.setProperty("--key-slice", j);
        button.appendChild(face);
      }
    });
    document.querySelectorAll(selector).forEach(function (device) {
      if ((!isCampaign && !motion.matches) || device.classList.contains("device-tilt")) return;
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
        return node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector));
      });
    })) sync();
  }).observe(document.body, { childList: true, subtree: true });
})();
