'use strict';

/**
 * Unit-level coverage for the 2026-11-02 waitlist hardening in
 * api/waitlist.js: strict email validation, the honeypot field, the
 * per-IP rate limit, origin-restricted CORS, and refusing to write
 * anything -- resubscribe, property update, or email -- for a contact
 * that already exists (an unauthenticated POST is not proof of ownership
 * of the address it names).
 *
 * This calls the handler directly rather than going over HTTP (that's
 * test/server-routes.test.js and test/static-allowlist.test.js's job) so
 * that `fetch` can be stubbed -- nothing here ever reaches the real Resend
 * API or sends a real email. Every test that would otherwise touch the
 * network either short-circuits before the handler ever calls fetch
 * (honeypot, bad email, rate limit, wrong method) or runs against the stub
 * below.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const WAITLIST_PATH = require.resolve('../api/waitlist.js');

function freshWaitlistHandler() {
  delete require.cache[WAITLIST_PATH];
  // eslint-disable-next-line global-require
  return require('../api/waitlist.js');
}

function fakeReq({ method = 'POST', body = {}, origin, ip = '203.0.113.1' } = {}) {
  return {
    method,
    headers: {
      ...(origin ? { origin } : {}),
      'x-forwarded-for': ip,
    },
    socket: { remoteAddress: ip },
    body,
  };
}

function fakeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { res.headers[name.toLowerCase()] = value; },
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
    end() { return res; },
  };
  return res;
}

/** Fakes the handful of Resend endpoints this file calls. Records every call. */
function installFetchStub({ lookup = { status: 404 } } = {}) {
  const calls = [];
  const original = global.fetch;
  global.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    calls.push({ url: String(url), method, body: options.body ? JSON.parse(options.body) : undefined });

    if (String(url).includes('api.resend.com/contacts/') && method === 'GET') {
      if (lookup.status === 404) {
        return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { unsubscribed: !!lookup.unsubscribed, properties: lookup.properties || {} } }),
      };
    }
    if (String(url).includes('api.resend.com/contacts/') && method === 'PATCH') {
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
    }
    if (String(url).endsWith('api.resend.com/contacts') && method === 'POST') {
      return { ok: true, status: 200, json: async () => ({ id: 'contact_fake' }) };
    }
    // Anything else (e.g. the confirmation email send) -- never actually
    // reached by the "no platform" happy-path test below, but stubbed
    // defensively in case a future test exercises that branch.
    return { ok: true, status: 200, json: async () => ({ id: 'email_fake' }) };
  };
  return { calls, restore() { global.fetch = original; } };
}

test('OPTIONS preflight returns 200 and reflects only an allowed origin', async () => {
  const waitlist = freshWaitlistHandler();
  const resAllowed = fakeRes();
  await waitlist(fakeReq({ method: 'OPTIONS', origin: 'https://lunesynth.com' }), resAllowed);
  assert.equal(resAllowed.statusCode, 200);
  assert.equal(resAllowed.headers['access-control-allow-origin'], 'https://lunesynth.com');

  const resDenied = fakeRes();
  await waitlist(fakeReq({ method: 'OPTIONS', origin: 'https://evil.example' }), resDenied);
  assert.equal(resDenied.statusCode, 200);
  assert.equal(resDenied.headers['access-control-allow-origin'], undefined);
});

test('non-POST methods are rejected', async () => {
  const waitlist = freshWaitlistHandler();
  const res = fakeRes();
  await waitlist(fakeReq({ method: 'GET' }), res);
  assert.equal(res.statusCode, 405);
});

test('a filled honeypot field is accepted but does nothing', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub();
  try {
    const res = fakeRes();
    await waitlist(fakeReq({ body: { email: 'real.person@example.com', hp_token: 'I am a bot' } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(stub.calls, [], 'no Resend call should happen for a honeypot hit');
  } finally {
    stub.restore();
  }
});

test('rejects malformed, oversized, and control/HTML-bearing emails without touching the network', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub();
  try {
    const badEmails = [
      '',
      'not-an-email',
      'missing-domain@',
      'no-dot@example',
      'a'.repeat(250) + '@example.com', // > 254 chars total
      'bad\r\nheader@example.com',       // CRLF header injection attempt
      '<script>@example.com',
      'name@example.com"><svg onload=alert(1)>',
    ];
    let n = 0;
    for (const email of badEmails) {
      n += 1;
      const res = fakeRes();
      // A distinct IP per case, since the rate limit (checked before email
      // validation, by design -- it must cap load regardless of payload
      // validity) would otherwise 429 the later cases in this loop.
      await waitlist(fakeReq({ ip: `203.0.113.${50 + n}`, body: { email } }), res);
      assert.equal(res.statusCode, 400, `expected 400 for ${JSON.stringify(email)}`);
    }
    assert.deepEqual(stub.calls, [], 'no Resend call should happen for any rejected email');
  } finally {
    stub.restore();
  }
});

test('an invalid google_email is silently dropped rather than rejecting the signup', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub({ lookup: { status: 404 } });
  try {
    const res = fakeRes();
    await waitlist(fakeReq({
      body: { email: 'new.signup@example.com', platform: 'android', google_email: '<bad>@x' },
    }), res);
    assert.equal(res.statusCode, 200);
    const createCall = stub.calls.find((c) => c.url.endsWith('/contacts') && c.method === 'POST');
    assert.ok(createCall, 'expected a contact-create call');
    assert.equal(createCall.body.properties.google_account, undefined, 'the invalid google_email must not be stored');
  } finally {
    stub.restore();
  }
});

test('rate limit: 6th submission within 10 minutes from one IP is rejected', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub();
  try {
    const ip = '198.51.100.7';
    for (let i = 0; i < 5; i += 1) {
      const res = fakeRes();
      // Honeypot-filled requests are cheap (no Resend call) and still count
      // against the limit, so this does not need a working Resend stub path.
      await waitlist(fakeReq({ ip, body: { email: `person${i}@example.com`, hp_token: 'bot' } }), res);
      assert.equal(res.statusCode, 200, `request ${i} should succeed`);
    }
    const limited = fakeRes();
    await waitlist(fakeReq({ ip, body: { email: 'person6@example.com', hp_token: 'bot' } }), limited);
    assert.equal(limited.statusCode, 429);

    // A different IP is unaffected.
    const otherIp = fakeRes();
    await waitlist(fakeReq({ ip: '198.51.100.8', body: { email: 'other@example.com', hp_token: 'bot' } }), otherIp);
    assert.equal(otherIp.statusCode, 200);
  } finally {
    stub.restore();
  }
});

test('a brand-new signup creates the contact with attribution and properties', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub({ lookup: { status: 404 } });
  try {
    const res = fakeRes();
    await waitlist(fakeReq({ body: { email: 'fresh@example.com', platform: 'ios' } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const createCall = stub.calls.find((c) => c.url.endsWith('/contacts') && c.method === 'POST');
    assert.ok(createCall);
    assert.equal(createCall.body.email, 'fresh@example.com');
    assert.equal(createCall.body.properties.platform, 'ios');
  } finally {
    stub.restore();
  }
});

// An unauthenticated POST is not proof of ownership of the address it
// names. The platform/google_email answer used to be written to an
// existing contact's properties on a second request -- which let anyone
// redirect a stranger's Play Store invite to their own Google account just
// by POSTing that stranger's address with platform=android and their own
// google_email. It now never writes anything for an existing contact,
// subscribed or not: generic 200, no PATCH, no email. (A real fix for
// "I answered wrong" needs its own endpoint behind an expiring,
// purpose-bound confirmation token -- see the TODO in api/waitlist.js.)
test('an existing, subscribed contact answering the platform question writes nothing and sends nothing', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub({
    lookup: { status: 200, unsubscribed: false, properties: { utm_source: 'newsletter', signup_page: '/study/calculus/' } },
  });
  try {
    const res = fakeRes();
    await waitlist(fakeReq({ body: { email: 'returning@example.com', platform: 'ios', google_email: 'attacker@gmail.com' } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const mutatingCalls = stub.calls.filter((c) => c.method === 'PATCH' || c.method === 'POST');
    assert.deepEqual(mutatingCalls, [], 'no PATCH (property update) or POST should happen for an existing contact');
  } finally {
    stub.restore();
  }
});

test('an unsubscribed address is never resubscribed, updated, or emailed by a bare POST', async () => {
  const waitlist = freshWaitlistHandler();
  const stub = installFetchStub({ lookup: { status: 200, unsubscribed: true, properties: {} } });
  try {
    const res = fakeRes();
    await waitlist(fakeReq({ body: { email: 'opted.out@example.com' } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const mutatingCalls = stub.calls.filter((c) => c.method === 'PATCH' || c.method === 'POST');
    assert.deepEqual(mutatingCalls, [], 'no PATCH (resubscribe/property update) or POST should happen');
  } finally {
    stub.restore();
  }
});
