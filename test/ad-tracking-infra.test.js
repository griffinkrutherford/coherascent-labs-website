'use strict';

/**
 * Integration coverage for the 2026-11-05 ad-tracking infrastructure's
 * server-side pieces: the /campaign/tracking-config.json endpoint (must stay
 * dormant -- every tracker null -- with no env vars set, and report a Meta
 * Pixel ID once META_PIXEL_ID is set) and the CSP diff (Meta's two domains
 * added, nothing else loosened).
 *
 * Runs server.js as a real child process, same pattern as
 * test/server-routes.test.js, so this exercises the actual HTTP response
 * rather than re-deriving it from source.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');

const SERVER = path.join(__dirname, '..', 'server.js');
// 39190+: distinct from every other test file's fixed port (server-routes
// uses 39182, static-allowlist 39183, api-body-cap 39184); this file spins
// up three server processes on consecutive ports.
const PORT = 39190;

function get(pathname, host, extraEnvServer) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: extraEnvServer || PORT, path: pathname, headers: { Host: host } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
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

function spawnServer(port, env) {
  return spawn('node', [SERVER], { env: { ...process.env, PORT: String(port), ...env } });
}

let plainServer;
const PLAIN_PORT = PORT;

let configuredServer;
const CONFIGURED_PORT = PORT + 1;

test.before(async () => {
  // Explicitly unset, in case the ambient shell has these -- this suite
  // asserts the dormant-by-default behaviour.
  plainServer = spawnServer(PLAIN_PORT, { META_PIXEL_ID: '', META_CAPI_ACCESS_TOKEN: '' });
  configuredServer = spawnServer(CONFIGURED_PORT, { META_PIXEL_ID: '000000000000000' });
  await Promise.all([waitForServer(plainServer), waitForServer(configuredServer)]);
});

test.after(() => {
  if (plainServer) plainServer.kill();
  if (configuredServer) configuredServer.kill();
});

test('tracking-config.json is fully dormant with no env vars set', async () => {
  const { status, headers, body } = await get('/campaign/tracking-config.json', 'lunesynth.com', PLAIN_PORT);
  assert.equal(status, 200);
  assert.match(headers['content-type'], /application\/json/);
  assert.equal(headers['cache-control'], 'no-store');
  const config = JSON.parse(body);
  assert.deepEqual(config, { meta: null, google: null, tiktok: null });
});

test('tracking-config.json reports the configured Meta Pixel ID and nothing else', async () => {
  const { status, body } = await get('/campaign/tracking-config.json', 'lunesynth.com', CONFIGURED_PORT);
  assert.equal(status, 200);
  const config = JSON.parse(body);
  assert.deepEqual(config, { meta: { pixelId: '000000000000000' }, google: null, tiktok: null });
  // The access token must never be exposed to the client.
  assert.ok(!body.includes('META_CAPI_ACCESS_TOKEN'));
});

test('tracking-config.json never exposes a server access token even if one is set', async () => {
  const withToken = spawnServer(PORT + 2, { META_PIXEL_ID: '42', META_CAPI_ACCESS_TOKEN: 'super-secret-token' });
  await waitForServer(withToken);
  try {
    const { body } = await get('/campaign/tracking-config.json', 'lunesynth.com', PORT + 2);
    assert.ok(!body.includes('super-secret-token'));
    assert.deepEqual(JSON.parse(body), { meta: { pixelId: '42' }, google: null, tiktok: null });
  } finally {
    withToken.kill();
  }
});

test('tracking-config.json rejects non-GET methods the same as any other route would', async () => {
  const result = await new Promise((resolve, reject) => {
    const req = http.request(
      { host: 'localhost', port: PLAIN_PORT, path: '/campaign/tracking-config.json', method: 'POST', headers: { Host: 'lunesynth.com' } },
      (res) => { res.on('data', () => {}); res.on('end', () => resolve({ status: res.statusCode })); }
    );
    req.on('error', reject);
    req.end();
  });
  // POST is not "GET-like"; the route falls through to normal static
  // handling, which 404s rather than returning the JSON config.
  assert.equal(result.status, 404);
});

test('CSP report-only header adds exactly the two Meta domains the ad-tracking infra needs, and loosens nothing else', async () => {
  const { headers } = await get('/', 'lunesynth.com', PLAIN_PORT);
  const csp = headers['content-security-policy-report-only'];
  assert.ok(csp, 'expected a Content-Security-Policy-Report-Only header');

  const directives = csp.split('; ').reduce((acc, clause) => {
    const [name, ...values] = clause.split(' ');
    acc[name] = values;
    return acc;
  }, {});

  assert.deepEqual(directives['default-src'], ["'self'"]);
  assert.deepEqual(directives['script-src'], ["'self'", "'unsafe-inline'", 'https://connect.facebook.net']);
  assert.deepEqual(directives['style-src'], ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']);
  assert.deepEqual(directives['font-src'], ["'self'", 'https://fonts.gstatic.com']);
  assert.deepEqual(directives['img-src'], ["'self'", 'data:', 'https://images.unsplash.com', 'https://www.facebook.com']);
  assert.deepEqual(directives['media-src'], ["'self'"]);
  assert.deepEqual(directives['connect-src'], [
    "'self'",
    'https://api.resend.com',
    'https://coherascent-labs-app-production.up.railway.app',
    'https://www.facebook.com',
  ]);
  assert.deepEqual(directives['frame-ancestors'], ["'none'"]);
  assert.deepEqual(directives['base-uri'], ["'self'"]);
  assert.deepEqual(directives['form-action'], ["'self'"]);

  // Still report-only, not enforced -- this infrastructure must not change
  // that without a dedicated, deliberate decision.
  assert.ok(!headers['content-security-policy']);
});

test('CSP header is identical whether or not a Pixel is configured (the policy itself is not dormant/active, only what loads)', async () => {
  const [plain, configured] = await Promise.all([
    get('/', 'lunesynth.com', PLAIN_PORT),
    get('/', 'lunesynth.com', CONFIGURED_PORT),
  ]);
  assert.equal(
    plain.headers['content-security-policy-report-only'],
    configured.headers['content-security-policy-report-only']
  );
});
