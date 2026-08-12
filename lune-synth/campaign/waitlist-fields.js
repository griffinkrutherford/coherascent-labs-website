/**
 * Waitlist platform fields.
 *
 * Adds "iPhone / Android" to every waitlist form, plus a Google account email
 * field revealed only for Android.
 *
 * Why it matters: Play closed-testing invites key off the tester's Google
 * account, which is frequently not the address they sign up with. Asking here
 * means each signup self-reports instead of needing an email round-trip.
 *
 * Fields are injected rather than written into markup because the same form
 * appears on 13 static pages and is also built at runtime by cta.js and
 * offer-popup.js. One module keeps all of them identical.
 *
 * Public API (window.LuneWaitlistFields):
 *   enhance(form)   - inject fields into one form (idempotent)
 *   enhanceAll()    - inject into every waitlist form currently in the DOM
 *   collect(form)   - { platform, google_email } for the request body
 *   validate(form)  - { ok, message }; message is caller-displayed
 */
(function () {
  "use strict";

  var STYLE_ID = "lune-waitlist-fields-styles";
  var FLAG = "luneWaitlistFields";
  var seq = 0;

  var CSS = [
    ".lune-wf{display:block;width:100%;margin:14px 0 0;text-align:left;}",
    ".lune-wf__q{display:block;font-size:13px;font-weight:600;line-height:1.4;",
    "color:#a6bad7;margin:0 0 8px;padding:0;border:0;}",
    ".lune-wf__opts{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 2px;padding:0;border:0;}",
    ".lune-wf__opt{position:relative;flex:1 1 0;min-width:104px;}",
    ".lune-wf__opt input{position:absolute;opacity:0;width:0;height:0;}",
    ".lune-wf__opt span{display:block;text-align:center;padding:10px 12px;border-radius:9px;",
    "border:1px solid #251f3f;background:rgba(255,255,255,.03);color:#a6bad7;",
    "font-size:14px;font-weight:600;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}",
    ".lune-wf__opt span:hover{border-color:#3a3160;color:#edf5ff;}",
    ".lune-wf__opt input:checked+span{border-color:#64a8ff;color:#edf5ff;background:rgba(100,168,255,.12);}",
    ".lune-wf__opt input:focus-visible+span{outline:2px solid #64a8ff;outline-offset:2px;}",
    ".lune-wf__google{margin:10px 0 0;}",
    ".lune-wf__google[hidden]{display:none;}",
    ".lune-wf__label{display:block;font-size:13px;font-weight:600;color:#a6bad7;margin:0 0 6px;}",
    ".lune-wf__hint{display:block;font-size:12px;font-weight:400;color:#6d82a3;margin-top:2px;}",
    ".lune-wf__google input{width:100%;box-sizing:border-box;padding:11px 13px;border-radius:9px;",
    "border:1px solid #251f3f;background:rgba(255,255,255,.03);color:#edf5ff;font-size:15px;font-family:inherit;}",
    ".lune-wf__google input::placeholder{color:#6d82a3;}",
    ".lune-wf__google input:focus{outline:none;border-color:#64a8ff;}"
  ].join("");

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function enhance(form) {
    if (!form || form.dataset[FLAG] === "1") return;
    form.dataset[FLAG] = "1";
    injectStyles();

    seq += 1;
    var group = "lune-wf-platform-" + seq;
    var googleId = "lune-wf-google-" + seq;

    var wrap = document.createElement("div");
    wrap.className = "lune-wf";
    wrap.innerHTML = [
      '<fieldset class="lune-wf__opts">',
      '<legend class="lune-wf__q">Which phone will you use for the beta?</legend>',
      '<div class="lune-wf__opt">',
      '<input type="radio" name="' + group + '" value="ios" data-wf-platform />',
      "<span>iPhone</span>",
      "</div>",
      '<div class="lune-wf__opt">',
      '<input type="radio" name="' + group + '" value="android" data-wf-platform />',
      "<span>Android</span>",
      "</div>",
      "</fieldset>",
      '<div class="lune-wf__google" data-wf-google-wrap hidden>',
      '<label class="lune-wf__label" for="' + googleId + '">Google account email',
      '<span class="lune-wf__hint">The account your Play Store uses — invites go there, not to your signup email.</span>',
      "</label>",
      '<input type="email" id="' + googleId + '" autocomplete="email" ',
      'placeholder="you@gmail.com" data-wf-google />',
      "</div>"
    ].join("");

    // Insert above the submit button so the flow reads top-to-bottom.
    var submit = form.querySelector('button[type="submit"]') || form.querySelector("button");
    if (submit && submit.parentNode === form) {
      form.insertBefore(wrap, submit);
    } else {
      form.appendChild(wrap);
    }

    var googleWrap = wrap.querySelector("[data-wf-google-wrap]");
    var googleInput = wrap.querySelector("[data-wf-google]");

    wrap.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.hasAttribute || !target.hasAttribute("data-wf-platform")) return;
      var isAndroid = target.value === "android";
      googleWrap.hidden = !isAndroid;
      if (!isAndroid) {
        googleInput.value = "";
      } else {
        // Only steal focus once the field appears, never on page load.
        try { googleInput.focus({ preventScroll: true }); } catch (e) { googleInput.focus(); }
      }
    });
  }

  function enhanceAll(root) {
    var scope = root || document;
    var forms = scope.querySelectorAll ? scope.querySelectorAll("[data-waitlist-form]") : [];
    Array.prototype.forEach.call(forms, enhance);
  }

  function selectedPlatform(form) {
    var checked = form.querySelector("[data-wf-platform]:checked");
    return checked ? checked.value : "";
  }

  function collect(form) {
    var platform = selectedPlatform(form);
    var googleInput = form.querySelector("[data-wf-google]");
    var payload = { platform: platform };
    if (platform === "android" && googleInput && googleInput.value.trim()) {
      payload.google_email = googleInput.value.trim().toLowerCase();
    }
    return payload;
  }

  function validate(form) {
    // A form without the fields (older cached markup) must never be blocked.
    if (!form.querySelector("[data-wf-platform]")) return { ok: true };

    var platform = selectedPlatform(form);
    if (!platform) {
      return { ok: false, message: "Please choose iPhone or Android so we can send your invite the right way." };
    }
    if (platform === "android") {
      var googleInput = form.querySelector("[data-wf-google]");
      var value = googleInput ? googleInput.value.trim() : "";
      if (!value) {
        return { ok: false, message: "Please add the Google account email your Play Store uses — Android invites go to that address." };
      }
      if (value.indexOf("@") === -1 || value.indexOf(".") === -1) {
        return { ok: false, message: "That Google account email does not look right. Please check it." };
      }
    }
    return { ok: true };
  }

  window.LuneWaitlistFields = {
    enhance: enhance,
    enhanceAll: enhanceAll,
    collect: collect,
    validate: validate
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { enhanceAll(); });
  } else {
    enhanceAll();
  }

  // cta.js and offer-popup.js build their forms after load, so watch for them.
  if (typeof MutationObserver === "function") {
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j += 1) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches("[data-waitlist-form]")) enhance(node);
          else enhanceAll(node);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
