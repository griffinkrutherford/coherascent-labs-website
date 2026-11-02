'use strict';

/**
 * server.js caps /api/waitlist request bodies at 16 KB (413 beyond) --
 * `body += chunk` had no limit before, so a single request could buffer an
 * unbounded body in memory. This spawns the real server (no email provider
 * involved: the oversized body is rejected before server.js even hands the
 * request to api/waitlist.js) and posts a body over and under the cap.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const http = require('node:http');

const SERVER = path.join(__dirname, '..', 'server.js');
const PORT = 39184; // fixed, unlikely-to-collide port for this test file only

function post(body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: 'localhost',
        port: PORT,
        path: '/api/waitlist',
        method: 'POST',
        headers: { Host: 'lunesynth.com', 'Content-Type': 'application/json', Connection: 'close' },
        agent: false,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.end(body);
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
  // No RESEND_API_KEY: a body small enough to pass the cap still 500s
  // (missing config) rather than reaching Resend, which is fine -- this
  // only asserts the cap itself, not the downstream signup flow.
  server = spawn('node', [SERVER], { env: { ...process.env, PORT: String(PORT), RESEND_API_KEY: '' } });
  await waitForServer(server);
});

test.after(() => {
  if (server) server.kill();
});

test('a request body over 16 KB is rejected with 413', async () => {
  const oversized = JSON.stringify({ email: 'a@example.com', filler: 'x'.repeat(20 * 1024) });
  const { status, body } = await post(oversized);
  assert.equal(status, 413);
  assert.match(body, /too large/i);
});

test('a normal-sized body is not affected by the cap', async () => {
  const normal = JSON.stringify({ email: 'a@example.com', platform: 'ios' });
  const { status } = await post(normal);
  // No RESEND_API_KEY in this process, so the handler 500s past validation --
  // the point here is just that it is NOT 413.
  assert.notEqual(status, 413);
});
