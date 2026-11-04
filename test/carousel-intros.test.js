const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const intros = require('../applied-carousel-intros.js');

const ROOT = path.join(__dirname, '..');
const PROMPTS = path.join(ROOT, 'mobile-app-assets/screenshots/applied/question-prompts');

function carouselImages() {
  // Every slide in the final carousel: the static HTML slides plus the pool
  // applied-response-slides.js injects.
  const html = fs.readFileSync(path.join(ROOT, 'lune-synth/index.html'), 'utf8');
  const start = html.indexOf('<div class="response-carousel__deck" data-response-slideshow');
  const section = html.slice(start, html.indexOf('class="response-carousel__controls', start));
  const staticImages = [...section.matchAll(/data-screenshot-src="[^"]*question-prompts\/(?:carousel-v7\/)?([^/?"]+?)-mid\.webp/g)].map((m) => m[1]);
  const slidesJs = fs.readFileSync(path.join(ROOT, 'applied-response-slides.js'), 'utf8');
  const pool = [...slidesJs.matchAll(/image: "([^"]+)"/g)].map((m) => m[1]);
  return { staticImages, pool };
}

test('every carousel slide image has an intro clip in the manifest', () => {
  const { staticImages, pool } = carouselImages();
  assert.equal(staticImages.length, 14);
  assert.ok(pool.length >= 16);
  for (const image of [...staticImages, ...pool]) {
    assert.ok(intros.has(image), `${image} has no intro clip`);
  }
});

test('every manifest entry has its clip, poster and stills on disk', () => {
  for (const [image, ms] of Object.entries(intros.INTRO_MS)) {
    assert.ok(ms >= 2000 && ms <= 3600, `${image}: ${ms} ms`);
    for (const suffix of ['-intro.mp4', '-intro-poster.webp', '.webp', '-mid.webp', '-low.webp']) {
      const file = path.join(PROMPTS, 'carousel-v7', image + suffix);
      assert.ok(fs.existsSync(file), `missing ${path.relative(ROOT, file)}`);
    }
    const clip = fs.statSync(path.join(PROMPTS, 'carousel-v7', image + '-intro.mp4')).size;
    assert.ok(clip < 600 * 1024, `${image}-intro.mp4 is ${clip} bytes`);
  }
});

test('image names come from both v6 and v7 screenshot paths', () => {
  const base = '../mobile-app-assets/screenshots/applied/question-prompts/';
  assert.equal(intros.imageFromSrc(base + '19-stats-mid.webp?v=6'), '19-stats');
  assert.equal(intros.imageFromSrc(base + 'carousel-v7/19-stats-mid.webp?v=7'), '19-stats');
  assert.equal(intros.imageFromSrc(base + 'study-cs-code-trace-mid.webp'), 'study-cs-code-trace');
  assert.equal(intros.imageFromSrc('/images/other.webp'), '');
  assert.equal(intros.baseFromSrc(base + '5b-toc-mid.webp?v=6'), base);
});

test('assets derive from the image name, versioned, and unknown images get none', () => {
  const base = '../mobile-app-assets/screenshots/applied/question-prompts/';
  const assets = intros.assetsFor('es-preterite', base);
  assert.deepEqual(assets, {
    image: 'es-preterite',
    ms: intros.INTRO_MS['es-preterite'],
    video: base + 'carousel-v7/es-preterite-intro.mp4?v=7',
    poster: base + 'carousel-v7/es-preterite-intro-poster.webp?v=7',
    still: base + 'carousel-v7/es-preterite-mid.webp?v=7',
    high: base + 'carousel-v7/es-preterite.webp?v=7',
    low: base + 'carousel-v7/es-preterite-low.webp?v=7',
  });
  assert.equal(intros.assetsFor('no-such-image', base), null);
});

test('applyToHost rewrites a v6 host to its v7 still and intro, idempotently', () => {
  const attrs = new Map([['data-screenshot-src', '../mobile-app-assets/screenshots/applied/question-prompts/14-mid.webp?v=6']]);
  const host = { getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null), setAttribute: (k, v) => attrs.set(k, v) };
  assert.ok(intros.applyToHost(host));
  assert.equal(attrs.get('data-screenshot-src'), '../mobile-app-assets/screenshots/applied/question-prompts/carousel-v7/14-mid.webp?v=7');
  assert.equal(attrs.get('data-intro-video'), '../mobile-app-assets/screenshots/applied/question-prompts/carousel-v7/14-intro.mp4?v=7');
  assert.equal(attrs.get('data-intro-ms'), String(intros.INTRO_MS['14']));
  const before = new Map(attrs);
  intros.applyToHost(host);
  assert.deepEqual(attrs, before);
  const plain = { getAttribute: () => '/images/x.webp', setAttribute: () => assert.fail('should not write') };
  assert.equal(intros.applyToHost(plain), null);
});

test('the carousel ORDER parser accepts v7 paths (slide 0 stays the calculus slide)', () => {
  const slidesJs = fs.readFileSync(path.join(ROOT, 'applied-response-slides.js'), 'utf8');
  assert.match(slidesJs, /question-prompts\\\/\(\?:carousel-v7\\\/\)\?/);
});
