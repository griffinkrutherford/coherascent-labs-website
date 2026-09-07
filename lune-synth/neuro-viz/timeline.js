// Normalized timeline for the "Build the circuit" scene.
//
// setup    both axons bare and identical
// practice earned side accumulates reps and myelinates; outsourced side
//          receives a copied answer that never travels the axon
// result   both fire; the conduction-speed gap is the payoff

export const ACTS = Object.freeze({
  setup: [0.0, 0.14],
  practice: [0.14, 0.78],
  result: [0.78, 1.0],
});

export const TOTAL_REPS = 6;

function remap(t, a, b) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return (t - a) / (b - a);
}

export function computeSlices(t) {
  const practiceT = remap(t, ACTS.practice[0], ACTS.practice[1]);
  const resultT = remap(t, ACTS.result[0], ACTS.result[1]);

  // Myelination accrues one rep at a time, easing within each rep so the
  // growth reads as discrete practice sessions rather than a smooth ramp.
  const repFloat = practiceT * TOTAL_REPS;
  const repIndex = Math.min(Math.floor(repFloat), TOTAL_REPS - 1);
  const repProgress = repFloat - repIndex;
  const myelinT = practiceT <= 0 ? 0 : Math.min(repFloat / TOTAL_REPS, 1);

  return {
    setupT: remap(t, ACTS.setup[0], ACTS.setup[1]),
    practiceT,
    resultT,
    myelinT,
    repCount: practiceT <= 0 ? 0 : Math.min(repIndex + 1, TOTAL_REPS),
    repProgress,
    // The copied-answer packet fires once per rep on the outsourced side.
    copyT: repProgress,
    firing: resultT > 0,
  };
}
