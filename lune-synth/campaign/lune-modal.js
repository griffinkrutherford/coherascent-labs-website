/* Shared accessible modal/popover shell, used for:
   - the "coming soon" App Store / Google Play badges (store-badges.js)
   - popping Tock's Easter Egg / Golden Egg reveals to the front (tock-section.js)

   window.LuneModal.create(options) returns { open, close, body, panel }.
   options:
     className  - extra class on the overlay (for per-use styling)
     closeLabel - aria-label for the built-in close button (default "Close")
     titleText  - if set, rendered as an <h2> and used for aria-labelledby
     labelledBy - id of an existing heading to use instead (when hosting contentNode)
     bodyHtml   - static markup appended into the panel body
     contentNode - an existing DOM node to move into the panel on open, and
                   move back to its original position in the page on close
                   (used so the live-updating Tock reward card keeps working)
     onClose    - called after the modal finishes closing

   Any element inside bodyHtml/contentNode with [data-modal-close] closes the
   modal when clicked, in addition to the built-in close button, Escape, and
   a click on the overlay outside the panel. Focus is trapped in the panel
   while open and restored to the trigger on close. */
(function () {
  "use strict";

  var counter = 0;

  function focusables(panel) {
    return Array.prototype.slice
      .call(
        panel.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return !el.closest("[hidden]");
      });
  }

  function create(options) {
    options = options || {};
    counter += 1;

    var overlay = document.createElement("div");
    overlay.className = "lune-modal" + (options.className ? " " + options.className : "");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.hidden = true;

    var panel = document.createElement("div");
    panel.className = "lune-modal__panel";
    overlay.appendChild(panel);

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "lune-modal__close";
    closeButton.setAttribute("aria-label", options.closeLabel || "Close");
    closeButton.innerHTML = "&times;";
    panel.appendChild(closeButton);

    var body = document.createElement("div");
    body.className = "lune-modal__body";
    panel.appendChild(body);

    var titleId = "";
    if (options.titleText) {
      var heading = document.createElement("h2");
      heading.className = "lune-modal__title";
      titleId = "lune-modal-title-" + counter;
      heading.id = titleId;
      heading.textContent = options.titleText;
      body.appendChild(heading);
    }

    if (options.bodyHtml) {
      var wrap = document.createElement("div");
      wrap.innerHTML = options.bodyHtml;
      body.appendChild(wrap);
    }

    var moved = options.contentNode
      ? { node: options.contentNode, parent: options.contentNode.parentNode, next: options.contentNode.nextSibling }
      : null;

    if (titleId) overlay.setAttribute("aria-labelledby", titleId);
    else if (options.labelledBy) overlay.setAttribute("aria-labelledby", options.labelledBy);

    document.body.appendChild(overlay);

    var lastFocused = null;

    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove("has-lune-modal");
      if (moved) {
        var ref = moved.next && moved.next.parentNode === moved.parent ? moved.next : null;
        moved.parent.insertBefore(moved.node, ref);
      }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      if (options.onClose) options.onClose();
    }

    function open() {
      if (!overlay.hidden) return;
      if (moved) body.appendChild(moved.node);
      lastFocused = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("has-lune-modal");
      var autofocusTarget = panel.querySelector("[data-autofocus]");
      (autofocusTarget || closeButton).focus();
    }

    closeButton.addEventListener("click", close);

    panel.addEventListener("click", function (event) {
      if (event.target.closest("[data-modal-close]")) close();
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) close();
    });

    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusables(panel);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    return { open: open, close: close, body: body, panel: panel };
  }

  window.LuneModal = { create: create };
})();
