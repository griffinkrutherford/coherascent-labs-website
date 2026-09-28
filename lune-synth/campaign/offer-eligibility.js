/**
 * Server-side classifier for which beta promotional offer, if any, a waitlist
 * contact earned. Node-only (require()'d by api/access-email.js and
 * scripts/export-offer-roster.js); never loaded as a browser <script>.
 *
 * The two offers are Terms §6.1 (Founding 40) and §6.2 (First Light). Both
 * are decided by *when our server recorded the signup*, never by a client
 * clock or by trusting a caller's claim -- see Terms §6.2 ("Eligibility is
 * determined by the time our servers record the waitlist signup").
 *
 * Founding 40: sold out at exactly 40 signups on 2026-09-21 (Terms §6.1 says
 * "All 40 places have been claimed"). FOUNDING_40_CUTOFF_AT is the instant
 * after which no further signup can be a Founding 40 member, expressed as
 * the start of the next UTC day so the entire calendar day of 2026-09-21
 * counts, in every timezone, as eligible.
 *
 * First Light: a 48-hour window that opens when
 * lune-synth/campaign/offer-state.js's FIRST_LIGHT_ENDS_AT is set (it is
 * "" -- dormant -- until then). That file is the single source of truth for
 * the end time; this module derives the window's start from it rather than
 * declaring a second constant, so the two can never disagree.
 */

'use strict';

const { FIRST_LIGHT_ENDS_AT } = require('./offer-state.js');

const FOUNDING_40_CUTOFF_AT = '2026-09-22T00:00:00Z';
const FIRST_LIGHT_WINDOW_HOURS = 48;

/**
 * Pure classification, independent of the real-world constants above so
 * tests can exercise every branch (including an open First Light window,
 * which is dormant in production right now).
 *
 * @param {string|number|Date} createdAt - when the signup was recorded.
 * @param {object} [window]
 * @param {string} [window.foundingCutoffAt] - defaults to FOUNDING_40_CUTOFF_AT.
 * @param {string} [window.firstLightEndsAt] - defaults to the real, possibly
 *   dormant, FIRST_LIGHT_ENDS_AT.
 * @param {number} [window.windowHours] - defaults to FIRST_LIGHT_WINDOW_HOURS.
 * @returns {'founding-40'|'first-light'|'none'}
 */
function classifyOfferTier(createdAt, window) {
  const opts = window || {};
  const foundingCutoffAt = opts.foundingCutoffAt !== undefined ? opts.foundingCutoffAt : FOUNDING_40_CUTOFF_AT;
  const firstLightEndsAt = opts.firstLightEndsAt !== undefined ? opts.firstLightEndsAt : FIRST_LIGHT_ENDS_AT;
  const windowHours = opts.windowHours !== undefined ? opts.windowHours : FIRST_LIGHT_WINDOW_HOURS;

  const createdMs = createdAt instanceof Date ? createdAt.getTime() : Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) return 'none';

  const cutoffMs = Date.parse(foundingCutoffAt);
  if (Number.isFinite(cutoffMs) && createdMs < cutoffMs) return 'founding-40';

  const endMs = firstLightEndsAt ? Date.parse(firstLightEndsAt) : NaN;
  if (!Number.isFinite(endMs)) return 'none'; // First Light is dormant.

  const startMs = endMs - windowHours * 3600 * 1000;
  if (createdMs >= startMs && createdMs <= endMs) return 'first-light';

  return 'none';
}

module.exports = {
  FOUNDING_40_CUTOFF_AT,
  FIRST_LIGHT_WINDOW_HOURS,
  classifyOfferTier,
};
