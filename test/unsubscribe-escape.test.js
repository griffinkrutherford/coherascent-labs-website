'use strict';

/**
 * api/unsubscribe.js used to interpolate the (attacker-reachable, since it
 * travels in a URL anyone can edit) `email` query param straight into the
 * response HTML. A signed token (see api/unsubscribe-token.js) means an
 * attacker cannot forge a link for an address of their choosing, but
 * nothing stops someone from signing themselves up with an HTML-bearing
 * address and then opening their own unsubscribe link -- this is the
 * regression test for escaping it regardless.
 *
 * Stubs `fetch` so this never reaches the real Resend API.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { sign } = require('../api/unsubscribe-token.js');

const SECRET = 'test-secret';

function freshUnsubscribeHandler() {
  const resolved = require.resolve('../api/unsubscribe.js');
  delete require.cache[resolved];
  delete require.cache[require.resolve('../api/waitlist-confirmation.js')];
  // eslint-disable-next-line global-require
  return require('../api/unsubscribe.js');
}

function fakeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    bodyText: '',
    setHeader(name, value) { res.headers[name.toLowerCase()] = value; },
    end(text) { res.bodyText = text || ''; },
  };
  return res;
}

function queryFor(email, token) {
  return new URLSearchParams({ e: email, t: token });
}

test('an HTML-bearing email in the unsubscribe link is escaped, not injected', async () => {
  const unsubscribe = freshUnsubscribeHandler();
  const original = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
  process.env.RESEND_API_KEY = SECRET;
  try {
    const email = '<img src=x onerror=alert(1)>@example.com';
    const token = sign(email, SECRET);
    const res = fakeRes();
    await unsubscribe({}, res, queryFor(email, token));

    assert.equal(res.statusCode, 200);
    assert.doesNotMatch(res.bodyText, /<img src=x onerror=alert\(1\)>/, 'raw markup must not appear in the response');
    assert.match(res.bodyText, /&lt;img src=x onerror=alert\(1\)&gt;/, 'the address should appear HTML-escaped instead');
  } finally {
    global.fetch = original;
    delete process.env.RESEND_API_KEY;
  }
});

test('a correctly-signed ordinary email still unsubscribes normally', async () => {
  const unsubscribe = freshUnsubscribeHandler();
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method });
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  process.env.RESEND_API_KEY = SECRET;
  try {
    const email = 'person@example.com';
    const token = sign(email, SECRET);
    const res = fakeRes();
    await unsubscribe({}, res, queryFor(email, token));

    assert.equal(res.statusCode, 200);
    assert.match(res.bodyText, /person@example\.com/);
    assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/contacts/')));
  } finally {
    global.fetch = original;
    delete process.env.RESEND_API_KEY;
  }
});

test('an invalid token is rejected before any Resend call', async () => {
  const unsubscribe = freshUnsubscribeHandler();
  const original = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; return { ok: true, status: 200, json: async () => ({}) }; };
  process.env.RESEND_API_KEY = SECRET;
  try {
    const res = fakeRes();
    await unsubscribe({}, res, queryFor('person@example.com', 'wrong-token'));
    assert.equal(res.statusCode, 400);
    assert.equal(called, false);
  } finally {
    global.fetch = original;
    delete process.env.RESEND_API_KEY;
  }
});
