'use strict';

/**
 * The First Light pricing display on Pro Monthly: while the offer is open
 * the normal price is struck through and the discounted price is shown with
 * a "First Light" badge; once the window closes (time-injected, same as
 * offer-countdown.test.js) everything reverts to the normal price with no
 * strikethrough. Annual is never discounted here -- Terms §6.2 sets no
 * annual-plan treatment -- so this file never asserts a sale price for it.
 *
 * The static markup in lune-synth/index.html and lune-synth/pro/index.html
 * is the no-JS fallback: it must always show the plain $12.99 price with
 * the struck "was" price and the "First Light" badge both `hidden`, so a
 * visitor without JS never sees a struck price (open or closed, today or
 * after the deadline).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  FIRST_LIGHT_ENDS_AT,
  PRO_MONTHLY_PRICE,
  FIRST_LIGHT_MONTHLY_PRICE,
  createOfferClock,
} = require('../lune-synth/campaign/offer-state.js');

const ROOT = path.join(__dirname, '..');
const DEADLINE_MS = Date.parse(FIRST_LIGHT_ENDS_AT);
const DAY = 24 * 60 * 60 * 1000;

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('the First Light monthly price is 50% off, rounded down to the cent', () => {
  assert.equal(PRO_MONTHLY_PRICE, 12.99);
  assert.equal(FIRST_LIGHT_MONTHLY_PRICE, 6.49);
});

test('proMonthlyPricing: open means struck, offer price, and a First Light badge', () => {
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  const now = DEADLINE_MS - DAY;
  const pricing = clock.proMonthlyPricing(now);
  assert.equal(pricing.open, true);
  assert.equal(pricing.displayText, '6.49');
  assert.equal(pricing.normalText, '12.99');
  assert.equal(pricing.wasLabel, 'was $12.99');
  assert.equal(pricing.badgeLabel, 'First Light');
});

test('proMonthlyPricing: one second before the deadline is still open', () => {
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  const pricing = clock.proMonthlyPricing(DEADLINE_MS - 1000);
  assert.equal(pricing.open, true);
  assert.equal(pricing.displayText, '6.49');
});

test('proMonthlyPricing: at and after the deadline reverts to the normal price, no strike', () => {
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  for (const after of [0, 1000, 30 * DAY]) {
    const pricing = clock.proMonthlyPricing(DEADLINE_MS + after);
    assert.equal(pricing.open, false);
    assert.equal(pricing.displayText, '12.99');
  }
});

test('proMonthlyPricing: a dormant window (no First Light open) never shows the struck price', () => {
  const clock = createOfferClock('');
  const pricing = clock.proMonthlyPricing(Date.now());
  assert.equal(pricing.open, false);
  assert.equal(pricing.displayText, '12.99');
});

test('proMonthlyPricing never invents an annual discount', () => {
  const clock = createOfferClock(FIRST_LIGHT_ENDS_AT);
  const pricing = clock.proMonthlyPricing(DEADLINE_MS - DAY);
  assert.ok(!('annualPrice' in pricing), 'no annual field should exist to invent a sale price from');
  assert.ok(!('offerAnnualPrice' in pricing));
});

function assertNoJsPricingFallback(html, label) {
  // The monthly price block: struck "was" price hidden, badge hidden, plain
  // $12.99 showing -- regardless of whether First Light is open or closed
  // right now, since this is the static, pre-JS markup.
  const priceBlockMatch = html.match(/data-first-light-pro-price[\s\S]*?<\/article>/);
  assert.ok(priceBlockMatch, `${label}: expected a [data-first-light-pro-price] card`);
  const block = priceBlockMatch[0];

  const wasMatch = block.match(/<s class="[^"]*"\s+data-first-light-was[^>]*>([^<]*)<\/s>/);
  assert.ok(wasMatch, `${label}: expected a <s data-first-light-was> element`);
  assert.match(block.slice(0, block.indexOf(wasMatch[0]) + wasMatch[0].length), /data-first-light-was[^>]*\bhidden\b/, `${label}: the struck price must be hidden by default (no-JS fallback)`);
  assert.equal(wasMatch[1].trim(), `$${PRO_MONTHLY_PRICE.toFixed(2)}`, `${label}: the struck price text must be the normal price`);

  const amountMatch = block.match(/data-pricing-amount="([^"]*)"[^>]*>\$?([0-9.]+)/);
  assert.ok(amountMatch, `${label}: expected a [data-pricing-amount] element`);
  assert.equal(amountMatch[1], PRO_MONTHLY_PRICE.toFixed(2), `${label}: the static price attribute must be the normal price`);

  const badgeMatch = block.match(/data-first-light-badge[^>]*/);
  assert.ok(badgeMatch, `${label}: expected a [data-first-light-badge] element`);
  assert.match(badgeMatch[0], /\bhidden\b/, `${label}: the First Light badge must be hidden by default (no-JS fallback)`);
}

test('lune-synth/index.html: no-JS fallback shows the plain monthly price, no strike', () => {
  assertNoJsPricingFallback(readFile('lune-synth/index.html'), 'index.html');
});

test('lune-synth/pro/index.html: no-JS fallback shows the plain monthly price, no strike', () => {
  assertNoJsPricingFallback(readFile('lune-synth/pro/index.html'), 'pro/index.html');
});

test('the annual plan/card is never given a struck price or a made-up sale price', () => {
  for (const [relativePath, cardPattern] of [
    ['lune-synth/index.html', /<article class="pricing-card pricing-card--featured"[\s\S]*?<\/article>/],
    ['lune-synth/pro/index.html', /<article class="pro-plan pro-plan--annual pro-card"[\s\S]*?<\/article>/],
  ]) {
    const html = readFile(relativePath);
    const match = html.match(cardPattern);
    assert.ok(match, `${relativePath}: expected the annual plan card`);
    const card = match[0];
    assert.doesNotMatch(card, /data-first-light-was/, `${relativePath}: annual must not get a struck price`);
    assert.doesNotMatch(card, /\$6\.49|\$3\.49|\$2\.49/, `${relativePath}: annual must not show an invented First Light price`);
  }
});

test('offer-state.js is loaded on both pages that show the Pro monthly price, at the same version', () => {
  const indexVersion = readFile('lune-synth/index.html').match(/offer-state\.js\?v=(\d+)/);
  const proVersion = readFile('lune-synth/pro/index.html').match(/offer-state\.js\?v=(\d+)/);
  assert.ok(indexVersion && proVersion, 'expected offer-state.js on both pages');
  assert.equal(indexVersion[1], proVersion[1], 'both pages must load the same offer-state.js version');
});
