/**
 * Secure Serverless Waitlist Handler for Resend
 * Path: /api/waitlist.js
 */

const { sendWaitlistConfirmation } = require('./waitlist-confirmation.js');
const { sendCapiLeadEvent } = require('./meta-capi.js');

// Copy shown in the site's success popup. Returned as `message` so the clients
// (blog.js, cta.js) pick it up centrally rather than each hardcoding it.
// Title and body are returned together so they cannot contradict each other.
// The clients previously hardcoded "You're on the list!" as the heading while
// the body came from here, which read as a stutter on every state.
const COPY = {
  new: { title: 'You’re on the list!', message: 'A confirmation email is on its way.' },
  existing: { title: 'Already on the list', message: 'We haven’t sent a second confirmation.' },
};

/**
 * The confirmation is held briefly rather than sent on the spot, because the
 * success popup asks for platform immediately afterwards. Waiting lets the one
 * email we send already reflect the answer -- an email asking a question the
 * reader answered ten seconds earlier reads as broken.
 *
 * A platform answer arriving inside the window cancels the timer and sends the
 * tailored version at once, so the usual wait is seconds, not the full delay.
 */
const CONFIRMATION_DELAY_MS = 90 * 1000;
const pendingConfirmations = new Map();

function deliverConfirmation(email, apiKey, options) {
  return sendWaitlistConfirmation(email, apiKey, options).then((result) => {
    if (!result.sent) {
      console.error(`[waitlist] stored ${email} but confirmation not sent (${result.reason})`);
    }
  });
}

function scheduleConfirmation(email, apiKey, options) {
  if (pendingConfirmations.has(email) || sentRecently(email)) return;
  markSent(email);
  const timer = setTimeout(() => {
    pendingConfirmations.delete(email);
    deliverConfirmation(email, apiKey, options);
  }, CONFIRMATION_DELAY_MS);
  // Never hold the process open for a courtesy email.
  if (typeof timer.unref === 'function') timer.unref();
  pendingConfirmations.set(email, timer);
}

/**
 * Backstop for two cases the contact lookup cannot cover: requests that race
 * each other (a double-clicked button, where neither has been written yet when
 * both look), and a lookup that errored. Durable dedup is lookupContact().
 */
const RECENT_TTL_MS = 60 * 60 * 1000;
const RECENT_MAX = 5000;
const recentlySent = new Map();

function markSent(email) {
  if (recentlySent.size >= RECENT_MAX) recentlySent.clear();
  recentlySent.set(email, Date.now());
}

function sentRecently(email) {
  const at = recentlySent.get(email);
  if (!at) return false;
  if (Date.now() - at > RECENT_TTL_MS) {
    recentlySent.delete(email);
    return false;
  }
  return true;
}

function looksLikeDuplicate(data, status) {
  if (status === 409) return true;
  const message = typeof data?.message === 'string' ? data.message.toLowerCase() : '';
  return (
    message.includes('already exists')
    || message.includes('already registered')
    || message.includes('duplicate')
    || message.includes('contact already')
  );
}

/**
 * Authoritative dedup. Resend returns 200 when creating a contact that already
 * exists, so the create response cannot distinguish new from repeat -- only
 * this lookup can. Unlike the in-process map it survives restarts and is shared
 * across instances.
 *
 * Returns { status: 'exists' | 'missing' | 'unknown', unsubscribed }.
 *
 * The unsubscribed flag matters: an opted-out contact still exists, so treating
 * existence alone as "already on the list" silently strands anyone who
 * unsubscribes and later rejoins -- which both the unsubscribe page and the
 * deletion page explicitly invite them to do.
 */
async function lookupContact(email, apiKey) {
  try {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const body = await response.json().catch(() => ({}));
      const contact = body && body.data ? body.data : body;
      return { status: 'exists', unsubscribed: contact ? contact.unsubscribed === true : false };
    }
    if (response.status === 404) return { status: 'missing', unsubscribed: false };
    return { status: 'unknown', unsubscribed: false };
  } catch (error) {
    console.warn(`[waitlist] contact lookup failed (${error.name}); falling back to local guard`);
    return { status: 'unknown', unsubscribed: false };
  }
}

/**
 * Creates the contact, carrying the platform answers as custom properties.
 *
 * If the properties are rejected -- most likely because
 * scripts/resend-setup-properties.js has not been run against this key -- the
 * create is retried bare. Storing the metadata must never cost us the signup.
 */
async function createContact(email, properties, apiKey) {
  const send = (body) => fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const base = { email, unsubscribed: false };
  const hasProperties = Object.keys(properties).length > 0;

  let response = await send(hasProperties ? { ...base, properties } : base);
  if (response.ok || !hasProperties) return response;

  const text = await response.clone().text().catch(() => '');
  if (/propert/i.test(text)) {
    console.error(
      `[waitlist] contact properties rejected (${response.status}); retrying without them. `
      + 'Run scripts/resend-setup-properties.js to define them. Response: '
      + text.slice(0, 300)
    );
    response = await send(base);
  }

  return response;
}

/**
 * Where a signup came from, derived entirely from the Referer header.
 *
 * A same-origin form post sends the full page URL, query string included, so
 * the utm_* params a campaign link arrived with are still readable here. That
 * keeps attribution server-side: no tracking cookie, no client-side script,
 * and nothing stored beyond the campaign labels we put in the link ourselves.
 * The privacy policy's "product analytics are first-party" claim depends on it
 * staying that way -- do not route this through a third-party SDK.
 *
 * Limitation worth knowing: this records the page the form was submitted from,
 * which is the entry page only when someone signs up without navigating first.
 */
function parseAttribution(req) {
  const raw = req && req.headers && typeof req.headers.referer === 'string' ? req.headers.referer : '';
  if (!raw) return {};

  let url;
  try {
    url = new URL(raw);
  } catch (error) {
    return {};
  }

  // Cap every value: these land on a contact record and arrive from a header
  // the client controls.
  const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

  const attribution = {};
  const path = clean(url.pathname, 120);
  if (path) attribution.signup_page = path;

  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = clean(url.searchParams.get(key), 60).toLowerCase();
    if (value) attribution[key] = value;
  }

  // Additive (2026-11-05 ad-tracking infra): capture a paid click the same
  // way utm_* is captured above, from the landing URL alone, no SDK involved.
  //
  // fbc mirrors Meta's own `_fbc` cookie format (fb.1.<click_time_ms>.<fbclid>)
  // so this property lines up with what Meta CAPI expects, but it is built
  // from the request time, not the real click time, since there is no
  // client-side timestamp here -- it is a first-party Resend property, a
  // fallback for analysis, never what sendCapiLeadEvent() sends (that call
  // prefers the visitor's real _fbc cookie, read from the Cookie header).
  const fbclid = clean(url.searchParams.get('fbclid'), 100);
  if (fbclid) attribution.fbc = `fb.1.${Date.now()}.${fbclid}`;

  const ref = clean(url.searchParams.get('ref'), 60);
  if (ref) attribution.ref = ref;

  return attribution;
}

// Only these origins can read the response to a cross-origin request. Every
// legitimate caller (blog.js, cta.js, offer-popup.js, waitlist-fields.js)
// posts from the same origin, where the browser never even consults these
// headers -- this exists to stop a third-party page from using a visitor's
// browser to drive this endpoint and read what comes back.
const ALLOWED_ORIGINS = new Set([
  'https://lunesynth.com',
  'https://www.lunesynth.com',
  'https://coherascentlabs.com',
  'https://www.coherascentlabs.com',
]);

// A field left empty by every real form (it is off-screen and unreachable by
// tab order) but routinely filled in by a simple bot that fills every input
// it finds. See cta.js/offer-popup.js/blog.js's formMarkup for the field
// itself.
const HONEYPOT_FIELD = 'hp_token';

// Strict enough to reject control characters, newlines, and the characters
// that matter for HTML injection, while still accepting ordinary addresses.
const MAX_EMAIL_LENGTH = 254; // RFC 5321 §4.5.3.1.3
const CONTROL_OR_HTML_CHARS_RE = /[\x00-\x1f\x7f<>]/;
const EMAIL_FORMAT_RE = /^[^\s<>"'`,;]+@[^\s<>"'`,;]+\.[^\s<>"'`,;]+$/;

function sanitizeEmail(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_EMAIL_LENGTH) return null;
  if (CONTROL_OR_HTML_CHARS_RE.test(trimmed)) return null;
  if (!EMAIL_FORMAT_RE.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

// In-memory per-IP limit: 5 submissions per 10 minutes, 20 per day. Resets
// on deploy, which is acceptable for an abuse brake rather than a billing
// control, and matches the process-local dedup this file already does
// elsewhere (recentlySent).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 5;
const RATE_LIMIT_DAY_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX_PER_DAY = 20;
const RATE_LIMIT_MAX_TRACKED_IPS = 5000;
const requestTimestampsByIp = new Map();

function getClientIp(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

/** Returns true if this request should proceed, false if it is rate-limited. */
function checkRateLimit(ip) {
  const now = Date.now();
  const previous = requestTimestampsByIp.get(ip) || [];
  const timestamps = previous.filter((t) => now - t < RATE_LIMIT_DAY_MS);

  const recentCount = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS).length;
  if (recentCount >= RATE_LIMIT_MAX_PER_WINDOW || timestamps.length >= RATE_LIMIT_MAX_PER_DAY) {
    requestTimestampsByIp.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  if (requestTimestampsByIp.size >= RATE_LIMIT_MAX_TRACKED_IPS && !requestTimestampsByIp.has(ip)) {
    requestTimestampsByIp.delete(requestTimestampsByIp.keys().next().value);
  }
  requestTimestampsByIp.set(ip, timestamps);
  return true;
}

module.exports = async (req, res) => {
  // CORS: reflect only an allowed origin, never '*'. Same-origin calls (every
  // real caller) never send Origin to begin with, so this changes nothing for
  // them.
  const origin = req.headers && req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!checkRateLimit(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    // A field no human reaches was filled in. Accept it exactly like a real
    // signup -- so a bot sees a normal success response and learns nothing
    // -- but do no work: no contact write, no email, no log beyond this one.
    const honeypotValue = req.body && typeof req.body[HONEYPOT_FIELD] === 'string' ? req.body[HONEYPOT_FIELD].trim() : '';
    if (honeypotValue) {
      console.warn('[waitlist] honeypot triggered, discarding submission');
      return res.status(200).json({ success: true, ...COPY.new });
    }

    const trimmedEmail = sanitizeEmail(req.body.email);

    if (!trimmedEmail) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Platform answers from the signup form. Client-side validation already
    // enforces these, but a direct POST can omit them, so treat both as
    // optional here and let the confirmation email ask for whatever is missing.
    const rawPlatform = typeof req.body.platform === 'string' ? req.body.platform.trim().toLowerCase() : '';
    const platform = rawPlatform === 'android' || rawPlatform === 'ios' ? rawPlatform : '';
    const sanitizedGoogleEmail = sanitizeEmail(req.body.google_email);
    const googleEmail = platform === 'android' && sanitizedGoogleEmail ? sanitizedGoogleEmail : '';

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('Configuration Error: RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const properties = {};
    if (platform) properties.platform = platform;
    if (googleEmail) properties.google_account = googleEmail;

    // Which page and campaign produced this signup. Only set on the first
    // write for an address: the platform popup posts a second time from the
    // same page, and letting that overwrite the original source would credit
    // every signup to wherever the popup happened to be answered.
    const attribution = parseAttribution(req);

    // Ask first: Resend answers 200 whether or not the contact already exists,
    // so only an explicit lookup can tell a new signup from a repeat.
    const existing = await lookupContact(trimmedEmail, RESEND_API_KEY);

    // An unauthenticated POST is not proof the requester owns this address.
    // The previous behaviour let a second POST -- the popup's platform
    // answer, or just anyone resubmitting the address -- update stored
    // properties (including google_account, which controls where a Play
    // Store invite is sent) or clear an opt-out. Either one lets a stranger
    // redirect or resubscribe someone else's contact just by POSTing their
    // address. An existing contact, subscribed or not, now always gets the
    // generic response and nothing is written: no property update, no
    // resubscribe, no email.
    //
    // TODO(product): if real users need to correct their platform or Google
    // account after the initial signup, build that as its own endpoint
    // gated by an expiring, purpose-bound confirmation token (e.g. a mailed
    // link), not a bare POST to this one. Do not wire anything up here
    // without that token -- that is exactly the authentication this
    // endpoint lacks today.
    if (existing.status === 'exists') {
      console.log(`[waitlist] signup for existing contact ${trimmedEmail} ignored (unsubscribed=${existing.unsubscribed})`);
      return res.status(200).json({ success: true, ...COPY.existing });
    }

    const response = await createContact(
      trimmedEmail,
      { ...properties, ...attribution },
      RESEND_API_KEY
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (looksLikeDuplicate(data, response.status)) {
        return res.status(200).json({
          success: true,
          ...COPY.existing
        });
      }

      console.error('Resend API Error response:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to register email with Resend.'
      });
    }

    // The address is stored. Everything below is a courtesy: the confirmation
    // must never fail, delay, or reject the submission.
    //
    // Not awaited. This runs on a persistent Railway process, so the send
    // completes after the response is flushed and the form stays snappy.
    // sendWaitlistConfirmation never throws, so there is no unhandled rejection.
    // Logged so the answers survive even if the contact write is not doing what
    // we expect -- Railway logs are currently the only durable record.
    console.log(
      `[waitlist] stored ${trimmedEmail} platform=${platform || 'unknown'} google=${googleEmail || 'none'}`
      + ` page=${attribution.signup_page || 'unknown'}`
      + ` campaign=${attribution.utm_campaign || attribution.utm_source || 'none'}`
    );

    // Server-side Meta Conversions API confirmation of the same Lead the
    // browser Pixel (lune-synth/campaign/ad-tracking.js) fires on success,
    // deduplicated by tracking_event_id. Not awaited -- sendCapiLeadEvent()
    // never throws and never rejects (see api/meta-capi.js), and this must
    // never delay or affect the signup response either way. It is also a
    // strict no-op unless META_PIXEL_ID/META_CAPI_ACCESS_TOKEN are set and
    // the client reported consent === 'granted', so this line does nothing
    // at all today.
    sendCapiLeadEvent({
      email: trimmedEmail,
      eventId: typeof req.body.tracking_event_id === 'string' ? req.body.tracking_event_id : '',
      consent: typeof req.body.tracking_consent === 'string' ? req.body.tracking_consent : '',
      ip: getClientIp(req),
      userAgent: (req.headers && req.headers['user-agent']) || '',
      cookieHeader: (req.headers && req.headers.cookie) || '',
      eventSourceUrl: (req.headers && req.headers.referer) || '',
      attribution,
    }).catch(() => {});

    if (platform) {
      // Signup already carried the answer, so nothing to wait for.
      if (!sentRecently(trimmedEmail)) {
        markSent(trimmedEmail);
        deliverConfirmation(trimmedEmail, RESEND_API_KEY, { platform, googleEmail });
      }
    } else {
      scheduleConfirmation(trimmedEmail, RESEND_API_KEY, {});
    }

    return res.status(200).json({
      success: true,
      ...COPY.new
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
};
