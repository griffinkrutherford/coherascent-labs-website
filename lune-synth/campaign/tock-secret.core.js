/* Manual clock travel only; autoplay, snapping and pointer grabs never enter here. */
(function (global) {
  'use strict';
  var REQUIRED_DEGREES = 12 * 360; // The short hand moves once per twelve minute-hand turns.
  var GOLDEN_DEGREES = 14 * REQUIRED_DEGREES; // Seven days advanced: fourteen short-hand turns.
  function angleDelta(previous, next) {
    if (!Number.isFinite(previous) || !Number.isFinite(next)) return 0;
    return ((next - previous + 540) % 360 + 360) % 360 - 180;
  }
  function createRotationTracker() {
    var travel = 0;
    var unlocked = false;
    var goldenUnlocked = false;
    return {
      add: function (delta) {
        if (goldenUnlocked || !Number.isFinite(delta) || Math.abs(delta) > 90) return false;
        travel += delta; // Reversing direction cancels travel; wiggling cannot earn a turn.
        if (travel + 1e-7 >= GOLDEN_DEGREES) goldenUnlocked = true;
        if (unlocked || Math.abs(travel) + 1e-7 < REQUIRED_DEGREES) return false;
        unlocked = true;
        return true;
      },
      isUnlocked: function () { return unlocked; },
      isGoldenUnlocked: function () { return goldenUnlocked; }
    };
  }
  function formatDuration(value) {
    var hours = Math.floor(value / 60);
    var minutes = value % 60;
    return hours ? hours + ' hr' + (minutes ? ' ' + minutes + ' min' : '') : minutes + ' min';
  }
  function parseWardrobeCode(value, set) {
    if ((set !== 'standard' && set !== 'golden') || !value || value.set !== set || !Number.isInteger(value.durationMinutes) ||
        value.durationMinutes < 5 || value.durationMinutes > 120 || value.durationMinutes % 5 !== 0 ||
        value.riskLevel !== 0 || typeof value.expiresAt !== 'string' || typeof value.serverNow !== 'string' ||
        value.sequenceVersion !== 1 || !Array.isArray(value.sequence) || value.sequence.length !== (set === 'standard' ? 2 : 3)) return null;
    var steps = [];
    for (var i = 0; i < value.sequence.length; i++) {
      var step = value.sequence[i];
      var control = i % 2 === 0 ? 'time' : 'risk';
      if (!step || step.control !== control || !Number.isInteger(step.value)) return null;
      if (control === 'time') {
        if (step.value < 5 || step.value > 120 || step.value % 5 !== 0) return null;
        steps.push('Set time to ' + formatDuration(step.value));
      } else {
        if (step.value < 0 || step.value > 5) return null;
        steps.push('Set risk slider to ' + (step.value * 10) + '%');
      }
    }
    if (value.sequence[0].value !== value.durationMinutes || (set === 'golden' && value.sequence[0].value === value.sequence[2].value)) return null;
    var utcIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    if (!utcIso.test(value.expiresAt) || !utcIso.test(value.serverNow)) return null;
    var expiresAt = Date.parse(value.expiresAt);
    var serverNow = Date.parse(value.serverNow);
    var remaining = expiresAt - serverNow;
    if (!Number.isFinite(remaining) || remaining <= 0 || remaining > 600000) return null;
    return { steps: steps, remainingMs: remaining };
  }
  var api = { angleDelta: angleDelta, createRotationTracker: createRotationTracker, parseWardrobeCode: parseWardrobeCode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TockSecret = api;
})(typeof window !== 'undefined' ? window : globalThis);
