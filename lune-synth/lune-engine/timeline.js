export const ACTS = Object.freeze({
  neural:   [0.00, 0.35],
  crossing: [0.35, 0.55],
  audit:    [0.55, 1.00],
});

function remap(t, a, b) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return (t - a) / (b - a);
}

function within(t, [a, b]) {
  return remap(t, a, b);
}

export function computeSlices(t) {
  const [aS, aE] = ACTS.audit;
  const auditStart   = aS + (aE - aS) * 0.7;
  const resolveStart = aS + (aE - aS) * 0.9;
  const inkT = within(t, ACTS.neural);
  return {
    inkT,
    candidateT: inkT,
    crossT: within(t, ACTS.crossing),
    latticeT: within(t, ACTS.audit),
    auditT: remap(t, auditStart, aE),
    resolveT: remap(t, resolveStart, aE),
  };
}
