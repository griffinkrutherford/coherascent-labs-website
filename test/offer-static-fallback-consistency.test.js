'use strict';

/**
 * offer-state.js overwrites every ".waitlist-offer" / ".lune-cta__offer"
 * element's text at runtime, so the raw HTML/JS shipped for those elements
 * is only what a visitor sees for the instant before the script runs (or if
 * it fails to load at all). That "instant before" text is duplicated by hand
 * in a few places -- lune-synth/index.html's static markup and cta.js's
 * FALLBACK_CONFIG -- and nothing forces them to agree with offer-state.js's
 * own DEFAULT_OFFER string. This test is that force.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractFoundingClaimed(offerStateSource) {
  const match = offerStateSource.match(/var DEFAULT_OFFER = "([^"]+)";/);
  assert.ok(match, 'expected to find DEFAULT_OFFER in offer-state.js');
  return match[1];
}

function staticHeroOffer(indexHtml) {
  const match = indexHtml.match(/<p class="waitlist-offer">([\s\S]*?)<\/p>/);
  assert.ok(match, 'expected a static .waitlist-offer line in index.html');
  return match[1];
}

test('index.html\'s static waitlist-offer markup matches offer-state.js\'s current offer', () => {
  const offerStateSource = readFile('lune-synth/campaign/offer-state.js');
  const { FIRST_LIGHT_ENDS_AT, createOfferClock } = require('../lune-synth/campaign/offer-state.js');
  const heroOffer = staticHeroOffer(readFile('lune-synth/index.html'));
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  if (!clock.hasWindow) {
    // Dormant: the no-JS line is the standing waitlist offer.
    const founding = extractFoundingClaimed(offerStateSource);
    assert.ok(heroOffer.includes(founding), 'index.html\'s static offer line has drifted from offer-state.js');
    return;
  }
  // A window is set: the no-JS line names First Light, its Terms §6.2
  // discount, and the same deadline the clock computes in Mountain time, so
  // it stays self-dating (and truthful) if a visitor without JS arrives late.
  // Deliberately not keyed to Date.now(), so this suite never flips on a date.
  assert.match(heroOffer, /First Light/);
  assert.match(heroOffer, /50% off your first 3 months/);
  assert.doesNotMatch(heroOffer, /spots?|limited to|only \d+/i, 'no capacity claim');
  assert.doesNotMatch(heroOffer, /founding offer/i, 'First Light must never be called a founding offer; Founding 50 is a separate, closed offer');
  const mountain = clock.endLabel('America/Denver'); // e.g. "Thu, Nov 12, 11:59 PM MT"
  const [, month, day, time] = mountain.match(/^\w+, (\w+) (\d+), (.+) MT$/);
  assert.ok(heroOffer.includes(`${month} ${day}, ${time} MT`), `static deadline must match ${mountain}`);
});

test('cta.js\'s FALLBACK_CONFIG.offerHtml matches offer-state.js\'s DEFAULT_OFFER text', () => {
  const founding = extractFoundingClaimed(readFile('lune-synth/campaign/offer-state.js'));
  const ctaJs = readFile('lune-synth/campaign/cta.js');
  assert.ok(ctaJs.includes(founding), 'cta.js\'s fallback offer text has drifted from offer-state.js');
});

test('cta.js prefers the live window.LuneOffer.offerHtml() over its own static fallback', () => {
  const ctaJs = readFile('lune-synth/campaign/cta.js');
  assert.match(ctaJs, /window\.LuneOffer\s*\?\s*window\.LuneOffer\.offerHtml\(\)\s*:\s*settings\.offerHtml/);
});
