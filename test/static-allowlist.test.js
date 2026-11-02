'use strict';

/**
 * server.js serves static files through an explicit allowlist (see
 * isAllowedPublicPath in server.js). This test is the safety net for that
 * allowlist in both directions:
 *
 *   1. Every root-relative asset reference (src/href/poster/srcset) found by
 *      grepping every *.html file in the repo must still resolve 200 through
 *      the running server -- the allowlist must not have missed anything the
 *      live site actually uses.
 *   2. A fixed set of paths that must never be public (server.js itself, the
 *      api/ handlers, repo docs, dotfiles, build artifacts, package.json,
 *      LaTeX output, unreferenced draft pages) must 404.
 *
 * Only root-relative ("/foo") references are crawled automatically; they are
 * the overwhelming majority (the whole lune-synth/* site uses them
 * exclusively) and, unlike a handful of page-relative ones, resolve to a
 * request path without needing to know which host rewrote the URL. The small
 * number of page-relative references left in the repo are asserted directly
 * below instead.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.join(__dirname, '..');
const SERVER = path.join(ROOT, 'server.js');
const PORT = 39183; // fixed, unlikely-to-collide port for this test file only
const EXCLUDE_DIRS = new Set(['.git', 'node_modules']);

function get(pathname, host = 'lunesynth.com') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: 'localhost', port: PORT, path: pathname, headers: { Host: host } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function waitForServer(proc, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start in time')), timeoutMs);
    proc.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('running on port')) {
        clearTimeout(timer);
        resolve();
      }
    });
    proc.once('error', (error) => { clearTimeout(timer); reject(error); });
  });
}

// Only the subtrees server.js's allowlist actually serves publicly. Crawling
// the whole repo would also pick up vendor/liquid-glass-main's demo pages,
// docs/, etc. -- dev material this hardening pass deliberately did not put
// on the public allowlist, so their references are expected to 404 and
// asserting otherwise would defeat the point of the test.
const CRAWL_ROOT_DIRS = ['lune-synth', 'applied', 'research'];
const CRAWL_ROOT_FILES = ['index.html', 'applied.html', 'research.html'];

function walkHtmlFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
}

const EXTERNAL_SCHEME = /^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i;

function stripQueryAndFragment(ref) {
  return ref.split('#')[0].split('?')[0];
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/** Pulls every src/href/poster value plus every URL inside a srcset list. */
function extractRootRelativeRefs(rawHtml) {
  const html = stripHtmlComments(rawHtml);
  const refs = new Set();
  const attrRe = /\b(?:src|href|poster|data-src|data-poster)\s*=\s*["']([^"']+)["']/gi;
  const srcsetRe = /\bsrcset\s*=\s*["']([^"']+)["']/gi;

  let m;
  while ((m = attrRe.exec(html))) {
    const ref = stripQueryAndFragment(m[1].trim());
    if (ref.startsWith('/') && !EXTERNAL_SCHEME.test(m[1].trim())) refs.add(ref);
  }
  while ((m = srcsetRe.exec(html))) {
    for (const candidate of m[1].split(',')) {
      const url = stripQueryAndFragment(candidate.trim().split(/\s+/)[0] || '');
      if (url.startsWith('/') && !EXTERNAL_SCHEME.test(url)) refs.add(url);
    }
  }
  return refs;
}

function collectAllRefs() {
  const htmlFiles = [];
  for (const name of CRAWL_ROOT_FILES) {
    const full = path.join(ROOT, name);
    if (fs.existsSync(full)) htmlFiles.push(full);
  }
  for (const dirName of CRAWL_ROOT_DIRS) {
    const dir = path.join(ROOT, dirName);
    if (fs.existsSync(dir)) walkHtmlFiles(dir, htmlFiles);
  }
  const refs = new Set();
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    for (const ref of extractRootRelativeRefs(html)) refs.add(ref);
  }
  return [...refs].sort();
}

/**
 * GETs a path and, if the server redirects, follows exactly one hop (enough
 * for every redirect server.js issues: retired pages and cross-domain
 * canonicalization are both single-hop). A redirect to another of this
 * site's own hosts switches the Host header so the follow-up request lands
 * on the right virtual host, matching what a browser would do.
 */
async function getFollowingOneRedirect(pathname, host) {
  const first = await get(pathname, host);
  if (first.status !== 301 && first.status !== 302) return first;

  const location = first.headers.location || '';
  let nextHost = host;
  let nextPath = location;
  try {
    const url = new URL(location, `https://${host}`);
    nextHost = url.hostname;
    nextPath = `${url.pathname}${url.search}`;
  } catch (error) {
    // Location was already a bare path; nextPath/nextHost stand as set above.
  }
  return get(nextPath, nextHost);
}

let server;

test.before(async () => {
  server = spawn('node', [SERVER], { env: { ...process.env, PORT: String(PORT), RESEND_API_KEY: 're_test_stub' } });
  await waitForServer(server);
});

test.after(() => {
  if (server) server.kill();
});

test('every root-relative asset reference in every *.html file resolves 200', async () => {
  const refs = collectAllRefs();
  assert.ok(refs.length > 100, `expected to find the site's many asset references, found ${refs.length}`);

  const failures = [];
  for (const ref of refs) {
    // Every crawled reference is checked from both hosts and passes if
    // either lands on 200 (directly, or after the one redirect server.js
    // issues for a retired page or cross-domain canonical link) -- a
    // reference's "home" host is not tracked by the crawl, so this is the
    // same check a browser following the link from either domain would get.
    const fromLune = await getFollowingOneRedirect(ref, 'lunesynth.com');
    if (fromLune.status === 200) continue;
    const fromPrimary = await getFollowingOneRedirect(ref, 'coherascentlabs.com');
    if (fromPrimary.status === 200) continue;
    failures.push(`${ref} -> lune:${fromLune.status} primary:${fromPrimary.status}`);
  }

  assert.deepEqual(failures, [], `these referenced paths did not resolve 200 through the allowlist:\n${failures.join('\n')}`);
});

// The small set of page-relative references left in the repo, asserted by
// hand since they do not round-trip through the generic root-relative crawl.
test('the handful of page-relative references still resolve', async () => {
  // index.html (coherascentlabs.com) -> liquid-glass-cards.js, circle_favicon.png, logo webp
  for (const ref of ['/liquid-glass-cards.js', '/liquid-glass-cards.css', '/circle_favicon.png',
    '/coherascent-labs-logo-march-16-2026.webp', '/coherascent-labs-streamlined-light-2.webp']) {
    const { status } = await get(ref, 'coherascentlabs.com');
    assert.equal(status, 200, `${ref} on coherascentlabs.com`);
  }

  // research/index.html's "../x" references clamp to the same root files.
  for (const ref of ['/research/', '/images/bridge-equations.png', '/images/dpll.png',
    '/images/deterministic-probabilistic-automaton.png', '/images/gradient-optimization.png']) {
    const { status } = await get(ref, 'coherascentlabs.com');
    assert.equal(status, 200, `${ref} on coherascentlabs.com`);
  }

  // lune-synth/index.html's "../x" references (its "./lune-engine/index.js"
  // script tag is HTML-commented out -- DISABLED -- so it is not live).
  for (const ref of ['/applied-handwriting-demo.js', '/applied-response-slideshow.js']) {
    const { status } = await get(ref, 'lunesynth.com');
    assert.equal(status, 200, `${ref} on lunesynth.com`);
  }
});

test('the homepage and key top-level routes still resolve 200', async () => {
  for (const ref of ['/', '/about/', '/blog/', '/privacy/', '/terms/', '/support/', '/delete-account/']) {
    const { status } = await get(ref, 'lunesynth.com');
    assert.equal(status, 200, `${ref} on lunesynth.com`);
  }
  // On the primary host these two redirect to lunesynth.com (pre-existing
  // behaviour, not part of the allowlist); research.html is the one that
  // actually serves from coherascentlabs.com.
  for (const ref of ['/applied.html']) {
    const { status } = await get(ref, 'coherascentlabs.com');
    assert.equal(status, 301, `${ref} on coherascentlabs.com should redirect to lunesynth.com`);
  }
  for (const ref of ['/', '/research.html']) {
    const { status } = await get(ref, 'coherascentlabs.com');
    assert.equal(status, 200, `${ref} on coherascentlabs.com`);
  }
});

test('sensitive repo files are not publicly reachable', async () => {
  const sensitivePaths = [
    '/server.js',
    '/AGENTS.md',
    '/CLAUDE.md',
    '/README.md',
    '/package.json',
    '/api/waitlist.js',
    '/api/waitlist-confirmation.js',
    '/api/unsubscribe.js',
    '/api/access-email.js',
    '/mobile-app-plan.md',
    '/tmp/gtm/00-strategy.md',
    '/.vscode/settings.json',
    '/.gitignore',
    '/.git/config',
    '/docs/',
    '/docs/store-assets/og-card-source.html',
    '/scripts/',
    '/scripts/waitlist-send-access.js',
    '/test/server-routes.test.js',
    '/bridging-equation.tex',
    '/bridging-equation.pdf',
    '/bridging-equation.log',
    '/disable-and-push-engine.sh',
    '/vendor/liquid-glass-main/index.html',
    '/index-vibe.html',
    '/stars-banner.html',
    '/mobile-app-assets/README.md',
    '/lune-synth/lune-synth-landing-medals/README.md',
    '/lune-synth/lune-synth-landing-medals/manifest.json',
    '/lune-synth/lune-synth-landing-medals/export-medals.mjs',
    '/lune-synth/screenshots/applied/README.md',
    '/output/imagegen/blog-art-prompts.md',
  ];

  const unexpected = [];
  for (const p of sensitivePaths) {
    const { status } = await get(p, 'lunesynth.com');
    if (status !== 404) unexpected.push(`${p} -> ${status} (expected 404)`);
    const { status: primaryStatus } = await get(p, 'coherascentlabs.com');
    if (primaryStatus !== 404) unexpected.push(`${p} on coherascentlabs.com -> ${primaryStatus} (expected 404)`);
  }

  assert.deepEqual(unexpected, [], `these sensitive paths were reachable:\n${unexpected.join('\n')}`);
});

test('path traversal through an allowed directory cannot reach a denied file', async () => {
  const attempts = [
    '/lune-synth/../server.js',
    '/lune-synth/..%2fserver.js',
    '/lune-synth/%2e%2e/server.js',
    '/images/../server.js',
    '/images/../api/waitlist.js',
  ];
  for (const attempt of attempts) {
    const { status } = await get(attempt, 'lunesynth.com');
    assert.notEqual(status, 200, `${attempt} must not reach a denied file`);
  }
});

test('security headers are present on every response, including 404s', async () => {
  const { headers, status } = await get('/', 'lunesynth.com');
  assert.equal(status, 200);
  assert.equal(headers['strict-transport-security'], 'max-age=31536000; includeSubDomains');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.ok(headers['permissions-policy']);
  assert.ok(headers['content-security-policy-report-only']);

  const notFound = await get('/server.js', 'lunesynth.com');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.headers['x-frame-options'], 'DENY');
});
