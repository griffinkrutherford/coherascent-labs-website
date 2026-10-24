/* The App Store / Google Play hero badges are not live links yet. Intercept
   taps/clicks/Enter/Space on them and show a "coming soon" popover instead
   of doing nothing silently, using the shared LuneModal shell. */
(function () {
  "use strict";
  if (!window.LuneModal) return;

  function waitlistLine() {
    return document.getElementById("waitlist")
      ? '<p><a href="#waitlist" data-coming-soon-waitlist>Join the beta waitlist</a> to hear the moment it launches.</p>'
      : "";
  }

  function buildModal(storeLabel) {
    return window.LuneModal.create({
      className: "lune-modal--coming-soon",
      closeLabel: "Close",
      titleText: "Coming soon to the " + storeLabel,
      bodyHtml:
        "<p>Lune Synth isn&rsquo;t available on the " + storeLabel + " yet &mdash; we&rsquo;re still finishing testing before launch.</p>" +
        waitlistLine() +
        '<button type="button" class="lune-modal__ok" data-autofocus data-modal-close>Got it</button>'
    });
  }

  var modals = {};

  function openModal(key, label) {
    if (!modals[key]) modals[key] = buildModal(label);
    modals[key].open();
  }

  function wire(el, key, label) {
    if (!el || el.dataset.comingSoonWired === "true") return;
    el.dataset.comingSoonWired = "true";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("click", function () {
      openModal(key, label);
    });
    el.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal(key, label);
    });
  }

  document.querySelectorAll(".store-badge-btn").forEach(function (el) {
    var label = el.getAttribute("aria-label") || "";
    var isApple = /apple|app store/i.test(label);
    wire(el, isApple ? "apple" : "google", isApple ? "App Store" : "Google Play");
  });

  // The waitlist link lives inside the popover; close it before jumping so
  // the destination isn't hidden behind the (overflow: hidden) overlay.
  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-coming-soon-waitlist]");
    if (!link) return;
    event.preventDefault();
    var target = document.getElementById("waitlist");
    Object.keys(modals).forEach(function (key) {
      modals[key].close();
    });
    if (!target) return;
    window.setTimeout(function () {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      var focusTarget = target.querySelector("input, button, [tabindex]");
      if (focusTarget && focusTarget.focus) focusTarget.focus({ preventScroll: true });
    }, 50);
  });
})();
