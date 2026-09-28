'use strict';

/**
 * offer-state.js is a browser <script> file (no DOM calls at require-time),
 * but server code (api/access-email.js, scripts/export-offer-roster.js) needs
 * the same FIRST_LIGHT_ENDS_AT value it uses, or the two will drift. This
 * pins the require()-from-Node contract so nobody "simplifies" the early
 * `module.exports` guard back out.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

test('offer-state.js is require()-able from Node without touching the DOM', () => {
  // If this file ever calls document/window before the module-export guard,
  // require() throws here in a plain Node process (no DOM globals exist).
  const exported = require('../lune-synth/campaign/offer-state.js');
  assert.equal(typeof exported, 'object');
  assert.ok(exported !== null);
});

test('exports exactly the constant server code needs, nothing else', () => {
  const exported = require('../lune-synth/campaign/offer-state.js');
  assert.deepEqual(Object.keys(exported), ['FIRST_LIGHT_ENDS_AT']);
  assert.equal(typeof exported.FIRST_LIGHT_ENDS_AT, 'string');
});

test('dormant window (default state) exports an empty string, not a fabricated date', () => {
  // Regression guard: if First Light is opened by editing this file, the
  // value becomes non-empty and offer-eligibility.js picks it up automatically.
  const exported = require('../lune-synth/campaign/offer-state.js');
  if (exported.FIRST_LIGHT_ENDS_AT !== '') {
    assert.ok(
      Number.isFinite(Date.parse(exported.FIRST_LIGHT_ENDS_AT)),
      'FIRST_LIGHT_ENDS_AT, when set, must be a parseable date'
    );
  }
});
