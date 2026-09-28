'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');

const SERVER = path.join(__dirname, '..', 'server.js');
const PORT = 39182; // fixed, unlikely-to-collide port for this test file only

/**
 * fetch() refuses to let a caller set the Host header (it's on the Fetch
 * spec's forbidden-header list), which is exactly what's needed here --
 * server.js routes lunesynth.com content only when Host matches, the same
 * way the house rule's own curl -H 'Host: lunesynth.com' example works. Raw
 * http.request has no such restriction.
 */
function get(pathname, host) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: PORT, path: pathname, headers: { Host: host } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
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

let server;

test.before(async () => {
  server = spawn('node', [SERVER], { env: { ...process.env, PORT: String(PORT) } });
  await waitForServer(server);
});

test.after(() => {
  if (server) server.kill();
});

test('GET /pro/ on the lunesynth.com host serves the Pro page', async () => {
  const { status, body } = await get('/pro/', 'lunesynth.com');
  assert.equal(status, 200);
  assert.match(body, /<title>Lune Synth Pro/);
});

test('GET /pro (no trailing slash) also serves the Pro page', async () => {
  const { status } = await get('/pro', 'lunesynth.com');
  assert.equal(status, 200);
});

test('/pro/ is not served on a host other than lunesynth.com (matches /about, /support)', async () => {
  const { status } = await get('/pro/', 'coherascentlabs.com');
  assert.equal(status, 404);
});

test('the shared footer script links to /pro/', async () => {
  const { status, body } = await get('/campaign/site-footer.js', 'lunesynth.com');
  assert.equal(status, 200);
  assert.match(body, /href="\/pro\/">Pro<\/a>/);
});

test('the homepage hero links to /pro/ next to the store badges', async () => {
  const { status, body } = await get('/', 'lunesynth.com');
  assert.equal(status, 200);
  assert.match(body, /href="\/pro\/">See what Lune Synth Pro will include/);
});

test("the Pro page's legal.css contains the new benefit/price/badge styling", async () => {
  const { status, body } = await get('/lune-synth/legal.css', 'lunesynth.com');
  assert.equal(status, 200);
  assert.match(body, /\.pro-benefits/);
  assert.match(body, /\.pro-price/);
  assert.match(body, /\.pro-status-badge/);
});
