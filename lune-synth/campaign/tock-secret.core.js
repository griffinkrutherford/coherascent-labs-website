/* Manual clock travel only; autoplay, snapping and pointer grabs never enter here. */
(function (global) {
  'use strict';
  var REQUIRED_DEGREES = 12 * 360; // The short hand moves once per twelve minute-hand turns.
  function angleDelta(previous, next) {
    if (!Number.isFinite(previous) || !Number.isFinite(next)) return 0;
    return ((next - previous + 540) % 360 + 360) % 360 - 180;
  }
  function createRotationTracker() {
    var travel = 0;
    var unlocked = false;
    return {
      add: function (delta) {
        if (unlocked || !Number.isFinite(delta) || Math.abs(delta) > 90) return false;
        travel += delta; // Reversing direction cancels travel; wiggling cannot earn a turn.
        if (Math.abs(travel) + 1e-7 < REQUIRED_DEGREES) return false;
        unlocked = true;
        return true;
      },
      isUnlocked: function () { return unlocked; }
    };
  }
  var api = { angleDelta: angleDelta, createRotationTracker: createRotationTracker };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TockSecret = api;
})(typeof window !== 'undefined' ? window : globalThis);
