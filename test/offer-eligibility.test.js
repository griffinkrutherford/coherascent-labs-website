'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyOfferTier, FOUNDING_40_CUTOFF_AT, FIRST_LIGHT_WINDOW_HOURS } = require('../lune-synth/campaign/offer-eligibility.js');

test('signups before the Founding 40 cutoff classify as founding-40', () => {
  assert.equal(classifyOfferTier('2026-09-01T00:00:00Z'), 'founding-40');
});

test('the entire cutoff day counts, up to (but not including) the boundary instant', () => {
  const oneMsBeforeCutoff = new Date(Date.parse(FOUNDING_40_CUTOFF_AT) - 1).toISOString();
  assert.equal(classifyOfferTier(oneMsBeforeCutoff), 'founding-40');
  assert.equal(classifyOfferTier(FOUNDING_40_CUTOFF_AT), 'none', 'the cutoff instant itself is not eligible');
});

test('signups after the cutoff are "none" while First Light is dormant', () => {
  // Production default: offer-state.js's FIRST_LIGHT_ENDS_AT is "".
  assert.equal(classifyOfferTier('2026-09-25T00:00:00Z'), 'none');
});

test('a signup inside an open First Light window classifies as first-light', () => {
  const endsAt = '2026-10-01T05:59:00Z';
  const insideWindow = '2026-09-30T12:00:00Z';
  assert.equal(classifyOfferTier(insideWindow, { firstLightEndsAt: endsAt }), 'first-light');
});

test('First Light window boundaries are inclusive of the start, exclusive after the end', () => {
  const endsAt = '2026-10-01T05:59:00Z';
  const startMs = Date.parse(endsAt) - FIRST_LIGHT_WINDOW_HOURS * 3600 * 1000;
  assert.equal(
    classifyOfferTier(new Date(startMs).toISOString(), { firstLightEndsAt: endsAt }),
    'first-light',
    'the window opens at ends_at - 48h, inclusive'
  );
  assert.equal(
    classifyOfferTier(new Date(startMs - 1).toISOString(), { firstLightEndsAt: endsAt }),
    'none',
    'one millisecond before the window opens is not eligible'
  );
  assert.equal(
    classifyOfferTier(new Date(Date.parse(endsAt) + 1).toISOString(), { firstLightEndsAt: endsAt }),
    'none',
    'one millisecond after the window closes is not eligible'
  );
});

test('a signup before the Founding 40 cutoff is founding-40 even if First Light is also open', () => {
  // Founding 40 always takes precedence -- it is the earlier, better offer,
  // and Terms §6.3 says the two cannot combine.
  assert.equal(
    classifyOfferTier('2026-09-01T00:00:00Z', { firstLightEndsAt: '2026-10-01T05:59:00Z' }),
    'founding-40'
  );
});

test('missing or unparseable creation times default to no offer, never Founding 40', () => {
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
