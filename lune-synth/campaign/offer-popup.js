(function () {
  "use strict";

  var DISMISSED_KEY = "luneSynth.betaOfferPopup.dismissed.v1";
  var JOINED_KEY = "luneSynth.waitlistJoined.v1";
  var SHOW_DELAY_MS = 6500;
  var popup;
  var lastFocusedElement;
  var showTimer;

  function readStored(key) {
    try { return window.localStorage.getItem(key) === "true"; }
    catch (error) { return false; }
  }

  function store(key) {
    try { window.localStorage.setItem(key, "true"); }
    catch (error) { /* Storage can be unavailable in privacy modes. */ }
  }

  function shouldSuppress() {
    return readStored(DISMISSED_KEY) || readStored(JOINED_KEY);
  }

  function markup() {
    return [
      '<div class="beta-offer-popup" data-beta-offer-popup role="dialog" aria-modal="true" aria-labelledby="beta-offer-title" hidden>',
      '  <div class="beta-offer-popup__panel">',
      '    <button class="beta-offer-popup__close" type="button" data-beta-offer-dismiss aria-label="Dismiss limited-time beta offer">&times;</button>',
      '    <div data-beta-offer-content>',
      '      <p class="beta-offer-popup__eyebrow">First 100 users only</p>',
      '      <h2 id="beta-offer-title">Get in early. Keep the savings.</h2>',
      '      <p class="beta-offer-popup__lede">The first 100 users get <strong>2 months free</strong> and a <strong>lifetime 50% off</strong> Lune Synth&trade; Pro.</p>',
      '      <form class="beta-offer-popup__form" data-beta-offer-form novalidate>',
      '        <label class="sr-only" for="beta-offer-email">Email address</label>',
      '        <input id="beta-offer-email" type="email" name="email" autocomplete="email" inputmode="email" placeholder="Email address" aria-label="Email address" required>',
      '        <button type="submit">Join Waitlist</button>',
      '      </form>',
      '      <p class="beta-offer-popup__status" data-beta-offer-status aria-live="polite"></p>',
      '      <p class="beta-offer-popup__terms">Waitlist signup does not guarantee the offer. Beta invitation, activation, and <a href="/terms/">terms</a> apply.</p>',
      '      <button class="beta-offer-popup__decline" type="button" data-beta-offer-dismiss>Not now</button>',
      '    </div>',
      '    <div class="beta-offer-popup__success" data-beta-offer-success hidden>',
      '      <p class="beta-offer-popup__eyebrow">You&rsquo;re on the list</p>',
      '      <h2>Check your inbox.</h2>',
      '      <p>We just emailed you one quick question: is your phone Android or iPhone? If Android, we need the Google account email your Play Store uses &mdash; otherwise your invite never reaches you. Just reply to that email.</p>',
      '      <button class="beta-offer-popup__done" type="button" data-beta-offer-dismiss>Done</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");
  }

  function closePopup() {
    if (!popup || popup.hidden) return;
    store(DISMISSED_KEY);
    popup.hidden = true;
    document.body.classList.remove("has-beta-offer-popup");
    if (lastFocusedElement && lastFocusedElement.focus) lastFocusedElement.focus();
  }

  function openPopup() {
    if (!popup || shouldSuppress()) return;
    var visibleDialog = document.querySelector('[role="dialog"]:not([hidden])');
    if (visibleDialog) {
      showTimer = window.setTimeout(openPopup, 2000);
      return;
    }
    lastFocusedElement = document.activeElement;
    popup.hidden = false;
    document.body.classList.add("has-beta-offer-popup");
    var input = popup.querySelector('input[type="email"]');
    if (input) input.focus();
  }

  function markJoined() {
    store(JOINED_KEY);
    store(DISMISSED_KEY);
    window.clearTimeout(showTimer);
    if (popup && !popup.hidden) closePopup();
  }

  function bindForm() {
    var form = popup.querySelector("[data-beta-offer-form]");
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var status = popup.querySelector("[data-beta-offer-status]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = input.value.trim();
      status.textContent = "";
      if (!email || !input.validity.valid) {
        status.textContent = "Enter a valid email address.";
        input.focus();
        return;
      }

      var originalLabel = button.textContent;
      input.disabled = true;
      button.disabled = true;
      button.textContent = "Joining…";

      fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          cta_placement: "limited_offer_popup",
          landing_path: window.location.pathname
        })
      })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.success) throw new Error(data.error || "Unable to join the waitlist.");
          store(JOINED_KEY);
          store(DISMISSED_KEY);
          popup.querySelector("[data-beta-offer-content]").hidden = true;
          popup.querySelector("[data-beta-offer-success]").hidden = false;
          popup.querySelector("[data-beta-offer-dismiss]").focus();
        });
      })
      .catch(function (error) {
        status.textContent = error.message || "Something went wrong. Please try again.";
      })
      .finally(function () {
        input.disabled = false;
        button.disabled = false;
        button.textContent = originalLabel;
      });
    });
  }

  function init() {
    if (shouldSuppress() || document.querySelector("[data-beta-offer-popup]")) return;
    document.body.insertAdjacentHTML("beforeend", markup());
    popup = document.querySelector("[data-beta-offer-popup]");
    popup.querySelectorAll("[data-beta-offer-dismiss]").forEach(function (control) {
      control.addEventListener("click", closePopup);
    });
    popup.addEventListener("click", function (event) {
      if (event.target === popup) closePopup();
    });
    popup.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePopup();
      if (event.key !== "Tab") return;
      var controls = Array.prototype.slice.call(popup.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')).filter(function (element) {
        return !element.closest("[hidden]");
      });
      if (!controls.length) return;
      var first = controls[0];
      var last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    bindForm();
    showTimer = window.setTimeout(openPopup, SHOW_DELAY_MS);
  }

  window.addEventListener("lune:waitlist_success", markJoined);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
