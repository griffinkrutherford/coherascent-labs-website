/**
 * One-off backfill: ask existing waitlist signups which phone they use.
 *
 * Everyone who joined before the platform question shipped has no answer, and
 * the signup form can never reach them -- dedup correctly refuses to email an
 * address that is already a contact. This closes that gap.
 *
 *   # see who would be emailed, send nothing (default)
 *   RESEND_API_KEY=re_xxx node scripts/waitlist-backfill-ask.js
 *
 *   # actually send
 *   RESEND_API_KEY=re_xxx node scripts/waitlist-backfill-ask.js --send
 *
 * Safe to re-run. Each contact is marked with `platform_asked` immediately
 * after its send, so a crash halfway through cannot double-email anyone on the
 * next run. Requires scripts/resend-setup-properties.js to have run first.
 */

const { sendWaitlistConfirmation } = require('../api/waitlist-confirmation.js');

const API = 'https://api.resend.com';
const SEND = process.argv.includes('--send');
// Text-only sends look personal and are far likelier to reach Primary
// rather than Promotions -- which matters when the goal is a reply.
const PLAIN = process.argv.includes('--plain');
// Brand typography without the Promotions fingerprint -- no button, no
// logo image, no card. For broadcasts that want both look and a reply.
const LETTER = process.argv.includes('--letter');
const LIMIT_ARG = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : Infinity;

// Resend's default rate limit is ~2 requests/second. Each contact costs a GET,
// a send and a PATCH, so pace conservatively -- this is a one-off.
const PACE_MS = 700;

/**
 * Never send to these. Re-sending to an address that has already hard-bounced
 * damages the sending domain's reputation, which matters most while the domain
 * is new and has no history to absorb it.
 *
 * Extend at the command line with --exclude=a@b.com,c@d.com
 */
const NEVER_SEND = new Set([
  'support@lunesynth.com', // permanent bounce 2026-08-12: no mailbox exists
]);

/**
 * Restrict the run to specific addresses: --only=a@b.com,c@d.com
 *
 * --limit=1 depends on audience order, which changes as people sign up and get
 * marked. --only makes a test send deterministic.
 */
const ONLY_ARG = process.argv.find(a => a.startsWith('--only='));
const ONLY = ONLY_ARG
  ? new Set(ONLY_ARG.split('=')[1].split(',').map(e => e.trim().toLowerCase()).filter(Boolean))
  : null;

const EXCLUDE_ARG = process.argv.find(a => a.startsWith('--exclude='));
if (EXCLUDE_ARG) {
  EXCLUDE_ARG.split('=')[1].split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
    .forEach(e => NEVER_SEND.add(e));
}

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
    if (!ok) throw new Error(`list contacts failed (${status}): ${JSON.stringify(body).slice(0, 300)}`);

    const page = body.data || [];
    contacts.push(...page);
    if (page.length < 100) break;
    after = page[page.length - 1].id;
    await sleep(PACE_MS);
  }

  return contacts;
}

/** The list endpoint omits custom properties, so each contact needs its own fetch. */
async function getProperties(email, apiKey) {
  const { ok, body } = await api(`/contacts/${encodeURIComponent(email)}`, { method: 'GET' }, apiKey);
  if (!ok) return null;
  return (body && (body.properties || (body.data && body.data.properties))) || {};
}

(async () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.\n\n  RESEND_API_KEY=re_xxx node scripts/waitlist-backfill-ask.js');
    process.exit(1);
  }

  console.log(SEND ? 'MODE: SENDING\n' : 'MODE: dry run — nothing will be sent. Add --send to actually send.\n');
  console.log(PLAIN ? 'FORMAT: plain text (better Primary-inbox odds)\n' : 'FORMAT: branded HTML (add --plain for plain text)\n');
  if (ONLY) console.log(`RESTRICTED to: ${[...ONLY].join(', ')}\n`);

  const contacts = await listAllContacts(apiKey);
  console.log(`Audience: ${contacts.length} contact(s)\n`);

  const targets = [];
  const skipped = { answered: 0, asked: 0, unsubscribed: 0, unreadable: 0, blocked: 0 };

  for (const contact of contacts) {
    if (ONLY && !ONLY.has(contact.email.toLowerCase())) continue;
    if (NEVER_SEND.has(contact.email.toLowerCase())) {
      skipped.blocked += 1;
      console.log(`  excluded ${contact.email} (known bad address)`);
      continue;
    }
    if (contact.unsubscribed) { skipped.unsubscribed += 1; continue; }

    const properties = await getProperties(contact.email, apiKey);
    await sleep(PACE_MS);

    if (properties === null) { skipped.unreadable += 1; continue; }
    // --only is an explicit instruction, so it overrides the "already asked"
    // guard -- otherwise a second test send to yourself silently does nothing.
    if (!ONLY && properties.platform) { skipped.answered += 1; continue; }
    if (!ONLY && properties.platform_asked) { skipped.asked += 1; continue; }

    targets.push(contact.email);
  }

  console.log('Skipping:');
  console.log(`  ${String(skipped.answered).padStart(4)}  already told us their platform`);
  console.log(`  ${String(skipped.asked).padStart(4)}  already asked by a previous run`);
  console.log(`  ${String(skipped.unsubscribed).padStart(4)}  unsubscribed`);
  console.log(`  ${String(skipped.unreadable).padStart(4)}  could not read properties`);
  console.log(`  ${String(skipped.blocked).padStart(4)}  excluded (bounced / --exclude)`);
  console.log(`\nWould email ${targets.length} contact(s):`);
  targets.slice(0, 50).forEach(e => console.log(`  ${e}`));
  if (targets.length > 50) console.log(`  ... and ${targets.length - 50} more`);

  if (!SEND) {
    console.log('\nDry run complete. Re-run with --send to email the list above.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  let failed = 0;

  for (const email of targets.slice(0, LIMIT)) {
    const result = await sendWaitlistConfirmation(email, apiKey, { reminder: true, plain: PLAIN, style: LETTER ? 'letter' : 'full' });

    if (result.sent) {
      // Marked immediately, not at the end: a crash must not re-email anyone.
      await api(`/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: { platform_asked: today } }),
      }, apiKey);
      sent += 1;
      console.log(`  sent    ${email}`);
    } else {
      failed += 1;
      console.log(`  FAILED  ${email} (${result.reason})`);
    }

    await sleep(PACE_MS);
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
  if (failed) console.log('Failures are not marked, so re-running will retry only those.');
})();
