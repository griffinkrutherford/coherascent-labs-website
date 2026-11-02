'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPlainLetter, buildLetterHtml, buildText, buildHtml } = require('../api/waitlist-confirmation.js');

// Regression pin: this letter used to tell every waitlist signup that
// "founding-member perks apply" regardless of when they joined, which
// became false the moment the Founding 50 sold out (Terms §6.1). The
// waitlist confirmation is sent before we know for certain which offer (if
// any) a signup earns, so it must not name one.
test('buildPlainLetter never claims founding-member perks apply', () => {
  assert.doesNotMatch(buildPlainLetter({}), /founding-member perks/i);
  assert.doesNotMatch(buildPlainLetter({ reminder: true }), /founding-member perks/i);
});

test('buildLetterHtml (rendered from buildPlainLetter) inherits the same fix', () => {
  assert.doesNotMatch(buildLetterHtml({}), /founding-member perks/i);
  assert.doesNotMatch(buildLetterHtml({ reminder: true }), /founding-member perks/i);
});

test('buildText and buildHtml (the branded templates) already avoided the claim', () => {
  assert.doesNotMatch(buildText({}), /founding-member perks/i);
  assert.doesNotMatch(buildHtml({}), /founding-member perks/i);
});

test('the confirmation still reads as a complete, warm letter without the discount claim', () => {
  const letter = buildPlainLetter({});
  assert.match(letter, /spot is\nreserved/);
  assert.match(letter, /Griffin/);
});

// api/waitlist.js's sanitizeEmail already rejects control characters and
// angle brackets before a google_email ever reaches this file, so this is a
// defense-in-depth pin, not the primary guard: even if something HTML-shaped
// did arrive here, the HTML template must never render it unescaped, and the
// plain-text template -- which cannot execute markup -- is the only place a
// free-text echo of the address is expected at all.
test('buildHtml escapes an HTML-bearing googleEmail instead of rendering it', () => {
  const malicious = '<img src=x onerror=alert(1)>@evil.example';
  const html = buildHtml({ platform: 'android', googleEmail: malicious, email: 'victim@example.com' });
  assert.doesNotMatch(html, /<img src=x onerror=alert\(1\)>/, 'raw markup must not appear');
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/, 'the address should appear HTML-escaped');
});

test('buildHtml never echoes anything about the recipient beyond the (escaped) email itself', () => {
  const html = buildHtml({ platform: 'android', googleEmail: 'person@gmail.com', email: 'person@gmail.com' });
  // The android_known block names the invite address and nothing else
  // free-text about the recipient.
  assert.match(html, /person@gmail\.com/);
  assert.doesNotMatch(html, /platform=android/);
});
