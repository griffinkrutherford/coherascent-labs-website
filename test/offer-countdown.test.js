'use strict';

/**
 * The First Light countdown with injected time: before the deadline it is
 * open and counts down, at the exact deadline instant and after it the offer
 * reads closed. The deadline is Friday 2026-11-06 11:59 PM Mountain Standard
 * Time (UTC-7), stored as an absolute UTC instant so a viewer's timezone can
 * never move it.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FIRST_LIGHT_ENDS_AT,
  FIRST_LIGHT_STARTS_AT,
  DEFAULT_OFFER,
  createOfferClock,
} = require('../lune-synth/campaign/offer-state.js');
const { classifyOfferTier, FOUNDING_CUTOFF_AT } = require('../lune-synth/campaign/offer-eligibility.js');

const DEADLINE = '2026-11-07T06:59:00Z';
const DEADLINE_MS = Date.parse(DEADLINE);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function values(parts) {
  return Object.fromEntries(parts.map((part) => [part.key, part.value]));
}

test('the live window ends Friday Nov 6, 11:59 PM MST, as an absolute UTC instant', () => {
  assert.equal(FIRST_LIGHT_ENDS_AT, DEADLINE);
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  assert.equal(clock.endLabel('America/Denver'), 'Fri, Nov 6, 11:59 PM MT');
  // Same instant shown in another zone, never re-anchored to local midnight.
  assert.equal(clock.endLabel('America/New_York'), 'Fri, Nov 6, 11:59 PM MT (Sat, Nov 7, 1:59 AM your time)');
});

test('before the deadline: open, with days/hours/minutes/seconds remaining', () => {
  const clock = createOfferClock(DEADLINE);
  const now = DEADLINE_MS - (1 * DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND);
  assert.equal(clock.phase(now), 'first-light-open');
  assert.deepEqual(values(clock.remainingParts(now)), { days: 1, hours: 2, minutes: 3, seconds: 4 });
  assert.deepEqual(clock.remainingParts(now).map(clock.displayValue), ['1', '02', '03', '04']);
  const html = clock.offerHtml(now, 'America/Denver');
  assert.match(html, /Limited-time First Light offer/);
  assert.doesNotMatch(html, /founding offer/i, 'First Light must never be called a founding offer');
  assert.match(html, /Join by Fri, Nov 6, 11:59 PM MT/);
  assert.match(html, /50% off your first 3 months/);
  assert.doesNotMatch(html, /spots?|limited to|only \d+|48 hours/i, 'no capacity claim or stale 48h copy');
  assert.match(clock.footnoteText(now), /First Light discount applies once you are invited/);
});

test('one second before the deadline still counts as open', () => {
  const clock = createOfferClock(DEADLINE);
  const now = DEADLINE_MS - SECOND;
  assert.equal(clock.phase(now), 'first-light-open');
  assert.deepEqual(values(clock.remainingParts(now)), { days: 0, hours: 0, minutes: 0, seconds: 1 });
});

test('at the deadline instant: closed, zero remaining, standing offer copy', () => {
  const clock = createOfferClock(DEADLINE);
  assert.equal(clock.phase(DEADLINE_MS), 'first-light-closed');
  assert.deepEqual(values(clock.remainingParts(DEADLINE_MS)), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  assert.equal(clock.offerHtml(DEADLINE_MS), DEFAULT_OFFER);
  assert.equal(clock.announcement(DEADLINE_MS), 'The First Light offer has closed.');
});

test('after the deadline: closed, never negative, no First Light copy', () => {
  const clock = createOfferClock(DEADLINE);
  for (const after of [SECOND, HOUR, 30 * DAY]) {
    const now = DEADLINE_MS + after;
    assert.equal(clock.phase(now), 'first-light-closed');
    assert.deepEqual(values(clock.remainingParts(now)), { days: 0, hours: 0, minutes: 0, seconds: 0 });
    assert.equal(clock.offerHtml(now), DEFAULT_OFFER);
    assert.doesNotMatch(clock.footnoteText(now), /First Light/);
  }
});

test('the screen-reader announcement changes once a minute, not every second', () => {
  const clock = createOfferClock(DEADLINE);
  const minuteStart = DEADLINE_MS - (2 * DAY + 5 * HOUR + 7 * MINUTE);
  const spoken = new Set();
  for (let s = 0; s < 60; s += 1) spoken.add(clock.announcement(minuteStart - s * SECOND));
  assert.equal(spoken.size, 1, 'all 60 seconds inside one minute share one announcement');
  assert.equal([...spoken][0], '2 days, 5 hours, 7 minutes left in the First Light offer');
  assert.notEqual(clock.announcement(minuteStart - 60 * SECOND), [...spoken][0]);
  assert.equal(
    clock.announcement(DEADLINE_MS - (1 * DAY + 1 * HOUR + 1 * MINUTE)),
    '1 day, 1 hour, 1 minute left in the First Light offer',
  );
});

test('a dormant or malformed end time never opens the offer', () => {
  for (const endsAt of ['', 'not-a-date']) {
    const clock = createOfferClock(endsAt);
    assert.equal(clock.hasWindow, false);
    assert.equal(clock.phase(Date.parse('2026-11-03T00:00:00Z')), 'founding-claimed');
    assert.equal(clock.offerHtml(Date.parse('2026-11-03T00:00:00Z')), DEFAULT_OFFER);
  }
});

test('server eligibility: Founding 50 takes precedence through its own cutoff, then First Light opens', () => {
  assert.equal(FIRST_LIGHT_STARTS_AT, '2026-11-02T07:00:00Z');
  assert.equal(FOUNDING_CUTOFF_AT, '2026-11-02T22:16:00Z');
  // Founding's cutoff (2026-11-02T22:16:00Z) is later than First Light's
  // start (2026-11-02T07:00:00Z), so signups in between are Founding, not
  // First Light -- the owner's "today's 07:00Z-22:16Z signups are Founding"
  // decision.
  assert.equal(classifyOfferTier('2026-11-02T06:59:59Z'), 'founding-40');
  assert.equal(classifyOfferTier(FIRST_LIGHT_STARTS_AT), 'founding-40');
  assert.equal(classifyOfferTier('2026-11-02T22:15:59Z'), 'founding-40');
  assert.equal(classifyOfferTier(FOUNDING_CUTOFF_AT), 'first-light', 'the Founding cutoff instant itself is First Light, not Founding');
  assert.equal(classifyOfferTier('2026-11-04T18:00:00Z'), 'first-light');
  assert.equal(classifyOfferTier(DEADLINE), 'first-light');
  assert.equal(classifyOfferTier(DEADLINE_MS + 1), 'none');
  assert.equal(classifyOfferTier('2026-09-01T00:00:00Z'), 'founding-40', 'early signups are Founding too');
});
