'use strict';

/**
 * Unit coverage for api/meta-capi.js: the server-side Meta Conversions API
 * (CAPI) Lead event. Every test stubs global.fetch -- nothing here ever
 * reaches the real Graph API. Covers: dormant-by-default (no env vars -> no
 * network call at all), consent gating, email hashing, and failure
 * isolation (a rejected or thrown fetch never throws out of this module).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const CAPI_PATH = require.resolve('../api/meta-capi.js');

function freshCapi() {
  delete require.cache[CAPI_PATH];
  // eslint-disable-next-line global-require
  return require('../api/meta-capi.js');
}

function withEnv(vars, fn) {
  const previous = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(previous)) {
        if (previous[key] === undefined) delete process.env[key];
        else process.env[key] = previous[key];
      }
    });
}

function installFetchStub(responder) {
  const calls = [];
  const original = global.fetch;
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options, body: options.body ? JSON.parse(options.body) : undefined });
    return responder(calls[calls.length - 1]);
  };
  return { calls, restore: () => { global.fetch = original; } };
}

test('sendCapiLeadEvent is a strict no-op with no env vars set -- no network call at all', async () => {
  await withEnv({ META_PIXEL_ID: undefined, META_CAPI_ACCESS_TOKEN: undefined }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const stub = installFetchStub(() => { throw new Error('must not be called'); });
    try {
      const result = await sendCapiLeadEvent({
        email: 'person@example.com',
        eventId: 'evt-1',
        consent: 'granted',
      });
      assert.equal(result.sent, false);
      assert.equal(result.reason, 'not_configured');
      assert.equal(stub.calls.length, 0);
    } finally {
      stub.restore();
    }
  });
});

test('never sends for an unconsented visitor even when fully configured', async () => {
  await withEnv({ META_PIXEL_ID: '123', META_CAPI_ACCESS_TOKEN: 'token-abc' }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const stub = installFetchStub(() => { throw new Error('must not be called'); });
    try {
      const declined = await sendCapiLeadEvent({ email: 'a@b.com', eventId: 'evt-1', consent: 'denied' });
      assert.equal(declined.sent, false);
      assert.equal(declined.reason, 'no_consent');

      const missing = await sendCapiLeadEvent({ email: 'a@b.com', eventId: 'evt-1' });
      assert.equal(missing.sent, false);
      assert.equal(missing.reason, 'no_consent');

      assert.equal(stub.calls.length, 0);
    } finally {
      stub.restore();
    }
  });
});

test('requires a usable email and event_id even with consent granted', async () => {
  await withEnv({ META_PIXEL_ID: '123', META_CAPI_ACCESS_TOKEN: 'token-abc' }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const stub = installFetchStub(() => { throw new Error('must not be called'); });
    try {
      const noEmail = await sendCapiLeadEvent({ eventId: 'evt-1', consent: 'granted' });
      assert.equal(noEmail.reason, 'no_email');

      const noEventId = await sendCapiLeadEvent({ email: 'a@b.com', consent: 'granted' });
      assert.equal(noEventId.reason, 'no_event_id');

      assert.equal(stub.calls.length, 0);
    } finally {
      stub.restore();
    }
  });
});

test('sends a correctly shaped, hashed Lead event when fully configured and consented', async () => {
  await withEnv({ META_PIXEL_ID: '999888777', META_CAPI_ACCESS_TOKEN: 'secret-token', META_CAPI_TEST_EVENT_CODE: 'TEST1234' }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const stub = installFetchStub(() => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' }));
    try {
      const result = await sendCapiLeadEvent({
        email: ' Person@Example.com ',
        eventId: 'evt-42',
        consent: 'granted',
        ip: '203.0.113.9',
        userAgent: 'TestAgent/1.0',
        cookieHeader: '_fbp=fb.1.111.222; _fbc=fb.1.333.444; other=value',
        eventSourceUrl: 'https://lunesynth.com/campaign/students/',
        attribution: { utm_source: 'facebook', utm_campaign: 'waitlist-students', signup_page: '/campaign/students/' },
      });

      assert.equal(result.sent, true);
      assert.equal(stub.calls.length, 1);

      const call = stub.calls[0];
      assert.ok(call.url.startsWith('https://graph.facebook.com/'));
      assert.ok(call.url.includes('999888777'));
      assert.ok(call.url.includes('access_token=secret-token'));

      const event = call.body.data[0];
      assert.equal(event.event_name, 'Lead');
      assert.equal(event.event_id, 'evt-42');
      assert.equal(event.action_source, 'website');
      assert.equal(event.event_source_url, 'https://lunesynth.com/campaign/students/');

      const expectedHash = crypto.createHash('sha256').update('person@example.com', 'utf8').digest('hex');
      assert.deepEqual(event.user_data.em, [expectedHash]);
      assert.equal(event.user_data.client_ip_address, '203.0.113.9');
      assert.equal(event.user_data.client_user_agent, 'TestAgent/1.0');
      assert.equal(event.user_data.fbp, 'fb.1.111.222');
      assert.equal(event.user_data.fbc, 'fb.1.333.444');

      // signup_page is not a utm_* field; custom_data stays scoped to utm_*.
      assert.deepEqual(event.custom_data, { utm_source: 'facebook', utm_campaign: 'waitlist-students' });
      assert.equal(call.body.test_event_code, 'TEST1234');

      // The email itself is never sent in the clear.
      assert.ok(!JSON.stringify(call.body).includes('person@example.com'));
    } finally {
      stub.restore();
    }
  });
});

test('a rejected Graph API response never throws and is reported, not raised', async () => {
  await withEnv({ META_PIXEL_ID: '1', META_CAPI_ACCESS_TOKEN: 'tok' }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const stub = installFetchStub(() => ({ ok: false, status: 400, json: async () => ({}), text: async () => 'Invalid parameter' }));
    try {
      const result = await sendCapiLeadEvent({ email: 'a@b.com', eventId: 'evt-1', consent: 'granted' });
      assert.equal(result.sent, false);
      assert.equal(result.reason, 'rejected');
      assert.equal(result.status, 400);
    } finally {
      stub.restore();
    }
  });
});

test('a thrown/rejected fetch (network error, timeout) never escapes sendCapiLeadEvent', async () => {
  await withEnv({ META_PIXEL_ID: '1', META_CAPI_ACCESS_TOKEN: 'tok' }, async () => {
    const { sendCapiLeadEvent } = freshCapi();
    const original = global.fetch;
    global.fetch = async () => { throw new Error('ECONNRESET'); };
    try {
      const result = await sendCapiLeadEvent({ email: 'a@b.com', eventId: 'evt-1', consent: 'granted' });
      assert.equal(result.sent, false);
      assert.equal(result.reason, 'error');
    } finally {
      global.fetch = original;
    }
  });
});

test('parseCookieHeader tolerates malformed and empty input', () => {
  const { parseCookieHeader } = freshCapi();
  assert.deepEqual(parseCookieHeader(''), {});
  assert.deepEqual(parseCookieHeader(undefined), {});
  assert.deepEqual(parseCookieHeader('justtext;;='), {});
  assert.deepEqual(parseCookieHeader('_fbp=fb.1.1.1; _fbc=fb.1.2.2'), { _fbp: 'fb.1.1.1', _fbc: 'fb.1.2.2' });
});

test('normalizeEmailForHash trims and lowercases, and rejects non-strings', () => {
  const { normalizeEmailForHash } = freshCapi();
  assert.equal(normalizeEmailForHash('  Foo@Bar.COM  '), 'foo@bar.com');
  assert.equal(normalizeEmailForHash(null), '');
  assert.equal(normalizeEmailForHash(42), '');
});
