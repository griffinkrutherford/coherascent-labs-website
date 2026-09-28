'use strict';

/**
 * A discount promise stated in an email or on the Pro page but phrased
 * differently in Terms §6 is exactly how a promise drifts (the "as one of
 * the first hundred" bug this lane fixed was invisible until someone
 * actually compared the email to the Terms). This pins the marketing-facing
 * offer copy in access-email.js and the Pro page against the Terms
 * document's own language, so an edit to one without the other fails here
 * instead of surfacing as a support ticket.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { OFFER_FOUNDING_40, OFFER_FIRST_LIGHT } = require('../api/access-email.js');

const terms = fs.readFileSync(path.join(__dirname, '..', 'lune-synth', 'terms', 'index.html'), 'utf8');
const proPage = fs.readFileSync(path.join(__dirname, '..', 'lune-synth', 'pro', 'index.html'), 'utf8');

test('Terms §6.1 still promises "two months free" and "50% discount" for Founding 40', () => {
  assert.match(terms, /two months free/i);
  assert.match(terms, /50% discount/i);
  assert.match(OFFER_FOUNDING_40, /two months free/i);
  assert.match(OFFER_FOUNDING_40, /50% off/i);
});

test('Terms §6.2 still promises "50% off the first three months" for First Light', () => {
  assert.match(terms, /50% off the first three months/i);
  assert.match(OFFER_FIRST_LIGHT, /50% off your first three months/i);
});

test('the Pro page\'s offer summary uses the same figures as the Terms and the access email', () => {
  assert.match(proPage, /two months free/i);
  assert.match(proPage, /50% off.*for as long as/i);
  assert.match(proPage, /50% off.*first three months/i);
});

test('the Terms document itself still distinguishes 6.1 (Founding 40) from 6.2 (First Light)', () => {
  assert.match(terms, /6\.1 Founding 40/);
  assert.match(terms, /6\.2 First Light/);
});
