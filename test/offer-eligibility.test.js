'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyOfferTier, FOUNDING_CUTOFF_AT, FOUNDING_40_CUTOFF_AT, FIRST_LIGHT_WINDOW_HOURS } = require('../lune-synth/campaign/offer-eligibility.js');

test('FOUNDING_40_CUTOFF_AT is kept as an alias of FOUNDING_CUTOFF_AT', () => {
  assert.equal(FOUNDING_40_CUTOFF_AT, FOUNDING_CUTOFF_AT);
});

test('signups before the Founding cutoff classify as founding-40 (the tier id)', () => {
  assert.equal(classifyOfferTier('2026-09-01T00:00:00Z'), 'founding-40');
});

test('the instant right at the cutoff is excluded from Founding (First Light disabled, to isolate this from whichever window is live)', () => {
  const oneMsBeforeCutoff = new Date(Date.parse(FOUNDING_CUTOFF_AT) - 1).toISOString();
  assert.equal(classifyOfferTier(oneMsBeforeCutoff, { firstLightEndsAt: '' }), 'founding-40');
  assert.equal(classifyOfferTier(FOUNDING_CUTOFF_AT, { firstLightEndsAt: '' }), 'none', 'the cutoff instant itself is not eligible for Founding');
});

test('signups after the cutoff are "none" while First Light is dormant', () => {
  // Explicit dormant override, decoupled from whatever offer-state.js's real
  // FIRST_LIGHT_ENDS_AT currently is (it is not always "").
  assert.equal(classifyOfferTier('2026-11-03T00:00:00Z', { firstLightEndsAt: '' }), 'none');
});

test('a signup inside an open First Light window classifies as first-light', () => {
  // foundingCutoffAt is explicitly disabled so this test exercises only the
  // First Light window math, independent of wherever the real Founding
  // cutoff happens to sit.
  const endsAt = '2026-10-01T05:59:00Z';
  const insideWindow = '2026-09-30T12:00:00Z';
  assert.equal(classifyOfferTier(insideWindow, { firstLightEndsAt: endsAt, foundingCutoffAt: '' }), 'first-light');
});

test('First Light window boundaries are inclusive of the start, exclusive after the end', () => {
  const endsAt = '2026-10-01T05:59:00Z';
  const startMs = Date.parse(endsAt) - FIRST_LIGHT_WINDOW_HOURS * 3600 * 1000;
  const window = { firstLightEndsAt: endsAt, foundingCutoffAt: '' };
  assert.equal(
    classifyOfferTier(new Date(startMs).toISOString(), window),
    'first-light',
    'the window opens at ends_at - 48h, inclusive'
  );
  assert.equal(
    classifyOfferTier(new Date(startMs - 1).toISOString(), window),
    'none',
    'one millisecond before the window opens is not eligible'
  );
  assert.equal(
    classifyOfferTier(new Date(Date.parse(endsAt) + 1).toISOString(), window),
    'none',
    'one millisecond after the window closes is not eligible'
  );
});

test('a signup before the Founding cutoff is founding-40 (the tier id) even if First Light is also open', () => {
  // Founding always takes precedence -- it is the earlier, better offer,
  // and Terms §6.3 says the two cannot combine.
  assert.equal(
    classifyOfferTier('2026-09-01T00:00:00Z', { firstLightEndsAt: '2026-10-01T05:59:00Z' }),
    'founding-40'
  );
});

test('missing or unparseable creation times default to no offer, never Founding', () => {
  // A missing timestamp must never be treated as "early enough" -- that
  // would let a bug silently grant the best offer to everyone.
  assert.equal(classifyOfferTier(undefined), 'none');
  assert.equal(classifyOfferTier(''), 'none');
  assert.equal(classifyOfferTier('not-a-date'), 'none');
  assert.equal(classifyOfferTier(null), 'none');
});

test('accepts a Date instance as well as an ISO string', () => {
  assert.equal(classifyOfferTier(new Date('2026-09-01T00:00:00Z')), 'founding-40');
});
