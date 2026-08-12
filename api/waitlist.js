/**
 * Secure Serverless Waitlist Handler for Resend
 * Path: /api/waitlist.js
 */

const { sendWaitlistConfirmation } = require('./waitlist-confirmation.js');

// Copy shown in the site's success popup. Returned as `message` so the clients
// (blog.js, cta.js) pick it up centrally rather than each hardcoding it.
const MESSAGE_NEW =
  'You’re on the list.';

const MESSAGE_EXISTING =
  'You’re already on the list.';

const MESSAGE_ANSWERED = 'Saved.';

const MESSAGE_RESUBSCRIBED = 'You’re back on the list.';

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
 * Sends the confirmation now with the answers included. Returns false when the
 * email already went out, so a late answer does not trigger a second one.
 */
function flushConfirmation(email, apiKey, options) {
  const timer = pendingConfirmations.get(email);
  if (!timer) return false;
  clearTimeout(timer);
  pendingConfirmations.delete(email);
  deliverConfirmation(email, apiKey, options);
  return true;
}

async function updateContactProperties(email, properties, apiKey) {
  try {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[waitlist] property update failed for ${email} (${response.status}): ${text.slice(0, 300)}`);
    }
    return response.ok;
  } catch (error) {
    console.error(`[waitlist] property update errored for ${email}: ${error.message}`);
    return false;
  }
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

/** Clears the opt-out so a rejoining contact actually receives mail again. */
async function resubscribeContact(email, apiKey) {
  try {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unsubscribed: false }),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[waitlist] resubscribe failed for ${email} (${response.status}): ${text.slice(0, 300)}`);
    }
    return response.ok;
  } catch (error) {
    console.error(`[waitlist] resubscribe errored for ${email}: ${error.message}`);
    return false;
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

    const properties = {};
    if (platform) properties.platform = platform;
    if (googleEmail) properties.google_account = googleEmail;

    // Ask first: Resend answers 200 whether or not the contact already exists,
    // so only an explicit lookup can tell a new signup from a repeat.
    const existing = await lookupContact(trimmedEmail, RESEND_API_KEY);

    // Rejoining after unsubscribing is a real signup, not a duplicate. Clear
    // the opt-out and fall through so they get a confirmation like anyone else.
    if (existing.status === 'exists' && existing.unsubscribed) {
      await resubscribeContact(trimmedEmail, RESEND_API_KEY);
      if (Object.keys(properties).length) {
        await updateContactProperties(trimmedEmail, properties, RESEND_API_KEY);
      }
      console.log(`[waitlist] resubscribed ${trimmedEmail} platform=${platform || 'unknown'}`);

      if (platform) {
        deliverConfirmation(trimmedEmail, RESEND_API_KEY, { platform, googleEmail });
      } else {
        scheduleConfirmation(trimmedEmail, RESEND_API_KEY, {});
      }
      return res.status(200).json({ success: true, message: MESSAGE_RESUBSCRIBED });
    }

    if (existing.status === 'exists') {
      // The popup's platform answer arrives as a second request for an address
      // we already stored. That is an update, not a duplicate signup.
      if (platform) {
        await updateContactProperties(trimmedEmail, properties, RESEND_API_KEY);
        console.log(`[waitlist] updated ${trimmedEmail} platform=${platform} google=${googleEmail || 'none'}`);
        flushConfirmation(trimmedEmail, RESEND_API_KEY, { platform, googleEmail });
        return res.status(200).json({ success: true, message: MESSAGE_ANSWERED });
      }

      return res.status(200).json({
        success: true,
        message: MESSAGE_EXISTING
      });
    }

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
      message: MESSAGE_NEW
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
};
