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

// Three-column blog grid with URL-aware client-side pagination.
(function initBlogPagination() {
  var list = document.querySelector("[data-post-list]");
  var pagination = document.querySelector("[data-blog-pagination]");
  if (!list || !pagination) return;

  var posts = Array.prototype.slice.call(list.children);
  var previousButton = pagination.querySelector("[data-page-previous]");
  var nextButton = pagination.querySelector("[data-page-next]");
  var pageNumbers = pagination.querySelector("[data-page-numbers]");
  var pageStatus = pagination.querySelector("[data-page-status]");
  var postsPerPage = 6;
  var totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  var currentPage = 1;
  var numberButtons = [];

  function pageFromUrl() {
    var value = Number(new URL(window.location.href).searchParams.get("page"));
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
  }

  function urlForPage(page) {
    var url = new URL(window.location.href);
    if (page === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(page));
    return url.pathname + url.search + url.hash;
  }

  function renderPage(page, updateHistory, scrollToGrid) {
    currentPage = Math.min(Math.max(page, 1), totalPages);
    var firstPost = (currentPage - 1) * postsPerPage;
    var lastPost = firstPost + postsPerPage;

    posts.forEach(function (post, index) {
      post.hidden = index < firstPost || index >= lastPost;
    });

    numberButtons.forEach(function (button, index) {
      var isCurrent = index + 1 === currentPage;
      if (isCurrent) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageStatus.textContent = "Page " + currentPage + " of " + totalPages + " · " + posts.length + " posts";

    if (updateHistory) {
      window.history.pushState({ blogPage: currentPage }, "", urlForPage(currentPage));
    }
    if (scrollToGrid) list.scrollIntoView({ block: "start" });
  }

  for (var page = 1; page <= totalPages; page += 1) {
    var button = document.createElement("button");
    button.className = "blog-pagination__page";
    button.type = "button";
    button.textContent = String(page);
    button.setAttribute("aria-label", "Go to page " + page);
    button.setAttribute("data-page", String(page));
    button.addEventListener("click", function () {
      renderPage(Number(this.getAttribute("data-page")), true, true);
    });
    pageNumbers.appendChild(button);
    numberButtons.push(button);
  }

  previousButton.addEventListener("click", function () {
    renderPage(currentPage - 1, true, true);
  });
  nextButton.addEventListener("click", function () {
    renderPage(currentPage + 1, true, true);
  });
  window.addEventListener("popstate", function () {
    renderPage(pageFromUrl(), false, false);
  });

  var requestedPage = pageFromUrl();
  renderPage(requestedPage, false, false);
  if (requestedPage !== currentPage) {
    window.history.replaceState({ blogPage: currentPage }, "", urlForPage(currentPage));
  }
})();

// ---------- Newsletter / waitlist capture (matches homepage) ----------
(function () {
  var form = document.querySelector("[data-waitlist-form]");
  var popup = document.querySelector("[data-waitlist-popup]");
  if (!form || !popup) return;

  var closeControls = Array.prototype.slice.call(popup.querySelectorAll("[data-waitlist-close]"));
  var closeButton = popup.querySelector("[data-waitlist-close]");
  var lastFocusedElement = null;

  function openPopup() {
    lastFocusedElement = document.activeElement;
    popup.hidden = false;
    document.body.style.overflow = "hidden";

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closePopup() {
    popup.hidden = true;
    document.body.style.overflow = "";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var emailInput = form.querySelector('input[type="email"]');
    var submitButton = form.querySelector('button[type="submit"]');
    if (!emailInput || !submitButton) return;

    var email = emailInput.value.trim();
    if (!email) return;

    // Disable inputs and show loading state
    var originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    emailInput.disabled = true;
    submitButton.textContent = "Joining...";

    // Get popup elements to update messaging dynamically
    var popupTitle = popup.querySelector("#waitlist-popup-title");
    var popupMessage = popup.querySelector("[data-waitlist-message]");

    fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email })
    })
    .then(function (response) {
      return response.json().then(function (data) {
        if (response.ok && data.success) {
          // Success
          if (popupTitle) popupTitle.textContent = "You're on the list!";
          if (popupMessage) {
            popupMessage.textContent = data.message || "Thank you for joining the Lune Synth™ beta waitlist. We will notify you as soon as invites are ready.";
          }
          form.reset();
          openPopup();
        } else {
          // Server error
          if (popupTitle) popupTitle.textContent = "Oops!";
          if (popupMessage) {
            popupMessage.textContent = data.error || "Something went wrong. Please check your email and try again.";
          }
          openPopup();
        }
      });
    })
    .catch(function (error) {
      // Network/Connection failure
      if (popupTitle) popupTitle.textContent = "Connection Error";
      if (popupMessage) {
        popupMessage.textContent = "Could not reach the server. Please check your internet connection and try again.";
      }
      openPopup();
    })
    .finally(function () {
      // Re-enable inputs and restore button text
      submitButton.disabled = false;
      emailInput.disabled = false;
      submitButton.textContent = originalButtonText;
    });
  });

  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      closePopup();
    }
  });

  closeControls.forEach(function (control) {
    control.addEventListener("click", closePopup);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !popup.hidden) {
      closePopup();
    }
  });
})();
