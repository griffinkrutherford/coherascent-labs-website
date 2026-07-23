// Header behavior — copied from the main lunesynth.com site so the blog header
// matches exactly (scroll-blur, sticky height, mobile hamburger + brand popup).

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

  window.addEventListener("resize", function () {
    if (window.innerWidth > 640) setOpen(false);
  });
})();

// Mobile brand dropdown (Coherascent Labs logo menu): full screen popup like the hamburger nav.
(function handleBrandDropdown() {
  var header = document.querySelector(".site-header");
  var brandDropdown = document.querySelector(".brand-dropdown");
  var brand = brandDropdown ? brandDropdown.querySelector(".brand") : null;
  var navToggle = document.querySelector("[data-nav-toggle]");
  if (!header || !brandDropdown || !brand) return;

  function setBrandOpen(open) {
    header.classList.toggle("brand-open", open);
    brand.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  brand.addEventListener("click", function (e) {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      setBrandOpen(!header.classList.contains("brand-open"));
    }
  });

  brandDropdown.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setBrandOpen(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("brand-open")) {
      setBrandOpen(false);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setBrandOpen(false);
  });
})();
