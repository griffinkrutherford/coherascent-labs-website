#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const contentPath = path.join(root, "lune-synth", "campaign", "pages.json");
const pages = JSON.parse(fs.readFileSync(contentPath, "utf8"));

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  <link rel="stylesheet" href="/campaign/landing.css?v=2" />
  <link rel="stylesheet" href="/campaign/cta.css?v=1" />
  <script src="/campaign/cta-config.js?v=1" defer></script>
  <script src="/campaign/cta.js?v=1" defer></script>
  <script src="/campaign/landing.js?v=1" defer></script>
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

  <footer class="campaign-footer campaign-shell">
    <span>&copy; <span data-current-year>2026</span> Coherascent Labs LLC</span>
    <nav aria-label="Footer">
      <a href="/">Lune Synth</a>
      <a href="/blog/">Blog</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="mailto:griffin@lunesynth.com">Contact</a>
    </nav>
${disclaimer ? `    ${disclaimer}\n` : ""}  </footer>
</body>
</html>
`;
}

for (const page of pages) {
  const outputPath = path.join(root, page.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, render(page));
  console.log(`Generated ${path.relative(root, outputPath)}`);
}
