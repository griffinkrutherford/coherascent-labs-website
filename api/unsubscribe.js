/**
 * One-click unsubscribe endpoint.
 *
 * Handles both:
 *   GET  /unsubscribe?e=<email>&t=<token>   - the link in the email footer
 *   POST /unsubscribe?e=<email>&t=<token>   - List-Unsubscribe-Post (RFC 8058),
 *                                             which Gmail and Apple Mail call
 *                                             from their own UI
 *
 * Marks the contact unsubscribed in Resend. The backfill script already skips
 * unsubscribed contacts, so this is honoured on every future send.
 */

const { verify } = require('./unsubscribe-token.js');

function page(title, body, status) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${title} | Lune Synth</title></head>
<body style="margin:0;background:#050914;color:#edf5ff;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:72px 24px;">
<div style="background:#081122;border:1px solid #251f3f;border-radius:14px;padding:32px;">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${title}</h1>
<p style="margin:0;font-size:15px;line-height:1.65;color:#a6bad7;">${body}</p>
<p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#6d82a3;">
<a href="https://lunesynth.com/" style="color:#64a8ff;text-decoration:none;">lunesynth.com</a>
</p>
</div></div></body></html>`;
}

module.exports = async (req, res, query) => {
  const email = (query.get('e') || '').trim().toLowerCase();
  const token = query.get('t') || '';
  const apiKey = process.env.RESEND_API_KEY;

  const respond = (status, title, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(page(title, body, status));
  };

  if (!email || !token || !verify(email, token, apiKey)) {
    return respond(400, 'That link didn’t work',
      'The unsubscribe link looks incomplete or expired. Email '
      + '<a href="mailto:griffin@lunesynth.com" style="color:#64a8ff;">griffin@lunesynth.com</a> '
      + 'and we’ll remove you right away.');
  }

  if (!apiKey) {
    console.error('[unsubscribe] RESEND_API_KEY is not set');
    return respond(500, 'Something went wrong',
      'We couldn’t process that just now. Email '
      + '<a href="mailto:griffin@lunesynth.com" style="color:#64a8ff;">griffin@lunesynth.com</a> '
      + 'and we’ll remove you manually.');
  }

  try {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unsubscribed: true }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[unsubscribe] failed for ${email} (${response.status}): ${text.slice(0, 300)}`);
      // A 404 means they are not on the list, which is the outcome they wanted.
      if (response.status !== 404) {
        return respond(500, 'Something went wrong',
          'We couldn’t process that just now. Email '
          + '<a href="mailto:griffin@lunesynth.com" style="color:#64a8ff;">griffin@lunesynth.com</a> '
          + 'and we’ll remove you manually.');
      }
    }

    console.log(`[unsubscribe] ${email}`);
    return respond(200, 'You’re unsubscribed',
      `We won’t email <strong style="color:#edf5ff;">${email}</strong> about the Lune Synth beta again. `
      + 'If this was a mistake, just join the waitlist again at lunesynth.com.');
  } catch (error) {
    console.error(`[unsubscribe] errored for ${email}: ${error.message}`);
    return respond(500, 'Something went wrong',
      'We couldn’t process that just now. Email '
      + '<a href="mailto:griffin@lunesynth.com" style="color:#64a8ff;">griffin@lunesynth.com</a> '
      + 'and we’ll remove you manually.');
  }
};
