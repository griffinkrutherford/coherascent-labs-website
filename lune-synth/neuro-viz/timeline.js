// Shared timing keeps the pulses and the visible transfer meters in sync.
// Illustrative timing only; these are not measured conduction speeds.
export function computeTransfer(resultT, myelinLevel = 1) {
  const slowT = Math.max(0, Math.min(1, resultT / 0.88));
  // Two hesitations reinforce the visible detours. The same progress drives
  // both the signal and its meter, including these pauses.
  const stops = [[0, 0], [0.22, 0.28], [0.32, 0.28], [0.55, 0.63], [0.65, 0.63], [1, 1]];
  const next = stops.findIndex(([time]) => time >= slowT);
  const [a, b] = next <= 0 ? [stops[0], stops[1]] : [stops[next - 1], stops[next]];
  const unbuilt = a[1] + (b[1] - a[1]) * (slowT - a[0]) / (b[0] - a[0]);
  return { earned: Math.max(0, Math.min(1, resultT / (0.88 - 0.66 * Math.max(0, Math.min(1, myelinLevel))))), unbuilt };
}

// The user chooses practice time; pulses keep looping at that selected level.
export function computePracticeComparison(t, level) {
  const myelinT = Math.max(0, Math.min(1, level));
  return { myelinT, practiceT: myelinT, firing: true, resultT: t };
}

// Three seven-second signal comparisons: grow for 18s, hold full for 3s.
export function autoPracticeLevel(elapsedMs) {
  return Math.min(1, (Math.max(0, elapsedMs) % 21000) / 18000);
}
