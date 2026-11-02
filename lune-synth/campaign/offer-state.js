/*
 * Single source of truth for the waitlist offer shown across lunesynth.com.
 *
 * Founding 40: the original beta offer (2 months free, then 50% off Pro for
 * life) went to the first 40 waitlist signups and is fully claimed. It is
 * never advertised as available again. Terms §6.1 governs it.
 *
 * First Light: the founding-cohort offer for the next signups -- priority
 * beta access and 50% off the first 3 months of Pro once Pro launches. Terms
 * §6.2 governs it; the window is whatever this file states. It is dormant
 * while FIRST_LIGHT_ENDS_AT is "".
 *
 * OPEN (2026-11-02, owner request): the window runs from FIRST_LIGHT_STARTS_AT
 * to Friday 2026-11-06 11:59 PM Mountain Standard Time (UTC-7), stored as the
 * absolute UTC instant below so no viewer's timezone can move it. At that
 * instant every page switches itself to the closed copy -- no redeploy.
 *
 * This clock is display only. Eligibility is decided on the server: every
 * Resend contact carries its server-side creation time, so the First Light
 * cohort is the contacts created inside [FIRST_LIGHT_STARTS_AT,
 * FIRST_LIGHT_ENDS_AT] (see offer-eligibility.js). A visitor's device clock
 * never decides who qualifies.
 */
(function () {
  "use strict";

  var FIRST_LIGHT_ENDS_AT = "2026-11-07T06:59:00Z"; // Fri Nov 6, 11:59 PM MST
  // Start of Mon Nov 2 in Mountain time; signups recorded from here count.
  // "" falls back to the original 48-hour window before FIRST_LIGHT_ENDS_AT.
  var FIRST_LIGHT_STARTS_AT = "2026-11-02T07:00:00Z";
  var CLOSE_ZONE = "America/Denver";
  var CLOSE_ZONE_LABEL = "MT";

  var DEFAULT_OFFER = "<strong>Free to join.</strong> First in line for beta invites and Pro launch offers.";
  var UNITS = [["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];

  // Pro Monthly's approved launch price and its First Light discount (Terms
  // §6.2: 50% off the first 3 paid months). Rounded down to the cent so the
  // displayed price never implies a fraction of a cent. The annual plan has
  // no First Light treatment yet -- Terms §6.2 does not set one, so no sale
  // price is invented for it here; the pricing markup leaves it untouched.
  var PRO_MONTHLY_PRICE = 12.99;
  var FIRST_LIGHT_MONTHLY_PRICE = Math.floor(PRO_MONTHLY_PRICE * 100 * 0.5) / 100;

  // Pure, DOM-free clock. Every function takes `now` (ms) so tests can inject
  // time; the browser code below only ever passes Date.now().
  function createOfferClock(endsAt, options) {
    var opts = options || {};
    var endMs = Date.parse(endsAt);
    var hasWindow = endsAt !== "" && endsAt != null && Number.isFinite(endMs);
    var closeZone = opts.closeZone || CLOSE_ZONE;

    function phase(now) {
      if (!hasWindow) return "founding-claimed";
      return (now == null ? Date.now() : now) < endMs ? "first-light-open" : "first-light-closed";
    }

    function remainingParts(now) {
      var total = hasWindow ? Math.max(0, Math.floor((endMs - now) / 1000)) : 0;
      return UNITS.map(function (unit, index) {
        var value = index === 0 ? Math.floor(total / unit[1]) : Math.floor((total % UNITS[index - 1][1]) / unit[1]);
        return { key: unit[0], value: value };
      });
    }

    function displayValue(part) {
      var text = String(part.value);
      return part.key === "days" || text.length > 1 ? text : "0" + text;
    }

    // Changes once a minute, so the polite live region speaks at most once a
    // minute even though the visible digits tick every second.
    function announcement(now) {
      if (phase(now) !== "first-light-open") return "The First Light offer has closed.";
      var p = remainingParts(now);
      function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }
      return plural(p[0].value, "day") + ", " + plural(p[1].value, "hour") + ", " +
        plural(p[2].value, "minute") + " left in the First Light offer";
    }

    function formatEnd(zone) {
      try {
        return new Intl.DateTimeFormat("en-US", {
          weekday: "short", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit", timeZone: zone
        }).format(new Date(endMs));
      } catch (error) {
        return new Date(endMs).toUTCString();
      }
    }

    function endLabel(viewerZone) {
      if (!hasWindow) return "";
      var mountain = formatEnd(closeZone) + " " + CLOSE_ZONE_LABEL;
      if (!viewerZone || viewerZone === closeZone) return mountain;
      return mountain + " (" + formatEnd(viewerZone) + " your time)";
    }

    function offerHtml(now, viewerZone) {
      if (phase(now) === "first-light-open") {
        return "<strong class=\"cta-accent cta-accent--blue blue-glow\">First Light founding offer.</strong> " +
          "Join by " + endLabel(viewerZone) + " for priority beta access &amp; " +
          "<strong class=\"cta-accent cta-accent--red red-glow\">50% off your first 3 months</strong> of Lune Synth&trade; Pro.";
      }
      // Before First Light opens and after it closes: the standing waitlist
      // offer. The Founding 40 are mentioned only in the footnote.
      return DEFAULT_OFFER;
    }

    function footnoteText(now) {
      if (phase(now) === "first-light-open") {
        return "*First Light discount applies once you are invited to the beta, activate the app, and Lune Synth Pro launches. Signing up is free and charges nothing. Founding 40 members keep their original offer. See Terms §6.";
      }
      return "*Joining the waitlist is free and charges nothing. Founding 40 members keep their original offer under Terms §6.";
    }

    // Pricing-display state for the Pro Monthly card/plan. Pure and
    // time-injectable like the rest of this clock -- the DOM code below (and
    // any page's pricing markup) decides what to render, this just says
    // whether the First Light price should show and what it is. Annual is
    // intentionally absent: Terms §6.2 sets no annual discount, so nothing
    // here invents one.
    function proMonthlyPricing(now) {
      var open = phase(now) === "first-light-open";
      return {
        open: open,
        normalPrice: PRO_MONTHLY_PRICE,
        offerPrice: FIRST_LIGHT_MONTHLY_PRICE,
        normalText: PRO_MONTHLY_PRICE.toFixed(2),
        offerText: FIRST_LIGHT_MONTHLY_PRICE.toFixed(2),
        displayText: (open ? FIRST_LIGHT_MONTHLY_PRICE : PRO_MONTHLY_PRICE).toFixed(2),
        wasLabel: "was $" + PRO_MONTHLY_PRICE.toFixed(2),
        badgeLabel: "First Light"
      };
    }

    return {
      hasWindow: hasWindow,
      endMs: endMs,
      phase: phase,
      remainingParts: remainingParts,
      displayValue: displayValue,
      announcement: announcement,
      endLabel: endLabel,
      offerHtml: offerHtml,
      footnoteText: footnoteText,
      proMonthlyPricing: proMonthlyPricing
    };
  }

  // Server-side code (api/access-email.js, scripts/*) needs these same values
  // to decide who gets First Light wording -- they must never be redeclared
  // elsewhere, or the copies will drift. When this file is require()'d from
  // Node (module exists there, never in a browser <script> tag) we hand back
  // the constants and the pure clock and stop before anything below, which
  // all assumes a DOM that Node does not have.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      FIRST_LIGHT_ENDS_AT: FIRST_LIGHT_ENDS_AT,
      FIRST_LIGHT_STARTS_AT: FIRST_LIGHT_STARTS_AT,
      DEFAULT_OFFER: DEFAULT_OFFER,
      PRO_MONTHLY_PRICE: PRO_MONTHLY_PRICE,
      FIRST_LIGHT_MONTHLY_PRICE: FIRST_LIGHT_MONTHLY_PRICE,
      createOfferClock: createOfferClock
    };
    return;
  }

  var clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  var viewerZone;
  try { viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (error) { viewerZone = ""; }

  function phase(now) { return clock.phase(now); }
  function endLabel() { return clock.endLabel(viewerZone); }
  function offerHtml(now) { return clock.offerHtml(now, viewerZone); }
  function footnoteText(now) { return clock.footnoteText(now); }
  function proMonthlyPricing(now) { return clock.proMonthlyPricing(now); }

  // Countdown ------------------------------------------------------------

  var STYLE_ID = "lune-offer-countdown-style";
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".lune-offer-countdown{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin:.75rem auto 0;font-variant-numeric:tabular-nums}",
      ".lune-offer-countdown__unit{display:flex;flex-direction:column;align-items:center;min-width:3.6rem;padding:.5rem .55rem;border-radius:14px;background:rgba(100,168,255,.08);border:1px solid rgba(164,123,255,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}",
      ".lune-offer-countdown__value{display:block;font-size:1.4rem;font-weight:800;line-height:1.1;color:var(--text,#edf5ff)}",
      ".lune-offer-countdown__label{margin-top:.15rem;font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#a6bad7)}",
      "html[data-theme=\"light\"] .lune-offer-countdown__unit{background:rgba(255,255,255,.72);border-color:rgba(127,99,214,.22);box-shadow:0 6px 16px rgba(151,164,192,.14)}",
      ".lune-offer-countdown__value.is-ticking{animation:luneOfferTick .45s ease-out}",
      "@keyframes luneOfferTick{0%{opacity:.35;transform:translateY(-4px)}100%{opacity:1;transform:none}}",
      "@media (prefers-reduced-motion: reduce){.lune-offer-countdown__value.is-ticking{animation:none}}",
      "@media (max-width:420px){.lune-offer-countdown{gap:.4rem}.lune-offer-countdown__unit{min-width:3.1rem;padding:.42rem .4rem}.lune-offer-countdown__value{font-size:1.2rem}}",
      ".lune-offer-countdown__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}"
    ].join("");
    document.head.appendChild(style);
  }

  var countdowns = [];
  var timer = null;

  function buildCountdown() {
    var root = document.createElement("div");
    root.className = "lune-offer-countdown";
    root.setAttribute("role", "timer");
    root.setAttribute("aria-label", "First Light closes " + endLabel());
    UNITS.forEach(function (unit) {
      var cell = document.createElement("span");
      cell.className = "lune-offer-countdown__unit";
      cell.setAttribute("aria-hidden", "true");
      cell.innerHTML = '<span class="lune-offer-countdown__value" data-unit="' + unit[0] + '">--</span>' +
        '<span class="lune-offer-countdown__label">' + unit[0] + "</span>";
      root.appendChild(cell);
    });
    // role=timer is not live by default; only this minute-granular text is
    // announced, so screen readers hear at most one update a minute.
    var live = document.createElement("span");
    live.className = "lune-offer-countdown__sr";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    root.appendChild(live);
    return root;
  }

  function renderAll() {
    var now = Date.now();
    if (phase(now) !== "first-light-open") {
      // The window just ended: swap every offer line to the closed copy.
      stopTimer();
      applyEverywhere();
      return;
    }
    var parts = clock.remainingParts(now);
    var spoken = clock.announcement(now);
    countdowns.forEach(function (root) {
      parts.forEach(function (part) {
        var node = root.querySelector('[data-unit="' + part.key + '"]');
        var text = clock.displayValue(part);
        if (node && node.textContent !== text) {
          node.textContent = text;
          node.classList.remove("is-ticking");
          void node.offsetWidth;
          node.classList.add("is-ticking");
        }
      });
      var live = root.querySelector(".lune-offer-countdown__sr");
      if (live && live.textContent !== spoken) live.textContent = spoken;
    });
  }

  function stopTimer() {
    if (timer) window.clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    stopTimer();
    if (phase() !== "first-light-open") return;
    // Recompute from end - now every tick (no drifting counter), aligned to
    // the next whole second.
    timer = window.setTimeout(function () { renderAll(); schedule(); }, 1000 - (Date.now() % 1000) + 5);
  }

  function attachCountdown(container) {
    if (phase() !== "first-light-open" || !container || container.querySelector(".lune-offer-countdown")) return;
    injectStyle();
    var root = buildCountdown();
    var slot = container.querySelector("[data-offer-countdown-slot]");
    (slot || container).appendChild(root);
    countdowns.push(root);
    renderAll();
    schedule();
  }

  // Apply to the page ----------------------------------------------------

  function applyOfferLine(line) {
    var link = line.querySelector("a");
    var target = link || line;
    var sup = target.querySelector("sup");
    target.innerHTML = offerHtml() + (sup ? "<sup>*</sup>" : "");
    if (phase() === "first-light-open") attachCountdown(line.parentNode || line);
  }

  // Pricing-area banner: visible in the static HTML (with its no-JS deadline
  // line) and kept only while the window is open.
  function applyBanner(banner) {
    var open = phase() === "first-light-open";
    banner.hidden = !open;
    var deadline = banner.querySelector("[data-offer-deadline]");
    if (deadline && open) deadline.textContent = "Ends " + endLabel();
    if (open) attachCountdown(banner);
  }

  // Pro Monthly price card/plan: static markup is always the normal price
  // (the no-JS fallback), so there is never a struck price left on screen
  // without JS. While First Light is open this crosses out the normal price
  // and shows the discounted one, with a "First Light" badge; outside the
  // window (including the instant it closes on an open tab) it reverts --
  // no made-up state survives past `pricing.open`. Annual is never touched
  // here; Terms §6.2 sets no annual discount.
  function applyProPrice(card) {
    var pricing = proMonthlyPricing();
    var was = card.querySelector("[data-first-light-was]");
    var amount = card.querySelector("[data-pricing-amount]");
    var badge = card.querySelector("[data-first-light-badge]");
    var note = card.querySelector("[data-first-light-note]");
    if (was) was.hidden = !pricing.open;
    if (amount) {
      amount.textContent = "$" + pricing.displayText;
      amount.setAttribute("data-pricing-amount", pricing.displayText);
    }
    if (badge) badge.hidden = !pricing.open;
    if (note) {
      var normalNote = note.getAttribute("data-note-normal");
      var offerNote = note.getAttribute("data-note-offer");
      if (normalNote && offerNote) note.textContent = pricing.open ? offerNote : normalNote;
    }
  }

  function applyAnnualNote(note) {
    note.hidden = phase() !== "first-light-open";
  }

  function applyEverywhere() {
    if (phase() !== "first-light-open") {
      // Outside the window nothing may keep advertising First Light: drop every
      // countdown (including the popup's) and the First Light popup itself.
      stopTimer();
      document.querySelectorAll(".lune-offer-countdown").forEach(function (node) { node.remove(); });
      countdowns = [];
      var popup = document.querySelector("div[data-beta-offer-popup]");
      if (popup) {
        popup.remove();
        document.body.classList.remove("has-beta-offer-popup");
      }
    }
    document.querySelectorAll(".waitlist-offer, .lune-cta__offer").forEach(applyOfferLine);
    document.querySelectorAll("[data-first-light-banner]").forEach(applyBanner);
    document.querySelectorAll("#waitlist-offer-note, .waitlist-offer-note small").forEach(function (note) {
      note.textContent = footnoteText();
    });
    document.querySelectorAll("[data-first-light-pro-price]").forEach(applyProPrice);
    document.querySelectorAll("[data-first-light-annual-note]").forEach(applyAnnualNote);
  }

  window.LuneOffer = Object.freeze({
    phase: phase,
    offerHtml: offerHtml,
    footnoteText: footnoteText,
    proMonthlyPricing: proMonthlyPricing,
    endLabel: function () { return clock.hasWindow ? endLabel() : ""; },
    attachCountdown: attachCountdown,
    apply: applyEverywhere
  });

  function init() {
    applyEverywhere();
    // A tab left open across the deadline, or one restored from sleep, must
    // not keep advertising a closed window.
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") return;
      applyEverywhere();
      if (phase() === "first-light-open") { renderAll(); schedule(); }
    });
  }

  // Loaded first and deferred, so the CTA, popup and footer scripts that follow
  // have not rendered yet. DOMContentLoaded fires only after every deferred
  // script has run, so their markup exists by then.
  if (document.readyState === "complete") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
