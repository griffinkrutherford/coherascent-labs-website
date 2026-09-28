'use strict';

/**
 * offer-state.js overwrites every ".waitlist-offer" / ".lune-cta__offer"
 * element's text at runtime, so the raw HTML/JS shipped for those elements
 * is only what a visitor sees for the instant before the script runs (or if
 * it fails to load at all). That "instant before" text is duplicated by hand
 * in a few places -- lune-synth/index.html's static markup and cta.js's
 * FALLBACK_CONFIG -- and nothing forces them to agree with offer-state.js's
 * own FOUNDING_CLAIMED string. This test is that force.
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
  const match = offerStateSource.match(/var FOUNDING_CLAIMED = "([^"]+)";/);
  assert.ok(match, 'expected to find FOUNDING_CLAIMED in offer-state.js');
  return match[1];
}

test('index.html\'s static waitlist-offer markup matches offer-state.js\'s FOUNDING_CLAIMED text', () => {
  const founding = extractFoundingClaimed(readFile('lune-synth/campaign/offer-state.js'));
  const indexHtml = readFile('lune-synth/index.html');
  assert.ok(indexHtml.includes(founding), 'index.html\'s static offer line has drifted from offer-state.js');
});

test('cta.js\'s FALLBACK_CONFIG.offerHtml matches offer-state.js\'s FOUNDING_CLAIMED text', () => {
  const founding = extractFoundingClaimed(readFile('lune-synth/campaign/offer-state.js'));
  const ctaJs = readFile('lune-synth/campaign/cta.js');
  assert.ok(ctaJs.includes(founding), 'cta.js\'s fallback offer text has drifted from offer-state.js');
});

test('cta.js prefers the live window.LuneOffer.offerHtml() over its own static fallback', () => {
  const ctaJs = readFile('lune-synth/campaign/cta.js');
  assert.match(ctaJs, /window\.LuneOffer\s*\?\s*window\.LuneOffer\.offerHtml\(\)\s*:\s*settings\.offerHtml/);
});
