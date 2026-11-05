/**
 * Ad-tracking runtime: the consent banner and the Meta Pixel loader it
 * gates. Injected dynamically (never referenced by a <script> tag in any
 * page) by lune-synth/campaign/site-footer.js, which is the one component
 * every page already loads -- see that file for the fetch against
 * /campaign/tracking-config.json that decides whether this file is ever
 * requested at all.
 *
 * Dormant unless a tracker is configured server-side: with no env vars set,
 * this script is never injected in the first place.
 *
 * No tracking before Accept. navigator.globalPrivacyControl / DNT are
 * treated as an immediate, silent decline -- the signal already answers the
 * question, so no banner is shown.
 *
 * Google/TikTok pixels are not implemented. The `hasAnyTracker`/
 * `activateTrackers` hook points below are where their loaders would plug
 * in once config.google / config.tiktok are populated server-side.
 */
(function (root) {
  "use strict";

  var STORAGE_KEY = "lune_tracking_consent";

  // ---- Pure helpers (no DOM/window access beyond the params they're given;
  // safe to call directly from a Node test without jsdom). -----------------

  function safeGetItem(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSetItem(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  /** Returns 'granted' | 'denied' | null (no stored preference, or unreadable). */
  function readConsent(storage) {
    var raw = safeGetItem(storage, STORAGE_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && (parsed.status === "granted" || parsed.status === "denied")) return parsed.status;
    } catch (error) {
      // fall through
    }
    return null;
  }

  function writeConsent(storage, status) {
    if (status !== "granted" && status !== "denied") return false;
    return safeSetItem(storage, STORAGE_KEY, JSON.stringify({ status: status, ts: Date.now() }));
  }

  /** navigator.globalPrivacyControl, or any flavor of Do Not Track, as a decline signal. */
  function hasPrivacySignal(nav) {
    if (!nav) return false;
    if (nav.globalPrivacyControl === true) return true;
    var dnt = nav.doNotTrack;
    return dnt === "1" || dnt === "yes" || dnt === 1;
  }

  /** Meta's own _fbc cookie format: fb.1.<click_time_ms>.<fbclid>. */
  function formatFbc(fbclid, timestampMs) {
    if (!fbclid) return "";
    return "fb.1." + timestampMs + "." + fbclid;
  }

  function hasAnyTracker(config) {
    return !!(config && (config.meta || config.google || config.tiktok));
  }

  function generateEventId() {
    if (root.crypto && typeof root.crypto.randomUUID === "function") return root.crypto.randomUUID();
    return "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  // ---- Runtime state + DOM-touching behavior (browser only). -------------

  var state = { config: null, consentStatus: null, metaLoaded: false };

  function getConsentStatus() {
    return state.consentStatus;
  }

  function safeStorage() {
    try {
      return root.localStorage;
    } catch (error) {
      return { getItem: function () { return null; }, setItem: function () {} };
    }
  }

  function buildBannerMarkup() {
    return (
      '<div class="lune-consent-banner" data-lune-consent-banner role="region" aria-label="Cookie and tracking preferences">' +
        '<div class="lune-consent-banner__panel">' +
          '<p class="lune-consent-banner__text">We use optional tracking to measure how well our ads work. ' +
          'Nothing loads until you choose Accept. <a href="/privacy/">Privacy Policy</a></p>' +
          '<div class="lune-consent-banner__actions">' +
            '<button type="button" class="lune-consent-banner__decline" data-lune-consent-decline>Decline</button>' +
            '<button type="button" class="lune-consent-banner__accept" data-lune-consent-accept>Accept</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function findBanner() {
    return document.querySelector("[data-lune-consent-banner]");
  }

  function mountBanner() {
    if (findBanner()) return;
    var wrapper = document.createElement("div");
    wrapper.innerHTML = buildBannerMarkup();
    var banner = wrapper.firstElementChild;
    document.body.appendChild(banner);
    banner.querySelector("[data-lune-consent-accept]").addEventListener("click", function () {
      applyConsent("granted");
    });
    banner.querySelector("[data-lune-consent-decline]").addEventListener("click", function () {
      applyConsent("denied");
    });
    root.requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });
  }

  function showBanner() {
    var existing = findBanner();
    if (existing) {
      existing.hidden = false;
      root.requestAnimationFrame(function () {
        existing.classList.add("is-visible");
      });
      return;
    }
    mountBanner();
  }

  function hideBanner() {
    var existing = findBanner();
    if (!existing) return;
    existing.classList.remove("is-visible");
    existing.hidden = true;
  }

  function reopenBanner() {
    showBanner();
  }

  function applyConsent(status) {
    state.consentStatus = status;
    writeConsent(safeStorage(), status);
    hideBanner();
    if (status === "granted") activateTrackers();
  }

  function activateTrackers() {
    if (state.config && state.config.meta && state.config.meta.pixelId && !state.metaLoaded) {
      loadMetaPixel(state.config.meta.pixelId);
    }
    // Hook points for later: config.google / config.tiktok would each get
    // their own loadXPixel() call here, gated the same way. Neither is
    // implemented yet.
  }

  function loadMetaPixel(pixelId) {
    state.metaLoaded = true;
    if (!root.fbq) {
      /* eslint-disable */
      (function (f, b, e, v) {
        if (f.fbq) return;
        var n = (f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        });
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        var t = b.createElement(e);
        t.async = true;
        t.src = v;
        var s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(root, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
    }
    root.fbq("init", pixelId);
    root.fbq("track", "PageView");
    trackViewContent();
  }

  function trackViewContent() {
    if (!root.fbq || state.consentStatus !== "granted" || !state.metaLoaded) return;
    root.fbq("track", "ViewContent", { content_name: root.location ? root.location.pathname : "" });
  }

  function trackLead(eventId) {
    if (!root.fbq || state.consentStatus !== "granted" || !state.metaLoaded) return;
    if (!eventId) return;
    root.fbq("track", "Lead", {}, { eventID: eventId });
  }

  function init(config) {
    state.config = config || {};
    if (!hasAnyTracker(state.config)) return;

    var stored = readConsent(safeStorage());
    if (stored) {
      state.consentStatus = stored;
      if (stored === "granted") activateTrackers();
      return;
    }

    if (hasPrivacySignal(root.navigator)) {
      applyConsent("denied");
      return;
    }

    showBanner();
  }

  var api = {
    readConsent: readConsent,
    writeConsent: writeConsent,
    hasPrivacySignal: hasPrivacySignal,
    formatFbc: formatFbc,
    hasAnyTracker: hasAnyTracker,
    generateEventId: generateEventId,
    getConsentStatus: getConsentStatus,
    trackLead: trackLead,
    trackViewContent: trackViewContent,
    reopenBanner: reopenBanner,
    init: init,
  };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.LuneAdTracking = api;
    if (typeof document !== "undefined") {
      var bootConfig = root.LUNE_TRACKING_CONFIG || null;
      if (bootConfig) init(bootConfig);
    }
  }
})(typeof window !== "undefined" ? window : this);
