(function () {
  "use strict";

  var dialog;
  var activeForm;
  var activeSubmitter;
  var previousOverflow;

  function updateViewport() {
    var viewport = window.visualViewport;
    var height = viewport ? viewport.height : window.innerHeight;
    dialog.style.setProperty("--waitlist-prompt-height", height + "px");
    dialog.style.setProperty("--waitlist-prompt-center", ((viewport ? viewport.offsetTop : 0) + height / 2) + "px");
  }

  function trackViewport(enabled) {
    var method = enabled ? "addEventListener" : "removeEventListener";
    window[method]("resize", updateViewport);
    if (window.visualViewport) {
      window.visualViewport[method]("resize", updateViewport);
      window.visualViewport[method]("scroll", updateViewport);
    }
  }

  function restorePage() {
    if (!activeForm) return;
    var launcher = activeSubmitter || activeForm.querySelector('button[type="submit"]');
    activeForm = null;
    activeSubmitter = null;
    dialog.hidden = true;
    trackViewport(false);
    document.body.style.overflow = previousOverflow;
    if (launcher && launcher.isConnected) launcher.focus({ preventScroll: true });
  }

  function closePrompt() {
    // Restore before continuing signup, so a queued close event cannot unlock
    // the page underneath the success popup that the original form opens.
    restorePage();
    dialog.close();
  }

  function createDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "lune-waitlist-prompt";
    dialog.hidden = true;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "waitlist-prompt-title");
    dialog.setAttribute("aria-describedby", "waitlist-prompt-description");
    dialog.innerHTML = [
      '<div class="lune-waitlist-prompt__panel">',
      '<button class="lune-waitlist-prompt__close" type="button" data-prompt-close aria-label="Close email request">&times;</button>',
      '<span class="lune-waitlist-prompt__icon" aria-hidden="true"></span>',
      '<h2 id="waitlist-prompt-title">Where should we send your invite?</h2>',
      '<p id="waitlist-prompt-description">Add your email address to join the Lune Synth beta waitlist.</p>',
      '<form class="lune-waitlist-prompt__form" novalidate>',
      '<label for="waitlist-prompt-email">Email address</label>',
      '<input id="waitlist-prompt-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" aria-describedby="waitlist-prompt-status" required autofocus>',
      '<p class="lune-waitlist-prompt__status" id="waitlist-prompt-status" aria-live="polite"></p>',
      '<button class="lune-waitlist-prompt__submit" type="submit">Join Waitlist</button>',
      '</form>',
      '<button class="lune-waitlist-prompt__later" type="button" data-prompt-close>Not now</button>',
      '</div>'
    ].join("");
    document.body.appendChild(dialog);

    var input = dialog.querySelector("input");
    var status = dialog.querySelector(".lune-waitlist-prompt__status");
    dialog.querySelectorAll("[data-prompt-close]").forEach(function (button) {
      button.addEventListener("click", closePrompt);
    });
    dialog.addEventListener("close", function () {
      if (!dialog.open) restorePage();
    });
    dialog.addEventListener("keydown", function (event) {
      // Native dialog handles Escape and focus containment. Keep Escape from
      // also dismissing a beta-offer popup underneath this dialog.
      if (event.key === "Escape") event.stopPropagation();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closePrompt();
    });
    input.addEventListener("input", function () {
      input.removeAttribute("aria-invalid");
      status.textContent = "";
    });
    dialog.querySelector("form").addEventListener("submit", function (event) {
      event.preventDefault();
      input.value = input.value.trim();
      if (!input.validity.valid) {
        input.setAttribute("aria-invalid", "true");
        status.textContent = input.value ? "Enter a valid email address, like you@example.com." : "Add your email so we can send your beta invite.";
        input.focus({ preventScroll: true });
        return;
      }
      var form = activeForm;
      var submitter = activeSubmitter;
      var email = input.value;
      closePrompt();
      if (!form || !form.isConnected) return;
      var sourceInput = form.querySelector('input[type="email"]');
      if (!sourceInput || sourceInput.disabled) return;
      sourceInput.value = email;
      // The existing handler owns the API request, attribution, loading state,
      // success message, and post-signup platform question.
      if (submitter && submitter.form === form && !submitter.disabled) form.requestSubmit(submitter);
      else form.requestSubmit();
    });
  }

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches("[data-waitlist-form], [data-cta-form], [data-beta-offer-form]")) return;
    var input = form.querySelector('input[type="email"]');
    if (!input || input.disabled || input.value.trim()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!dialog) createDialog();
    if (dialog.open) return;
    activeForm = form;
    activeSubmitter = event.submitter;
    previousOverflow = document.body.style.overflow;
    dialog.querySelector("form").reset();
    dialog.querySelector("input").removeAttribute("aria-invalid");
    dialog.querySelector(".lune-waitlist-prompt__status").textContent = "";
    dialog.hidden = false;
    trackViewport(true);
    updateViewport();
    document.body.style.overflow = "hidden";
    dialog.showModal();
  }, true);
})();
