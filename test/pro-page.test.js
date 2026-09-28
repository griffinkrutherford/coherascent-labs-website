'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HTML_PATH = path.join(__dirname, '..', 'lune-synth', 'pro', 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

// Matches an explicit calendar date, or a month name paired with a year or
// day number, which is how a launch date would leak in ("launches October
// 2026", "coming 10/1/2026"). A bare month name isn't checked -- "may" is
// also a common verb, and false-positiving on it teaches nothing. Terms §6
// dates (2026-09-21) are legitimate history about the *closed* Founding 40
// offer, not a Pro launch date, so those are allowed explicitly.
const DATE_LIKE = /\b(20\d{2}-\d{2}-\d{2}|(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?,?\s*(20\d{2})?|\d{1,2}(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(,?\s*20\d{2})?)\b/gi;

test('the Pro page makes no launch-date promise', () => {
  const withoutKnownHistoricalDate = html.replace(/2026-09-21/g, '');
  const matches = withoutKnownHistoricalDate.match(DATE_LIKE) || [];
  assert.deepEqual(matches, [], `found date-like text that could read as a launch date: ${JSON.stringify(matches)}`);
});

test('states plainly that Pro has not launched and is not purchasable', () => {
  assert.match(html, /Coming soon/i);
  assert.match(html, /not yet available to purchase/i);
});

test('names a planned price with an explicit "not final" caveat', () => {
  assert.match(html, /\$12\.99/);
  assert.match(html, /not final/i);
});

test('ties the beta offers back to Terms §6 rather than restating scarcity itself', () => {
  assert.match(html, /Terms.*§?6\.1|6\.1/);
  assert.match(html, /Terms.*§?6\.2|6\.2/);
});

test('contains a valid FAQPage JSON-LD block whose text matches the visible FAQ', () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'expected a JSON-LD script block');
  const data = JSON.parse(match[1]);
  assert.equal(data['@type'], 'FAQPage');
  assert.ok(Array.isArray(data.mainEntity) && data.mainEntity.length >= 3);
  for (const entry of data.mainEntity) {
    assert.equal(entry['@type'], 'Question');
    assert.ok(html.includes(entry.name), `visible page should contain the FAQ heading "${entry.name}"`);
  }
});

test('never claims a specific numeric allowance for a Pro benefit that has not shipped', () => {
  // Regression guard: it's tempting to write "500 generations/month" once a
  // number exists internally, but this page must stay honest that these are
  // still being decided until the feature actually ships.
  const benefitsSection = html.slice(html.indexOf('pro-benefits'), html.indexOf('</ul>'));
  assert.doesNotMatch(benefitsSection, /\d+\s*(generations|pages|messages|constellations)/i);
});
