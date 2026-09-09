// Shared landing-page sticky header and navigation menu.

(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;

  var ticking = false;

  function updateHeaderHeight() {
    document.documentElement.style.setProperty(
      "--sticky-header-height",
      Math.ceil(header.getBoundingClientRect().height) + "px"
    );
  }

  function updateHeader() {
    updateHeaderHeight();
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeader);
  }

  updateHeader();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();

// Mobile hamburger: toggle the fullscreen nav overlay.
(function handleNavToggle() {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("primary-nav");
  if (!header || !toggle || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", function () {
    if (header.classList.contains("brand-open")) {
      header.classList.remove("brand-open");
      var brandEl = document.querySelector(".brand");
      if (brandEl) brandEl.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      return;
    }
    setOpen(!header.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

})();
