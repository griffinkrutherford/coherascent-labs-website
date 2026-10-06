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
    // These are illustrative goals, not measured product outcomes.
    // Each linked source defines the official scale used for that example.
    var scoreExamples = {
      sat: { from: 1180, to: 1400, gain: "+220 points", scope: "SAT total · 400–1600 scale", source: "https://satsuite.collegeboard.org/scores/what-scores-mean", color: "#64a8ff" },
      act: { from: 22, to: 28, gain: "+6 points", scope: "ACT composite · 1–36 scale", source: "https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html", color: "#b89aff" },
      psat: { from: 1020, to: 1260, gain: "+240 points", scope: "PSAT/NMSQT total · 320–1520 scale", source: "https://satsuite.collegeboard.org/scores/what-scores-mean", color: "#6de1ef" },
      "ap-exams": { from: 2, to: 4, gain: "+2 score levels", scope: "AP Calculus AB · 1–5 scale", source: "https://apstudents.collegeboard.org/about-ap-scores", color: "#ffd27d" },
      ged: { from: 148, to: 165, gain: "+17 points", scope: "GED Math · 100–200 scale", source: "https://api.ged.com/score_scale/", color: "#7ee4b6" },
      gre: { from: 145, to: 160, gain: "+15 points", scope: "GRE Quantitative · 130–170 scale", source: "https://www.ets.org/content/ets-org/ca/en/gre/test-takers/general-test/scores/get-scores.html", color: "#bf9dff" },
      lsat: { from: 151, to: 163, gain: "+12 points", scope: "LSAT score · 120–180 scale", source: "https://www.lsac.org/lsat/lsat-scoring", color: "#f1ce8e" },
      mcat: { from: 498, to: 512, gain: "+14 points", scope: "MCAT total · 472–528 scale", source: "https://students-residents.aamc.org/mcat-scores/mcat-exam-score-scale", color: "#ff99bd" },
      gmat: { from: 555, to: 655, gain: "+100 points", scope: "GMAT total · 205–805 scale", source: "https://www.mba.com/exams/gmat-exam/scores", color: "#a7e5a1" },
      usmle: { from: 220, to: 245, gain: "+25 points", scope: "USMLE Step 2 CK · three-digit score", source: "https://www.usmle.org/scores-transcripts/examination-results-and-scoring", color: "#78dbdf" },
      "ib-exams": { from: 4, to: 6, gain: "+2 grades", scope: "IB Mathematics AA · subject grade, 1–7", source: "https://ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/", color: "#a5b0ff" },
      "state-assessments": { from: 60, to: 85, suffix: "%", gain: "+25 percentage points", scope: "Practice-set accuracy · state scoring varies", color: "#81c4fa" },
      "phd-qualifying-exams": { from: 55, to: 85, suffix: "%", gain: "+30 percentage points", scope: "Practice-set accuracy · program grading varies", color: "#efb98c" }
    };
    var scoreVariant = document.documentElement.dataset.campaignVariant || "test";
    var scoreName = scoreNames[scoreVariant] || "test";
    var example = scoreExamples[scoreVariant];
    var exampleMarkup = example ? `
      <div class="campaign-score__example" data-reveal style="--score-accent: ${example.color}">
        <p class="campaign-score__example-kicker">Illustrative score jump</p>
        <div class="campaign-score__jump">
          <div class="campaign-score__endpoint">
            <span class="campaign-score__label">Example start</span>
            <strong class="campaign-score__value">${example.from}${example.suffix || ""}</strong>
          </div>
          <span class="campaign-score__arrow" aria-hidden="true">→</span>
          <div class="campaign-score__endpoint campaign-score__endpoint--goal">
            <span class="campaign-score__label">Example goal</span>
            <strong class="campaign-score__value">${example.to}${example.suffix || ""}</strong>
            <span class="campaign-score__gain">${example.gain}</span>
          </div>
        </div>
        <div class="campaign-score__example-meta">
          <span>${example.scope}</span>
          ${example.source ? `<a href="${example.source}" target="_blank" rel="noopener noreferrer">Official scoring ↗</a>` : ""}
        </div>
        <p class="campaign-score__example-note">Illustrative targets, not measured Lune Synth results.</p>
      </div>` : "";
    var scoreSection = document.createElement("section");
    scoreSection.className = "campaign-score campaign-shell";
    scoreSection.setAttribute("aria-labelledby", "score-improvement-title");
    scoreSection.innerHTML = `
      <div class="campaign-score__copy" data-reveal>
        <p class="section-kicker">Study for score improvement</p>
        <h2 id="score-improvement-title">Make your next ${scoreName} attempt count.</h2>
        <p>Find the gap, practice the skill, aim higher.</p>
      </div>
      ${exampleMarkup}
      <div class="campaign-score__path" data-reveal aria-label="Score improvement study loop">
        <div><strong>Find the miss</strong><span>The exact skill behind the gap</span></div>
        <div><strong>Practice the fix</strong><span>A focused mission for that skill</span></div>
        <div><strong>Try it again</strong><span>A fresh attempt under timed conditions</span></div>
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
