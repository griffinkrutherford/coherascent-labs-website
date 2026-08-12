/**
 * Waitlist confirmation email.
 *
 * Sent after an address is stored, purely as a courtesy — the caller must never
 * fail a waitlist submission because this failed. See sendWaitlistConfirmation.
 *
 * The email asks the recruiting question (phone platform, and the Google account
 * email for Android users) because Play closed-testing invites key off the
 * tester's Google account, which is often not their signup address.
 *
 * Mail-client constraints this file is written against:
 *   - Gmail strips <style> blocks, so every style is inline.
 *   - Outlook ignores background-image, so every gradient carries a solid
 *     background-color fallback near the sweep's midpoint.
 *   - CSS custom properties are unsupported, so hex values are repeated.
 *   - No web font is fetched, so stacks lead with system fallbacks.
 */

const { buildUrl } = require('./unsubscribe-token.js');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// mail.lunesynth.com is the verified sending domain; the apex lunesynth.com is
// NOT verified for sending and will be rejected. Sending from the subdomain
// also keeps the apex's reputation insulated from anything that happens here.
//
// A human From rather than noreply@: this email exists to get replies, and
// "noreply" tells people not to bother.
const FROM = 'Griffin at Lune Synth <griffin@mail.lunesynth.com>';
const REPLY_TO = 'griffin@lunesynth.com';

const SUBJECT = "You're on the Lune Synth beta list — one quick question";
// The backfill goes to people who signed up weeks ago and needs a reply,
// not a brand impression. A short question reads as a person writing to
// you; an announcement-shaped subject reads as a campaign and sorts that
// way in Gmail.
const SUBJECT_REMINDER = "Android or iPhone?";
const PREHEADER = 'One quick question so your invite reaches the right place.';

const LOGO_URL = 'https://lunesynth.com/images/lune-synth-icon-120.png';

const TIMEOUT_MS = 3000;
const MAX_ATTEMPTS = 2;

// Brand tokens, repeated literally because var() does not work in email.
const PAGE_BG = '#050914';
const CARD_BG = '#081122';
const BORDER = '#251f3f';
const TEXT = '#edf5ff';
const MUTED = '#a6bad7';
const FAINT = '#6d82a3';
const ON_ACCENT = '#06111f';
const SWEEP = 'linear-gradient(120deg,#64a8ff 0%,#a47bff 50%,#ff5d87 100%)';
// Midpoint of the sweep, used wherever Outlook will drop the gradient.
const SWEEP_FALLBACK = '#a47bff';

const SANS = "'Plus Jakarta Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'Roboto Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The signup form now asks for platform up front, so most recipients have
 * already answered. Only re-ask when the answer is genuinely missing --
 * repeating a question they just answered reads as broken.
 */
function questionState({ platform, googleEmail } = {}) {
  if (platform === 'ios') return 'ios_known';
  if (platform === 'android') return googleEmail ? 'android_known' : 'android_needs_email';
  return 'unknown';
}

function buildHtml(options = {}) {
  const state = questionState(options);
  const unsubscribeUrl = options.unsubscribeUrl || '';
  const recipient = options.email || 'your signup email';
  const googleEmail = options.googleEmail || '';
  const replyHref = `mailto:${REPLY_TO}?subject=${encodeURIComponent('My phone: Android / iPhone')}`;

  const blocks = {
    unknown: {
      eyebrow: 'Before we can invite you',
      title: 'Reply with one word: <span style="color:' + TEXT + ';">Android</span> or <span style="color:' + TEXT + ';">iPhone</span>.',
      body: 'That&rsquo;s it &mdash; that&rsquo;s the whole ask.',
      note: '<strong style="color:' + MUTED + ';">Android only:</strong> your Play invite goes to the Google account on your phone. '
        + 'If that isn&rsquo;t <span style="color:' + TEXT + ';">' + escapeHtml(recipient) + '</span>, include the right address. Otherwise nothing else needed.',
      cta: 'Reply Android or iPhone',
    },
    android_needs_email: {
      eyebrow: 'One thing still missing',
      title: 'Is your Play Store on <span style="color:' + TEXT + ';">' + escapeHtml(recipient) + '</span>?',
      body: 'If so, you&rsquo;re done &mdash; no need to reply.',
      note: 'If your phone uses a different Google account, reply with that address and we&rsquo;ll send the invite there instead.',
      cta: 'Mine is a different account',
    },
    android_known: {
      eyebrow: 'Your invite is set',
      title: 'We&rsquo;ll send your Play invite here:',
      body: '<span style="font-family:' + MONO + ';color:' + TEXT + ';">' + escapeHtml(googleEmail) + '</span>',
      note: 'That&rsquo;s the Google account your Play Store uses. If it&rsquo;s wrong, just reply and we&rsquo;ll fix it &mdash; otherwise the app never appears for you.',
      cta: 'That&rsquo;s not right',
    },
    ios_known: {
      eyebrow: 'Your invite is set',
      title: 'You&rsquo;re all set for TestFlight.',
      body: 'We&rsquo;ll send your iPhone invite to this address when your cohort opens.',
      note: 'Nothing else needed from you right now.',
      cta: null,
    },
  };

  const block = blocks[state];
  const ctaRow = block.cta
    ? `
<tr>
<td align="left" style="padding:24px 34px 0 34px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" bgcolor="${SWEEP_FALLBACK}" style="border-radius:9px;background-color:${SWEEP_FALLBACK};background-image:${SWEEP};">
<a href="${replyHref}" style="display:inline-block;padding:14px 30px;font-family:${SANS};font-size:15px;font-weight:700;line-height:1;color:${ON_ACCENT};text-decoration:none;border-radius:9px;">${block.cta}</a>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:16px 34px 0 34px;font-family:${SANS};font-size:14px;line-height:1.65;color:${FAINT};">
Or just hit reply &mdash; it reaches a person, not a robot.
</td>
</tr>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${escapeHtml(SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${PAGE_BG};opacity:0;">${escapeHtml(PREHEADER)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE_BG};margin:0;padding:0;">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${CARD_BG};border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">

<tr>
<td height="3" style="height:3px;line-height:3px;font-size:0;background-color:${SWEEP_FALLBACK};background-image:${SWEEP};">&nbsp;</td>
</tr>

<tr>
<td style="padding:30px 34px 0 34px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="middle" style="padding-right:12px;">
<img src="${LOGO_URL}" width="44" height="44" alt="Lune Synth" style="display:block;width:44px;height:44px;border:0;outline:none;text-decoration:none;" />
</td>
<td valign="middle" style="font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:3px;color:${TEXT};text-transform:uppercase;">LUNE&nbsp;SYNTH</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:26px 34px 0 34px;font-family:${SANS};font-size:25px;line-height:1.28;font-weight:800;color:${TEXT};">You&rsquo;re on the list.</td>
</tr>

<tr>
<td style="padding:14px 34px 0 34px;font-family:${SANS};font-size:15px;line-height:1.65;color:${MUTED};">
${options.reminder
  ? 'You joined the Lune Synth beta waitlist a little while back, and your spot is still reserved. We&rsquo;re assembling the first cohort now, and there&rsquo;s one thing we need before we can send your invite.'
  : 'Thanks for joining the Lune Synth beta waitlist. Invites go out in small cohorts, and yours is reserved.'}
</td>
</tr>

<tr>
<td style="padding:12px 34px 0 34px;font-family:${SANS};font-size:14px;line-height:1.6;color:${FAINT};">
Lune Synth is the anti-slop learning app: you do the work by hand, and it grades your actual reasoning step by step instead of handing you the answer.
</td>
</tr>

<tr>
<td style="padding:22px 34px 0 34px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE_BG};border:1px solid ${BORDER};border-radius:10px;">
<tr>
<td style="padding:20px 22px;font-family:${SANS};font-size:15px;line-height:1.65;color:${TEXT};">
<div style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:2px;color:${FAINT};text-transform:uppercase;padding-bottom:10px;">${block.eyebrow}</div>
<strong style="color:${TEXT};">${block.title}</strong>
<div style="padding-top:12px;color:${MUTED};">
${block.body}
</div>
<div style="padding-top:14px;font-size:14px;color:${FAINT};">
${block.note}
</div>
</td>
</tr>
</table>
</td>
</tr>

${ctaRow}

<tr>
<td style="padding:28px 34px 30px 34px;">
<div style="border-top:1px solid ${BORDER};padding-top:18px;font-family:${SANS};font-size:12px;line-height:1.6;color:${FAINT};">
You received this because you joined the Lune Synth beta waitlist at lunesynth.com.<br />
Lune Synth&trade; &mdash; the anti-slop learning app.${unsubscribeUrl
  ? `<br /><a href="${unsubscribeUrl}" style="color:${FAINT};text-decoration:underline;">Unsubscribe</a>`
  : ''}
</div>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function buildText(options = {}) {
  const state = questionState(options);
  const unsubscribeUrl = options.unsubscribeUrl || '';
  const recipient = options.email || 'your signup email';
  const googleEmail = options.googleEmail || '';

  const bodies = {
    unknown: `BEFORE WE CAN INVITE YOU

Reply with one word: Android or iPhone. That's the whole ask.

Android only: your Play invite goes to the Google account on your phone. If
that isn't ${recipient}, include the right address. Otherwise nothing else
needed.

Just reply to this email - it reaches a person, not a robot.`,

    android_needs_email: `ONE THING STILL MISSING

Is your Play Store on ${recipient}? If so, you're done - no need to reply.

If your phone uses a different Google account, reply with that address and
we'll send the invite there instead.`,

    android_known: `YOUR INVITE IS SET

We'll send your Play invite here:

  ${googleEmail}

That's the Google account your Play Store uses. If it's wrong, just reply and
we'll fix it - otherwise the app never appears for you.`,

    ios_known: `YOUR INVITE IS SET

You're all set for TestFlight. We'll send your iPhone invite to this address
when your cohort opens.

Nothing else needed from you right now.`,
  };

  const intro = options.reminder
    ? `You joined the Lune Synth beta waitlist a little while back, and your spot
is still reserved. We're assembling the first cohort now, and there's one thing
we need before we can send your invite.`
    : `Thanks for joining the Lune Synth beta waitlist. Invites go out in small
cohorts, and yours is reserved.`;

  return `You're on the list.

${intro}

Lune Synth is the anti-slop learning app: you do the work by hand, and it
grades your actual reasoning step by step instead of handing you the answer.

${bodies[state]}

--
You received this because you joined the Lune Synth beta waitlist at
lunesynth.com.
Lune Synth - the anti-slop learning app.
${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}\n` : ''}`;
}

/**
 * Sends the confirmation. Resolves with a result object; never throws.
 *
 * Retries at most once, and only for 429 / 5xx / network failures. A 422
 * (unverified sending domain, malformed address) fails identically on every
 * attempt, so retrying it only delays the log line.
 */
async function sendWaitlistConfirmation(email, apiKey, options = {}) {
  if (!apiKey) {
    return { sent: false, reason: 'missing_api_key' };
  }

  const state = questionState(options);
  const unsubscribeUrl = buildUrl(email, apiKey);
  const withUnsubscribe = { ...options, unsubscribeUrl, email };

  // Gmail sorts on appearance as much as content: table layout, a logo, a
  // styled CTA button and List-Unsubscribe together read as bulk marketing and
  // land in Promotions. When the whole point of a send is to get a reply, a
  // text-only message looks like a person wrote it and lands in Primary far
  // more often. Brand impression is worth less than being read.
  const textOnly = options.plain === true;

  const payload = JSON.stringify({
    from: FROM,
    to: [email],
    reply_to: REPLY_TO,
    // RFC 8058 one-click unsubscribe. Gmail and Apple Mail surface a native
    // "Unsubscribe" control from these, which diverts people who would
    // otherwise reach for the spam button.
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    subject: options.reminder
      ? SUBJECT_REMINDER
      : (state === 'unknown' || state === 'android_needs_email'
        ? SUBJECT
        : "You're on the Lune Synth beta list"),
    ...(textOnly ? {} : { html: buildHtml(withUnsubscribe) }),
    text: buildText(withUnsubscribe),
  });

  let lastReason = 'unknown';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
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
        console.error(
          `[waitlist] confirmation email failed (${lastReason}, attempt ${attempt}):`,
          body.slice(0, 500)
        );
        return { sent: false, reason: lastReason };
      }

      console.warn(`[waitlist] confirmation email ${lastReason}, retrying once`);
    } catch (error) {
      lastReason = error.name === 'AbortError' ? 'timeout' : 'network_error';

      if (attempt === MAX_ATTEMPTS) {
        console.error(
          `[waitlist] confirmation email failed (${lastReason}, attempt ${attempt}):`,
          error.message
        );
        return { sent: false, reason: lastReason };
      }

      console.warn(`[waitlist] confirmation email ${lastReason}, retrying once`);
    } finally {
      clearTimeout(timer);
    }
  }

  return { sent: false, reason: lastReason };
}

module.exports = {
  sendWaitlistConfirmation,
  // Exported for local preview/testing without sending mail.
  buildHtml,
  buildText,
  SUBJECT,
};
