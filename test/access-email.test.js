'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAccessLetter, offerParagraphForTier, OFFER_FOUNDING_40, OFFER_FIRST_LIGHT } = require('../api/access-email.js');

// Regression pin: this exact wrong claim went out to every recipient
// regardless of when they signed up. It must never come back.
test('never claims "first hundred" -- the bug this lane exists to fix', () => {
  const letter = buildAccessLetter({
    platform: 'ios',
    testflightUrl: 'https://testflight.apple.com/join/xyz',
    postalAddress: '123 Example St',
    createdAt: '2026-09-01T00:00:00Z',
  });
  assert.doesNotMatch(letter.toLowerCase(), /first hundred/);
});

// Word-wrapped copy can insert a newline anywhere a space was, so compare
// with whitespace collapsed rather than asserting an exact substring match.
function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ');
}

test('offerParagraphForTier: founding-40 (the tier id) names the Founding 50 offer', () => {
  const paragraph = collapseWhitespace(offerParagraphForTier('founding-40'));
  assert.match(paragraph, /Founding 50 member/);
  assert.ok(paragraph.includes(OFFER_FOUNDING_40), 'should include the exact Founding offer text');
});

test('offerParagraphForTier: first-light names the First Light offer', () => {
  const paragraph = collapseWhitespace(offerParagraphForTier('first-light'));
  assert.match(paragraph, /First Light signup/);
  assert.ok(paragraph.includes(OFFER_FIRST_LIGHT), 'should include the exact First Light offer text');
});

test('offerParagraphForTier: none makes no discount claim at all', () => {
  assert.equal(offerParagraphForTier('none'), '');
});

test('a Founding 50 signup (created before the cutoff) gets the Founding paragraph', () => {
  const letter = buildAccessLetter({
    platform: 'ios',
    testflightUrl: 'https://testflight.apple.com/join/xyz',
    postalAddress: '123 Example St',
    createdAt: '2026-09-01T00:00:00Z',
  });
  assert.match(letter, /Founding 50 member/);
});

test('a signup with no createdAt gets no offer paragraph, never the best one by default', () => {
  const letter = buildAccessLetter({
    platform: 'ios',
    testflightUrl: 'https://testflight.apple.com/join/xyz',
    postalAddress: '123 Example St',
  });
  assert.doesNotMatch(letter, /Founding 50 member/);
  assert.doesNotMatch(letter, /First Light signup/);
});

test('a signup after both the Founding cutoff and the First Light deadline gets no discount claim', () => {
  const letter = buildAccessLetter({
    platform: 'android',
    playUrl: 'https://play.google.com/apps/testing/x',
    googleAccount: 'tester@example.com',
    postalAddress: '123 Example St',
    createdAt: '2026-12-01T00:00:00Z',
  });
  assert.doesNotMatch(letter, /Founding 50 member/);
  assert.doesNotMatch(letter, /First Light signup/);
  // Still a complete, sendable letter -- withholding the offer must not
  // withhold the actual access instructions.
  assert.match(letter, /play\.google\.com/);
});

test('an individually-invited Founding 50 email overrides a late (or missing) createdAt', () => {
  const previousEnv = process.env.FOUNDING_EXTRA_EMAILS;
  process.env.FOUNDING_EXTRA_EMAILS = 'vip@example.com';
  try {
    const letter = buildAccessLetter({
      platform: 'ios',
      testflightUrl: 'https://testflight.apple.com/join/xyz',
      postalAddress: '123 Example St',
      createdAt: '2026-12-01T00:00:00Z',
      email: 'VIP@Example.com ',
    });
    assert.match(letter, /Founding 50 member/);
  } finally {
    if (previousEnv === undefined) delete process.env.FOUNDING_EXTRA_EMAILS;
    else process.env.FOUNDING_EXTRA_EMAILS = previousEnv;
  }
});

test('FOUNDING_EXTRA_EMAILS comparison is case- and whitespace-insensitive, and empty entries are ignored', () => {
  const { foundingExtraEmails } = require('../api/access-email.js');
  const previousEnv = process.env.FOUNDING_EXTRA_EMAILS;
  process.env.FOUNDING_EXTRA_EMAILS = ' Vip@Example.com ,, second@example.com ,';
  try {
    const emails = foundingExtraEmails();
    assert.ok(emails.has('vip@example.com'));
    assert.ok(emails.has('second@example.com'));
    assert.equal(emails.size, 2);
  } finally {
    if (previousEnv === undefined) delete process.env.FOUNDING_EXTRA_EMAILS;
    else process.env.FOUNDING_EXTRA_EMAILS = previousEnv;
  }
});

test('still refuses to send without a postal address, regardless of tier', async () => {
  const { sendAccessEmail } = require('../api/access-email.js');
  const result = await sendAccessEmail('person@example.com', 're_fake_key', {
    platform: 'ios',
    testflightUrl: 'https://testflight.apple.com/join/xyz',
    createdAt: '2026-09-01T00:00:00Z',
  });
  assert.equal(result.sent, false);
  assert.equal(result.reason, 'missing_postal_address');
});
