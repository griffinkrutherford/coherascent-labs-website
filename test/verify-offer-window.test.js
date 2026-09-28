'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReport } = require('../scripts/verify-offer-window.js');

test('dormant window (empty string) reports ok and explains nothing renders', () => {
  const { ok, lines } = buildReport('');
  assert.equal(ok, true);
  assert.match(lines.join('\n'), /DORMANT/);
});

test('an unparseable date is flagged as misconfigured and fails the check', () => {
  const { ok, lines } = buildReport('not-a-real-date');
  assert.equal(ok, false);
  assert.match(lines.join('\n'), /MISCONFIGURED/);
});

test('an end time already in the past is flagged as a warning and fails the check', () => {
  const { ok, lines } = buildReport('2020-01-01T00:00:00Z');
  assert.equal(ok, false);
  assert.match(lines.join('\n'), /WARNING.*already in the past/);
});

test('a valid future window reports ok with both UTC and Mountain times', () => {
  const now = Date.parse('2026-09-28T00:00:00Z');
  const { ok, lines } = buildReport('2026-10-01T05:59:00Z', now);
  assert.equal(ok, true);
  const text = lines.join('\n');
  assert.match(text, /Opens:.*UTC/);
  assert.match(text, /Closes:.*UTC/);
  assert.match(text, /MDT|MST/);
});

test('a window whose start has already passed but whose end has not is reported as currently open', () => {
  const endsAt = '2026-10-01T05:59:00Z';
  const oneHourBeforeClose = Date.parse(endsAt) - 3600 * 1000;
  const { ok, lines } = buildReport(endsAt, oneHourBeforeClose);
  assert.equal(ok, true);
  assert.match(lines.join('\n'), /already open/);
});
