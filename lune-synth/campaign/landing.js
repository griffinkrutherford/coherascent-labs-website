(function () {
  "use strict";

  if (!document.querySelector('script[data-lune-site-footer]')) {
    var footerScript = document.createElement("script");
    footerScript.src = "/campaign/site-footer.js?v=5";
    footerScript.defer = true;
    footerScript.dataset.luneSiteFooter = "";
    document.head.appendChild(footerScript);
  }

  if (document.documentElement.dataset.campaignFamily === "test-prep") {
    var scoreNames = {
      act: "ACT",
      "ap-exams": "AP exam",
      ged: "GED",
      gmat: "GMAT",
      gre: "GRE",
      "ib-exams": "IB exam",
      lsat: "LSAT",
      mcat: "MCAT",
      "phd-qualifying-exams": "qualifying exam",
      psat: "PSAT",
      sat: "SAT",
      "state-assessments": "state assessment",
      usmle: "USMLE"
    };
    var scoreVariant = document.documentElement.dataset.campaignVariant || "test";
    var scoreName = scoreNames[scoreVariant] || "test";
    var scoreSection = document.createElement("section");
    scoreSection.className = "campaign-score campaign-shell";
    scoreSection.setAttribute("aria-labelledby", "score-improvement-title");
    scoreSection.innerHTML = `
      <div class="campaign-score__copy" data-reveal>
        <p class="section-kicker">Study for score improvement</p>
        <h2 id="score-improvement-title">Turn every missed question into a better chance at a higher ${scoreName} score.</h2>
        <p>Lune Synth shows you where points are slipping away, builds focused practice around those gaps, and helps you repeat the reasoning until it holds up under test-day pressure.</p>
      </div>
      <div class="campaign-score__path" data-reveal aria-label="Score improvement study loop">
        <div><strong>Diagnose lost points</strong><span>Find the exact concept, setup, or execution error behind each miss.</span></div>
        <div><strong>Target repeatable gains</strong><span>Spend prep time on the skills most likely to improve the next attempt.</span></div>
        <div><strong>Build test-day confidence</strong><span>Practice the full reasoning until you can reproduce it without answer-generation shortcuts.</span></div>
      </div>`;
    var firstFeature = document.querySelector("lune-quick-missions");
    if (firstFeature) firstFeature.before(scoreSection);
  }

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
