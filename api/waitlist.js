const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;
const RESEND_TIMEOUT_MS = 8000;
const attemptsByClient = new Map();

function getClientId(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return (req.headers && req.headers['x-real-ip']) || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRateLimit(req) {
  const now = Date.now();
  const clientId = getClientId(req);
  const current = attemptsByClient.get(clientId);

  if (attemptsByClient.size > 1000) {
    for (const [key, value] of attemptsByClient) {
      if (now - value.startedAt >= RATE_LIMIT_WINDOW_MS) attemptsByClient.delete(key);
    }
  }

  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    attemptsByClient.set(clientId, { count: 1, startedAt: now });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count <= RATE_LIMIT_MAX_ATTEMPTS) return { allowed: true, retryAfter: 0 };

  return {
    allowed: false,
    retryAfter: Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - current.startedAt)) / 1000)),
  };
}

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function setCorsHeaders(req, res) {
  const configuredHost = process.env.LUNE_SYNTH_DOMAIN || 'lunesynth.com';
  const allowedOrigins = new Set([
    `https://${configuredHost}`,
    `https://www.${configuredHost}`,
  ]);
  const origin = req.headers && req.headers.origin;

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  return !origin || allowedOrigins.has(origin);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const originAllowed = setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed.' });
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!originAllowed) {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const rateLimit = checkRateLimit(req);
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfter));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('Configuration Error: RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
    let response;

    try {
      response = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          unsubscribed: false,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMessage = typeof data.message === 'string' ? data.message.toLowerCase() : '';
      if (providerMessage.includes('already exists') || providerMessage.includes('duplicate')) {
        return res.status(200).json({
          success: true,
          message: 'Already subscribed! You are already on the waitlist.'
        });
      }

      console.error('Resend API error:', response.status, providerMessage || 'No provider message');
      return res.status(502).json({ error: 'Could not join the waitlist right now. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully added to waitlist!'
    });

  } catch (error) {
    if (error && error.name === 'AbortError') {
      console.error('Resend API request timed out.');
      return res.status(504).json({ error: 'The waitlist service timed out. Please try again.' });
    }

    console.error('Waitlist handler error:', error && error.message ? error.message : error);
    return res.status(500).json({ error: 'Could not join the waitlist right now. Please try again.' });
  }
};
