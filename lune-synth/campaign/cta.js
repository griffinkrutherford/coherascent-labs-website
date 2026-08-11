(function () {
  "use strict";

  var FALLBACK_CONFIG = {
    mode: "waitlist",
    headline: "Join the beta waitlist",
    offerHtml: "Limited-time offer for the first 100 users: <strong>2 months free</strong> &amp; a <strong>lifetime 50% off</strong> Lune Synth&trade; Pro.",
    emailPlaceholder: "Email address",
    submitLabel: "Join Waitlist",
    loadingLabel: "Joining…",
    successTitle: "You're on the list!",
    successMessage: "Check your inbox — we just emailed you one quick question: is your phone Android or iPhone? If Android, we need the Google account email your Play Store uses. Reply to that email so your invite reaches the right place.",
    appStoreUrl: "",
    playStoreUrl: "",
    appStoreLabel: "Download on the App Store",
    playStoreLabel: "Get it on Google Play"
  };

  var instanceCount = 0;

  function config() {
    return Object.assign({}, FALLBACK_CONFIG, window.LUNE_CTA_CONFIG || {});
  }

  function track(eventName, detail) {
    var payload = Object.assign({ event: eventName }, detail || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent("lune:" + eventName, { detail: payload }));
  }

  function attribution(element) {
    var root = document.documentElement;
    var params = new URLSearchParams(window.location.search);
    return {
      campaign_family: root.dataset.campaignFamily || "unknown",
      campaign_variant: root.dataset.campaignVariant || "unknown",
      campaign_audience: root.dataset.campaignAudience || "unknown",
      cta_placement: element.dataset.placement || "unknown",
      landing_path: window.location.pathname,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      fbclid: params.get("fbclid") || ""
    };
  }

  function storeLinksMarkup(settings) {
    var links = [];
    if (settings.appStoreUrl) {
      links.push('<a class="lune-cta__store" href="' + settings.appStoreUrl + '" rel="noopener">' + settings.appStoreLabel + "</a>");
    }
    if (settings.playStoreUrl) {
      links.push('<a class="lune-cta__store" href="' + settings.playStoreUrl + '" rel="noopener">' + settings.playStoreLabel + "</a>");
    }
    return links.length ? '<div class="lune-cta__stores">' + links.join("") + "</div>" : "";
  }

  function formMarkup(settings, id) {
    return [
      '<form class="lune-cta__form" data-cta-form novalidate>',
      '<label class="sr-only" for="' + id + '-email">Email address</label>',
      '<input id="' + id + '-email" type="email" name="email" autocomplete="email" inputmode="email" placeholder="' + settings.emailPlaceholder + '" required />',
      '<button type="submit">' + settings.submitLabel + "</button>",
      '<p class="lune-cta__status" data-cta-status aria-live="polite"></p>',
      "</form>"
    ].join("");
  }

  function popupMarkup(settings, id) {
    return [
      '<div class="lune-cta__popup" data-cta-popup role="dialog" aria-modal="true" aria-labelledby="' + id + '-popup-title" hidden>',
      '<div class="lune-cta__popup-panel">',
      '<button class="lune-cta__popup-close" type="button" data-cta-close aria-label="Close message">&times;</button>',
      '<h3 id="' + id + '-popup-title">' + settings.successTitle + "</h3>",
      '<p data-cta-message>' + settings.successMessage + "</p>",
      '<button class="lune-cta__popup-action" type="button" data-cta-close>Got it</button>',
      "</div>",
      "</div>"
    ].join("");
  }

  class LuneSynthCta extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      instanceCount += 1;

      var settings = config();
      var id = "lune-cta-" + instanceCount;
      var mode = settings.mode;
      var showForm = mode === "waitlist" || mode === "hybrid" || (mode === "stores" && !settings.appStoreUrl && !settings.playStoreUrl);
      var showStores = mode === "stores" || mode === "hybrid";
      var clarifier = this.dataset.clarifier || "";

      this.classList.add("lune-cta");
      this.innerHTML = [
        '<div class="lune-cta__copy">',
        '<h2 class="lune-cta__headline">' + settings.headline + "</h2>",
        '<p class="lune-cta__offer">' + settings.offerHtml + "</p>",
        clarifier ? '<p class="lune-cta__clarifier">' + clarifier + "</p>" : "",
        "</div>",
        showForm ? formMarkup(settings, id) : "",
        showStores ? storeLinksMarkup(settings) : "",
        popupMarkup(settings, id)
      ].join("");

      var form = this.querySelector("[data-cta-form]");
      if (form) this.bindForm(form, settings);
      this.bindPopup();
    }

    bindForm(form, settings) {
      var details = attribution(this);
      var input = form.querySelector('input[type="email"]');
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector("[data-cta-status]");
      var started = false;

      input.addEventListener("focus", function () {
        if (started) return;
        started = true;
        track("waitlist_form_start", details);
      });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        var email = input.value.trim();
        status.textContent = "";

        if (!email || !input.validity.valid) {
          status.textContent = "Enter a valid email address.";
          input.focus();
          return;
        }

        var originalLabel = button.textContent;
        button.disabled = true;
        input.disabled = true;
        button.textContent = settings.loadingLabel;
        track("waitlist_submit", details);

        try {
          var response = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign({ email: email }, details))
          });
          var data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to join the waitlist.");

          form.reset();
          this.openPopup(data.message || settings.successMessage);
          track("waitlist_success", details);
        } catch (error) {
          status.textContent = error.message || "Something went wrong. Please try again.";
          track("waitlist_error", Object.assign({ error_message: status.textContent }, details));
        } finally {
          button.disabled = false;
          input.disabled = false;
          button.textContent = originalLabel;
        }
      });
    }

    bindPopup() {
      var popup = this.querySelector("[data-cta-popup]");
      if (!popup) return;
      popup.querySelectorAll("[data-cta-close]").forEach((button) => {
        button.addEventListener("click", () => this.closePopup());
      });
      popup.addEventListener("click", (event) => {
        if (event.target === popup) this.closePopup();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !popup.hidden) this.closePopup();
      });
    }

    openPopup(message) {
      var popup = this.querySelector("[data-cta-popup]");
      if (!popup) return;
      var messageElement = popup.querySelector("[data-cta-message]");
      if (messageElement) messageElement.textContent = message;
      this.lastFocusedElement = document.activeElement;
      popup.hidden = false;
      document.body.classList.add("has-modal");
      popup.querySelector("[data-cta-close]").focus();
    }

    closePopup() {
      var popup = this.querySelector("[data-cta-popup]");
      if (!popup) return;
      popup.hidden = true;
      document.body.classList.remove("has-modal");
      if (this.lastFocusedElement && this.lastFocusedElement.focus) this.lastFocusedElement.focus();
    }
  }

  if (!customElements.get("lune-synth-cta")) {
    customElements.define("lune-synth-cta", LuneSynthCta);
  }
})();
