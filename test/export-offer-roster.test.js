'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildRosterRow,
  rowsToCsv,
  rowsToJson,
  filterRows,
  CSV_COLUMNS,
} = require('../scripts/export-offer-roster.js');

test('buildRosterRow tags a Founding 40 contact correctly', () => {
  const row = buildRosterRow(
    { email: 'early@example.com', created_at: '2026-09-01T00:00:00Z', unsubscribed: false },
    { platform: 'ios' }
  );
  assert.deepEqual(row, {
    email: 'early@example.com',
    createdAt: '2026-09-01T00:00:00Z',
    tier: 'founding-40',
    platform: 'ios',
    unsubscribed: false,
  });
});

test('buildRosterRow tags a post-cutoff contact as "none" while First Light is dormant', () => {
  const row = buildRosterRow(
    { email: 'late@example.com', created_at: '2026-09-25T00:00:00Z', unsubscribed: false },
    { platform: 'android' }
  );
  assert.equal(row.tier, 'none');
});

test('buildRosterRow handles missing properties without throwing', () => {
  const row = buildRosterRow(
    { email: 'no-props@example.com', created_at: '2026-09-01T00:00:00Z', unsubscribed: true },
    null
  );
  assert.equal(row.platform, '');
  assert.equal(row.unsubscribed, true);
});

test('rowsToCsv produces a header plus one line per row, quoting only when needed', () => {
  const csv = rowsToCsv([
    { email: 'a@example.com', createdAt: '2026-09-01T00:00:00Z', tier: 'founding-40', platform: 'ios', unsubscribed: false },
  ]);
  const lines = csv.trim().split('\n');
  assert.equal(lines[0], CSV_COLUMNS.join(','));
  assert.equal(lines[1], 'a@example.com,2026-09-01T00:00:00Z,founding-40,ios,false');
});

test('rowsToCsv quotes a value containing a comma', () => {
  const csv = rowsToCsv([
    { email: 'a@example.com', createdAt: '2026-09-01T00:00:00Z', tier: 'founding-40', platform: 'ios, tvOS', unsubscribed: false },
  ]);
  assert.match(csv, /"ios, tvOS"/);
});

test('rowsToJson round-trips the same data rowsToCsv formats', () => {
  const rows = [
    { email: 'a@example.com', createdAt: '2026-09-01T00:00:00Z', tier: 'founding-40', platform: 'ios', unsubscribed: false },
  ];
  const parsed = JSON.parse(rowsToJson(rows));
  assert.deepEqual(parsed, rows);
});

test('filterRows("all") returns every row unchanged', () => {
  const rows = [{ tier: 'founding-40' }, { tier: 'none' }];
  assert.deepEqual(filterRows(rows, 'all'), rows);
});

test('filterRows narrows to the requested tier', () => {
  const rows = [
    { email: 'a', tier: 'founding-40' },
    { email: 'b', tier: 'first-light' },
    { email: 'c', tier: 'none' },
  ];
  assert.deepEqual(filterRows(rows, 'first-light'), [{ email: 'b', tier: 'first-light' }]);
});

test('filterRows narrows to a single email, case-insensitively', () => {
  const rows = [
    { email: 'Person@Example.com', tier: 'founding-40' },
    { email: 'other@example.com', tier: 'none' },
  ];
  assert.deepEqual(
    filterRows(rows, 'all', 'person@example.com'),
    [{ email: 'Person@Example.com', tier: 'founding-40' }]
  );
});

test('filterRows combines a tier filter and an email filter (both must match)', () => {
  const rows = [
    { email: 'a@example.com', tier: 'founding-40' },
    { email: 'a@example.com', tier: 'none' }, // hypothetical duplicate, still exercises the AND
    { email: 'b@example.com', tier: 'founding-40' },
  ];
  assert.deepEqual(
    filterRows(rows, 'founding-40', 'a@example.com'),
    [{ email: 'a@example.com', tier: 'founding-40' }]
  );
});

test('an empty email filter matches everything, same as omitting it', () => {
  const rows = [{ email: 'a@example.com', tier: 'none' }];
  assert.deepEqual(filterRows(rows, 'all', ''), rows);
});
