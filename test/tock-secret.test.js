const test = require('node:test');
const assert = require('node:assert/strict');
const { angleDelta, createRotationTracker, parseWardrobeCode } = require('../lune-synth/campaign/tock-secret.core.js');

test('one full short-hand rotation requires twelve manual minute-hand rotations', () => {
  const t = createRotationTracker();
  for (let i = 0; i < 47; i++) assert.equal(t.add(90), false);
  assert.equal(t.isUnlocked(), false);
  assert.equal(t.add(90), true);
  assert.equal(t.isUnlocked(), true);
  assert.equal(t.add(90), false); // reveal once
});
test('counterclockwise works and reversing/wiggling cancels travel', () => {
  const t = createRotationTracker();
  for (let i = 0; i < 500; i++) { t.add(45); t.add(-45); }
  assert.equal(t.isUnlocked(), false);
  for (let i = 0; i < 48; i++) t.add(-90);
  assert.equal(t.isUnlocked(), true);
});
test('angle unwrapping crosses noon correctly in either direction', () => {
  assert.equal(angleDelta(359, 1), 2);
  assert.equal(angleDelta(1, 359), -2);
  assert.equal(angleDelta(350, 20), 30);
  assert.equal(angleDelta(NaN, 0), 0);
});
test('non-finite values and ambiguous pointer jumps cannot grant travel', () => {
  const t = createRotationTracker();
  for (const bad of [NaN, Infinity, -Infinity, 4320, -4320, 180, -180]) {
    for (let i = 0; i < 100; i++) assert.equal(t.add(bad), false);
  }
  assert.equal(t.isUnlocked(), false);
});
test('200 seeded variable-step manual turns are stable in both directions', () => {
  let seed = 0x706f636b;
  function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }
  for (let run = 0; run < 200; run++) {
    const t = createRotationTracker();
    const direction = run % 2 ? -1 : 1;
    let travel = 0, angle = rand() * 360;
    while (travel < 4320) {
      const step = Math.min(1 + rand() * 59, 4320 - travel);
      const next = ((angle + direction * step) % 360 + 360) % 360;
      const unlocked = t.add(angleDelta(angle, next));
      travel += step;
      assert.equal(unlocked, travel + 1e-7 >= 4320);
      angle = next;
    }
    assert.equal(t.isUnlocked(), true);
  }
});

test('golden reward takes fourteen forward short-hand turns including the first turn', () => {
  const t = createRotationTracker();
  let standardReveals = 0;
  for (let i = 0; i < 671; i++) {
    if (t.add(90)) standardReveals++;
    assert.equal(t.isGoldenUnlocked(), false);
  }
  assert.equal(standardReveals, 1);
  assert.equal(t.isUnlocked(), true);
  assert.equal(t.add(90), false); // Keep the existing once-only standard reveal contract.
  assert.equal(t.isGoldenUnlocked(), true);
  for (let i = 0; i < 100; i++) assert.equal(t.add(-90), false);
  assert.equal(t.isGoldenUnlocked(), true); // Both reveals persist.
});
test('backward days and oscillations cannot earn the golden reward', () => {
  const t = createRotationTracker();
  for (let i = 0; i < 672; i++) t.add(-90);
  assert.equal(t.isUnlocked(), true);
  assert.equal(t.isGoldenUnlocked(), false);
  for (let i = 0; i < 1000; i++) { t.add(90); t.add(-90); }
  for (let i = 0; i < 1343; i++) {
    t.add(90);
    assert.equal(t.isGoldenUnlocked(), false);
  }
  t.add(90);
  assert.equal(t.isGoldenUnlocked(), true);
});
test('invalid deltas cannot complete either reward after the standard reveal', () => {
  const t = createRotationTracker();
  for (let i = 0; i < 48; i++) t.add(90);
  for (const delta of [NaN, Infinity, -Infinity, 60480, -60480, 180, -180]) {
    for (let i = 0; i < 1000; i++) t.add(delta);
  }
  assert.equal(t.isGoldenUnlocked(), false);
});
test('200 seeded seven-day sweeps preserve wrap, reversed travel and exact thresholds', () => {
  let seed = 0x676f6c64;
  function rand() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }
  for (let run = 0; run < 200; run++) {
    const t = createRotationTracker();
    let net = 0, angle = rand() * 360, reveals = 0;
    function move(step) {
      const next = ((angle + step) % 360 + 360) % 360;
      if (t.add(angleDelta(angle, next))) reveals++;
      net += step;
      angle = next;
      assert.equal(t.isGoldenUnlocked(), net + 1e-7 >= 60480);
    }
    for (let i = 0; i < 30; i++) {
      const step = 1 + rand() * 80;
      move(-step); move(step); // Includes both negative wraps and direction reversals.
    }
    while (net < 60480 - 1e-7) move(Math.min(1 + rand() * 89, 60480 - net));
    assert.equal(reveals, 1);
    assert.equal(t.isUnlocked(), true);
    assert.equal(t.isGoldenUnlocked(), true);
  }
});


test('rotating codes validate the set, wheel values, free risk and server expiry', () => {
  const base = { set: 'standard', durationMinutes: 75, riskLevel: 0,
    expiresAt: '2026-10-22T20:10:00.000Z', serverNow: '2026-10-22T20:00:00.000Z' };
  assert.deepEqual(parseWardrobeCode(base, 'standard'), { duration: '1 hr 15 min', remainingMs: 600000 });
  assert.deepEqual(parseWardrobeCode({ ...base, set: 'golden', durationMinutes: 120 }, 'golden'), { duration: '2 hr', remainingMs: 600000 });
  assert.equal(parseWardrobeCode({ ...base, durationMinutes: 5 }, 'standard').duration, '5 min');
  assert.equal(parseWardrobeCode({ ...base, set: 'unknown' }, 'unknown'), null);
  for (const wrong of [null, {}, { ...base, set: 'golden' }, { ...base, durationMinutes: 73 },
    { ...base, durationMinutes: 0 }, { ...base, durationMinutes: 125 }, { ...base, durationMinutes: '75' },
    { ...base, riskLevel: 1 }, { ...base, riskLevel: '0' }, { ...base, expiresAt: 'invalid' },
    { ...base, serverNow: base.expiresAt }, { ...base, expiresAt: '2026-10-22T20:10:01.000Z' },
    { ...base, serverNow: null }, { ...base, serverNow: '2026-10-22' }]) assert.equal(parseWardrobeCode(wrong, 'standard'), null);
});
