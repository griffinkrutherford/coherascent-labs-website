'use strict';

/**
 * Covers the script's actual CLI entry point (require.main === module), not
 * just the pure functions test/export-offer-roster.test.js already covers.
 * All of these must fail loudly and read-only -- none should ever reach the
 * network.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'export-offer-roster.js');

function run(args, env) {
  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return { status: error.status, stdout: error.stdout || '', stderr: error.stderr || '' };
  }
}

test('exits 1 with a clear message when RESEND_API_KEY is missing', () => {
  const { status, stderr } = run([], { RESEND_API_KEY: '' });
  assert.equal(status, 1);
  assert.match(stderr, /RESEND_API_KEY is not set/);
});

test('exits 1 on an unknown --tier value without ever needing an API key', () => {
  const { status, stderr } = run(['--tier=bogus'], { RESEND_API_KEY: '' });
  assert.equal(status, 1);
  assert.match(stderr, /Unknown --tier value "bogus"/);
});

test('exits 1 on an unknown --format value without ever needing an API key', () => {
  const { status, stderr } = run(['--format=xml'], { RESEND_API_KEY: '' });
  assert.equal(status, 1);
  assert.match(stderr, /Unknown --format value "xml"/);
});

test('exits 1 on an --email value that is not an email address, without needing an API key', () => {
  const { status, stderr } = run(['--email=not-an-email'], { RESEND_API_KEY: '' });
  assert.equal(status, 1);
  assert.match(stderr, /doesn't look like an email address/);
});

test('validates flags before checking for an API key, so a typo never triggers a network call', () => {
  // If flag validation happened after the API-key check, a good key with a
  // bad --tier would still make the (potentially large) contacts/properties
  // fetch before failing. Order matters for a read-only script meant to be
  // run quickly and often.
  const { status: withKeyStatus, stderr: withKeyStderr } = run(['--tier=bogus'], { RESEND_API_KEY: 're_fake_unused' });
  assert.equal(withKeyStatus, 1);
  assert.match(withKeyStderr, /Unknown --tier value "bogus"/);
});
