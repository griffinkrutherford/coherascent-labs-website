/**
 * Secure Serverless Waitlist Handler for Resend
 * Path: /api/waitlist.js
 */

const { sendWaitlistConfirmation } = require('./waitlist-confirmation.js');

// Copy shown in the site's success popup. Returned as `message` so the clients
// (blog.js, cta.js) pick it up centrally rather than each hardcoding it.
const MESSAGE_NEW =
  'Check your inbox — we just emailed you one quick question: is your phone Android or iPhone? ' +
  '(If Android, we need the Google account email your Play Store uses.) ' +
  'Reply to that email so your invite reaches the right place.';

const MESSAGE_EXISTING =
  'You’re already on the list. If you haven’t told us whether your phone is Android or iPhone yet, ' +
  'reply to your confirmation email — or email griffin@lunesynth.com. ' +
  'Android invites go to your Google account, so we need that address to reach you.';

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
 * Returns 'exists' | 'missing' | 'unknown'. On 'unknown' the caller falls back
 * to the in-process guard rather than risking a duplicate send.
 */
async function lookupContact(email, apiKey) {
  try {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) return 'exists';
    if (response.status === 404) return 'missing';
    return 'unknown';
  } catch (error) {
    console.warn(`[waitlist] contact lookup failed (${error.name}); falling back to local guard`);
    return 'unknown';
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

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email presence and simple format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Platform answers from the signup form. Client-side validation already
    // enforces these, but a direct POST can omit them, so treat both as
    // optional here and let the confirmation email ask for whatever is missing.
    const rawPlatform = typeof req.body.platform === 'string' ? req.body.platform.trim().toLowerCase() : '';
    const platform = rawPlatform === 'android' || rawPlatform === 'ios' ? rawPlatform : '';
    const rawGoogle = typeof req.body.google_email === 'string' ? req.body.google_email.trim().toLowerCase() : '';
    const googleEmail = platform === 'android' && rawGoogle.includes('@') ? rawGoogle : '';

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('Configuration Error: RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    // Ask first: Resend answers 200 whether or not the contact already exists,
    // so only an explicit lookup can tell a new signup from a repeat.
    const existing = await lookupContact(trimmedEmail, RESEND_API_KEY);
    if (existing === 'exists') {
      return res.status(200).json({
        success: true,
        message: MESSAGE_EXISTING
      });
    }

    const properties = {};
    if (platform) properties.platform = platform;
    if (googleEmail) properties.google_account = googleEmail;

    const response = await createContact(trimmedEmail, properties, RESEND_API_KEY);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (looksLikeDuplicate(data, response.status)) {
        return res.status(200).json({
          success: true,
          message: MESSAGE_EXISTING
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
    );

    if (!sentRecently(trimmedEmail)) {
      markSent(trimmedEmail);
      sendWaitlistConfirmation(trimmedEmail, RESEND_API_KEY, { platform, googleEmail }).then((result) => {
        if (!result.sent) {
          console.error(
            `[waitlist] stored ${trimmedEmail} but confirmation not sent (${result.reason})`
          );
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: MESSAGE_NEW
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
};
