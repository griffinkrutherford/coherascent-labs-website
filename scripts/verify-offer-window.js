#!/usr/bin/env node
/**
 * Pre-deploy sanity check for opening First Light.
 *
 * offer-state.js's own runbook comment says: set FIRST_LIGHT_ENDS_AT and
 * deploy, "nothing else needs to change." That's true for the code, but a
 * typo'd or wrong-timezone date still deploys cleanly -- Date.parse either
 * silently falls back to the dormant "founding-claimed" phase (if it fails
 * to parse) or opens a window that closes at the wrong instant (if it
 * parses but is wrong), and neither failure mode throws or shows up in
 * normal testing. This prints exactly what the deployed value would do, in
 * both UTC and Mountain time, so a human can eyeball it before pushing.
 *
 *   node scripts/verify-offer-window.js
 *
 * Read-only: no network access, no environment variables required.
 */

'use strict';

const { FIRST_LIGHT_ENDS_AT } = require('../lune-synth/campaign/offer-state.js');
const { FIRST_LIGHT_WINDOW_HOURS, FOUNDING_40_CUTOFF_AT } = require('../lune-synth/campaign/offer-eligibility.js');

/** Pure report builder, exported so tests can check its text without stdout capture. */
function buildReport(firstLightEndsAt, now) {
  const nowMs = now == null ? Date.now() : now;
  const lines = [];

  lines.push(`Founding 40 cutoff: ${FOUNDING_40_CUTOFF_AT} (fixed; closed 2026-09-21)`);
  lines.push('');

  if (!firstLightEndsAt) {
    lines.push('First Light: DORMANT (FIRST_LIGHT_ENDS_AT is "" in offer-state.js).');
    lines.push('Everyone sees "Founding 40: all 40 spots claimed." No countdown renders.');
    return { ok: true, lines };
  }

  const endMs = Date.parse(firstLightEndsAt);
  if (!Number.isFinite(endMs)) {
    lines.push(`First Light: MISCONFIGURED. "${firstLightEndsAt}" does not parse as a date.`);
    lines.push('offer-state.js treats this the same as dormant (hasWindow is false), so the');
    lines.push('site will silently keep showing "Founding 40: all 40 spots claimed" -- nobody');
    lines.push('will see First Light, and nothing will error. Fix the string before deploying.');
    return { ok: false, lines };
  }

  const startMs = endMs - FIRST_LIGHT_WINDOW_HOURS * 3600 * 1000;
  const fmt = (ms, timeZone) => new Intl.DateTimeFormat('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone,
  }).format(new Date(ms));

  lines.push(`First Light window: ${FIRST_LIGHT_WINDOW_HOURS} hours`);
  lines.push(`  Opens:  ${fmt(startMs, 'UTC')}  /  ${fmt(startMs, 'America/Denver')}`);
  lines.push(`  Closes: ${fmt(endMs, 'UTC')}  /  ${fmt(endMs, 'America/Denver')}`);
  lines.push('');

  if (endMs <= nowMs) {
    lines.push('WARNING: this end time is already in the past. Deploying now would show');
    lines.push('"Founding 40 and First Light are closed" immediately, with no live window.');
    return { ok: false, lines };
  }
  if (startMs <= nowMs) {
    const remainingMs = endMs - nowMs;
    const remainingH = (remainingMs / 3600000).toFixed(1);
    lines.push(`OK: the window is already open (if deployed now) and closes in ~${remainingH}h.`);
    return { ok: true, lines };
  }

  const untilOpenH = ((startMs - nowMs) / 3600000).toFixed(1);
  lines.push(`OK: the window has not started yet. It opens in ~${untilOpenH}h from now.`);
  lines.push('If you are deploying to open it immediately, the start time should be now or');
  lines.push('in the past -- double check FIRST_LIGHT_ENDS_AT is exactly 48h from deploy time.');
  return { ok: true, lines };
}

if (require.main === module) {
  const { ok, lines } = buildReport(FIRST_LIGHT_ENDS_AT);
  console.log(lines.join('\n'));
  process.exit(ok ? 0 : 1);
}

module.exports = { buildReport };
