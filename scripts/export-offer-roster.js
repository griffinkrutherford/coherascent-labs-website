#!/usr/bin/env node
/**
 * Read-only roster export: every waitlist contact, tagged with the beta
 * offer (if any) their signup earned -- Founding 40 (Terms §6.1), First
 * Light (Terms §6.2), or none. Griffin's reference for support replies and
 * for double-checking who a promotional send should and should not reach.
 *
 *   RESEND_API_KEY=re_xxx node scripts/export-offer-roster.js
 *   RESEND_API_KEY=re_xxx node scripts/export-offer-roster.js --tier=founding-40
 *   RESEND_API_KEY=re_xxx node scripts/export-offer-roster.js --format=json
 *   RESEND_API_KEY=re_xxx node scripts/export-offer-roster.js --out=roster.csv
 *
 * Never writes to Resend. Contact properties (platform) are fetched only to
 * enrich the roster; nothing here can grant or revoke an offer -- that is
 * decided solely by classifyOfferTier() against the recorded signup time.
 */

'use strict';

const fs = require('fs');
const { classifyOfferTier } = require('../lune-synth/campaign/offer-eligibility.js');

const API = 'https://api.resend.com';
const PACE_MS = 700;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const argv = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const found = argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const TIER_FILTER = arg('tier', 'all');
const FORMAT = arg('format', 'csv');
const OUT_PATH = arg('out', '');

if (!['all', 'founding-40', 'first-light', 'none'].includes(TIER_FILTER)) {
  console.error(`Unknown --tier value "${TIER_FILTER}". Use founding-40, first-light, none, or all.`);
  process.exit(1);
}
if (!['csv', 'json'].includes(FORMAT)) {
  console.error(`Unknown --format value "${FORMAT}". Use csv or json.`);
  process.exit(1);
}

/**
 * Builds one roster row from a Resend contact plus its properties. Pure and
 * exported for tests: no network, no filesystem, no environment.
 */
function buildRosterRow(contact, properties) {
  const props = properties || {};
  return {
    email: contact.email,
    createdAt: contact.created_at || '',
    tier: classifyOfferTier(contact.created_at),
    platform: props.platform || '',
    unsubscribed: contact.unsubscribed === true,
  };
}

const CSV_COLUMNS = ['email', 'createdAt', 'tier', 'platform', 'unsubscribed'];

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Pure formatting, exported for tests. */
function rowsToCsv(rows) {
  const header = CSV_COLUMNS.join(',');
  const lines = rows.map((row) => CSV_COLUMNS.map((column) => csvEscape(row[column])).join(','));
  return [header, ...lines].join('\n') + '\n';
}

function rowsToJson(rows) {
  return JSON.stringify(rows, null, 2) + '\n';
}

function filterRows(rows, tierFilter) {
  return tierFilter === 'all' ? rows : rows.filter((row) => row.tier === tierFilter);
}

// --- Network glue below; nothing above touches the network. -----------

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
  try { body = text ? JSON.parse(text) : {}; } catch (error) { body = { raw: text }; }
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

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.\n\n  RESEND_API_KEY=re_xxx node scripts/export-offer-roster.js');
    process.exit(1);
  }

  const contacts = await listAllContacts(apiKey);
  console.error(`[roster] fetched ${contacts.length} contact(s), reading properties...`);

  const rows = [];
  for (const contact of contacts) {
    const properties = await getProperties(contact.email, apiKey);
    await sleep(PACE_MS);
    rows.push(buildRosterRow(contact, properties));
  }

  const filtered = filterRows(rows, TIER_FILTER);
  const counts = rows.reduce((acc, row) => {
    acc[row.tier] = (acc[row.tier] || 0) + 1;
    return acc;
  }, {});
  console.error(
    `[roster] ${rows.length} total -- founding-40: ${counts['founding-40'] || 0}, `
    + `first-light: ${counts['first-light'] || 0}, none: ${counts.none || 0}`
  );
  if (TIER_FILTER !== 'all') console.error(`[roster] filtered to tier=${TIER_FILTER}: ${filtered.length} row(s)`);

  const output = FORMAT === 'json' ? rowsToJson(filtered) : rowsToCsv(filtered);
  if (OUT_PATH) {
    fs.writeFileSync(OUT_PATH, output);
    console.error(`[roster] wrote ${OUT_PATH}`);
  } else {
    process.stdout.write(output);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[roster] failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { buildRosterRow, rowsToCsv, rowsToJson, filterRows, CSV_COLUMNS };
