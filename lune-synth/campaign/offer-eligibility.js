/**
 * Server-side classifier for which beta promotional offer, if any, a waitlist
 * contact earned. Node-only (require()'d by api/access-email.js and
 * scripts/export-offer-roster.js); never loaded as a browser <script>.
 *
 * The two offers are Terms §6.1 (Founding 50) and §6.2 (First Light). Both
 * are decided by *when our server recorded the signup*, never by a client
 * clock or by trusting a caller's claim -- see Terms §6.2 ("Eligibility is
 * determined by the time our servers record the waitlist signup").
 *
 * Founding 50: raised from 40 to 50 members on 2026-11-02 (owner decision,
 * 47 waitlist signups plus 3 added individually -- see
 * api/access-email.js's FOUNDING_EXTRA_EMAILS). FOUNDING_CUTOFF_AT is the
 * instant after which no further signup can be a Founding member; everyone
 * recorded before it, plus the individually-invited names, make up the 50.
 * The internal tier id stays 'founding-40' (the wire format and several
 * tests pin it) even though the member count and display name are now 50 --
 * only the display copy says "Founding 50".
 *
 * First Light: a window that opens when lune-synth/campaign/offer-state.js's
 * FIRST_LIGHT_ENDS_AT is set (it is "" -- dormant -- until then). That file is
 * the single source of truth for both ends of the window: it also declares
 * FIRST_LIGHT_STARTS_AT. When the start is "", the window falls back to the
 * original 48 hours before the end. Founding always takes precedence over
 * First Light (Terms §6.3: the two offers do not combine).
 */

'use strict';

const { FIRST_LIGHT_ENDS_AT, FIRST_LIGHT_STARTS_AT } = require('./offer-state.js');

const FOUNDING_CUTOFF_AT = '2026-11-02T22:16:00Z';
// Kept for any external caller still importing the old name (same value).
const FOUNDING_40_CUTOFF_AT = FOUNDING_CUTOFF_AT;
const FIRST_LIGHT_WINDOW_HOURS = 48;

/**
 * Pure classification, independent of the real-world constants above so
 * tests can exercise every branch (including an open First Light window,
 * which is dormant in production right now).
 *
 * @param {string|number|Date} createdAt - when the signup was recorded.
 * @param {object} [window]
 * @param {string} [window.foundingCutoffAt] - defaults to FOUNDING_CUTOFF_AT.
 * @param {string} [window.firstLightEndsAt] - defaults to the real, possibly
 *   dormant, FIRST_LIGHT_ENDS_AT.
 * @param {string} [window.firstLightStartsAt] - defaults to the real
 *   FIRST_LIGHT_STARTS_AT only when firstLightEndsAt is also defaulted, so a
 *   caller-supplied end time is never paired with the real start.
 * @param {number} [window.windowHours] - defaults to FIRST_LIGHT_WINDOW_HOURS;
 *   used only when no start time is given.
 * @returns {'founding-40'|'first-light'|'none'}
 */
function classifyOfferTier(createdAt, window) {
  const opts = window || {};
  const foundingCutoffAt = opts.foundingCutoffAt !== undefined ? opts.foundingCutoffAt : FOUNDING_CUTOFF_AT;
  const firstLightEndsAt = opts.firstLightEndsAt !== undefined ? opts.firstLightEndsAt : FIRST_LIGHT_ENDS_AT;
  const windowHours = opts.windowHours !== undefined ? opts.windowHours : FIRST_LIGHT_WINDOW_HOURS;
  const firstLightStartsAt = opts.firstLightStartsAt !== undefined
    ? opts.firstLightStartsAt
    : (opts.firstLightEndsAt === undefined ? FIRST_LIGHT_STARTS_AT : '');

  const createdMs = createdAt instanceof Date ? createdAt.getTime() : Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) return 'none';

  const cutoffMs = Date.parse(foundingCutoffAt);
  if (Number.isFinite(cutoffMs) && createdMs < cutoffMs) return 'founding-40';

  const endMs = firstLightEndsAt ? Date.parse(firstLightEndsAt) : NaN;
  if (!Number.isFinite(endMs)) return 'none'; // First Light is dormant.

  const explicitStartMs = firstLightStartsAt ? Date.parse(firstLightStartsAt) : NaN;
  const startMs = Number.isFinite(explicitStartMs) ? explicitStartMs : endMs - windowHours * 3600 * 1000;
  if (createdMs >= startMs && createdMs <= endMs) return 'first-light';

  return 'none';
}

module.exports = {
  FOUNDING_CUTOFF_AT,
  FOUNDING_40_CUTOFF_AT,
  FIRST_LIGHT_WINDOW_HOURS,
  classifyOfferTier,
};
