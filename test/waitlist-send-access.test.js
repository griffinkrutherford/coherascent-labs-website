'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'waitlist-send-access.js');

test('--help-preview shows Founding 40 wording only for the Founding 40 example, never "first hundred"', () => {
  const output = execFileSync('node', [
    SCRIPT,
    '--help-preview',
    '--testflight-url=https://testflight.apple.com/join/xyz',
    '--play-url=https://play.google.com/apps/testing/x',
    '--postal-address=123 Example St',
  ], {
    encoding: 'utf8',
    env: { ...process.env, RESEND_API_KEY: 're_fake_for_preview_only' },
  });

  assert.doesNotMatch(output.toLowerCase(), /first hundred/);

  const sections = output.split(/=== .* ===/).filter(Boolean);
  assert.equal(sections.length, 3, 'expected Android Founding 40, iOS Founding 40, and iOS no-offer previews');

  const [android40, ios40, iosNone] = sections;
  assert.match(android40, /Founding 40 member/);
  assert.match(ios40, /Founding 40 member/);
  assert.doesNotMatch(iosNone, /Founding 40 member/);
  assert.doesNotMatch(iosNone, /First Light signup/);
});
