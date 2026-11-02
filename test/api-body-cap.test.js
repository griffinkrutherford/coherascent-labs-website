'use strict';

/**
 * server.js caps /api/waitlist request bodies two ways: a 16 KB byte count
 * (413 beyond, counted against bytes actually received, never a declared
 * Content-Length) and a read timeout (408 beyond, default 10 s, overridable
 * via API_BODY_READ_TIMEOUT_MS for the slow-drip test below) for a body that
 * never finishes arriving at all. `body += chunk` had neither limit before,
 * so a single request could buffer an unbounded body or hold a connection
 * open indefinitely. This spawns the real server (no email provider
 * involved: every oversized/slow/normal body here is rejected or 500s
 * before server.js ever hands it to api/waitlist.js).
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

/**
 * A body sent a few bytes at a time, well under the 16 KB cap, never trips
 * MAX_API_BODY_BYTES and would otherwise hold the connection open
 * indefinitely. This runs its own short-lived server with
 * API_BODY_READ_TIMEOUT_MS set to a few hundred ms (server.js honours that
 * override only for this test; production never sets it, so it keeps the
 * real 10 s default) so the test does not need to actually wait 10 real
 * seconds to prove the timeout fires.
 */
test('a body dripped in slowly under the size cap is cut off by the read timeout', async () => {
  const dripPort = 39193;
  const dripTimeoutMs = 300;
  const dripServer = spawn('node', [SERVER], {
    env: { ...process.env, PORT: String(dripPort), RESEND_API_KEY: '', API_BODY_READ_TIMEOUT_MS: String(dripTimeoutMs) },
  });
  try {
    await waitForServer(dripServer);

    const result = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: 'localhost',
          port: dripPort,
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

      // Well under MAX_API_BODY_BYTES (16 KB) and never completed: the
      // open brace alone is valid JSON-in-progress, just never finished.
      req.write('{"email":"a@example.com"');
      // Dripped slower than the 300ms timeout, and the request is never
      // ended -- the only thing that can stop this is the read timeout.
      const dripInterval = setInterval(() => {
        try { req.write(' '); } catch (error) { /* socket already closed by the server */ }
      }, 100);
      req.on('close', () => clearInterval(dripInterval));
    });

    assert.equal(result.status, 408);
    assert.match(result.body, /too long/i);
  } finally {
    dripServer.kill();
  }
});
