/**
 * Post-signup platform question.
 *
 * Asked in the success popup, AFTER the email is already stored — so someone
 * who closes the popup is still on the waitlist. An earlier version injected
 * these fields into the form itself, which both risked losing the signup and
 * broke the hero form's horizontal layout.
 *
 * Why it is asked at all: Play closed-testing invites key off the tester's
 * Google account, which is frequently not their signup address.
 *
 * Public API (window.LuneWaitlistFields):
 *   mountQuestion(afterEl, email)  - render the question after afterEl
 */
(function () {
  "use strict";

  var STYLE_ID = "lune-waitlist-question-styles";
  var seq = 0;

  var CSS = [
    ".lune-wq{display:block;margin:18px 0 0;text-align:left;}",
    ".lune-wq__q{display:block;font-size:14px;font-weight:600;line-height:1.45;color:#edf5ff;margin:0 0 10px;}",
    ".lune-wq__why{display:block;font-size:12.5px;line-height:1.5;color:#6d82a3;margin:0 0 12px;}",
    ".lune-wq__opts{display:flex;gap:8px;flex-wrap:wrap;}",
    ".lune-wq__btn{flex:1 1 0;min-width:110px;padding:11px 14px;border-radius:9px;",
    "border:1px solid #251f3f;background:rgba(255,255,255,.03);color:#a6bad7;",
    "font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;",
    "transition:border-color .15s,color .15s,background .15s;}",
    ".lune-wq__btn:hover{border-color:#64a8ff;color:#edf5ff;background:rgba(100,168,255,.1);}",
    ".lune-wq__btn[aria-pressed='true']{border-color:#64a8ff;color:#edf5ff;background:rgba(100,168,255,.14);}",
    ".lune-wq__android{margin:12px 0 0;}",
    ".lune-wq__android[hidden]{display:none;}",
    ".lune-wq__presume{display:block;font-size:13.5px;line-height:1.5;color:#a6bad7;margin:0 0 10px;}",
    ".lune-wq__presume strong{color:#edf5ff;font-weight:600;word-break:break-all;}",
    ".lune-wq__toggle{display:flex;align-items:flex-start;gap:9px;cursor:pointer;margin:0 0 10px;}",
    ".lune-wq__toggle input{flex:0 0 auto;width:16px;height:16px;margin:1px 0 0;accent-color:#64a8ff;cursor:pointer;}",
    ".lune-wq__toggle span{font-size:13px;line-height:1.45;color:#a6bad7;}",
    ".lune-wq__diff[hidden]{display:none;}",
    ".lune-wq__label{display:block;font-size:13px;font-weight:600;color:#a6bad7;margin:0 0 6px;}",
    ".lune-wq__row{display:flex;gap:8px;flex-wrap:wrap;}",
    ".lune-wq__input{flex:1 1 190px;min-width:0;box-sizing:border-box;padding:11px 13px;",
    "border-radius:9px;border:1px solid #251f3f;background:rgba(255,255,255,.03);",
    "color:#edf5ff;font-size:15px;font-family:inherit;}",
    ".lune-wq__input::placeholder{color:#6d82a3;}",
    ".lune-wq__input:focus{outline:none;border-color:#64a8ff;}",
    ".lune-wq__save{flex:0 0 auto;padding:11px 20px;border-radius:9px;border:0;",
    "background-color:#a47bff;background-image:linear-gradient(120deg,#64a8ff 0%,#a47bff 50%,#ff5d87 100%);",
    "color:#06111f;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;}",
    ".lune-wq__save[disabled]{opacity:.6;cursor:default;}",
    ".lune-wq__status{display:block;font-size:13px;line-height:1.5;margin:10px 0 0;color:#a6bad7;}",
    ".lune-wq__status--err{color:#ff5d87;}",
    ".lune-wq__done{display:block;font-size:14px;line-height:1.55;color:#edf5ff;margin:14px 0 0;}"
  ].join("");

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function post(email, platform, googleEmail) {
    var body = { email: email, platform: platform };
    if (googleEmail) body.google_email = googleEmail;
    return fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (response) {
      if (!response.ok) throw new Error("save_failed");
      return response.json();
    });
  }

  function mountQuestion(afterEl, email) {
    if (!afterEl || !afterEl.parentNode || !email) return null;
    injectStyles();
    seq += 1;
    var inputId = "lune-wq-google-" + seq;

    var wrap = document.createElement("div");
    wrap.className = "lune-wq";
    wrap.innerHTML = [
      '<strong class="lune-wq__q">One quick thing — which phone will you use?</strong>',
      '<span class="lune-wq__why">Android invites go to your Google account, which often isn’t your signup email. Getting this right is what makes the app actually appear for you.</span>',
      '<div class="lune-wq__opts">',
      '<button type="button" class="lune-wq__btn" data-wq-pick="ios" aria-pressed="false">iPhone</button>',
      '<button type="button" class="lune-wq__btn" data-wq-pick="android" aria-pressed="false">Android</button>',
      "</div>",
      '<div class="lune-wq__android" data-wq-android hidden>',
      // Most people sign up with the same address their Play Store uses, so
      // assume that and let them correct it, rather than asking everyone.
      '<span class="lune-wq__presume">We’ll send your Play invite to <strong data-wq-presumed></strong>.</span>',
      '<label class="lune-wq__toggle">',
      '<input type="checkbox" data-wq-different />',
      "<span>That’s not my Google account — I’ll enter a different one</span>",
      "</label>",
      '<div class="lune-wq__diff" data-wq-diff hidden>',
      '<label class="lune-wq__label" for="' + inputId + '">Google account email</label>',
      '<input class="lune-wq__input" id="' + inputId + '" type="email" autocomplete="email" placeholder="you@gmail.com" data-wq-google />',
      "</div>",
      '<div class="lune-wq__row" style="margin-top:10px;">',
      '<button type="button" class="lune-wq__save" data-wq-save>Save</button>',
      "</div>",
      "</div>",
      '<span class="lune-wq__status" data-wq-status role="status" aria-live="polite"></span>'
    ].join("");

    afterEl.parentNode.insertBefore(wrap, afterEl.nextSibling);

    var androidBlock = wrap.querySelector("[data-wq-android]");
    var googleInput = wrap.querySelector("[data-wq-google]");
    var saveButton = wrap.querySelector("[data-wq-save]");
    var status = wrap.querySelector("[data-wq-status]");
    var buttons = wrap.querySelectorAll("[data-wq-pick]");
    var differentToggle = wrap.querySelector("[data-wq-different]");
    var differentBlock = wrap.querySelector("[data-wq-diff]");

    wrap.querySelector("[data-wq-presumed]").textContent = email;

    differentToggle.addEventListener("change", function () {
      differentBlock.hidden = !differentToggle.checked;
      setStatus("");
      if (differentToggle.checked) {
        try { googleInput.focus({ preventScroll: true }); } catch (e) { googleInput.focus(); }
      } else {
        googleInput.value = "";
      }
    });

    function setStatus(text, isError) {
      status.textContent = text || "";
      status.className = "lune-wq__status" + (isError ? " lune-wq__status--err" : "");
    }

    function finish(text) {
      wrap.innerHTML = '<span class="lune-wq__done">' + text + "</span>";
    }

    function press(value) {
      Array.prototype.forEach.call(buttons, function (button) {
        button.setAttribute("aria-pressed", String(button.getAttribute("data-wq-pick") === value));
      });
    }

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-wq-pick");
        press(value);
        setStatus("");

        if (value === "android") {
          androidBlock.hidden = false;
          try { googleInput.focus({ preventScroll: true }); } catch (e) { googleInput.focus(); }
          return;
        }

        androidBlock.hidden = true;
        setStatus("Saving…");
        post(email, "ios").then(function () {
          finish("Perfect — we’ll send your TestFlight invite to <strong>" + email + "</strong> when your cohort opens.");
        }).catch(function () {
          // The signup itself already succeeded, so this is never fatal.
          setStatus("Could not save that just now. You can also reply to the confirmation email.", true);
        });
      });
    });

    saveButton.addEventListener("click", function () {
      // Unless they said otherwise, the signup address is the Google account.
      var value = email;

      if (differentToggle.checked) {
        value = googleInput.value.trim().toLowerCase();
        if (!value || value.indexOf("@") === -1 || value.indexOf(".") === -1) {
          setStatus("Please enter the Google account email your Play Store uses.", true);
          googleInput.focus();
          return;
        }
      }

      saveButton.disabled = true;
      setStatus("Saving…");
      post(email, "android", value).then(function () {
        finish("Got it — your Play invite will go to <strong>" + value + "</strong>.");
      }).catch(function () {
        saveButton.disabled = false;
        setStatus("Could not save that just now. You can also reply to the confirmation email.", true);
      });
    });

    googleInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); saveButton.click(); }
    });

    return wrap;
  }

  window.LuneWaitlistFields = { mountQuestion: mountQuestion };
})();
