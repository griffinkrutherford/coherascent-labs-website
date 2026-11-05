'use strict';

/**
 * Unit coverage for the pure, DOM-free helpers in
 * lune-synth/campaign/ad-tracking.js: consent storage round-tripping
 * (including try/catch safety and malformed data), the GPC/DNT
 * auto-decline signal, the Meta _fbc formatter, and the tracker-presence
 * check that gates whether the banner (and this whole script) is ever
 * shown at all.
 *
 * This file is dual-environment (same pattern as
 * applied-carousel-intros.js): `require`-able directly here with no DOM/
 * jsdom, and a plain browser IIFE when loaded via <script>. Browser-only
 * behavior (mounting the banner, loading the Pixel) is exercised
 * separately with Playwright, per the task's manual verification step, not
 * here.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const adTracking = require('../lune-synth/campaign/ad-tracking.js');

function fakeStorage(initial) {
  const store = new Map(Object.entries(initial || {}));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    _store: store,
  };
}

function throwingStorage() {
  return {
    getItem() { throw new Error('SecurityError: access denied'); },
    setItem() { throw new Error('SecurityError: access denied'); },
  };
}

test('readConsent returns null with nothing stored', () => {
  assert.equal(adTracking.readConsent(fakeStorage()), null);
});

test('writeConsent then readConsent round-trips granted and denied', () => {
  const storage = fakeStorage();
  assert.equal(adTracking.writeConsent(storage, 'granted'), true);
  assert.equal(adTracking.readConsent(storage), 'granted');

  assert.equal(adTracking.writeConsent(storage, 'denied'), true);
  assert.equal(adTracking.readConsent(storage), 'denied');
});

test('writeConsent rejects any value other than granted/denied and leaves storage untouched', () => {
  const storage = fakeStorage();
  assert.equal(adTracking.writeConsent(storage, 'maybe'), false);
  assert.equal(adTracking.writeConsent(storage, ''), false);
  assert.equal(adTracking.writeConsent(storage, null), false);
  assert.equal(adTracking.readConsent(storage), null);
});

test('readConsent tolerates a raw legacy "granted"/"denied" string as well as the JSON shape', () => {
  assert.equal(adTracking.readConsent(fakeStorage({ lune_tracking_consent: 'granted' })), 'granted');
  assert.equal(adTracking.readConsent(fakeStorage({ lune_tracking_consent: 'denied' })), 'denied');
});

test('readConsent treats malformed stored JSON as no preference, not a crash', () => {
  assert.equal(adTracking.readConsent(fakeStorage({ lune_tracking_consent: '{not json' })), null);
  assert.equal(adTracking.readConsent(fakeStorage({ lune_tracking_consent: '{"status":"maybe"}' })), null);
  assert.equal(adTracking.readConsent(fakeStorage({ lune_tracking_consent: '' })), null);
});

test('a storage that throws (private browsing, blocked site data) never throws out of readConsent/writeConsent', () => {
  const storage = throwingStorage();
  assert.equal(adTracking.readConsent(storage), null);
  assert.equal(adTracking.writeConsent(storage, 'granted'), false);
});

test('hasPrivacySignal treats globalPrivacyControl and every DNT flavor as decline', () => {
  assert.equal(adTracking.hasPrivacySignal({ globalPrivacyControl: true }), true);
  assert.equal(adTracking.hasPrivacySignal({ doNotTrack: '1' }), true);
  assert.equal(adTracking.hasPrivacySignal({ doNotTrack: 'yes' }), true);
  assert.equal(adTracking.hasPrivacySignal({ doNotTrack: 1 }), true);
});

test('hasPrivacySignal is false with no signal, and never throws on a missing navigator', () => {
  assert.equal(adTracking.hasPrivacySignal({ globalPrivacyControl: false, doNotTrack: '0' }), false);
  assert.equal(adTracking.hasPrivacySignal({}), false);
  assert.equal(adTracking.hasPrivacySignal(null), false);
  assert.equal(adTracking.hasPrivacySignal(undefined), false);
});

test('formatFbc matches Meta\'s own _fbc cookie format', () => {
  assert.equal(adTracking.formatFbc('abc123', 1730000000000), 'fb.1.1730000000000.abc123');
});

test('formatFbc returns an empty string with no fbclid, rather than a malformed value', () => {
  assert.equal(adTracking.formatFbc('', 123), '');
  assert.equal(adTracking.formatFbc(null, 123), '');
  assert.equal(adTracking.formatFbc(undefined, 123), '');
});

test('hasAnyTracker is true only when at least one tracker config is present', () => {
  assert.equal(adTracking.hasAnyTracker(null), false);
  assert.equal(adTracking.hasAnyTracker({}), false);
  assert.equal(adTracking.hasAnyTracker({ meta: null, google: null, tiktok: null }), false);
  assert.equal(adTracking.hasAnyTracker({ meta: { pixelId: '123' }, google: null, tiktok: null }), true);
  assert.equal(adTracking.hasAnyTracker({ meta: null, google: { id: 'g1' }, tiktok: null }), true);
});

test('generateEventId produces non-empty, distinct ids', () => {
  const a = adTracking.generateEventId();
  const b = adTracking.generateEventId();
  assert.ok(a && typeof a === 'string');
  assert.ok(b && typeof b === 'string');
  assert.notEqual(a, b);
});

test('getConsentStatus starts as null (no banner interaction has happened in this module instance)', () => {
  // require.cache keeps one module instance across this whole test file, so
  // this only holds as the very first read; it documents the default
  // rather than re-asserting isolation the dual-export pattern does not
  // promise per-test.
  const fresh = (() => {
    delete require.cache[require.resolve('../lune-synth/campaign/ad-tracking.js')];
    // eslint-disable-next-line global-require
    return require('../lune-synth/campaign/ad-tracking.js');
  })();
  assert.equal(fresh.getConsentStatus(), null);
});
