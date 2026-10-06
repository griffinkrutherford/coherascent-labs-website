(function () {
  "use strict";

  if (!document.querySelector('script[data-lune-site-footer]')) {
    var footerScript = document.createElement("script");
    footerScript.src = "/campaign/site-footer.js?v=9";
    footerScript.defer = true;
    footerScript.dataset.luneSiteFooter = "";
    document.head.appendChild(footerScript);
  }

  if (document.documentElement.dataset.campaignFamily === "test-prep") {
    // These are illustrative goals, not measured product outcomes.
    // Source URLs record the official scoring guidance behind these examples.
    var scoreExamples = {
      sat: { title: "SAT score improvement", from: 1180, to: 1400, gain: "+220 points", scope: "SAT total · 400–1600 scale", source: "https://satsuite.collegeboard.org/scores/what-scores-mean", color: "#64a8ff" },
      act: { title: "ACT score improvement", from: 22, to: 28, gain: "+6 points", scope: "ACT composite · 1–36 scale", source: "https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html", color: "#b89aff" },
      psat: { title: "PSAT/NMSQT score improvement", from: 1020, to: 1260, gain: "+240 points", scope: "PSAT/NMSQT total · 320–1520 scale", source: "https://satsuite.collegeboard.org/scores/what-scores-mean", color: "#6de1ef" },
      "ap-exams": { title: "AP score improvement", from: 2, to: 4, gain: "+2 score levels", scope: "AP Calculus AB · 1–5 scale", source: "https://apstudents.collegeboard.org/about-ap-scores", color: "#ffd27d" },
      ged: { title: "GED Math score improvement", from: 148, to: 165, gain: "+17 points", scope: "GED Math · 100–200 scale", source: "https://api.ged.com/score_scale/", color: "#7ee4b6" },
      gre: { title: "GRE Quant score improvement", from: 145, to: 160, gain: "+15 points", scope: "GRE Quantitative · 130–170 scale", source: "https://www.ets.org/content/ets-org/ca/en/gre/test-takers/general-test/scores/get-scores.html", color: "#bf9dff" },
      lsat: { title: "LSAT score improvement", from: 151, to: 163, gain: "+12 points", scope: "LSAT score · 120–180 scale", source: "https://www.lsac.org/lsat/lsat-scoring", color: "#f1ce8e" },
      mcat: { title: "MCAT score improvement", from: 498, to: 512, gain: "+14 points", scope: "MCAT total · 472–528 scale", source: "https://students-residents.aamc.org/mcat-scores/mcat-exam-score-scale", color: "#ff99bd" },
      gmat: { title: "GMAT score improvement", from: 555, to: 655, gain: "+100 points", scope: "GMAT total · 205–805 scale", source: "https://www.mba.com/exams/gmat-exam/scores", color: "#a7e5a1" },
      usmle: { title: "USMLE Step 2 CK score improvement", from: 220, to: 245, gain: "+25 points", scope: "USMLE Step 2 CK · three-digit score", source: "https://www.usmle.org/scores-transcripts/examination-results-and-scoring", color: "#78dbdf" },
      "ib-exams": { title: "IB Math AA grade improvement", from: 4, to: 6, gain: "+2 grades", scope: "IB Mathematics AA · subject grade, 1–7", source: "https://ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/", color: "#a5b0ff" },
      "state-assessments": { title: "State practice accuracy", from: 60, to: 85, suffix: "%", gain: "+25 percentage points", scope: "Practice-set accuracy · state scoring varies", color: "#81c4fa" },
      "phd-qualifying-exams": { title: "Qualifying exam practice accuracy", from: 55, to: 85, suffix: "%", gain: "+30 percentage points", scope: "Practice-set accuracy · program grading varies", color: "#efb98c" }
    };
    var scoreVariant = document.documentElement.dataset.campaignVariant || "test";
    var example = scoreExamples[scoreVariant];
    var scoreData = document.querySelector("script[data-score-example]");
    if (scoreData) {
      try {
        var customExample = JSON.parse(scoreData.textContent);
        if (customExample && typeof customExample.title === "string" && Number.isFinite(customExample.from) && Number.isFinite(customExample.to)) {
          example = customExample;
        }
      } catch (_) { /* Keep the standard example if page data is invalid. */ }
    }
    if (example) {
      var scoreSection = document.createElement("section");
      scoreSection.className = "campaign-score campaign-shell";
      scoreSection.setAttribute("data-reveal", "");
      scoreSection.setAttribute("aria-labelledby", "score-improvement-title");
      scoreSection.style.setProperty("--score-accent", example.color);
      scoreSection.innerHTML = `
        <h2 class="campaign-score__title" id="score-improvement-title" aria-describedby="score-improvement-note">${example.title}<sup aria-hidden="true">*</sup></h2>
        <div class="campaign-score__jump">
          <div class="campaign-score__endpoint">
            <span class="campaign-score__label">Start</span>
            <strong class="campaign-score__value">${example.from}${example.suffix || ""}</strong>
          </div>
          <span class="campaign-score__arrow" aria-hidden="true">→</span>
          <div class="campaign-score__endpoint campaign-score__endpoint--goal">
            <span class="campaign-score__label">Goal</span>
            <strong class="campaign-score__value">${example.to}${example.suffix || ""}</strong>
            <span class="campaign-score__gain">${example.gain}</span>
          </div>
        </div>
        <p class="campaign-score__note" id="score-improvement-note">*Illustrative example; improvement isn’t guaranteed.</p>`;
      var hero = document.querySelector(".campaign-hero");
      if (hero) hero.after(scoreSection);
    }
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
