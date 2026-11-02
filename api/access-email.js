/**
 * Beta access email, the follow-up the waitlist letter promises.
 *
 * Sent once a build exists, only to contacts who answered the platform
 * question, and tailored per platform because the two stores work differently:
 *
 *   iOS      TestFlight invite, opened with the TestFlight app.
 *   Android  A Play opt-in URL that only works while signed in as the Google
 *            account we recorded. Getting that wrong is the single most common
 *            way closed testing fails, which is why we collected it.
 *
 * Unlike the waitlist letter, this one names the founding-member offer, so it
 * is commercial email under CAN-SPAM and carries a physical postal address.
 * sendAccessEmail refuses to send without one.
 */

const { buildUrl } = require('./unsubscribe-token.js');
const { classifyOfferTier } = require('../lune-synth/campaign/offer-eligibility.js');

/**
 * The Founding 50 cohort is the waitlist signups before the cutoff (see
 * offer-eligibility.js) PLUS a small number of people the owner invited
 * individually and who may have joined the waitlist after that cutoff, or
 * not through the waitlist at all. There is no signup timestamp that could
 * classify them correctly, so they are named here instead, server-side only
 * -- read fresh on every call (never cached at require-time) so a deploy's
 * env change takes effect without a restart. Comma-separated; each address
 * is trimmed and lowercased before comparison. Never commit real addresses
 * here -- this reads an environment variable, not a file.
 */
function foundingExtraEmails() {
  const raw = process.env.FOUNDING_EXTRA_EMAILS || '';
  return new Set(raw.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean));
}

/**
 * Same three-way result as classifyOfferTier, but an individually-invited
 * Founding 50 email overrides whatever the signup timestamp alone would say.
 */
function resolveOfferTier(createdAt, email) {
  if (email && foundingExtraEmails().has(String(email).trim().toLowerCase())) return 'founding-40';
  return classifyOfferTier(createdAt);
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM = 'Griffin at Lune Synth <griffin@mail.lunesynth.com>';
const REPLY_TO = 'griffin@lunesynth.com';
const SUBJECT = 'Your Lune Synth beta access';

const TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 2;

/**
 * The two offers, each stated once. Must stay consistent with Terms §6 and
 * the landing page; changing the wording here without changing those is how
 * a promise drifts. Which one (if either) applies to a given recipient is
 * decided by classifyOfferTier(), never assumed -- see buildAccessLetter.
 */
const OFFER_FOUNDING_40 = 'two months free, then 50% off Lune Synth Pro for as long as you keep the account';
const OFFER_FIRST_LIGHT = '50% off your first three months of Lune Synth Pro Monthly, or $39.99 for your first year of Lune Synth Pro Annual (normally $59.88), once it launches';
// Kept for any external caller still importing the old name.
const OFFER = OFFER_FOUNDING_40;

/**
 * Wraps a paragraph to `width`. Used where a constant is interpolated into
 * prose -- hand-wrapping around a variable breaks the moment the variable's
 * length changes, which is exactly what happened with OFFER.
 */
function wrap(text, width = 76) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if ((line + ' ' + word).length <= width) line += ' ' + word;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/**
 * The offer paragraph for a given tier, or '' for 'none' -- pulled out as its
 * own function so tests can cover all three branches directly, without
 * needing a real First Light window open to exercise that copy.
 */
function offerParagraphForTier(tier) {
  if (tier === 'founding-40') {
    return wrap(`As a Founding 50 member, you get ${OFFER_FOUNDING_40}. Nothing is charged during the beta, and I'll tell you plainly before that ever changes.`);
  }
  if (tier === 'first-light') {
    return wrap(`As a First Light signup, you get ${OFFER_FIRST_LIGHT}. Nothing is charged during the beta, and I'll tell you plainly before that ever changes.`);
  }
  return '';
}

function buildAccessLetter(options = {}) {
  const {
    platform,
    googleAccount = '',
    testflightUrl = '',
    playUrl = '',
    postalAddress = '',
    unsubscribeUrl = '',
    createdAt,
    email = '',
  } = options;

  // Decided by the signup's actual recorded time, never by guessing at the
  // audience -- see offer-eligibility.js -- except for the handful of
  // individually-invited Founding 50 names in FOUNDING_EXTRA_EMAILS, which
  // override the timestamp. A caller that omits both createdAt and a listed
  // email gets 'none': the safe default is to promise nothing rather than
  // over-promise.
  const tier = resolveOfferTier(createdAt, email);
  const offerParagraph = offerParagraphForTier(tier);

  const access = platform === 'android'
    ? `Here's your access link:

${playUrl}

Important: open that link while signed in to Google as ${googleAccount}.
Play only shows the test build to the account on the tester list, so a
different account will show nothing at all. If you need me to switch it to
another address, just reply.

Once you're opted in, Play may take a few minutes to show the install
button. That wait is normal.`
    : `Here's your invite:

${testflightUrl}

Install Apple's TestFlight app first if you don't have it, then open that
link on your iPhone and it will appear as an available build.`;

  return `Hi, your Lune Synth beta access is ready.

Thank you for waiting, and for answering the platform question. That's what
made it possible to send this to the right place.

${access}
${offerParagraph ? `\n${offerParagraph}\n` : ''}
Getting started takes about five minutes:

  1. Photograph a page of your own handwritten work, any subject.
  2. Read the step by step feedback. It grades your reasoning, not just
     the final answer.
  3. Take the Quick Mission it suggests. That's the part that builds the
     skill.

This is an early build, so you will find rough edges. Telling me about them
is the single most useful thing you can do, and replies to this email reach
me directly.

Thanks for being early. It genuinely helps.

Griffin
Lune Synth

${postalAddress}
${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}\n` : ''}`;
}

async function sendAccessEmail(email, apiKey, options = {}) {
  if (!apiKey) return { sent: false, reason: 'missing_api_key' };

  // CAN-SPAM: this email names a discount, so it is commercial and must carry a
  // physical postal address. Refusing here rather than sending without one.
  if (!options.postalAddress) {
    return { sent: false, reason: 'missing_postal_address' };
  }
  if (options.platform === 'android' && !options.playUrl) {
    return { sent: false, reason: 'missing_play_url' };
  }
  if (options.platform === 'ios' && !options.testflightUrl) {
    return { sent: false, reason: 'missing_testflight_url' };
  }

  const unsubscribeUrl = buildUrl(email, apiKey);
  const payload = JSON.stringify({
    from: FROM,
    to: [email],
    reply_to: REPLY_TO,
    subject: SUBJECT,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    text: buildAccessLetter({ ...options, email, unsubscribeUrl }),
  });

  let lastReason = 'unknown';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: payload,
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return { sent: true, id: data.id };
      }

      const body = await response.text().catch(() => '');
      lastReason = `http_${response.status}`;
      const retriable = response.status === 429 || response.status >= 500;
      if (!retriable || attempt === MAX_ATTEMPTS) {
        console.error(`[access] failed for ${email} (${lastReason}): ${body.slice(0, 300)}`);
        return { sent: false, reason: lastReason };
      }
    } catch (error) {
      lastReason = error.name === 'AbortError' ? 'timeout' : 'network_error';
      if (attempt === MAX_ATTEMPTS) {
        console.error(`[access] failed for ${email} (${lastReason}): ${error.message}`);
        return { sent: false, reason: lastReason };
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return { sent: false, reason: lastReason };
}

module.exports = {
  buildAccessLetter,
  sendAccessEmail,
  offerParagraphForTier,
  resolveOfferTier,
  foundingExtraEmails,
  OFFER,
  OFFER_FOUNDING_40,
  OFFER_FIRST_LIGHT,
  SUBJECT,
};
