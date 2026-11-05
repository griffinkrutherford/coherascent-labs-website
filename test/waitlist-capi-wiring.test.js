'use strict';

/**
 * Integration coverage for the 2026-11-05 ad-tracking wiring inside
 * api/waitlist.js's success path: the server-side Meta CAPI Lead call
 * (api/meta-capi.js) fires only for a genuinely new signup, only with
 * consent === 'granted', carries the real request IP/UA/cookies, and a
 * CAPI failure never changes the signup response.
 *
 * Unlike test/meta-capi.test.js (which calls sendCapiLeadEvent directly),
 * this file drives the real waitlist handler end to end, stubbing both the
 * Resend calls (api.resend.com) and the Graph API call
 * (graph.facebook.com) behind one global.fetch stub, the same pattern
 * test/waitlist-security.test.js uses.
 *
 * Sets RESEND_API_KEY itself (this sandbox's ambient env does not have it,
 * which is also why four pre-existing, unrelated waitlist-signup tests are
 * expected to fail here -- see the task's "known waitlist-signup failures"
 * baseline) so these tests reach the code under test regardless of the
 * ambient environment.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const WAITLIST_PATH = require.resolve('../api/waitlist.js');

function freshWaitlistHandler() {
  delete require.cache[WAITLIST_PATH];
  // eslint-disable-next-line global-require
  return require('../api/waitlist.js');
}

function fakeReq({ method = 'POST', body = {}, origin, ip = '203.0.113.1', referer, cookie, userAgent } = {}) {
  return {
    method,
    headers: {
      ...(origin ? { origin } : {}),
      ...(referer ? { referer } : {}),
      ...(cookie ? { cookie } : {}),
      ...(userAgent ? { 'user-agent': userAgent } : {}),
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

/** Stubs Resend (always "new contact, create succeeds") and Graph API. */
function installFetchStub({ graphResponse } = {}) {
  const calls = [];
  const original = global.fetch;
  global.fetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const parsedBody = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ url: String(url), method, body: parsedBody, headers: options.headers });

    if (String(url).includes('api.resend.com/contacts/') && method === 'GET') {
      return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
    }
    if (String(url).endsWith('api.resend.com/contacts') && method === 'POST') {
      return { ok: true, status: 200, json: async () => ({ id: 'contact_fake' }) };
    }
    if (String(url).includes('graph.facebook.com')) {
      if (graphResponse) return graphResponse(parsedBody);
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
    }
    // Confirmation email send, or anything else unstubbed.
    return { ok: true, status: 200, json: async () => ({ id: 'email_fake' }) };
  };
  return {
    calls,
    graphCalls: () => calls.filter((c) => c.url.includes('graph.facebook.com')),
    restore() { global.fetch = original; },
  };
}

function withEnv(vars, fn) {
  const previous = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  return Promise.resolve(fn()).finally(() => {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
}

// A short pause so the fire-and-forget sendCapiLeadEvent() promise (kicked
// off, not awaited, inside the handler) has settled before a test inspects
// what it did.
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 20));
}

test('a new signup with consent=granted and Meta env vars set fires a CAPI Lead with the same event_id, IP, UA, and cookies', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: '555', META_CAPI_ACCESS_TOKEN: 'tok-abc' }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub();
    try {
      const res = fakeRes();
      await waitlist(fakeReq({
        ip: '198.51.100.7',
        referer: 'https://lunesynth.com/campaign/students/?utm_source=facebook&utm_campaign=waitlist-students&fbclid=click123',
        cookie: '_fbp=fb.1.1.1; _fbc=fb.1.2.click123',
        userAgent: 'Mozilla/5.0 TestAgent',
        body: {
          email: 'new.lead@example.com',
          tracking_event_id: 'evt-shared-id',
          tracking_consent: 'granted',
        },
      }), res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);

      await flush();

      const graphCalls = stub.graphCalls();
      assert.equal(graphCalls.length, 1);
      const event = graphCalls[0].body.data[0];
      assert.equal(event.event_name, 'Lead');
      assert.equal(event.event_id, 'evt-shared-id');
      assert.equal(event.user_data.client_ip_address, '198.51.100.7');
      assert.equal(event.user_data.client_user_agent, 'Mozilla/5.0 TestAgent');
      assert.equal(event.user_data.fbp, 'fb.1.1.1');
      assert.equal(event.user_data.fbc, 'fb.1.2.click123');
      assert.equal(event.custom_data.utm_source, 'facebook');
      assert.equal(event.custom_data.utm_campaign, 'waitlist-students');
    } finally {
      stub.restore();
    }
  });
});

test('never fires CAPI when the client reported consent is not "granted"', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: '555', META_CAPI_ACCESS_TOKEN: 'tok-abc' }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub();
    try {
      for (const consent of ['denied', '', undefined]) {
        const res = fakeRes();
        const body = { email: `no-consent-${String(consent)}@example.com`, tracking_event_id: 'evt-x' };
        if (consent !== undefined) body.tracking_consent = consent;
        await waitlist(fakeReq({ ip: `198.51.100.${8 + ['denied', '', undefined].indexOf(consent)}`, body }), res);
        assert.equal(res.statusCode, 200);
      }
      await flush();
      assert.equal(stub.graphCalls().length, 0, 'no Graph API call should happen without granted consent');
    } finally {
      stub.restore();
    }
  });
});

test('never fires CAPI when Meta env vars are not configured, even with consent granted', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: undefined, META_CAPI_ACCESS_TOKEN: undefined }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub();
    try {
      const res = fakeRes();
      await waitlist(fakeReq({ ip: '198.51.100.20', body: { email: 'dormant@example.com', tracking_event_id: 'evt-y', tracking_consent: 'granted' } }), res);
      assert.equal(res.statusCode, 200);
      await flush();
      assert.equal(stub.graphCalls().length, 0);
    } finally {
      stub.restore();
    }
  });
});

test('never fires CAPI for an existing contact (no new Lead, nothing re-sent)', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: '555', META_CAPI_ACCESS_TOKEN: 'tok-abc' }, async () => {
    const waitlist = freshWaitlistHandler();
    const calls = [];
    const original = global.fetch;
    global.fetch = async (url, options = {}) => {
      calls.push(String(url));
      if (String(url).includes('api.resend.com/contacts/')) {
        return { ok: true, status: 200, json: async () => ({ data: { unsubscribed: false } }) };
      }
      return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
    };
    try {
      const res = fakeRes();
      await waitlist(fakeReq({ ip: '198.51.100.30', body: { email: 'already.exists@example.com', tracking_event_id: 'evt-z', tracking_consent: 'granted' } }), res);
      assert.equal(res.statusCode, 200);
      await flush();
      assert.ok(!calls.some((url) => url.includes('graph.facebook.com')), 'existing contact must never trigger a Lead event');
    } finally {
      global.fetch = original;
    }
  });
});

test('a CAPI failure (rejected or thrown) never changes the signup response', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: '555', META_CAPI_ACCESS_TOKEN: 'tok-abc' }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub({ graphResponse: () => { throw new Error('simulated network failure'); } });
    try {
      const res = fakeRes();
      await waitlist(fakeReq({ ip: '198.51.100.40', body: { email: 'capi.fails@example.com', tracking_event_id: 'evt-fail', tracking_consent: 'granted' } }), res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      await flush(); // let the rejected CAPI promise settle; must not throw/crash the process
    } finally {
      stub.restore();
    }
  });
});

test('fbclid and ref on the referer become first-party fbc/ref attribution properties on the Resend contact', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key' }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub();
    try {
      const res = fakeRes();
      await waitlist(fakeReq({
        ip: '198.51.100.50',
        referer: 'https://lunesynth.com/campaign/students/?fbclid=abc123&ref=newsletter&utm_source=facebook',
        body: { email: 'attribution.check@example.com' },
      }), res);
      assert.equal(res.statusCode, 200);

      const createCall = stub.calls.find((c) => c.url.endsWith('/contacts') && c.method === 'POST');
      assert.ok(createCall);
      assert.match(createCall.body.properties.fbc, /^fb\.1\.\d+\.abc123$/);
      assert.equal(createCall.body.properties.ref, 'newsletter');
      assert.equal(createCall.body.properties.utm_source, 'facebook');
    } finally {
      stub.restore();
    }
  });
});

test('no fbclid/ref on the referer means no fbc/ref property at all (byte-for-byte unchanged for every existing request)', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key' }, async () => {
    const waitlist = freshWaitlistHandler();
    const stub = installFetchStub();
    try {
      const res = fakeRes();
      await waitlist(fakeReq({
        ip: '198.51.100.60',
        referer: 'https://lunesynth.com/campaign/students/?utm_source=facebook',
        body: { email: 'no.fbclid@example.com' },
      }), res);
      assert.equal(res.statusCode, 200);

      const createCall = stub.calls.find((c) => c.url.endsWith('/contacts') && c.method === 'POST');
      assert.ok(createCall);
      assert.ok(!('fbc' in createCall.body.properties));
      assert.ok(!('ref' in createCall.body.properties));
    } finally {
      stub.restore();
    }
  });
});

test('undefined attribution properties fall back to the core properties, keeping platform and google_account', async () => {
  await withEnv({ RESEND_API_KEY: 'test-key', META_PIXEL_ID: undefined, META_CAPI_ACCESS_TOKEN: undefined }, async () => {
    const waitlist = freshWaitlistHandler();
    const posts = [];
    const original = global.fetch;
    global.fetch = async (url, options = {}) => {
      const method = options.method || 'GET';
      if (String(url).includes('api.resend.com/contacts/') && method === 'GET') {
        return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
      }
      if (String(url).endsWith('api.resend.com/contacts') && method === 'POST') {
        const body = JSON.parse(options.body);
        posts.push(body);
        const keys = Object.keys(body.properties || {});
        const undefinedKey = keys.find((k) => !['platform', 'google_account', 'access_sent', 'platform_asked'].includes(k));
        if (undefinedKey) {
          const text = `contact property "${undefinedKey}" does not exist`;
          return { ok: false, status: 422, json: async () => ({}), text: async () => text, clone() { return { text: async () => text }; } };
        }
        return { ok: true, status: 200, json: async () => ({ id: 'contact_fake' }) };
      }
      return { ok: true, status: 200, json: async () => ({ id: 'email_fake' }) };
    };
    try {
      const res = fakeRes();
      await waitlist(fakeReq({
        referer: 'https://lunesynth.com/test-prep/sat/?utm_source=facebook&ref=ig-sat-1&fbclid=abc',
        body: { email: 'core.retry@example.com', platform: 'android', google_email: 'core.retry@gmail.com' },
      }), res);
      assert.equal(res.statusCode, 200);
      assert.equal(posts.length, 2, 'one rejected create, one core-only retry, no bare create');
      assert.equal(posts[1].properties.platform, 'android');
      assert.equal(posts[1].properties.google_account, 'core.retry@gmail.com');
      assert.equal(posts[1].properties.utm_source, undefined);
      assert.equal(posts[1].properties.ref, undefined);
    } finally {
      global.fetch = original;
    }
  });
});
