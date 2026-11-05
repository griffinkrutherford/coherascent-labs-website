/**
 * Meta Conversions API (CAPI): server-side confirmation of the waitlist
 * `Lead` event that the browser Pixel (lune-synth/campaign/ad-tracking.js)
 * also fires, deduplicated against it via the shared `event_id`.
 *
 * Dormant by default. sendCapiLeadEvent() is a strict no-op -- no network
 * call at all -- unless every one of these is true:
 *   - META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are both set
 *   - the client reported consent === 'granted'
 *   - a usable email and a non-empty eventId were supplied
 *
 * This must never affect the waitlist signup response. Every failure path
 * (missing config, no consent, network error, non-2xx from Graph) is caught
 * here and only logged; nothing is thrown and the returned promise never
 * rejects. Call it un-awaited from api/waitlist.js, after the signup response
 * is already decided.
 */

const crypto = require('crypto');

const GRAPH_VERSION = 'v21.0';
const CAPI_TIMEOUT_MS = 2500;

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Meta requires lowercase, trimmed email before hashing. */
function normalizeEmailForHash(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

/** Minimal Cookie header parser; never throws on malformed input. */
function parseCookieHeader(cookieHeader) {
  const out = {};
  if (typeof cookieHeader !== 'string' || !cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (!key) continue;
    const rawValue = part.slice(eq + 1).trim();
    try {
      out[key] = decodeURIComponent(rawValue);
    } catch (error) {
      out[key] = rawValue;
    }
  }
  return out;
}

function buildCustomData(attribution) {
  const customData = {};
  if (attribution && typeof attribution === 'object') {
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      if (attribution[key]) customData[key] = attribution[key];
    }
  }
  return customData;
}

async function sendCapiLeadEvent({
  email,
  eventId,
  consent,
  ip,
  userAgent,
  cookieHeader,
  eventSourceUrl,
  attribution,
} = {}) {
  try {
    const pixelId = typeof process.env.META_PIXEL_ID === 'string' ? process.env.META_PIXEL_ID.trim() : '';
    const accessToken = typeof process.env.META_CAPI_ACCESS_TOKEN === 'string' ? process.env.META_CAPI_ACCESS_TOKEN.trim() : '';
    if (!pixelId || !accessToken) return { sent: false, reason: 'not_configured' };

    // Never send for a visitor who did not grant consent, and never guess --
    // an absent or malformed consent field is treated as no consent.
    if (consent !== 'granted') return { sent: false, reason: 'no_consent' };

    const normalizedEmail = normalizeEmailForHash(email);
    if (!normalizedEmail) return { sent: false, reason: 'no_email' };

    const trimmedEventId = typeof eventId === 'string' ? eventId.trim().slice(0, 128) : '';
    if (!trimmedEventId) return { sent: false, reason: 'no_event_id' };

    const cookies = parseCookieHeader(cookieHeader);
    const userData = { em: [sha256Hex(normalizedEmail)] };
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (cookies._fbp) userData.fbp = cookies._fbp;
    if (cookies._fbc) userData.fbc = cookies._fbc;

    const event = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: trimmedEventId,
      action_source: 'website',
      user_data: userData,
    };
    if (eventSourceUrl) event.event_source_url = eventSourceUrl;

    const customData = buildCustomData(attribution);
    if (Object.keys(customData).length) event.custom_data = customData;

    const payload = { data: [event] };
    const testEventCode = typeof process.env.META_CAPI_TEST_EVENT_CODE === 'string'
      ? process.env.META_CAPI_TEST_EVENT_CODE.trim()
      : '';
    if (testEventCode) payload.test_event_code = testEventCode;

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CAPI_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn(`[meta-capi] Lead event rejected (${response.status}): ${text.slice(0, 300)}`);
      return { sent: false, reason: 'rejected', status: response.status };
    }

    return { sent: true };
  } catch (error) {
    console.warn(`[meta-capi] Lead event failed (${error && error.name}); signup unaffected`);
    return { sent: false, reason: 'error' };
  }
}

module.exports = {
  sendCapiLeadEvent,
  sha256Hex,
  normalizeEmailForHash,
  parseCookieHeader,
  buildCustomData,
};
