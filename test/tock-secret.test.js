const test = require('node:test');
const assert = require('node:assert/strict');
const { angleDelta, createRotationTracker } = require('../lune-synth/campaign/tock-secret.core.js');

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
