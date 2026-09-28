'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPlainLetter, buildLetterHtml, buildText, buildHtml } = require('../api/waitlist-confirmation.js');

// Regression pin: this letter used to tell every waitlist signup that
// "founding-member perks apply" regardless of when they joined, which
// became false the moment the Founding 40 sold out (Terms §6.1,
// 2026-09-21). The waitlist confirmation is sent before we know for
// certain which offer (if any) a signup earns, so it must not name one.
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
