#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentPath = path.join(root, "lune-synth", "campaign", "pages.json");
const pages = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const featureTopics = {
  "math": "mathematics",
  "sat": "SAT Math",
  "act": "ACT Math",
  "parent-math-help": "math confidence",
  "physics": "physics",
  "chemistry": "chemistry",
  "biology": "biology",
  "computer-science": "computer science",
  "engineering": "engineering",
  "statistics": "statistics",
  "economics": "economics",
  "psychology": "psychology",
  "history": "history",
  "psat": "PSAT preparation",
  "ap-exams": "AP exam preparation",
  "ged": "GED preparation",
  "gre": "GRE preparation",
  "parent-ai-homework": "independent homework",
  "parent-homework-help": "productive homework",
  "student-behind-math": "math recovery",
  "student-study-consistency": "consistent study",
  "homeschool": "your homeschool curriculum",
  "algebra": "algebra",
  "calculus": "calculus",
  "geometry": "geometry",
  "arithmetic": "arithmetic",
  "organic-chemistry": "organic chemistry",
  "anatomy-physiology": "anatomy and physiology",
  "nursing": "nursing",
  "accounting": "accounting",
  "finance": "finance",
  "writing": "writing",
  "mcat": "MCAT preparation",
  "phd-qualifying-exams": "PhD qualifying-exam preparation",
  "lsat": "LSAT reasoning",
  "gmat": "GMAT preparation",
  "usmle": "USMLE clinical reasoning",
  "ib-exams": "IB exam preparation",
  "state-assessments": "state assessment preparation",
  "parent-middle-school-math": "middle school math",
  "parent-high-school-math": "high school math",
  "college-study": "college study",
  "adult-learners": "returning to learning"
};

const mathWorldVariants = new Set([
  "math", "sat", "act", "parent-math-help", "physics", "computer-science", "engineering", "statistics",
  "psat", "ged", "gre", "parent-homework-help", "student-behind-math", "algebra", "calculus", "geometry",
  "arithmetic", "accounting", "finance", "phd-qualifying-exams", "gmat", "ib-exams", "state-assessments",
  "parent-middle-school-math", "parent-high-school-math"
]);

const jupiterWorldVariants = new Set([
  "chemistry", "biology", "organic-chemistry", "anatomy-physiology", "nursing", "mcat", "usmle", "ap-exams"
]);

const retroWorldVariants = new Set(["student-study-consistency", "adult-learners"]);

const defaultBenefits = {
  subject: [
    { number: "01", title: "Do the work", body: "Write, draw, calculate, recall, or explain so your reasoning stays visible." },
    { number: "02", title: "Get precise feedback", body: "Find the specific gap without replacing your attempt with a finished answer." },
    { number: "03", title: "Practice what is weak", body: "Turn the mistake into a short mission focused on the skill that needs repetition." }
  ],
  "test-prep": [
    { number: "01", title: "Make a real attempt", body: "Practice the decisions and reasoning you will need to produce on test day." },
    { number: "02", title: "Diagnose the miss", body: "Separate concept gaps from rushed work, misreads, and incomplete reasoning." },
    { number: "03", title: "Target the next set", body: "Use limited prep time on the patterns most likely to improve your next attempt." }
  ],
  parent: [
    { number: "01", title: "See the real attempt", body: "Visible work shows how your child approached the problem, not only where they landed." },
    { number: "02", title: "Protect their confidence", body: "Feedback preserves what worked and narrows attention to one manageable correction." },
    { number: "03", title: "Build independence", body: "A precise hint helps your child continue without handing the work to a person or machine." }
  ],
  student: [
    { number: "01", title: "Start small", body: "Turn an overwhelming goal into one clear attempt you can complete now." },
    { number: "02", title: "Know what to fix", body: "Replace vague frustration with feedback tied to the work you actually produced." },
    { number: "03", title: "Keep moving", body: "Build momentum through short targeted missions and visible progress." }
  ],
  family: [
    { number: "01", title: "Keep learning visible", body: "Capture handwritten work so reasoning remains part of the learning record." },
    { number: "02", title: "Add focused support", body: "Give students a precise next step without surrendering the curriculum or the teaching relationship." },
    { number: "03", title: "Practice with purpose", body: "Generate short missions around the skills that need reinforcement next." }
  ]
};

function normalizePage(page) {
  return Object.assign({
    benefits: defaultBenefits[page.family] || defaultBenefits.subject,
    contrastBefore: "Consume another finished answer",
    contrastAfter: "Produce an attempt and improve it",
    exampleKicker: "One attempt. One useful next step.",
    exampleHeadline: "Feedback that responds to the work.",
    attemptLabel: "Student attempt",
    clarifier: "Join for early access to Lune Synth."
  }, page);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function defaultWorldFor(page) {
  if (mathWorldVariants.has(page.variant)) return "math";
  if (jupiterWorldVariants.has(page.variant)) return "jupiter";
  if (retroWorldVariants.has(page.variant)) return "retro";
  return "earth";
}

function featureConfig(page) {
  const topic = featureTopics[page.variant] || page.eyebrow || "your study goal";
  const isParent = page.family === "parent" || page.family === "family";
  const quickHeadline = isParent
    ? `Turn today's ${topic} struggle into one manageable mission.`
    : `Turn one ${topic} gap into one clear mission.`;
  const quickBody = isParent
    ? `Lune Synth narrows the next few minutes to the specific skill visible in the learner's work. ${page.nextPractice}`
    : `Use the feedback from your latest attempt to focus the next few minutes on what actually needs practice. ${page.nextPractice}`;
  const constellationHeadline = isParent
    ? `See the path from today's work to lasting ${topic} confidence.`
    : `Turn ${topic} into a path you can see.`;
  const constellationBody = isParent
    ? `Constellations organize a larger learning goal into connected skills, so progress stays visible without reducing learning to a final score.`
    : `Build a visible roadmap from the skill in front of you to the larger goal, then move through focused missions, connected tests, and cumulative mastery.`;

  const overrides = page.featureSections || {};
  return {
    quickMissions: Object.assign({
      featureName: "quick-missions",
      variant: page.variant,
      sectionTitle: "Take One Quick Mission",
      eyebrow: `${topic} quick practice`,
      headline: quickHeadline,
      body: quickBody,
      skillChip: `One ${topic} skill`,
      mediaAlt: `A focused Quick Mission for ${topic} in Lune Synth`
    }, overrides.quickMissions || {}),
    constellations: Object.assign({
      featureName: "constellations",
      variant: page.variant,
      sectionTitle: "Turn a Big Study Goal Into a Constellation",
      eyebrow: `${topic} roadmap`,
      headline: constellationHeadline,
      body: constellationBody,
      topic,
      goal: page.closingHeadline || topic,
      defaultWorld: defaultWorldFor(page),
      mediaAlt: `A ${topic} learning Constellation in Lune Synth`
    }, overrides.constellations || {})
  };
}

function featureMarkup(page) {
  const config = featureConfig(page);
  return `
    <lune-quick-missions>
      <script type="application/json">${jsonForHtml(config.quickMissions)}</script>
    </lune-quick-missions>

    <lune-constellations>
      <script type="application/json">${jsonForHtml(config.constellations)}</script>
    </lune-constellations>`;
}

function benefitMarkup(benefits) {
  return benefits.map((benefit) => `
          <article class="benefit-card" data-reveal>
            <span class="benefit-card__number">${escapeHtml(benefit.number)}</span>
            <h3>${escapeHtml(benefit.title)}</h3>
            <p>${escapeHtml(benefit.body)}</p>
          </article>`).join("");
}

function render(page) {
  const canonical = `https://lunesynth.com${page.route}`;
  const ogImage = `https://lunesynth.com${page.phoneImageHigh}`;
  const disclaimer = page.disclaimer
    ? `<p class="campaign-footer__disclaimer">${escapeHtml(page.disclaimer)}</p>`
    : "";

  return `<!doctype html>
<html lang="en" data-theme="dark" data-campaign-family="${escapeHtml(page.family)}" data-campaign-variant="${escapeHtml(page.variant)}" data-campaign-audience="${escapeHtml(page.audience)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(page.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(page.metaTitle)}" />
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/png" href="/circle_favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Roboto+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
  <link rel="preload" href="${escapeHtml(page.phoneImage)}" as="image" />
  <link rel="stylesheet" href="/campaign/landing.css?v=5" />
  <link rel="stylesheet" href="/campaign/cta.css?v=1" />
  <link rel="stylesheet" href="/campaign/features.css?v=3" />
  <link rel="stylesheet" href="/campaign/offer-popup.css?v=1" />
  <script src="/campaign/cta-config.js?v=2" defer></script>
  <script src="/campaign/waitlist-fields.js?v=3" defer></script>
  <script src="/campaign/cta.js?v=2" defer></script>
  <script src="/campaign/features.js?v=3" defer></script>
  <script src="/campaign/landing.js?v=3" defer></script>
  <script src="/campaign/offer-popup.js?v=1" defer></script>
</head>
<body>
  <header class="campaign-header campaign-shell">
    <a class="campaign-brand" href="/" aria-label="Lune Synth home">
      <img src="/images/lune-synth-icon-120.png" alt="" width="46" height="46" />
      <span class="campaign-brand__copy">
        <strong>Lune Synth&trade;</strong>
        <span>The anti-slop learning app</span>
      </span>
    </a>
    <a class="campaign-header__cta" href="#join-beta">Join the beta</a>
  </header>

  <main class="campaign-main">
    <section class="campaign-hero campaign-shell" aria-labelledby="campaign-title">
      <div class="campaign-hero__copy" data-reveal>
        <p class="campaign-eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1 id="campaign-title">${escapeHtml(page.headline)}</h1>
        <p class="campaign-hero__body">${escapeHtml(page.heroBody)}</p>
        <div class="campaign-hero__cta" id="join-beta">
          <lune-synth-cta data-placement="hero" data-clarifier="${escapeHtml(page.clarifier)}">
            <noscript><p><a href="mailto:griffin@lunesynth.com?subject=Lune%20Synth%20beta">Join the Lune Synth beta waitlist</a></p></noscript>
          </lune-synth-cta>
        </div>
      </div>

      <div class="campaign-hero__visual" id="product-preview" data-reveal>
        <figure class="phone-mock">
          <div class="phone-mock__frame" data-phone-mock>
            <div class="phone-mock__screen">
              <picture>
                <source media="(min-width: 900px)" srcset="${escapeHtml(page.phoneImageHigh)}" />
                <img src="${escapeHtml(page.phoneImage)}" alt="${escapeHtml(page.phoneAlt)}" width="480" height="1043" decoding="async" />
              </picture>
            </div>
            <div class="phone-shell-buttons" aria-hidden="true">
              <span class="phone-shell-buttons__rail phone-shell-buttons__rail--left">
                <span class="phone-shell-button phone-shell-button--volume"></span>
                <span class="phone-shell-button phone-shell-button--volume phone-shell-button--volume-secondary"></span>
              </span>
              <span class="phone-shell-buttons__rail phone-shell-buttons__rail--right">
                <span class="phone-shell-button phone-shell-button--power"></span>
              </span>
            </div>
          </div>
          <figcaption class="phone-mock__label">${escapeHtml(page.phoneLabel)}</figcaption>
        </figure>
      </div>
    </section>

    <section class="campaign-section campaign-shell" aria-labelledby="problem-title">
      <div class="campaign-section__heading" data-reveal>
        <p class="section-kicker">${escapeHtml(page.problemKicker)}</p>
        <h2 id="problem-title">${escapeHtml(page.problemHeadline)}</h2>
        <p class="campaign-section__body">${escapeHtml(page.problemBody)}</p>
      </div>
      <div class="contrast" data-reveal aria-label="Study approach comparison">
        <div class="contrast__item">${escapeHtml(page.contrastBefore)}</div>
        <span class="contrast__arrow" aria-hidden="true">&rarr;</span>
        <div class="contrast__item contrast__item--better">${escapeHtml(page.contrastAfter)}</div>
      </div>
    </section>

    <section class="campaign-section campaign-shell" aria-labelledby="process-title">
      <div class="campaign-section__heading" data-reveal>
        <p class="section-kicker">The Lune Synth loop</p>
        <h2 id="process-title">The student thinks first. The technology helps second.</h2>
      </div>
      <div class="benefit-grid">${benefitMarkup(page.benefits)}
      </div>
    </section>

    <section class="campaign-section campaign-shell" aria-labelledby="feedback-title">
      <div class="campaign-section__heading" data-reveal>
        <p class="section-kicker">${escapeHtml(page.exampleKicker)}</p>
        <h2 id="feedback-title">${escapeHtml(page.exampleHeadline)}</h2>
      </div>
      <div class="feedback-panel">
        <article class="attempt-card" data-reveal>
          <span class="attempt-card__label">${escapeHtml(page.attemptLabel)}</span>
          <p>${escapeHtml(page.attempt)}</p>
        </article>
        <div class="feedback-flow" data-reveal>
          <div class="feedback-step">
            <span>What grading notices</span>
            <p>${escapeHtml(page.observation)}</p>
          </div>
          <div class="feedback-step">
            <span>Luna's hint</span>
            <p>${escapeHtml(page.hint)}</p>
          </div>
          <div class="feedback-step">
            <span>Targeted next practice</span>
            <p>${escapeHtml(page.nextPractice)}</p>
          </div>
        </div>
      </div>
    </section>

${featureMarkup(page)}

    <section class="campaign-final campaign-shell" aria-labelledby="final-title">
      <div class="campaign-final__copy" data-reveal>
        <h2 id="final-title">${escapeHtml(page.closingHeadline)}</h2>
        <p>${escapeHtml(page.closingBody)}</p>
      </div>
      <lune-synth-cta data-placement="footer" data-clarifier="${escapeHtml(page.clarifier)}">
        <noscript><p><a href="mailto:griffin@lunesynth.com?subject=Lune%20Synth%20beta">Join the Lune Synth beta waitlist</a></p></noscript>
      </lune-synth-cta>
    </section>
  </main>

  <lune-site-footer id="site-footer">
${disclaimer ? `    <span data-footer-note>${disclaimer.replace(/^<p class="campaign-footer__disclaimer">|<\/p>$/g, "")}</span>\n` : ""}  </lune-site-footer>
</body>
</html>
`;
}

for (const sourcePage of pages) {
  const page = normalizePage(sourcePage);
  const outputPath = path.join(root, page.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, render(page));
  console.log(`Generated ${path.relative(root, outputPath)}`);
}
