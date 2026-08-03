(function () {
  "use strict";

  var year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var campaignDetail = {
    event: "landing_page_view",
    campaign_family: document.documentElement.dataset.campaignFamily || "unknown",
    campaign_variant: document.documentElement.dataset.campaignVariant || "unknown",
    campaign_audience: document.documentElement.dataset.campaignAudience || "unknown",
    landing_path: window.location.pathname
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(campaignDetail);

  var revealItems = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

  revealItems.forEach(function (item) { observer.observe(item); });
})();
