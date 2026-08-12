/**
 * Send beta access to everyone who answered the platform question.
 *
 *   # who would get it, sends nothing (default)
 *   RESEND_API_KEY=re_xxx node scripts/waitlist-send-access.js \
 *     --testflight-url=https://testflight.apple.com/join/XXXX \
 *     --play-url=https://play.google.com/apps/testing/com.example \
 *     --postal-address="Tano Holdings LLC, 123 Example St, City, ST 00000"
 *
 *   # actually send
 *   ... --send
 *
 * Only contacts with a `platform` property are eligible: without it we cannot
 * tell which store link to send, and a wrong link is worse than no email.
 * Anyone still unanswered should get another round of the backfill instead.
 *
 * Safe to re-run. Each contact is marked `access_sent` immediately after its
 * own send, so a crash partway through cannot double-send on the next run.
 */

const { sendAccessEmail, buildAccessLetter } = require('../api/access-email.js');

const API = 'https://api.resend.com';
const argv = process.argv.slice(2);
const SEND = argv.includes('--send');
const arg = (name) => {
  const found = argv.find(a => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : '';
};

const TESTFLIGHT_URL = arg('testflight-url');
const PLAY_URL = arg('play-url');
const POSTAL_ADDRESS = arg('postal-address');
const LIMIT = arg('limit') ? parseInt(arg('limit'), 10) : Infinity;
const ONLY = arg('only')
  ? new Set(arg('only').split(',').map(e => e.trim().toLowerCase()).filter(Boolean))
  : null;

const NEVER_SEND = new Set(['support@lunesynth.com']);
const PACE_MS = 700;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path, options, apiKey) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options && options.headers),
    },
  });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch (e) { body = { raw: text }; }
  return { ok: response.ok, status: response.status, body };
}

async function listAllContacts(apiKey) {
  const contacts = [];
  let after = null;
  for (;;) {
    const query = new URLSearchParams({ limit: '100' });
    if (after) query.set('after', after);
    const { ok, status, body } = await api(`/contacts?${query}`, { method: 'GET' }, apiKey);
    if (!ok) throw new Error(`list contacts failed (${status})`);
    const page = body.data || [];
    contacts.push(...page);
    if (page.length < 100) break;
    after = page[page.length - 1].id;
    await sleep(PACE_MS);
  }
  return contacts;
}

async function getProperties(email, apiKey) {
  const { ok, body } = await api(`/contacts/${encodeURIComponent(email)}`, { method: 'GET' }, apiKey);
  if (!ok) return null;
  return (body && (body.properties || (body.data && body.data.properties))) || {};
}

(async () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    process.exit(1);
  }

  // Fail before touching the audience, not partway through it.
  const missing = [];
  if (!POSTAL_ADDRESS) missing.push('--postal-address (required: this email names the offer, so CAN-SPAM applies)');
  if (!TESTFLIGHT_URL) missing.push('--testflight-url (needed for iPhone testers)');
  if (!PLAY_URL) missing.push('--play-url (needed for Android testers)');
  if (missing.length) {
    console.error('Cannot send. Missing:\n  ' + missing.join('\n  ') + '\n');
    console.error('Run with --help-preview to see the email without sending.');
    if (!argv.includes('--help-preview')) process.exit(1);
  }

  if (argv.includes('--help-preview')) {
    console.log('=== ANDROID ===\n');
    console.log(buildAccessLetter({
      platform: 'android',
      googleAccount: 'tester@gmail.com',
      playUrl: PLAY_URL || 'https://play.google.com/apps/testing/…',
      postalAddress: POSTAL_ADDRESS || '[[MAILING ADDRESS]]',
      unsubscribeUrl: 'https://lunesynth.com/unsubscribe?e=…&t=…',
    }));
    console.log('\n\n=== iOS ===\n');
    console.log(buildAccessLetter({
      platform: 'ios',
      testflightUrl: TESTFLIGHT_URL || 'https://testflight.apple.com/join/…',
      postalAddress: POSTAL_ADDRESS || '[[MAILING ADDRESS]]',
      unsubscribeUrl: 'https://lunesynth.com/unsubscribe?e=…&t=…',
    }));
    return;
  }

  console.log(SEND ? 'MODE: SENDING\n' : 'MODE: dry run — nothing will be sent. Add --send to actually send.\n');

  const contacts = await listAllContacts(apiKey);
  console.log(`Audience: ${contacts.length} contact(s)\n`);

  const targets = [];
  const skipped = { noPlatform: 0, alreadySent: 0, unsubscribed: 0, blocked: 0, unreadable: 0 };

  for (const contact of contacts) {
    const email = contact.email.toLowerCase();
    if (ONLY && !ONLY.has(email)) continue;
    if (NEVER_SEND.has(email)) { skipped.blocked += 1; continue; }
    if (contact.unsubscribed) { skipped.unsubscribed += 1; continue; }

    const properties = await getProperties(contact.email, apiKey);
    await sleep(PACE_MS);
    if (properties === null) { skipped.unreadable += 1; continue; }

    // Without a platform we do not know which store link to send.
    if (!properties.platform) { skipped.noPlatform += 1; continue; }
    if (!ONLY && properties.access_sent) { skipped.alreadySent += 1; continue; }

    targets.push({
      email: contact.email,
      platform: properties.platform,
      googleAccount: properties.google_account || contact.email,
    });
  }

  console.log('Skipping:');
  console.log(`  ${String(skipped.noPlatform).padStart(4)}  no platform answer yet (send the backfill to these)`);
  console.log(`  ${String(skipped.alreadySent).padStart(4)}  already sent access`);
  console.log(`  ${String(skipped.unsubscribed).padStart(4)}  unsubscribed`);
  console.log(`  ${String(skipped.blocked).padStart(4)}  excluded`);
  console.log(`  ${String(skipped.unreadable).padStart(4)}  could not read properties`);

  const ios = targets.filter(t => t.platform === 'ios');
  const android = targets.filter(t => t.platform === 'android');
  console.log(`\nWould send to ${targets.length} contact(s): ${ios.length} iPhone, ${android.length} Android\n`);
  targets.slice(0, 50).forEach(t => console.log(
    `  ${t.platform.padEnd(8)} ${t.email}${t.platform === 'android' ? `  ->  ${t.googleAccount}` : ''}`
  ));

  if (!SEND) {
    console.log('\nDry run complete. Re-run with --send to email the list above.');
    console.log('Tip: --help-preview shows the exact email text for both platforms.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  let failed = 0;

  for (const target of targets.slice(0, LIMIT)) {
    const result = await sendAccessEmail(target.email, apiKey, {
      platform: target.platform,
      googleAccount: target.googleAccount,
      testflightUrl: TESTFLIGHT_URL,
      playUrl: PLAY_URL,
      postalAddress: POSTAL_ADDRESS,
    });

    if (result.sent) {
      await api(`/contacts/${encodeURIComponent(target.email)}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: { access_sent: today } }),
      }, apiKey);
      sent += 1;
      console.log(`  sent    ${target.platform.padEnd(8)} ${target.email}`);
    } else {
      failed += 1;
      console.log(`  FAILED  ${target.platform.padEnd(8)} ${target.email} (${result.reason})`);
    }
    await sleep(PACE_MS);
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
  if (failed) console.log('Failures are not marked, so re-running retries only those.');
})();
