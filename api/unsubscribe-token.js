/**
 * Signed unsubscribe tokens.
 *
 * The link has to work from an email client with no session, so the address
 * travels in the URL. Without a signature anyone could unsubscribe anyone by
 * editing the query string, so each link carries an HMAC of the address.
 *
 * The key is derived from RESEND_API_KEY rather than a new secret: it is
 * already present on the service, and rotating it simply invalidates old
 * links, which is acceptable for an unsubscribe.
 */

const crypto = require('crypto');

function sign(email, secret) {
  return crypto
    .createHmac('sha256', String(secret || ''))
    .update(`unsubscribe:${String(email).trim().toLowerCase()}`)
    .digest('base64url')
    .slice(0, 32);
}

/** Constant-time compare, so the token cannot be guessed byte by byte. */
function verify(email, token, secret) {
  const expected = sign(email, secret);
  const given = String(token || '');
  if (expected.length !== given.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

function buildUrl(email, secret, origin = 'https://lunesynth.com') {
  const address = String(email).trim().toLowerCase();
  const query = new URLSearchParams({ e: address, t: sign(address, secret) });
  return `${origin}/unsubscribe?${query}`;
}

module.exports = { sign, verify, buildUrl };
