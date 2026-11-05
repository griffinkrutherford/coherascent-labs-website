<!-- markdownlint-disable MD013 -->

# Ad-tracking infrastructure (Meta Pixel + Conversions API)

## Update Log

- 2026-11-05: Built the full Meta Pixel + Conversions API (CAPI) infrastructure, dormant by default. No Meta account, Pixel, or access token was created; no money was spent; no external network call was made from this work beyond the site's own, local test server. Every piece ships OFF and stays off until the owner sets `META_PIXEL_ID` (and, for CAPI, `META_CAPI_ACCESS_TOKEN`). Chose a **docs draft** over editing the live `/privacy/` page for the required privacy-policy section -- see "Privacy policy decision" below.

## What this is

Per the 2026-11-05 owner approval ("add the infrastructure, I will pay later"),
this adds a consent-gated Meta Pixel (browser) and Conversions API (server)
integration to lunesynth.com, built so that:

- With **no env vars set** (today's state), the site is byte-for-byte
  behaviorally unchanged: no banner, no `connect.facebook.net` request, no
  `graph.facebook.com` request, nothing new in any page's rendered HTML.
- Setting `META_PIXEL_ID` alone turns on the **browser** side only: the
  consent banner starts appearing, and accepting it loads the Pixel.
- Setting `META_CAPI_ACCESS_TOKEN` as well additionally turns on the
  **server-side CAPI** confirmation of the same `Lead` event, for visitors who
  grant consent.
- Nothing here creates a Meta Business/Ads account, a Pixel, or an access
  token. Those are manual steps for the owner (or future automation
  explicitly authorized to make them) -- see "Creating the Pixel and token"
  below.

## Architecture

| Piece | File | Role |
| --- | --- | --- |
| Tracker config endpoint | `server.js` (`buildTrackingConfig`/`handleTrackingConfig`, route `GET /campaign/tracking-config.json`) | Reports which trackers are configured from env vars. Never exposes `META_CAPI_ACCESS_TOKEN`. Returns `{ meta: null, google: null, tiktok: null }` with no env vars set. |
| Bootstrap + consent banner host | `lune-synth/campaign/site-footer.js` | The one component every page already loads. Fetches the config endpoint once; only when `hasAnyTrackerConfigured()` is true does it inject `ad-tracking.css`/`ad-tracking.js` and un-hide the footer's "Privacy choices" button. |
| Consent banner + Pixel loader | `lune-synth/campaign/ad-tracking.js` / `.css` | Never referenced by a `<script>` tag in any page -- only ever injected by site-footer.js. Shows Accept/Decline (equally sized/weighted), stores the choice in `localStorage` (try/catch-wrapped), auto-declines on `navigator.globalPrivacyControl`/DNT without showing a banner, and loads `connect.facebook.net`'s Pixel base code only after Accept. Exposes `window.LuneAdTracking` (`getConsentStatus`, `generateEventId`, `trackLead`, `trackViewContent`, `reopenBanner`). Dual-exports its pure helpers (`readConsent`, `writeConsent`, `hasPrivacySignal`, `formatFbc`, `hasAnyTracker`) for direct `node:test` coverage -- same pattern as `applied-carousel-intros.js`. |
| Waitlist form hook | `lune-synth/campaign/cta.js` | Generates one `event_id` per submission and reads the current consent status, sends both as additive JSON fields on the existing `/api/waitlist` POST, and calls `window.LuneAdTracking.trackLead(eventId)` after a successful signup. Existing success/error handling and copy are unchanged. |
| Server-side CAPI sender | `api/meta-capi.js` (`sendCapiLeadEvent`) | Strict no-op unless `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` are both set AND the client reported `consent === 'granted'`. Hashes the email (SHA-256, lowercased/trimmed), reads `_fbp`/`_fbc` from the request's real `Cookie` header, includes IP/UA/`event_source_url`/utm `custom_data`. Never throws; every failure is caught and only logged. 2.5s timeout. |
| Waitlist wiring | `api/waitlist.js` | Calls `sendCapiLeadEvent()` fire-and-forget (never awaited) only on a genuinely new signup -- never for an existing contact. Also additively extends `parseAttribution()`: a referer's `fbclid` becomes a first-party `fbc` property (Meta `_fbc` cookie format, `fb.1.<time>.<fbclid>`) and a bare `ref` param is captured, alongside the pre-existing `utm_*` capture. Neither is added when absent -- every existing request's stored properties are unchanged. |
| CSP | `server.js` (`CSP_REPORT_ONLY`) | Adds `https://connect.facebook.net` to `script-src` and `https://www.facebook.com` to `img-src`/`connect-src`. Still report-only, not enforced; nothing else loosened. |

### Google / TikTok hook points (not implemented)

- `buildTrackingConfig()` in `server.js` always returns `google: null, tiktok: null` explicitly, so the client's `hasAnyTracker()` check and response shape never need to change when either is wired up.
- `ad-tracking.js`'s `activateTrackers()` has an inline comment marking where a `loadGooglePixel()`/`loadTikTokPixel()` call would go, gated the same way `loadMetaPixel()` is.
- Adding either later means: populate `google`/`tiktok` in `buildTrackingConfig()` from a new env var, add the loader function, and add the matching env vars to this doc. No other file needs to change.

## Env vars

| Var | Required for | Notes |
| --- | --- | --- |
| `META_PIXEL_ID` | Browser Pixel (banner, PageView, ViewContent, client Lead) | Numeric Pixel ID from Meta Events Manager. Unset = fully dormant. |
| `META_CAPI_ACCESS_TOKEN` | Server-side CAPI Lead | A Conversions API access token for that Pixel. Never exposed to the client. Unset = CAPI stays dormant even with `META_PIXEL_ID` set (banner/client Pixel still work). |
| `META_CAPI_TEST_EVENT_CODE` | CAPI test verification only | Optional. Set temporarily while watching Meta's Test Events tool (see below); remove once verified so production events don't carry a test code. |

No other env var is touched by this work. `RESEND_API_KEY` and everything else in `api/waitlist.js` is unchanged.

## Creating the Pixel and token later (owner action, not done here)

1. In Meta Events Manager (business.facebook.com), create a Pixel for the lunesynth.com domain (or reuse an existing one). Copy its numeric ID into `META_PIXEL_ID`.
2. Under that Pixel's **Settings → Conversions API**, generate an access token. Copy it into `META_CAPI_ACCESS_TOKEN`. Treat it like any other secret (Railway env var, never committed).
3. Set both in the production environment and redeploy (or however this repo's host picks up new env vars). `META_CAPI_TEST_EVENT_CODE` is optional and only useful during the verification pass below.
4. Everything else -- banner copy, event names, CSP, attribution capture -- is already in place; no further code change is needed to go live, only the env vars.

## Testing with Meta's Test Events tool

1. In Events Manager, open the Pixel's **Test Events** tab and copy the test event code it shows.
2. Set `META_CAPI_TEST_EVENT_CODE` to that value (alongside the two required vars) and redeploy/restart.
3. Load a page with the consent banner, Accept, and submit the waitlist form with a real (or disposable) email.
4. In Test Events, confirm both a browser-sourced `Lead` and a server-sourced `Lead` with a matching `Event ID` appear and are flagged as deduplicated. A `PageView` should appear immediately on Accept, without a form submission.
5. Remove `META_CAPI_TEST_EVENT_CODE` once confirmed; leave `META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN` in place for production.

Per the house rule on never trusting a 200 as proof a config change worked:
confirming the signup form still returns 200 is not evidence the Pixel or
CAPI event actually landed -- only Test Events (or the production Events
Manager view, after real traffic) is.

## Privacy policy decision

**Chose: a docs draft, not an edit to the live `/privacy/` page.**

`docs/legal/privacy-policy.md` (mirrored in `lune-synth/privacy/index.html`)
currently makes explicit, affirmative claims that this change would
contradict the moment any tracker is actually turned on, e.g.:

- "Product analytics are first-party. We do not use a third-party
  analytics, attribution, or advertising SDK."
- "We do not disclose personal information to a third-party analytics,
  attribution, crash-reporting, or advertising provider."
- "...we do not use third-party ad networks in the controlled beta."

Wrapping a new section in a `<script>`-gated conditional (per the task's
other listed option) would still leave those specific sentences live and
contradictory the moment `META_PIXEL_ID` is set -- a conditional section
describing the Pixel does not un-say the page's existing blanket denial of
third-party SDKs elsewhere on the same page. Editing a live, publicly
posted legal document's substantive claims without the owner's/a lawyer's
review first is exactly the kind of legal exposure this task should not
create by default. A docs draft lets the owner and a lawyer rewrite the
contradicting sentences and the new section together, as one reviewed
change, before anything goes live.

See `docs/legal/2026-11-05-meta-pixel-privacy-draft.md` for the proposed
language and the specific sentences in `privacy-policy.md` that need
revision before `META_PIXEL_ID` is ever set in production.

**COPPA / under-13:** this task adds no new signup surface and does not
touch the waitlist form's existing fields. The consent banner and Pixel
load on every page equally; no code here distinguishes a child's visit from
an adult's. Before `META_PIXEL_ID` is set in production, confirm with the
owner that firing Pixel/CAPI events from the waitlist form is acceptable
given the product's existing under-13 posture -- this doc does not resolve
that question, it only flags it per the task brief's instruction to do so.

## Verification checklist

Before setting `META_PIXEL_ID` in production:

- [ ] `npm test` passes (147+ baseline, plus all `ad-tracking*`/`meta-capi*`/`waitlist-capi-wiring` tests, with only the 4 known pre-existing waitlist-signup failures -- see that suite's own comments on why those 4 need `RESEND_API_KEY`).
- [ ] With no env vars set: `curl /campaign/tracking-config.json` returns `{"meta":null,"google":null,"tiktok":null}`; no page's HTML references `ad-tracking.js`/`.css`; no `facebook.net`/`facebook.com` request happens on any page load (verify in a real browser's network tab).
- [ ] With `META_PIXEL_ID` set to a throwaway/test value: the consent banner appears once per page per browser (not shown again after a stored choice); Decline is the same size/weight as Accept; no `connect.facebook.net` request happens before Accept; one happens after; the footer's "Privacy choices" button appears and reopens the banner.
- [ ] `navigator.globalPrivacyControl = true` (or `DNT: 1`) results in no banner and no Pixel load, with `localStorage`'s `lune_tracking_consent` recording `denied`.
- [ ] Submitting the waitlist form after Accept fires a `Lead` with an `event_id`; the exact same `event_id` would be sent to CAPI (confirm via the server logs or Test Events, not by reading the client code alone).
- [ ] With `META_CAPI_ACCESS_TOKEN` also set: Test Events (above) shows a deduplicated browser+server `Lead` pair.
- [ ] CSP report-only header still loads every existing page without new console CSP violations beyond the two Meta domains.
- [ ] `/privacy/` page is unchanged (the docs-draft decision above) until the owner/lawyer revise it.
