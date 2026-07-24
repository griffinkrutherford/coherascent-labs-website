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
    if (open) {
      window.requestAnimationFrame(function () {
        var firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      });
    }
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
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
      return;
    }

    if (e.key === "Tab" && header.classList.contains("nav-open")) {
      var focusable = Array.prototype.slice.call(nav.querySelectorAll("a[href]"));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        toggle.focus();
      } else if (!e.shiftKey && document.activeElement === toggle) {
        e.preventDefault();
        first.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        toggle.focus();
      } else if (e.shiftKey && document.activeElement === toggle) {
        e.preventDefault();
        last.focus();
      }
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) setOpen(false);
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
    if (window.innerWidth <= 640) {
      e.preventDefault();
      setBrandOpen(!header.classList.contains("brand-open"));
    }
  });

  brand.addEventListener("keydown", function (e) {
    if (window.innerWidth <= 640 && (e.key === "Enter" || e.key === " ")) {
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
    if (window.innerWidth > 640) setBrandOpen(false);
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

// Article share dock — a side pop-up with LinkedIn, X, Facebook, Email, and copy link.
(function initShareDock() {
  var article = document.querySelector(".article");
  if (!article) return;

  var canonical = document.querySelector('link[rel="canonical"]');
  var shareUrl = (canonical && canonical.href) || window.location.href;
  var ogTitle = document.querySelector('meta[property="og:title"]');
  var shareTitle = (ogTitle && ogTitle.getAttribute("content")) || document.title;
  var u = encodeURIComponent(shareUrl);
  var t = encodeURIComponent(shareTitle);

  var icons = {
    share: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15a3 3 0 0 0 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.17l7.73-8.84L.75 2.25h6.83l4.71 6.23 5.95-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96H15.8c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm9 7.01L4.4 6H19.6L12 11.01zM4 7.24V18h16V7.24l-8 5.29-8-5.29z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12a1 1 0 1 0 2 0V3h12a1 1 0 1 0 0-2zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>'
  };

  var links = [
    { cls: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u },
    { cls: "x", label: "X", href: "https://twitter.com/intent/tweet?url=" + u + "&text=" + t },
    { cls: "facebook", label: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" + u },
    { cls: "email", label: "Email", href: "mailto:?subject=" + t + "&body=" + u }
  ];

  var linksHtml = links.map(function (l) {
    var attrs = l.cls === "email" ? "" : ' target="_blank" rel="noopener noreferrer"';
    return '<a class="share-dock__link share-dock__link--' + l.cls + '" href="' + l.href + '"' + attrs + ">" +
      icons[l.cls] + "<span>" + l.label + "</span></a>";
  }).join("");

  var dock = document.createElement("div");
  dock.className = "share-dock";
  dock.innerHTML =
    '<div class="share-dock__panel" id="share-dock-panel" aria-label="Share this article" hidden>' +
      '<span class="share-dock__heading">Share this post</span>' +
      linksHtml +
      '<button type="button" class="share-dock__link share-dock__link--copy" data-share-copy>' +
        icons.copy + "<span>Copy link</span></button>" +
    "</div>" +
    '<button type="button" class="share-dock__toggle" aria-expanded="false" aria-controls="share-dock-panel" aria-label="Share this article">' +
      icons.share + "</button>";
  document.body.appendChild(dock);

  var toggle = dock.querySelector(".share-dock__toggle");
  var panel = dock.querySelector(".share-dock__panel");
  var copyBtn = dock.querySelector("[data-share-copy]");

  function setOpen(open) {
    dock.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = !dock.classList.contains("is-open");
    setOpen(open);
    if (open) {
      var firstShareLink = panel.querySelector("a, button");
      if (firstShareLink) firstShareLink.focus();
    }
  });

  // Open social shares in a centered popup window instead of a new tab.
  dock.querySelectorAll('a.share-dock__link[target="_blank"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var w = 600, h = 560;
      var x = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
      var y = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
      window.open(a.href, "shareWindow", "noopener,width=" + w + ",height=" + h + ",left=" + x + ",top=" + y);
      setOpen(false);
    });
  });

  copyBtn.addEventListener("click", function () {
    var span = copyBtn.querySelector("span");
    var original = span.textContent;
    function confirmCopied() {
      copyBtn.classList.add("is-copied");
      span.textContent = "Copied!";
      setTimeout(function () {
        span.textContent = original;
        copyBtn.classList.remove("is-copied");
      }, 1700);
    }
    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); confirmCopied(); } catch (err) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(confirmCopied, fallbackCopy);
    } else {
      fallbackCopy();
    }
  });

  document.addEventListener("click", function (e) {
    if (dock.classList.contains("is-open") && !dock.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();
