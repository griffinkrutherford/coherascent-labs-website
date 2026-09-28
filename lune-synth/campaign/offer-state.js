/*
 * Single source of truth for the waitlist offer shown across lunesynth.com.
 *
 * Founding 40: the original beta offer (2 months free, then 50% off Pro for
 * life) went to the first 40 waitlist signups and is fully claimed. It is
 * never advertised as available again. Terms §6 governs it.
 *
 * First Light: a 48-hour window for the next cohort -- priority beta access
 * and 50% off the first 3 months of Pro once Pro launches. It is dormant until
 * FIRST_LIGHT_ENDS_AT is set.
 *
 * TO OPEN FIRST LIGHT: when the first post goes live, set FIRST_LIGHT_ENDS_AT
 * to the UTC end time (first post + 48h), e.g. "2026-10-01T05:59:00Z" for
 * Wed Sep 30 11:59 pm MT, and deploy. Nothing else needs to change.
 *
 * This clock is display only. Eligibility is decided on the server: every
 * Resend contact carries its server-side creation time, so the First Light
 * cohort is the contacts created before this end time and after the window
 * opened. A visitor's device clock never decides who qualifies.
 */
(function () {
  "use strict";

  var FIRST_LIGHT_ENDS_AT = "";
  var CLOSE_ZONE = "America/Denver";
  var CLOSE_ZONE_LABEL = "MT";

  // Server-side code (api/access-email.js, scripts/*) needs this same value to
  // decide who gets First Light wording -- it must never be redeclared
  // elsewhere, or the two copies will drift. When this file is require()'d
  // from Node (module exists there, never in a browser <script> tag) we hand
  // back the constant and stop before anything below, which all assumes a
  // DOM that Node does not have.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { FIRST_LIGHT_ENDS_AT: FIRST_LIGHT_ENDS_AT };
    return;
  }

  var endMs = Date.parse(FIRST_LIGHT_ENDS_AT);
  var hasWindow = FIRST_LIGHT_ENDS_AT !== "" && Number.isFinite(endMs);

  function phase(now) {
    if (!hasWindow) return "founding-claimed";
    return (now == null ? Date.now() : now) < endMs ? "first-light-open" : "first-light-closed";
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

  function endLabel() {
    var local = formatEnd(undefined);
    var mountain = formatEnd(CLOSE_ZONE) + " " + CLOSE_ZONE_LABEL;
    var localZone;
    try { localZone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (error) { localZone = ""; }
    return localZone === CLOSE_ZONE ? mountain : mountain + " (" + local + " your time)";
  }

  var FOUNDING_CLAIMED = "<strong>Founding 40:</strong> all 40 spots claimed. Join for early beta access.";

  function offerHtml(now) {
    var current = phase(now);
    if (current === "first-light-open") {
      return "<strong class=\"cta-accent cta-accent--blue\">First Light: 48 hours only.</strong> " +
        "Join by " + endLabel() + " for priority beta access &amp; " +
        "<strong class=\"cta-accent cta-accent--red\">50% off your first 3 months</strong> of Lune Synth&trade; Pro. " +
        "Founding 40: all spots claimed.";
    }
    if (current === "first-light-closed") {
      return "Founding 40 and First Light are closed. Join for beta updates.";
    }
    return FOUNDING_CLAIMED;
  }

  function footnoteText(now) {
    if (phase(now) === "first-light-open") {
      return "*First Light discount applies once you are invited to the beta, activate the app, and Lune Synth Pro launches. Signing up is free and charges nothing. Founding members keep their original offer. See Terms §6.";
    }
    return "*Founding 40 members keep their original offer under Terms §6. Joining the waitlist is free.";
  }

  // Countdown ------------------------------------------------------------

  var STYLE_ID = "lune-offer-countdown-style";
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".lune-offer-countdown{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin:.75rem auto 0;font-variant-numeric:tabular-nums}",
      ".lune-offer-countdown__unit{display:flex;flex-direction:column;align-items:center;min-width:3.4rem;padding:.45rem .5rem;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14)}",
      ".lune-offer-countdown__value{display:block;font-size:1.35rem;font-weight:700;line-height:1.1}",
      ".lune-offer-countdown__label{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;opacity:.72}",
      ".lune-offer-countdown__value.is-ticking{animation:luneOfferTick .45s ease-out}",
      "@keyframes luneOfferTick{0%{opacity:.35;transform:translateY(-4px)}100%{opacity:1;transform:none}}",
      "@media (prefers-reduced-motion: reduce){.lune-offer-countdown__value.is-ticking{animation:none}}",
      ".lune-offer-countdown__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}"
    ].join("");
    document.head.appendChild(style);
  }

  var UNITS = [["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];
  var countdowns = [];
  var timer = null;
  var lastAnnouncedMinute = null;

  function remainingParts(now) {
    var total = Math.max(0, Math.floor((endMs - now) / 1000));
    return UNITS.map(function (unit, index) {
      var value = index === 0 ? Math.floor(total / unit[1]) : Math.floor((total % UNITS[index - 1][1]) / unit[1]);
      return { key: unit[0], value: value };
    });
  }

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
    var live = document.createElement("span");
    live.className = "lune-offer-countdown__sr";
    live.setAttribute("aria-live", "polite");
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
    var parts = remainingParts(now);
    var minuteKey = parts[0].value + ":" + parts[1].value + ":" + parts[2].value;
    countdowns.forEach(function (root) {
      parts.forEach(function (part) {
        var node = root.querySelector('[data-unit="' + part.key + '"]');
        var text = part.key === "days" ? String(part.value) : String(part.value).padStart(2, "0");
        if (node && node.textContent !== text) {
          node.textContent = text;
          node.classList.remove("is-ticking");
          void node.offsetWidth;
          node.classList.add("is-ticking");
        }
      });
      if (minuteKey !== lastAnnouncedMinute) {
        var live = root.querySelector(".lune-offer-countdown__sr");
        if (live) live.textContent = parts[0].value + " days, " + parts[1].value + " hours, " + parts[2].value + " minutes left";
      }
    });
    lastAnnouncedMinute = minuteKey;
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
    container.appendChild(root);
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
    var old = line.parentNode && line.parentNode.querySelector(".lune-offer-countdown");
    if (old && phase() !== "first-light-open") {
      old.remove();
      countdowns = countdowns.filter(function (root) { return root !== old; });
    }
    if (phase() === "first-light-open") attachCountdown(line.parentNode || line);
  }

  function applyEverywhere() {
    if (phase() !== "first-light-open") {
      // Outside the window nothing may keep advertising First Light: drop every
      // countdown (including the popup's) and the First Light popup itself.
      document.querySelectorAll(".lune-offer-countdown").forEach(function (node) { node.remove(); });
      countdowns = [];
      var popup = document.querySelector("div[data-beta-offer-popup]");
      if (popup) {
        popup.remove();
        document.body.classList.remove("has-beta-offer-popup");
      }
    }
    document.querySelectorAll(".waitlist-offer, .lune-cta__offer").forEach(applyOfferLine);
    document.querySelectorAll("#waitlist-offer-note, .waitlist-offer-note small").forEach(function (note) {
      note.textContent = footnoteText();
    });
  }

  window.LuneOffer = Object.freeze({
    phase: phase,
    offerHtml: offerHtml,
    footnoteText: footnoteText,
    endLabel: function () { return hasWindow ? endLabel() : ""; },
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
