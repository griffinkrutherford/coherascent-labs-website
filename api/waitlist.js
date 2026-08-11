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
 * Process-local guard against sending twice for rapid repeat submits (a
 * double-clicked button, a retried request). This is deliberately NOT the
 * primary dedup mechanism -- it is lost on restart and not shared across
 * instances. Real dedup comes from the contact store rejecting the duplicate
 * before we ever reach the send.
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
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('Configuration Error: RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    // Call Resend's Contacts API
    // We send: email, unsubscribed: false, and a custom property to mark the source
    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: trimmedEmail,
        unsubscribed: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Gracefully handle duplicate emails. Already on the list, so no second
      // confirmation -- they got one when they first signed up.
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
    if (!sentRecently(trimmedEmail)) {
      markSent(trimmedEmail);
      sendWaitlistConfirmation(trimmedEmail, RESEND_API_KEY).then((result) => {
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
