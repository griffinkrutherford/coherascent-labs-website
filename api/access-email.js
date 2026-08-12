/**
 * Beta access email — the follow-up the waitlist letter promises.
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

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM = 'Griffin at Lune Synth <griffin@mail.lunesynth.com>';
const REPLY_TO = 'griffin@lunesynth.com';
const SUBJECT = 'Your Lune Synth beta access';

const TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 2;

/**
 * The offer, stated once. Must stay consistent with Terms §6 and the landing
 * page; changing it here without changing those is how a promise drifts.
 */
const OFFER = 'two months free, then 50% off Lune Synth Pro for as long as you keep the account';

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

function buildAccessLetter(options = {}) {
  const {
    platform,
    googleAccount = '',
    testflightUrl = '',
    playUrl = '',
    postalAddress = '',
    unsubscribeUrl = '',
  } = options;

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

${wrap(`As one of the first hundred, you get ${OFFER}. Nothing is charged during the beta, and I'll tell you plainly before that ever changes.`)}

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

— Griffin
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
    text: buildAccessLetter({ ...options, unsubscribeUrl }),
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

module.exports = { buildAccessLetter, sendAccessEmail, OFFER, SUBJECT };
