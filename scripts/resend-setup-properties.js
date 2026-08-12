/**
 * One-time setup: define the custom contact properties the waitlist writes.
 *
 *   RESEND_API_KEY=re_xxx node scripts/resend-setup-properties.js
 *
 * Safe to re-run -- an "already exists" response is treated as success.
 *
 * Resend constrains property keys to alphanumerics and underscores (max 50)
 * and values to string or number.
 */

const ENDPOINT = 'https://api.resend.com/contact-properties';

const PROPERTIES = [
  {
    key: 'platform',
    type: 'string',
    fallbackValue: 'unknown',
    note: 'ios | android -- which phone the tester will use',
  },
  {
    key: 'google_account',
    type: 'string',
    fallbackValue: '',
    note: 'Play Store Google account, required to send an Android invite',
  },
  {
    key: 'platform_asked',
    type: 'string',
    fallbackValue: '',
    note: 'Date the backfill broadcast asked this contact; keeps re-runs idempotent',
  },
];

async function createProperty({ key, type, fallbackValue, note }, apiKey) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, type, fallbackValue }),
  });

  const body = await response.text();

  if (response.ok) {
    console.log(`  created  ${key.padEnd(16)} (${type})  -- ${note}`);
    return true;
  }

  // 409 is the authoritative "already defined" signal. Match on the status
  // rather than the message text, which reads "There is already a contact
  // property with this key" and defeated an earlier substring check.
  if (response.status === 409 || /already|duplicate|taken|exists/i.test(body)) {
    console.log(`  exists   ${key.padEnd(16)} (${type})  -- ${note}`);
    return true;
  }

  console.error(`  FAILED   ${key} -> HTTP ${response.status}: ${body.slice(0, 300)}`);
  return false;
}

(async () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.\n\nUsage:\n  RESEND_API_KEY=re_xxx node scripts/resend-setup-properties.js');
    process.exit(1);
  }

  console.log('Defining Resend contact properties for the waitlist:\n');
  const results = [];
  for (const property of PROPERTIES) {
    results.push(await createProperty(property, apiKey));
  }

  const ok = results.every(Boolean);
  console.log(ok
    ? '\nAll properties ready. The waitlist can now write them on each signup.'
    : '\nSome properties failed. The waitlist still works -- it retries without '
      + 'properties and logs the values -- but they will not be stored.');
  process.exit(ok ? 0 : 1);
})();
