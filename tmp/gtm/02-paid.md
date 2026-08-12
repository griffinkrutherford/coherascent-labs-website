# Lune Synth — Paid Acquisition Program (Meta-first)

**Execution document. Owner: founder unless noted. Today: Monday, August 3, 2026.**
**First ad dollar spent: Friday, August 7, 2026. Full launch: Monday, August 10, 2026.**

---

## 0. Standing facts this plan is built on (verified in repo)

| Fact | Detail |
|---|---|
| Landing pages | **43**, not 33. 20 subject `/study/*`, 13 test-prep `/test-prep/*`, 5 parent `/for-parents/*`, 4 student `/for-students/*`, 1 family `/for-families/homeschool/`. All generated from `lune-synth/campaign/pages.json` via `npm run build:campaigns`. |
| Meta creatives | **26** statics at `lune-synth/campaign/ads/meta/01-…26-.png`. **All 26 are subject or test-prep.** Zero creative exists for the 10 parent/student/family pages. |
| Creative aspect ratios | **Broken for Meta.** Only 7 of 26 are 4:5 (1.250): 01, 03, 07, 08, 09, 12, 16. Fifteen are ~3:2 (1.50–1.56): 04, 05, 06, 10, 11, 13, 14, 17, 18, 19, 21, 22, 24, 25, 26. One is 1.644 (02). Three are 2.06–2.16 (15, 20, 23) — taller than 9:16. **Nothing but the seven 4:5 files can enter a feed placement without letterboxing.** |
| Analytics | **None.** No `fbq`, no `gtag`, no GTM, no CAPI anywhere in the repo (grep-verified). |
| Attribution plumbing | `lune-synth/campaign/cta.js` **already** collects `campaign_family`, `campaign_variant`, `campaign_audience`, `cta_placement`, `landing_path`, `utm_source/medium/campaign/content`, `fbclid` and POSTs them to `/api/waitlist`. It already pushes to `window.dataLayer` and dispatches `lune:<event>` CustomEvents (`waitlist_form_start`, `waitlist_submit`, `waitlist_success`, `waitlist_error`). |
| Attribution loss | `api/waitlist.js` destructures **only `email`** and drops everything else on the floor. Every UTM already being sent is thrown away today. |
| Waitlist store | Resend Contacts API, single default audience, no metadata. |
| Social accounts | None. **You cannot run a Meta ad without a Facebook Page.** This is a Week 0 blocker, not a nice-to-have. |
| Legal | `lune-synth/privacy/index.html` and `lune-synth/terms/index.html` exist. Privacy policy must be amended before the Pixel fires. |
| Offer | Locked in `lune-synth/campaign/cta-config.js`: "Beta users get 2 months free & a lifetime 50% off Lune Synth™ Pro." Single source of truth. Do not restate the offer in ad copy in a way that can drift. |

### Three founder-confirmed constraints that shape everything below

**C1 — The paid budget is under $1,000/month. ~$30/day, total, across all channels, for the first 90 days.** This is a hard ceiling, not a starting point.

**C2 — The beta ships in roughly 1–2 weeks.** Apple developer account is in processing; software is essentially ready. [ASSUMPTION] TestFlight build available Aug 10–17, 2026. The waitlist is therefore a **short invite queue**, not a long holding pen, and the conversion event must migrate from "waitlist email" to "TestFlight install → first mission completed" as soon as that is instrumented.

**C3 — The founder has 20–40 hours/week. Time is abundant relative to money.** Wherever a task can be done by hand instead of bought, the manual version wins. This inverts the usual production calculus: founder-shot iPhone video beats an agency, manual Reddit/forum presence beats a Reddit ad buy, and hand-built creative variants beat a design retainer.

### What paid is actually for, at $30/day

At $30/day, Meta cannot be an acquisition channel. The arithmetic is unavoidable: an ad set needs roughly **50 optimizer events per week** to exit the learning phase. At a $3–5 cost per lead, that is **$150–250/week for a single ad set** — which is the entire budget. So:

> **The account can support exactly one properly-optimizing ad set at a time. Two only if the optimizer event is cheap enough to hit 50/week at ~$15/day per set.**

Therefore the honest framing, stated up front so no one is disappointed in October:

**Paid at this budget is a creative-validation and message-testing instrument.** Its job is to answer, cheaply and with real strangers' attention rather than the founder's intuition, three questions:
1. Which **hook** stops the scroll — anti-cheating wedge, get-unstuck, precise-feedback, or exam urgency?
2. Which **audience** — parents, pre-health, college STEM, grad-exam, adult learners — is cheapest to reach and most responsive?
3. Which **landing page** converts attention into an email, and at what rate?

The winners then get pointed at by organic, outreach, SEO, and the 43 landing pages, where the founder's 20–40 hours/week is the actual growth engine. Paid buys *information*; time buys *volume*. Any plan that reverses this at $30/day is fiction.

**Consequence: verdicts are slow.** A creative needs ~$60–90 of spend before its outbound CTR is trustworthy and ~$150 before its CPL is. At $30/day split across 3 ads, **one ad accumulates $10/day, so a creative-level verdict takes 6–9 days and a CPL-level verdict takes 15+ days.** Plan in fortnights, not days. This is stated plainly in §5 as the sample-size rule and it is the single most important discipline in this document — the failure mode at low budget is killing creatives at $12 of spend based on noise.

**Budget allocation, first 90 days ($900/mo cap):**

| Channel | Aug | Sep | Oct | Rationale |
|---|---|---|---|---|
| Meta | $560 | $600 | $520 | Primary creative-testing instrument |
| Google Search (exact-match only) | $0 | $180 | $280 | Opens Sept 7 once Meta has a message verdict; 43 intent pages already built |
| Reddit | $0 | $0 | $0 | **Do not buy Reddit ads.** Founder time in the subreddits (C3) is strictly better value. See §9. |
| Reserve / test overspend | $100 | $60 | $60 | |
| **Monthly total** | **$660** | **$840** | **$860** | Under the $1,000 ceiling every month |

12-week paid total ≈ **$2,360.** Every dollar figure below is built on that number.

---

## 1. Tracking foundation — Week 0, blocking

Nothing in Sections 3–9 may start before Section 1 is signed off. A Meta campaign optimizing toward an event that does not fire will spend its entire budget on the cheapest possible clicks and teach the algorithm nothing.

### 1.0 Account prerequisites (Mon Aug 3, first thing — these have latency you cannot compress)

| # | Task | Deadline |
|---|---|---|
| 0.1 | Create Facebook Page "Lune Synth". Profile = app icon, cover = a 4:5 creative, About = "The anti-slop learning app," link to lunesynth.com. **Blocking: no Page, no ads.** | Aug 3, 10:00 |
| 0.2 | Create Instagram Business account `@lunesynth`, link to the Page. Needed for IG feed/Reels/Stories placements to render with a real profile. | Aug 3, 11:00 |
| 0.3 | Create Meta Business Manager (business.facebook.com), add the Page, create one Ad Account (US, USD, America/New_York). Add payment method. | Aug 3, 12:00 |
| 0.4 | Submit **Business Verification** (legal entity docs for Coherascent Labs). Takes 1–5 business days and gates domain-level controls. Start it today even though ads can launch before it clears. | Aug 3 |
| 0.5 | Create the Pixel/Dataset in Events Manager. Record the ID as `META_PIXEL_ID`. Generate a Conversions API access token; store as `META_CAPI_TOKEN` in Railway env vars. Never commit either. | Aug 3 |
| 0.6 | Create GA4 property + web data stream for `lunesynth.com`. Record `G-XXXXXXXXXX` as `GA4_MEASUREMENT_ID`. | Aug 3 |
| 0.7 | Post 6–8 organic items to the Page and IG (blog excerpts, ad statics). A Page with zero posts running paid ads triggers manual review and depresses profile-click conversion. | Aug 4 |

### 1.1 The shared-script approach (fits this repo, no bundler)

Create **one** new file, `lune-synth/campaign/analytics.js`, served as a plain deferred script exactly like `cta.js`. It is the only place any third-party tag lives. Rationale: the campaign generator already emits four `<script src="/campaign/*.js" defer>` tags into every landing page head, so a fifth is a one-line generator change that propagates to all 43 pages on the next `npm run build:campaigns`. Do **not** use Google Tag Manager — it adds a render-blocking third-party dependency, a second consent surface, and a UI the founder has to maintain, for zero benefit on a site where every page already loads the same first-party script bundle.

`analytics.js` responsibilities, in order:

1. Read `META_PIXEL_ID` and `GA4_MEASUREMENT_ID` from a tiny generated config (`window.LUNE_ANALYTICS_CONFIG`, emitted by the generator alongside `cta-config.js`) so IDs are not hard-coded in a file that ships to a `www` host too.
2. Boot the Meta Pixel base snippet and `fbq('init', id)`.
3. Boot GA4 via `gtag.js`.
4. Capture and persist attribution (§1.4).
5. Fire `PageView` + `ViewContent`.
6. Subscribe to the `lune:*` CustomEvents `cta.js` already dispatches and forward them to Pixel + GA4. **No edits to `cta.js` are needed for event forwarding** — the CustomEvent bridge already exists.
7. Fire scroll/time engagement events.

Skeleton (write this literally; it is ~120 lines finished):

```js
/* lune-synth/campaign/analytics.js */
(function () {
  "use strict";
  var CFG = window.LUNE_ANALYTICS_CONFIG || {};
  var root = document.documentElement;
  var LS_KEY = "lune_attr_v1";

  /* ---- 1. Meta Pixel base ---- */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  if (CFG.metaPixelId) fbq('init', CFG.metaPixelId);

  /* ---- 2. GA4 ---- */
  if (CFG.ga4Id) {
    var g = document.createElement('script'); g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4Id;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CFG.ga4Id, { send_page_view: false });
  }

  /* ---- 3. Attribution capture: first-touch wins, last-touch recorded ---- */
  var p = new URLSearchParams(location.search);
  var KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
              'utm_id','fb_ad_id','fb_adset_id','fb_campaign_id','gclid','fbclid','msclkid'];
  var stored = {};
  try { stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) {}
  var last = {}; KEYS.forEach(function (k) { var v = p.get(k); if (v) last[k] = v; });
  if (!stored.first_touch_at && (last.utm_source || last.fbclid || last.gclid)) {
    stored.first_touch_at = new Date().toISOString();
    stored.first_landing_path = location.pathname;
    stored.first_referrer = document.referrer || '';
    KEYS.forEach(function (k) { if (last[k]) stored['first_' + k] = last[k]; });
    try { localStorage.setItem(LS_KEY, JSON.stringify(stored)); } catch (e) {}
  }
  window.LUNE_ATTRIBUTION = function () {
    var out = Object.assign({}, stored, last);
    out.referrer = document.referrer || '';
    out.page_path = location.pathname;
    out.campaign_family = root.dataset.campaignFamily || 'site';
    out.campaign_variant = root.dataset.campaignVariant || 'site';
    out.campaign_audience = root.dataset.campaignAudience || 'site';
    out.fbp = (document.cookie.match(/_fbp=([^;]+)/) || [])[1] || '';
    out.fbc = (document.cookie.match(/_fbc=([^;]+)/) || [])[1] ||
              (last.fbclid ? 'fb.1.' + Date.now() + '.' + last.fbclid : '');
    out.lp_variant = window.LUNE_AB_VARIANT || 'control';
    return out;
  };

  /* ---- 4. Page-level events ---- */
  var a = window.LUNE_ATTRIBUTION();
  fbq('track', 'PageView');
  if (CFG.ga4Id) gtag('event', 'page_view', a);
  if (root.dataset.campaignVariant) {
    fbq('track', 'ViewContent', {
      content_name: a.campaign_variant,
      content_category: a.campaign_family,
      content_type: 'landing_page'
    });
  }

  /* ---- 5. Bridge cta.js CustomEvents -> Pixel + GA4 ---- */
  var MAP = {
    'lune:waitlist_form_start': { fb: 'WaitlistFormStart', std: false },
    'lune:waitlist_submit':     { fb: 'WaitlistSubmit',    std: false },
    'lune:waitlist_success':    { fb: 'Lead',              std: true  },
    'lune:waitlist_error':      { fb: 'WaitlistError',     std: false }
  };
  Object.keys(MAP).forEach(function (evt) {
    window.addEventListener(evt, function (e) {
      var d = Object.assign({}, window.LUNE_ATTRIBUTION(), e.detail || {});
      var m = MAP[evt];
      var opts = d.event_id ? { eventID: d.event_id } : {};
      var params = m.std ? { content_name: d.campaign_variant,
                             content_category: d.campaign_family,
                             value: CFG.leadValue || 2.50, currency: 'USD' } : d;
      fbq(m.std ? 'track' : 'trackCustom', m.fb, params, opts);
      if (CFG.ga4Id) gtag('event', evt.replace('lune:', ''), d);
    });
  });

  /* ---- 6. Engagement signals ---- */
  var fired = {};
  function once(name, fn) { if (fired[name]) return; fired[name] = 1; fn(); }
  setTimeout(function () { once('t30', function () {
    fbq('trackCustom', 'Engaged30s', a); if (CFG.ga4Id) gtag('event', 'engaged_30s', a);
  }); }, 30000);
  window.addEventListener('scroll', function () {
    var pct = (scrollY + innerHeight) / document.body.scrollHeight;
    if (pct >= 0.75) once('s75', function () {
      fbq('trackCustom', 'ScrollDepth75', a); if (CFG.ga4Id) gtag('event', 'scroll_75', a);
    });
  }, { passive: true });
})();
```

### 1.2 Event taxonomy

| Event | Type | Where it fires | Why it exists |
|---|---|---|---|
| `PageView` | Meta standard | Every page | Retargeting audience seed, baseline |
| `ViewContent` | Meta standard | Any page with `data-campaign-variant` (all 43 LPs) | Per-niche traffic quality; retargeting by subject |
| `ScrollDepth75` | Custom | 75% scroll | Mid-funnel signal while Lead volume is too thin to optimize on |
| `Engaged30s` | Custom | 30s dwell | Same; also the seed for a "quality visitor" lookalike |
| `WaitlistFormStart` | Custom | Email input focus | Diagnoses form friction vs. page friction |
| `WaitlistSubmit` | Custom | Submit pressed | Denominator for submit→success failure rate |
| `Lead` | Meta standard | `waitlist_success` only | **The optimization event.** Browser + CAPI, deduped. `value: 2.50`, `currency: USD` [ASSUMPTION — placeholder lead value so value-based lookalikes are possible later; revise once activation data exists] |
| `WaitlistError` | Custom | API failure | Alerting only; never optimize on it |
| `CompleteRegistration` | Meta standard | **Reserved.** Fires on first in-app account creation once the app ships. | Do not use it now. Keep it clean for the post-launch AEM slot. |

Do not add a ninth event. iOS Aggregated Event Measurement allows eight per domain and every extra one dilutes the ranking.

### 1.3 Conversions API + deduplication

Dedupe works when the *same* `event_name` and the *same* `event_id` arrive from browser and server within 48 hours. `cta.js` does not currently mint an `event_id`, so it needs one three-line edit — the only change required to that file.

**Edit 1 — `lune-synth/campaign/cta.js`, inside the submit handler, immediately before `track("waitlist_submit", details)`:**

```js
var eventId = (window.crypto && crypto.randomUUID)
  ? crypto.randomUUID()
  : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
var payload = Object.assign({}, details, window.LUNE_ATTRIBUTION ? window.LUNE_ATTRIBUTION() : {}, {
  event_id: eventId,
  submitted_at: new Date().toISOString()
});
```

Then replace the three `track(...)` calls' second argument with `payload`, and change the fetch body to `JSON.stringify(Object.assign({ email: email }, payload))`. The browser Pixel picks `event_id` up automatically through the bridge in §1.1 step 5 (`opts.eventID`).

**Edit 2 — `api/waitlist.js`.** Currently it destructures only `email`. Rewrite the handler to:

1. Destructure the full payload: `const { email, event_id, campaign_family, campaign_variant, campaign_audience, landing_path, page_path, referrer, first_referrer, first_landing_path, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, fb_ad_id, fb_adset_id, fbc, fbp, gclid, lp_variant } = req.body;`
2. Route the Resend contact to a **family-specific audience** so nurture can be segmented on day one: maintain `RESEND_AUDIENCE_PARENT`, `_TESTPREP`, `_SUBJECT`, `_STUDENT`, `_FAMILY`, `_DEFAULT` env vars and select by `campaign_family`. This is the cheapest possible fix for "no segmentation" and costs one map lookup.
3. Persist the full row to durable storage (§1.6).
4. Fire the CAPI event.
5. **Return 200 to the browser regardless of whether CAPI or the DB write succeeded.** Waitlist signup must never fail because a tracking call failed.

CAPI call:

```js
const crypto = require('crypto');
const sha256 = (s) => crypto.createHash('sha256').update(String(s).trim().toLowerCase()).digest('hex');

async function sendCapiLead(payload, req, trimmedEmail) {
  const PIXEL = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  if (!PIXEL || !TOKEN) return;

  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const body = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: payload.event_id,                       // <-- dedupe key
      event_source_url: 'https://lunesynth.com' + (payload.landing_path || '/'),
      action_source: 'website',
      user_data: {
        em: [sha256(trimmedEmail)],
        client_ip_address: fwd || req.socket.remoteAddress,
        client_user_agent: req.headers['user-agent'] || '',
        fbc: payload.fbc || undefined,
        fbp: payload.fbp || undefined
      },
      custom_data: {
        value: 2.50, currency: 'USD',
        content_name: payload.campaign_variant,
        content_category: payload.campaign_family
      }
    }],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {})
  };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2000);          // never block the user
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL}/events?access_token=${TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: ctrl.signal });
    if (!r.ok) console.error('CAPI non-200', await r.text());
  } catch (e) { console.error('CAPI failed (non-fatal)', e.message); }
  finally { clearTimeout(t); }
}
```

Notes that matter:
- `event_id` must be identical on both sides. It is minted **once** in the browser and carried in the POST body. Never regenerate it server-side.
- `fbc` must be the `fb.1.<ms>.<fbclid>` format, not the raw `fbclid`. The `analytics.js` helper already builds it correctly, preferring the real `_fbc` cookie when the Pixel has set one.
- `client_ip_address` on Railway comes from `x-forwarded-for` first hop; `req.socket.remoteAddress` will be the proxy and is useless. **Verify `server.js` is not stripping the header** — it currently passes `req` straight through to the handler, so it will be present.
- Use `META_TEST_EVENT_CODE` only while validating in Events Manager → Test Events. Unset it before launch or events will not count toward optimization.
- Target Event Match Quality ≥ 6.0 for Lead. With hashed email + IP + UA + fbp + fbc you should land 7–8.

### 1.4 UTM convention

Use Meta's dynamic URL macros in the ad-level **URL parameters** field so tags are never hand-typed and never drift from the ad names:

```
utm_source=meta
&utm_medium=paid_social
&utm_campaign={{campaign.name}}
&utm_term={{adset.name}}
&utm_content={{ad.name}}
&utm_id={{campaign.id}}
&fb_campaign_id={{campaign.id}}
&fb_adset_id={{adset.id}}
&fb_ad_id={{ad.id}}
```

This makes the naming convention load-bearing, so name things machine-readably:

- Campaign: `LS_<lane>_<objective>_<yyyymm>` → `LS_adult_leads_202608`
- Ad set: `<audience>_<geo>_<age>` → `premed_us_18-34`
- Ad: `<creative#>_<niche>_<format>_<hook>_v<n>` → `06_mcat_4x5_diagnose_v1`

Rules: lowercase, underscores only, no spaces (Meta macros pass names through verbatim and spaces become `%20` in your reports). Google Ads uses `utm_source=google&utm_medium=cpc` with `{keyword}`/`{creative}` ValueTrack. Reddit uses `utm_source=reddit&utm_medium=paid_social`.

`analytics.js` persists **first touch** to `localStorage` and sends both first- and last-touch fields, so a visitor who arrives from a Meta ad, leaves, and returns via organic search is still credited to Meta in your own data even though GA4's last-non-direct model will disagree. Keep both; reconcile weekly.

### 1.5 Domain verification + iOS AEM priority

| # | Task | Deadline |
|---|---|---|
| 1.5.1 | Business Manager → Brand Safety and Suitability → Domains → add `lunesynth.com` → copy the `facebook-domain-verification` TXT value → add TXT record at the DNS provider → click Verify. DNS propagation is the long pole; do this first on Aug 3. | Aug 3 |
| 1.5.2 | Events Manager → Aggregated Event Measurement → Configure Web Events → set the priority order below. Note: **every change triggers a 72-hour cooldown during which the old config still applies.** Set it once, correctly, before spend. | Aug 5 |
| 1.5.3 | Amend `lune-synth/privacy/index.html` (source: `docs/legal/privacy-policy.md`) to disclose the Meta Pixel, Conversions API, GA4, and the localStorage attribution key; add a California "Do Not Sell or Share My Personal Information" section. Ads targeting CA residents without this is a real CPRA exposure. | Aug 5 |

**AEM priority order (8 slots, highest value at position 1):**

1. `Lead`
2. `WaitlistSubmit`
3. `WaitlistFormStart`
4. `Engaged30s`
5. `ScrollDepth75`
6. `ViewContent`
7. `PageView`
8. *(empty — reserved for `CompleteRegistration`/`Purchase` on app launch)*

When the app ships, `Purchase` takes slot 1 and everything shifts down one; plan for the 72-hour cooldown on that day.

**One subtlety that matters given §3.2.** The plan optimizes on `WaitlistFormStart` (slot 2) while `Lead` sits at slot 1. Under AEM, an iOS user who opted out of tracking and performs both actions is reported only as the *highest-priority* event — so those users register as `Lead`, not as `WaitlistFormStart`. The optimizer therefore sees slightly fewer FormStart events than actually occurred on iOS. Keep the ordering anyway: inverting it (FormStart at #1) would suppress `Lead` reporting for the same users, which destroys the CPL measurement this whole program is trying to produce. The right trade is to accept a small optimizer-signal loss on ATT-opted-out iOS traffic in exchange for clean conversion reporting. The `waitlist_signups` table is unaffected by AEM entirely and remains the source of truth.

### 1.6 Durable lead store (the fix for "cannot segment or attribute")

Resend Contacts cannot hold arbitrary metadata, so a second write is mandatory or the UTMs you just plumbed are still unqueryable.

**Do this: add Railway Postgres** ([ASSUMPTION] ~$5/mo) and one table:

```sql
CREATE TABLE waitlist_signups (
  id             bigserial PRIMARY KEY,
  created_at     timestamptz NOT NULL DEFAULT now(),
  email          text NOT NULL,
  event_id       text,
  campaign_family text, campaign_variant text, campaign_audience text,
  landing_path   text, first_landing_path text,
  referrer       text, first_referrer text,
  utm_source text, utm_medium text, utm_campaign text,
  utm_content text, utm_term text, utm_id text,
  fb_campaign_id text, fb_adset_id text, fb_ad_id text,
  gclid text, lp_variant text,
  UNIQUE (email)
);
CREATE INDEX ON waitlist_signups (utm_campaign, created_at);
```

Write with `ON CONFLICT (email) DO NOTHING` so duplicates behave exactly as the current Resend duplicate path does. This table is what produces the weekly CPL-by-creative report — Meta's own reporting will over-count relative to it, and the gap is your fraud/bot signal.

**Rejected alternative:** stuffing UTMs into Resend's `firstName`. It corrupts merge tags in nurture email and is not queryable.

### 1.7 App / TestFlight tracking (C2) — what is possible and what is not

The beta ships in 1–2 weeks, which changes the funnel from `ad → landing page → email → (silence)` to `ad → landing page → email → invite → TestFlight install → first mission`. The tracking must follow, but the honest answer is that **most of the mobile attribution stack is unavailable to you and will stay unavailable for months.** Do not build for it.

**What does not work, and why:**

| Thing | Status | Reason |
|---|---|---|
| Meta App Install campaigns | **Do not run.** | App Install objective requires the app to be live on the App Store *and* registered in Meta's app dashboard. A TestFlight build is not an App Store listing. Even after launch, App Install campaigns need substantial volume to optimize and Meta's own floor guidance is far above $30/day. |
| SKAdNetwork / AEM for app events | **Effectively dead for you.** | SKAN postbacks have a **privacy threshold**: below a certain (undisclosed, roughly 15+ per campaign/day) conversion volume, Apple returns null or coarse-grained values. A brand-new app at $30/day will be below the threshold on every single campaign, permanently. You will receive nulls. |
| TestFlight install attribution | **Impossible.** | App Store Connect gives TestFlight tester counts and session data. It gives **no** install-source attribution at all — no referrer, no campaign, nothing. There is no TestFlight equivalent of a UTM. |
| Apple Search Ads | **Blocked until the App Store listing is live.** Then it becomes the highest-intent channel available. Pre-build the keyword list now (§9). |
| MMP (AppsFlyer/Adjust/Branch) | **Not yet.** Cost and integration time are not justified below ~1,000 installs/month. Revisit at App Store launch. |

**What does work — and it is enough:**

The one attribution primitive you fully control is that **every TestFlight invite is sent to an email address you already have a `waitlist_signups` row for**, with `fb_ad_id`, `utm_campaign`, `campaign_variant`, and `first_referrer` attached. That is a complete, deterministic, first-party chain from ad impression to app install — better than anything SKAN would give you. Preserve it religiously.

**Concretely, do this:**

| # | Task | Deadline |
|---|---|---|
| 1.7.1 | Add columns to `waitlist_signups`: `invited_at timestamptz`, `tf_installed_at timestamptz`, `first_mission_at timestamptz`, `activation_state text`. | Aug 12 |
| 1.7.2 | Invite in **cohorts by acquisition source**, not first-come-first-served. Invite 25 from the highest-CPL-uncertainty source first. Record `invited_at`. This turns the invite queue into a lead-quality experiment at zero cost. | Aug 17 |
| 1.7.3 | In-app: fire a `first_mission_completed` event to your own backend with the user's email. Join it back to `waitlist_signups` and set `first_mission_at`. **This is the real north-star conversion.** | Aug 21 |
| 1.7.4 | Send `Lead` → and later a second CAPI event `CompleteRegistration` with `action_source: "app"`... **no** — send it as `action_source: "website"` from your server keyed on the original `event_id`'s user, using the hashed email as the match key. Meta will attribute it back to the original ad click within the 7-day window. This is the only way to feed real activation signal back to the optimizer without an SDK. | Aug 24 |
| 1.7.5 | Meta SDK in the iOS app: **install it, do not optimize on it yet.** `FBSDKCoreKit` with `AutoLogAppEventsEnabled`. It costs an afternoon and it starts accumulating the app-event history that App Install and App Event Optimization campaigns will need in Q4. Do not let it change the campaign structure now. | Sept 7 |
| 1.7.6 | AEM slot 8 (reserved in §1.5) becomes `CompleteRegistration` once 1.7.4 ships. Remember the 72-hour cooldown. | Aug 24 |

**Funnel decision:** run **web → landing page → waitlist email → manual TestFlight invite**, not app-install ads. This is correct at this budget for three independent reasons: (a) app-install campaigns are unavailable pre-App-Store and uneconomical after; (b) the email is a durable asset that survives the app's version churn and gives you a re-marketing surface paid cannot afford; (c) the manual invite step is exactly the kind of high-touch, time-cheap work C3 says you should be doing — every invite is an opportunity for a personal reply and a founder-to-user conversation that produces better product information than any dashboard.

### 1.8 Week 0 task list, in dependency order

| # | Task | Owner | Deadline |
|---|---|---|---|
| W0-01 | FB Page, IG Business, Business Manager, ad account, payment method (§1.0) | Founder | Mon Aug 3 |
| W0-02 | Submit business verification; create Pixel + CAPI token; create GA4 property | Founder | Mon Aug 3 |
| W0-03 | Add domain-verification TXT record to DNS | Founder | Mon Aug 3 |
| W0-04 | Write `lune-synth/campaign/analytics.js` per §1.1 | Dev | Tue Aug 4 |
| W0-05 | Emit `window.LUNE_ANALYTICS_CONFIG` (pixel id, GA4 id, lead value) from the generator, alongside `cta-config.js` | Dev | Tue Aug 4 |
| W0-06 | Add `<script src="/campaign/analytics.js?v=1" defer>` to `scripts/generate-lune-campaign-pages.js` head block (line ~222) **and** hand-add to `lune-synth/index.html`, `lune-synth/blog/index.html`, all 6 blog posts, `lune-synth/privacy/`, `lune-synth/terms/` | Dev | Tue Aug 4 |
| W0-07 | `cta.js` `event_id` edit (§1.3 Edit 1) | Dev | Tue Aug 4 |
| W0-08 | Provision Railway Postgres, create `waitlist_signups`, wire the insert | Dev | Wed Aug 5 |
| W0-09 | Rewrite `api/waitlist.js`: full payload, family→audience routing, DB insert, CAPI send, always-200 (§1.3 Edit 2) | Dev | Wed Aug 5 |
| W0-10 | `npm run build:campaigns`; deploy; verify with Meta Pixel Helper on 5 sample pages (one per family) | Dev | Wed Aug 5 |
| W0-11 | Events Manager → Test Events: submit a real waitlist entry, confirm `Lead` shows **"Browser and Server" / Deduplicated**, EMQ ≥ 6.0 | Dev | Wed Aug 5 |
| W0-12 | Set AEM priority order (§1.5). Starts 72h cooldown. | Founder | Wed Aug 5 |
| W0-13 | Update privacy policy + CPRA section; rebuild legal pages | Founder | Wed Aug 5 |
| W0-14 | Create Custom Audiences: All site visitors 30/90/180d; `ViewContent` 30d; `Engaged30s` 30d; `WaitlistFormStart` 30d; **`Lead` 180d (exclusion list)**; IG+FB engagers 365d. These need to start accumulating on day one even though they are unusable for weeks. | Founder | Wed Aug 5 |
| W0-15 | Reformat creatives to 4:5 / 1:1 / 9:16 (§6, first block) — 19 of 26 are unusable in feed today | Design | Thu Aug 6 |
| W0-16 | **$25/day smoke test**, 1 ad set, 3 ads, broad, 72h ($75 total). Purpose is to validate that `Lead` events arrive attributed in Ads Manager — **not** to judge creative. Do not draw a single creative conclusion from this. | Founder | Fri Aug 7 → Sun Aug 9 |

**Go/no-go gate for Aug 10 full launch:** at least three `Lead` events visible in Ads Manager, attributed to the correct ad, deduplicated, and matching three rows in `waitlist_signups` with populated `fb_ad_id`. If that reconciliation fails, pause spend and debug. At $30/day you cannot afford to run blind for even a week.

---

## 2. The under-18 constraint (a design constraint, not a footnote)

### 2.1 What Meta actually permits

Meta restricts advertising to people aged 13–17 to **age and location only**. No detailed interest or behavior targeting, no Custom Audiences, no Lookalikes, no ad-set-level optimization refinements against minors. In practice this means: any ad set with a minimum age below 18 loses every targeting lever that makes lean-budget prospecting viable, and loses retargeting entirely.

Second-order effects that matter here:
- A minor cannot be added to a Lookalike seed, so leads from teens **degrade** rather than improve your lookalikes.
- A minor cannot legally consent to marketing email in several jurisdictions, so a teen waitlist signup is a weaker asset than an adult one even when it converts.
- Education is **not** a Meta Special Ad Category (those are Credit, Employment, Housing, and Social Issues/Elections/Politics), so full targeting remains available — *for 18+*.

### 2.2 The design constraint

> **Every Meta ad set runs a minimum age of 18. Lune Synth never speaks to a teenager on Meta. It speaks to the adult who is either buying for the teenager or is the learner themselves.**

This is not a delivery setting; it reorganizes the entire program.

### 2.3 What this does to the audience map

Meta traffic splits into exactly two buyer types:

**Buyer A — Parents, 30–55.** The purchaser for every K–12 and college-entrance product. Reachable at full targeting depth via parental behaviors. They do not care about "SAT math practice"; they care about the nightly homework fight, the tutor invoice, and whether their kid is quietly using ChatGPT to skip the thinking. Lune Synth's anti-cheating counter-positioning is *strongest* here — it is the only angle in this market that a worried parent will read twice.

**Buyer B — Adult learners, 18+.** College undergrads (calculus, orgo, physics, engineering, accounting, finance, statistics, CS), nursing/pre-health students, pre-meds, grad-exam takers (GRE/GMAT/LSAT), medical trainees (USMLE), doctoral candidates, GED learners, career changers, and returning adult students. Fully targetable, high intent, and — critically — they are their own buyer, so there is no purchase-decision handoff.

**Consequence for the existing asset base:** 13 test-prep pages and 20 subject pages exist, but the *targetable* ones are a subset. The SAT, ACT, PSAT, AP, IB, state-assessment, arithmetic, and (largely) history creatives address 14–17-year-olds. **On Meta, those creatives must be re-voiced for the parent, or they cannot run at all.** They remain excellent Google Search and organic assets — a 16-year-old can search, they just cannot be targeted.

**Consequence for the creative queue:** the ten parent/student/family landing pages that already exist — `/for-parents/math-help/`, `/for-parents/ai-and-homework/`, `/for-parents/homework-help/`, `/for-parents/middle-school-math/`, `/for-parents/high-school-math/`, `/for-students/behind-in-math/`, `/for-students/study-consistency/`, `/for-students/college-study/`, `/for-students/adult-learners/`, `/for-families/homeschool/` — are the **only** destinations purpose-written for the audiences Meta lets you buy. They have **zero ad creative**. Closing that gap (§6) is the single highest-leverage production item in this document. Note also that the parent pages are written in parent voice ("your child," "your family"), while all 26 existing creatives are written in learner voice ("you," "your work") per the campaign system rules in `docs/lune-meta-ads-and-landing-pages-expansion-plan.md`. Parent creative needs a documented voice exception: **learner voice for Buyer B, parent voice for Buyer A**, and the two must never mix inside one ad set.

### 2.4 Age windows by segment (reference table)

**At $30/day only the last two rows are actually built** — `broad_us_18-54` and `parents_us_35-55` (§3.3, §3.6). The rest of this table is the map for when budget clears the G2 gate in §4.4. Keep it; do not build from it yet.

| Segment | Age | Geo | Notes |
|---|---|---|---|
| Parents of elementary/middle | 30–50 | US | Behavior: Parents (All), Parents with preteens (08–12) |
| Parents of high schoolers | 35–55 | US | Behavior: Parents with teenagers (13–17) |
| Homeschool families | 28–55 | US | Skews female 30–45 |
| College STEM | 18–26 | US | Reachable directly; they are the learner |
| Pre-med / orgo | 18–26 | US | |
| Nursing / allied health | 19–38 | US | Wide age band; many second-career |
| Grad exams (GRE/GMAT/LSAT) | 21–34 | US | |
| Medical trainees (USMLE/Step) | 23–34 | US | Small, expensive, extremely high intent |
| Adult learners / GED | 20–45 | US | |
| Broad (algorithm-led) | 18–54 | US | No detailed targeting |

Nothing runs below 18. There is no exception.

---

## 3. Campaign architecture (built for $30/day)

### 3.1 The controlling arithmetic

| Input | Value |
|---|---|
| Daily Meta spend | ~$20/day Aug, ~$20/day Sep, ~$17/day Oct ([ASSUMPTION] rest of the $30 goes to Google from Sept) |
| Weekly Meta spend | ~$140 |
| Target CPL | $4 [ASSUMPTION — US education waitlist with a real offer and a single-field form; if the real number is $8 this plan still works, it just halves the event volume] |
| Leads/week at target | ~35 |
| Meta's learning-phase requirement | ~50 optimizer events / ad set / week |

**35 < 50.** The account cannot exit learning phase on `Lead` in a single ad set, let alone several. Three responses are possible and only one is right.

*Wrong response A — run 3–4 ad sets anyway.* Every one sits in Learning Limited forever at ~$5/day. Meta serves them to the cheapest reachable inventory, results are noise, and no verdict is ever reachable. This is what most small accounts do and it is why most small accounts conclude "Meta doesn't work."

*Wrong response B — abandon conversion optimization and buy Traffic.* Cheap clicks, and the optimizer learns to find people who click and never convert. On a page whose only job is an email capture, this produces a CPC that looks great and a list of nobody.

**Right response — one ad set, and a cheaper optimizer event until Lead volume exists.**

### 3.2 Objective and optimizer event — the actual recommendation

**Run the Leads objective (website conversions) from day one. But optimize on `WaitlistFormStart`, not `Lead`, for the first 3–4 weeks.**

Reasoning, explicitly:

- `WaitlistFormStart` fires when someone focuses the email field. It is **genuinely intent-bearing** — nobody focuses an email input by accident — so unlike Traffic or ViewContent it cannot be gamed by cheap-click inventory. [ASSUMPTION] it fires at roughly 2.5–3× the rate of `Lead`, which puts weekly volume at ~90–105 events. **That clears 50/week in one ad set.** The optimizer actually learns.
- It is a *conversion* event on a *conversion* objective, so all the machinery (CAPI, AEM, value-based bidding later) stays intact and the switch to `Lead` later is a one-field change, not a rebuild.
- Do **not** use Traffic or Engagement objectives. The tempting argument is "cheaper events, faster learning." But the learning is about the *wrong thing*. Engagement optimization finds people who like posts; Traffic finds people who tap. Neither correlates with typing an email address, and at $30/day you cannot afford to spend six weeks teaching the model a false target. `WaitlistFormStart` is the correct compromise: cheap enough to hit volume, honest enough to be worth learning.

**Switch to optimizing on `Lead` when:** the account has produced ≥ 120 total `Lead` events (i.e. `waitlist_signups` ≥ 120 rows attributable to Meta) **and** the single prospecting ad set is generating ≥ 45 Leads/week. [ASSUMPTION] this happens around Week 6–8, or does not happen at all at this budget — in which case stay on `WaitlistFormStart` indefinitely. That is fine. It is a working configuration, not a stopgap.

**Second switch, post-beta (C2):** once §1.7.4 is live and `CompleteRegistration` (first mission completed in-app) is flowing via CAPI, that is the *true* north star — but its volume will be a fraction of `Lead`, so **never optimize on it at this budget.** Use it for reporting and lead-quality-by-source analysis only. Optimizing on a 5-events-per-week signal is worse than not optimizing.

### 3.3 Targeting: broad beats interest stacks at this budget

The conventional move is to build tight interest stacks. **At $30/day that is backwards**, and this is worth stating as a principle:

Interest targeting is a *prior* — it tells Meta where to look before the pixel knows anything. Broad targeting delegates the search to Meta's model, which is far better at it *once it has signal*. The catch is that broad needs conversion volume to work. But interest stacks need **more ad sets** (one per stack) to be interpretable, and more ad sets is precisely what this budget forbids.

So: **run one broad ad set, US, 18–54, no detailed targeting, Advantage+ Audience ON.** Let the creative do the targeting. This is not a compromise — with 26 subject-specific creatives, the creative *is* an extraordinarily precise targeting instrument. An organic-chemistry ad is self-selecting: only orgo students stop on it. You get niche targeting for free, at broad-audience CPMs, without fragmenting the optimizer.

**Interest stacks return when budget increases** (§4.4 ladder), or on Google Search where intent is explicit and cheap. Keep the audience definitions in §3.6 warm for that day.

**One exception, from Week 5:** a second ad set for **parents**, because parent-voice creative and learner-voice creative cannot share an ad set without the optimizer blending two incompatible audiences. Behavioral parent targeting is the one prior worth paying for, since "has a teenager" is not inferable from creative engagement.

### 3.4 Budget mode, attribution, placements

- **ABO, not CBO.** CBO's entire value is reallocating across multiple ad sets. With one or two ad sets there is nothing to reallocate, and ABO gives a guaranteed, predictable daily floor — which matters enormously when the floor is $20. Revisit CBO at $100/day+.
- **Bid strategy: Highest Volume (no cap).** Cost caps at this volume cause under-delivery, and under-delivery at $20/day means zero learning. Introduce a cost cap only after a stable CPL is proven over 3+ weeks.
- **Attribution: 7-day click, 1-day view.** Decisions on 7-day click. Reconcile every Friday against `waitlist_signups` grouped by `fb_ad_id`; expect Meta to over-report 10–25%. First-party number is CPL truth; Meta's number is optimizer signal.
- **Placements: Advantage+ Placements ON, exclude Audience Network.** At low budget you cannot afford to hand-pick placements — that fragments delivery further. Audience Network is the one exclusion worth making; it delivers the cheapest and lowest-quality clicks in education.
- **Ad scheduling: off.** Dayparting on a $20/day budget just shrinks the auction pool.

### 3.5 Account structure — the actual build

**Phase 1 (Aug 10 – Sep 6): one ad set.**

```
LS_test_leads_202608                              [ABO, $20/day]
└── broad_us_18-54                                 Optimize: WaitlistFormStart
    ├── 3–4 ads live at any time (§5 rotation)
    └── Excludes: Lead_180d Custom Audience
```

That is the whole account for four weeks. It will feel too simple. It is correct.

**Phase 2 (Sep 7 – Oct 4): two ad sets + retargeting.**

```
LS_test_leads_202609                              [ABO]
├── broad_us_18-54            $12/day              Optimize: WaitlistFormStart (or Lead if gate passed)
└── parents_us_35-55          $6/day               Optimize: WaitlistFormStart; parent-voice creative only

LS_retarget_202609                                [ABO, $2/day]
└── rt_engaged_30d            $2/day               Optimize: Lead. Tiny audience, tiny budget, cheapest leads in the account.
```

Retargeting opens only once ~4,000 site visitors have accumulated ([ASSUMPTION] ~Sep 7 at plan volume). $2/day sounds absurd; against a 3,000-person audience it is roughly correct and it will return the lowest CPL in the account.

**Phase 3 (Oct 5 – Nov 1): same two ad sets, plus the winner concentration.**

No new ad sets. Instead, kill everything that lost and put the full prospecting budget behind the one winning audience/creative/page triplet. **At this budget, Week 9–12 is about concentration, not expansion.**

**Every ad set excludes `Lead_180d`.** At $30/day, re-serving people who already signed up is not a rounding error — it is a meaningful fraction of the budget.

### 3.6 Audience definitions (paste-ready; only the first two run before November)

**`broad_us_18-54`** *(LIVE Aug 10)* — US, 18–54, all genders, English. No detailed targeting. Advantage+ Audience ON. Exclude `Lead_180d`. *The creative does the targeting.*

**`parents_us_35-55`** *(LIVE Sep 7)* — US, 35–55. Behaviors: Parents with teenagers (13–17) **OR** Parents with preteens (08–12). No interest layer (keeps the audience large enough to deliver at $6/day). Advantage+ Audience OFF — the behavioral prior is the entire point of the ad set. Exclude `Lead_180d`.

**`rt_engaged_30d`** *(LIVE Sep 7)* — (ViewContent 30d ∪ Engaged30s 30d ∪ ScrollDepth75 30d) − `Lead_180d`. Optimize `Lead`. Retargeting is the one place a small budget can optimize on the real conversion event, because the audience is pre-qualified.

---

**Held in reserve — build these only when budget clears $100/day (§4.4):**

- `premed_health_us_18-34` — Include ANY: Pre-medicine · Medical College Admission Test · Organic chemistry · Nursing · Nursing school · NCLEX · Anatomy · Physiology · UWorld · Kaplan · AAMC · Student Doctor Network · Anki · Quizlet. Narrow by: College student OR Graduate school.
- `gradexam_us_21-34` — Include ANY: Graduate Record Examinations · Graduate Management Admission Test · Law School Admission Test · Law school · Graduate school · Magoosh · Manhattan Prep · The Princeton Review · Kaplan Test Prep · LSAC.
- `college_stem_us_18-26` — Include ANY: Calculus · Physics · Chemistry · Engineering · Computer science · Wolfram Alpha · Symbolab · **Photomath · Chegg · Course Hero** · Khan Academy · Coursera. Narrow by: College student. *The Photomath/Chegg/Course Hero interests are deliberate: those are people whose current tool is failing them, and the counter-positioning lands hardest there.*
- `homeschool_us_28-55` — Include ANY: Homeschooling · Classical Conversations · Abeka · Time4Learning · The Good and the Beautiful · Charlotte Mason · Christian homeschooling.
- `adult_learners_us_20-45` — Include ANY: General Educational Development · Adult education · Community college · Continuing education · Career change · Vocational education.

**Lookalikes: do not build one during this 90-day plan.** Meta's floor is 100 seed records but that floor produces noise. The threshold that matters is **≥ 400 rows in `waitlist_signups`**, and at $4 CPL and ~$140/week Meta spend that arrives around Week 12 at the earliest. Building one earlier wastes a test slot the account cannot spare. When it arrives: `LAL 1% US — Lead 180d`, tested head-to-head against `broad_us_18-54`, killed if it does not win on CPL over 14 days.

---

## 4. Budget plan

### 4.1 The ramp (this is the whole ramp — it is deliberately flat)

| Period | Dates | Meta $/day | Google $/day | Ad sets live | Ads live | Period Meta spend |
|---|---|---|---|---|---|---|
| Smoke test | Aug 7–9 | $25 | — | 1 | 3 | $75 |
| Phase 1 | Aug 10–31 | $20 | — | 1 | 3–4 | $440 |
| Phase 2 | Sep 1–6 | $20 | — | 1 | 4 | $120 |
| Phase 2b | Sep 7–30 | $20 | $6 | 3 | 6 | $480 |
| Phase 3 | Oct 1–31 | $17 | $9 | 3 | 5 | $527 |
| **Total** | **Aug 7 – Oct 31** | | | | | **$1,642 Meta + ~$460 Google = $2,102** |

**There is no scaling inside the 90 days.** That is the correct answer, not a failure of ambition. Scaling before the gates in §4.4 are cleared converts a cheap information-gathering exercise into an expensive one with the same information content. The ramp is flat because the budget is the constraint and the deliverable is a verdict, not volume.

### 4.2 Metric targets [ASSUMPTION on every benchmark — US education, cold, pre-launch offer]

| Metric | Green | Amber | Red (act) |
|---|---|---|---|
| CPM | ≤ $18 | $18–30 | > $30 |
| Outbound CTR | ≥ 1.0% | 0.5–1.0% | < 0.5% |
| Hook rate (3s plays / impressions, video only) | ≥ 20% | 12–20% | < 12% |
| Outbound CPC | ≤ $0.90 | $0.90–1.60 | > $1.60 |
| LP view rate (LP views / outbound clicks) | ≥ 80% | 65–80% | < 65% — page-speed problem, not an ad problem |
| Cost per `WaitlistFormStart` | ≤ $1.50 | $1.50–2.75 | > $2.75 |
| Form-start → Lead rate | ≥ 45% | 30–45% | < 30% — form or trust problem |
| LP view → Lead CVR | ≥ 8% | 5–8% | < 5% |
| **CPL (blended)** | **≤ $4** | **$4–7** | **> $10** |
| Frequency, 7d, prospecting | ≤ 2.0 | 2.0–3.0 | > 3.0 |
| Frequency, 7d, retargeting | ≤ 5.0 | 5.0–7.0 | > 7.0 |

### 4.3 Decision rules

These are calibrated to a world where **one ad accumulates roughly $5–7/day**. Every threshold is expressed in dollars of spend, not days, because days are meaningless when spend rate varies.

**Kill an ad when any of:**
- ≥ $40 spent **and** outbound CTR < 0.5% **and** zero `WaitlistFormStart`. *(Roughly day 6–8. Do not act before $40 — below that you are reading noise.)*
- ≥ $75 spent **and** cost per `WaitlistFormStart` > 2.5× the ad set average.
- ≥ $120 spent **and** zero `Lead` events.
- Frequency > 3.0 in 7 days with declining CTR week over week — fatigue, not failure; archive and reintroduce in 30 days.

**Keep and build variants of an ad when:**
- ≥ $75 spent **and** cost per `WaitlistFormStart` ≤ 0.7× ad set average. Produce 2 variants that change exactly one element (headline, or motif, never both).

**Ad set budget changes:**
- Change ad set budget **at most once every 5 days**, by **at most ±25%**. A learning reset at $20/day costs a full week of signal — far more expensive than the budget change is worth.
- Never duplicate a winning ad set to "scale." Duplication at this budget splits an already-insufficient event stream in half.

**Pause the whole account when:**
- 14 consecutive days with blended CPL > $12 and no untested hypothesis remaining. Stop, spend two weeks on organic and creative production, restart with new creative. Burning $30/day into a known-dead configuration is the worst available use of the money.

### 4.4 The scaling ladder — gated, not scheduled

Each gate requires the previous one. **Do not raise budget on a calendar; raise it on a proof point.**

| Gate | Raise to | Proof required | Earliest realistic date |
|---|---|---|---|
| **G0 — current** | $20/day | none | Aug 10 |
| **G1** | $50/day | 30-day blended CPL ≤ $6 **and** ≥ 25% of Meta-sourced waitlist emails accept the TestFlight invite within 7 days of being sent. *(This second condition is the lead-quality check that CPL alone cannot give you — it is why §1.7.2 invites in source cohorts.)* | Nov 2026 |
| **G2** | $100/day | Cost per **activated** user (first mission completed in-app) ≤ $25 **and** D7 retention of the Meta-sourced cohort ≥ 30%. At G2, re-enable interest-stack ad sets from §3.6 and CBO. | Dec 2026 |
| **G3** | $250/day | LTV:CAC ≥ 2.5 on real subscription revenue — ≥ 5% of activated users converting to paid at ≥ $60 realized LTV. At G3, build the first lookalike and open a dedicated scaling campaign. | Q1 2027 |
| **G4** | $500/day+ | G3 sustained 60 days with CAC stable within ±20% as spend doubled. | Q2 2027 |

If G1 is not cleared by Dec 1, 2026, the correct conclusion is that **paid is not the channel** and the budget should move entirely to founder time on organic, SEO against the 43 existing pages, and direct outreach. Write that possibility down now so it is a decision rather than a drift.

---

## 5. Creative testing matrix

### 5.1 The honest statistical position

At $30/day you cannot run a statistically valid CPL A/B test. To detect a 30% CPL difference at conventional confidence you need roughly 100+ conversions per cell; at $4 CPL that is $400/cell, or the entire August budget for one comparison. Pretending otherwise produces confident conclusions from noise, which is worse than no conclusion.

**So the method is sequential elimination on leading indicators, with CPL used only for coarse, large-margin calls.**

| Decision type | Requires | Why it is affordable |
|---|---|---|
| Kill on hook failure | ≥ 1,500 impressions **and** ≥ $40 spend on that ad | CTR stabilizes at ~1,000–1,500 impressions; costs ~$25–40 |
| Promote a creative | ≥ $75 spend **and** ≥ 15 `WaitlistFormStart` | FormStart volume is ~3× Lead volume, so this is reachable |
| Declare a CPL winner | ≥ 25 `Lead` events per cell **and** ≥ 40% margin between cells | Only ever true for the top 2 cells; accept that most comparisons end "no verdict" |
| Landing-page CVR call | ≥ 250 LP views **and** ≥ 20 conversions per variant | Only run on the single winning page; never run LP tests on three pages at once |

**Only look for large wins.** If two creatives are within 25% of each other, record "no difference" and move on. The program's job is to find a 2–3× winner, not to optimize a 10% edge.

### 5.2 Round structure

One variable per round. **Two weeks per round**, not one — a one-week round at $20/day gives $35/ad, which is below the kill threshold. Six rounds fit in the 12 weeks.

| Round | Dates | Isolated variable | Held constant | Cells | Spend/cell | Verdict criterion |
|---|---|---|---|---|---|---|
| **R1** | Aug 10–23 | **Niche** — which vertical is cheapest to reach | 4:5 static, broad 18–54, matched subject LP, learner voice | 4 ads | ~$70 | Cost per FormStart; keep top 2, kill bottom 2 |
| **R2** | Aug 24–Sep 6 | **Hook** — anti-cheating wedge vs. get-unstuck vs. precise-feedback vs. exam urgency | Winning niche from R1, same visual frame, same LP | 4 ads | ~$70 | Outbound CTR primary, cost/FormStart secondary |
| **R3** | Sep 7–20 | **Voice/audience** — parent-voice creative on `parents_us_35-55` vs. learner-voice on `broad_us_18-54` | Winning hook from R2 | 2 ad sets × 2–3 ads | ~$60 | Cost per FormStart, per ad set |
| **R4** | Sep 21–Oct 4 | **Format** — 4:5 static vs. founder-shot 9:16 video vs. 4-card carousel | Winning hook + winning audience | 3 ads | ~$85 | Hook rate + cost/FormStart |
| **R5** | Oct 5–18 | **Landing page** — matched subject page vs. `/for-students/behind-in-math/` vs. `/for-parents/ai-and-homework/` | Winning creative, identical ad | 3 URLs on 3 duplicate ads | ~$70 | LP view → Lead CVR |
| **R6** | Oct 19–Nov 1 | **Concentration + offer clarifier** — winner at full budget; A/B the `data-clarifier` text only | Everything else | 2 ads | ~$130 | Blended CPL; establishes the G1 baseline |

**What is deliberately NOT tested in 90 days:** lookalikes (no seed), placements (fragments delivery), dayparting (shrinks pool), bid caps (under-delivery), Advantage+ Shopping (no catalog), dynamic creative (uninterpretable at this volume). Each of these is a legitimate test at $100/day+ and a budget incinerator below it.

### 5.3 Which creatives launch first, and why

The R1 four are chosen on four criteria simultaneously: **adult-targetable under §2 · highest willingness to pay · highest search-verified pain · non-seasonal.**

| Rank | Creative | Landing page | Why first |
|---|---|---|---|
| 1 | `17-organic-chemistry.png` | `/study/organic-chemistry/` | The single most universally hated college course in America. Audience is 18–22 and fully targetable. Pain is acute, recurring every semester, and the "I can follow the mechanism but can't produce it" framing in the LP copy is exactly the complaint. Highest expected volume of the four. |
| 2 | `26-nursing.png` | `/study/nursing/` | Huge, adult (19–38), and the highest-stakes non-elite audience in education — NCLEX failure has direct career cost. Willingness to pay for study tools is well established (UWorld, ATI). Non-seasonal. |
| 3 | `06-mcat.png` | `/test-prep/mcat/` | Highest willingness to pay per head of any targetable segment. Pre-meds already spend $1,000–3,000 on prep. Small audience, so expect higher CPM — that is the point of testing it against orgo. |
| 4 | `24-ged.png` | `/test-prep/ged/` | Fully adult (20–45), emotionally the strongest copy in the entire `pages.json` set ("You do not need to relearn everything at once"), and the cheapest CPMs of the four because the audience is not fought over by ed-tech advertisers. The contrarian pick, and often these win. |

**Explicitly deferred to Round 3+ or later:** `04-sat`, `10-act`, `11-ap-biology`, `12-ib-math`, `05-foundational-arithmetic`, `02-history`. All six address 14–17-year-olds and **cannot run on Meta in their current learner voice** (§2.2). They are excellent Google Search and organic assets today and become Meta assets only once re-voiced for parents.

### 5.4 Full creative → ad set → landing page map (all 26)

| # | Creative | Landing page | Meta-targetable audience | Ad set | Round | Reformat needed |
|---|---|---|---|---|---|---|
| 01 | calculus | `/study/calculus/` | College STEM 18–26 | broad | R4 | none (4:5) |
| 02 | history | `/study/history/` | **Parent 35–55** (HS student) | parents | R6+ | 1.644 → 4:5 + reshoot voice |
| 03 | lsat | `/test-prep/lsat/` | Grad-exam 21–34 | broad | R2 pool | none (4:5) |
| 04 | sat | `/test-prep/sat/` | **Parent 35–55 only** | parents | deferred | 3:2 → 4:5 + parent voice |
| 05 | foundational-arithmetic | `/for-parents/homework-help/` | **Parent 30–50 only** | parents | deferred | 3:2 → 4:5 + parent voice |
| 06 | mcat | `/test-prep/mcat/` | Pre-med 20–28 | broad | **R1** | 3:2 → 4:5 |
| 07 | gre | `/test-prep/gre/` | Grad-exam 21–32 | broad | R2 pool | none (4:5) |
| 08 | phd-qualifying-exams | `/test-prep/phd-qualifying-exams/` | Doctoral 24–35 | broad | hold — audience too small for $20/day | none (4:5) |
| 09 | algorithms | `/study/computer-science/` | College CS 18–28 | broad | R4 | none (4:5) |
| 10 | act | `/test-prep/act/` | **Parent 35–55 only** | parents | deferred | 3:2 → 4:5 + parent voice |
| 11 | ap-biology | `/test-prep/ap-exams/` | **Parent 35–55 only** | parents | deferred | 3:2 → 4:5 + parent voice |
| 12 | ib-math | `/test-prep/ib-exams/` | **Parent 35–55 only** | parents | deferred | none (4:5) + parent voice |
| 13 | usmle-step-2 | `/test-prep/usmle/` | Med trainee 23–34 | broad | hold — tiny audience | 3:2 → 4:5 |
| 14 | physics | `/study/physics/` | College STEM 18–26 | broad | R4 | 3:2 → 4:5 |
| 15 | chemistry | `/study/chemistry/` | College STEM 18–26 | broad | R4 | **2.06 → 4:5, full recompose** |
| 16 | economics | `/study/economics/` | College 18–26 | broad | R6+ | none (4:5) |
| 17 | organic-chemistry | `/study/organic-chemistry/` | Pre-med/college 18–24 | broad | **R1** | 3:2 → 4:5 |
| 18 | anatomy-physiology | `/study/anatomy-physiology/` | Health 18–30 | broad | R2 pool | 3:2 → 4:5 |
| 19 | statistics | `/study/statistics/` | College 18–30 | broad | R6+ | 3:2 → 4:5 |
| 20 | engineering | `/study/engineering/` | College STEM 18–26 | broad | R6+ | **2.12 → 4:5, full recompose** |
| 21 | accounting | `/study/accounting/` | College/adult 19–30 | broad | R6+ | 3:2 → 4:5 |
| 22 | finance | `/study/finance/` | College/adult 19–30 | broad | R6+ | 3:2 → 4:5 |
| 23 | writing | `/study/writing/` | College/adult 18–35 | broad | R6+ | **2.16 → 4:5, full recompose** |
| 24 | ged | `/test-prep/ged/` | Adult 20–45 | broad | **R1** | 3:2 → 4:5 |
| 25 | gmat | `/test-prep/gmat/` | Grad-exam 24–34 | broad | R2 pool | 3:2 → 4:5 |
| 26 | nursing | `/study/nursing/` | Health 19–38 | broad | **R1** | 3:2 → 4:5 |

### 5.5 The ten landing pages with no creative at all

This is the gap that matters most (§2.3). These pages are already written in the voice of the audiences Meta actually lets you buy, and not one of them has an ad.

| Landing page | Audience Meta permits | Creative needed | Priority |
|---|---|---|---|
| `/for-parents/ai-and-homework/` | Parents 35–55 | **P-01** — anti-cheating wedge, parent voice | **1** |
| `/for-students/behind-in-math/` | Adult learner 18–35 | **S-01** — "you are not bad at math" | **2** |
| `/for-parents/homework-help/` | Parents 30–50 | **P-02** — nightly homework conflict | **3** |
| `/for-students/adult-learners/` | Adult 22–45 | **S-02** — returning learner | **4** |
| `/for-parents/math-help/` | Parents 30–50 | **P-03** — confidence / one step | 5 |
| `/for-students/study-consistency/` | 18–30 | **S-03** — Quick Missions, five minutes | 6 |
| `/for-families/homeschool/` | Parents 28–55 | **P-04** — keep your curriculum | 7 |
| `/for-students/college-study/` | 18–26 | **S-04** — Constellations / study plan | 8 |
| `/for-parents/high-school-math/` | Parents 35–55 | **P-05** — teenager + AI + fall test season | 9 |
| `/for-parents/middle-school-math/` | Parents 30–50 | **P-06** — gaps compound | 10 |

Copy for P-01 through P-05 and S-01 through S-04 is written and ready to produce in §7.

---

## 6. New creative production queue

Governed by C3: **time is abundant, money is not.** Every item below is founder-executable with an iPhone, a desk, a pencil, and the design template that already produced 26 ads. No agency, no shoot crew, no stock licensing, no paid editor. Budget for outside creative production in this 90-day plan: **$0.**

### Block A — Reformat (BLOCKING, before any spend)

19 of 26 masters cannot enter a Meta feed placement without letterboxing (§0). This is the highest-priority production item because it invalidates the entire existing library.

| # | Task | Detail | Deadline |
|---|---|---|---|
| A1 | Recrop 15 masters from 3:2 → 4:5 (1080×1350) | 04, 05, 06, 10, 11, 13, 14, 17, 18, 19, 21, 22, 24, 25, 26. Crop, do not stretch. Protect icon, headline, phone, CTA pill, offer line. | **Aug 5** |
| A2 | Recrop 02 (1.644) → 4:5 | Same rules | Aug 5 |
| A3 | **Recompose** 15, 20, 23 (2.06–2.16 — too tall to crop) | Rebuild layout at 1080×1350. These need the headline re-set at a larger size; a crop would destroy them. | Aug 6 |
| A4 | Export the R1 four (06, 17, 24, 26) additionally at 1:1 (1080×1080) and 9:16 (1080×1920) | 9:16 requires moving the CTA pill up out of the bottom 250px UI safe zone and the headline down out of the top 250px | **Aug 6** |
| A5 | File organization per the expansion plan: `ads/meta/<nn>-<niche>/master.png`, `4x5.png`, `1x1.png`, `9x16.png`, `copy.md`, `url.txt` | Prevents the next 26 from being unusable the same way | Aug 6 |

**Standing rule from here on: no creative is "finished" until 4:5, 1:1, and 9:16 exist.** Add it to the campaign system rules in `docs/lune-meta-ads-and-landing-pages-expansion-plan.md`.

### Block B — Parent and adult-learner statics (the gap that blocks §2)

Ten existing landing pages have zero creative, and they are the only ones written for audiences Meta permits. Highest expected impact of any production item in this document. Use the exact same layout template as the 26 — icon, wordmark, all-caps headline, subhead, phone, CTA pill, offer line — so brand consistency is free.

| # | Creative | Copy source | Phone screen to use | Deadline |
|---|---|---|---|---|
| B1 | **P-01** parent / anti-cheating wedge → `/for-parents/ai-and-homework/` | §7 copy P1 | `screenshot-workflow/1/phone-mock.webp` (capture of handwritten work) | **Aug 12** |
| B2 | **S-01** behind-in-math → `/for-students/behind-in-math/` | §7 copy A8 | `applied/results/45-percent.webp` | **Aug 12** |
| B3 | **P-02** homework conflict → `/for-parents/homework-help/` | §7 copy P2 | `question-prompts/5.webp` | Aug 19 |
| B4 | **S-02** adult learner → `/for-students/adult-learners/` | §7 copy A5 | `question-prompts/24.webp` | Aug 19 |
| B5 | **P-03** confidence → `/for-parents/math-help/` | §7 copy P3 | `applied/results/80-percent.webp` | Aug 26 |
| B6 | **P-05** teenager + fall testing → `/for-parents/high-school-math/` | §7 copy P4 | `question-prompts/4.webp` | Aug 26 |
| B7 | **P-04** homeschool → `/for-families/homeschool/` | §7 copy H1 | `screenshot-workflow/1/phone-mock.webp` | Sep 2 |
| B8 | **S-03** Quick Missions → `/for-students/study-consistency/` | §7 copy F1 | `quick-mission-screen-poster.png` | Sep 2 |
| B9 | **S-04** Constellations → `/for-students/college-study/` | §7 copy F2 | Constellation screen (record new) | Sep 9 |
| B10 | **P-06** middle school → `/for-parents/middle-school-math/` | §7 copy P2 variant | `question-prompts/5.webp` | Sep 9 |

**Voice rule, documented as an exception to the existing campaign system:** the expansion plan mandates learner voice ("you", "your work") for all creative. **Parent creative uses parent voice ("your child", "your family") and must never appear in the same ad set as learner-voice creative.** The audiences are different people making different decisions.

### Block C — Founder-shot video (C3: this is where abundant time converts to the scarcest asset)

Video is the format Meta's auction rewards most heavily and the one Lune Synth has none of. It is also the one a founder can produce for free in an afternoon. **Do not hire this out.**

Setup, once: iPhone on a $20 tripod, desk by a window, white paper, black pen, no faces, no logos, no identifiable minors. Shoot vertically at 4K 30fps. Edit in CapCut or iMovie.

| # | Asset | Shot list | Length | Deadline |
|---|---|---|---|---|
| C1 | **V-01 "The whole loop"** — the single most important asset in this queue | (1) hand writes a derivative on paper, 3s · (2) hand picks up phone, photographs the page, 2s · (3) screen recording: Lune Synth reads it and names the exact broken step, 4s · (4) screen recording: targeted mission appears, 3s · (5) hard cut to CTA card, 2s | 14s, 9:16 | **Aug 19** |
| C2 | **V-02 "An answer is not feedback"** — the wedge in motion | Split screen: left, a generic chat UI producing a finished answer (built by you, no third-party branding); right, a handwritten attempt receiving a step-level correction. Text on screen only, no VO. | 10s, 9:16 | Aug 26 |
| C3 | **V-03 product motion, zero shooting** — edit from footage already in the repo | Cut from `screenshots/applied/quick-mission-screen.mp4` + `luna-hints.mp4` + `step-1.mp4`…`step-5.mp4` (all already exist per `docs/lune-campaign-phone-footage-plan.md`). No new capture required. | 8s, 9:16 | **Aug 14** — do this first; it is free |
| C4 | **V-04 parent voice-over** | Same visual loop as V-01, but on-screen text in parent voice. Founder VO optional; text-only performs comparably and avoids a bad-audio risk. | 12s, 9:16 | Sep 16 |
| C5 | **V-05 beta-user UGC** — unlocked by C2 | Once TestFlight users exist: ask 5 of them for a 20-second phone-shot clip of their own paper + their own feedback screen. Offer nothing but the beta they already have. Expect 1–2 usable. **Unpolished beats polished here.** | 15–25s, 9:16 | Sep 30 |

Note the ordering: **C3 ships first (Aug 14) because it requires no filming at all** — the footage is already committed to the repo and unused. That is a free video asset sitting on disk.

### Block D — Carousel

| # | Asset | Cards | Deadline |
|---|---|---|---|
| D1 | **CA-01 "The loop"** → matched subject page | 1: *You do the problem on paper* · 2: *Photograph what you wrote* · 3: *It finds the exact step that broke* · 4: *You get practice for that one skill* · 5: CTA + offer | Aug 28 |
| D2 | **CA-02 parent version** → `/for-parents/ai-and-homework/` | Same structure, parent voice | Sep 23 |

Carousels are cheap to make from assets that already exist (each card is a crop of an existing static plus a caption) and they extend a static's life without new photography.

### Block E — Feature-led lane (gated on a dependency)

The expansion plan specifies `/features/constellations/`, `/features/quick-missions/`, `/features/handwritten-feedback/`, `/features/precise-feedback/`, `/features/recovery-missions/`, `/features/voice-input/`, `/features/text-input/`. **None of these pages exist.** Producing feature creative before the pages exist creates an ad with nowhere to land.

Two options, and the second is correct at this budget:

1. Build the 7 feature pages first (each is a `pages.json` entry + `npm run build:campaigns`).
2. **Point feature creative at existing pages that already carry the feature sections** — `/for-students/study-consistency/` for Quick Missions, `/for-students/college-study/` for Constellations, `/for-students/behind-in-math/` for Recovery Missions, `/study/math/` for handwritten feedback. Zero new pages required.

**Do option 2 for the 90-day plan.** Build only **two** feature pages, and only if R4/R5 shows the feature angle beating the subject angle:

| # | Task | Condition | Deadline |
|---|---|---|---|
| E1 | Add `/features/quick-missions/` and `/features/handwritten-feedback/` to `pages.json`, rebuild | Only if a feature-led ad beats a subject-led ad on cost/FormStart in R4 | Oct 7 |
| E2 | Feature statics: Constellations, Quick Missions, Recovery Missions, handwritten feedback | Copy in §7 F1–F4 | Sep 2 (statics), reuse for E1 pages |

### Block F — Post-beta assets (unlocked by C2)

| # | Asset | Deadline |
|---|---|---|
| F1 | Replace the "Join the beta waitlist" CTA framing with "Get your TestFlight invite" once invites are flowing — a `cta-config.js` change, propagates to all 43 pages | Aug 24 |
| F2 | Screenshot set from the *real shipped build* to replace mockups in creative | Sep 7 |
| F3 | First three real user-feedback screenshots (with permission) as social proof on the winning landing page | Sep 21 |
| F4 | App Store screenshots + Apple Search Ads creative, pre-built and waiting for listing approval | Oct 7 |

### Priority order if time collapses

If only five things get made: **A1–A4 (reformat) → C3 (free video from existing footage) → B1 (parent anti-cheating static) → B2 (behind-in-math static) → C1 (the whole-loop video).** Everything else can slip.

---

## 7. Ad copy — ready to paste

Voice rules, derived from `pages.json` and the blog: restrained, precise, declarative. Respects the learner's intelligence. Never hypey, never exclamatory, no emoji, no "unlock", no "revolutionary", no fake urgency. Em-dashes and short sentences. The product is described by what it *refuses* to do as often as by what it does. **Do not restate the offer in primary text** — it lives in `cta-config.js` and appears on the landing page and in the creative; restating it in copy creates drift.

Format: Primary text · Headline (≤ 40 chars where possible) · Description · CTA button · Destination.

---

### Parent angle

**P1 — Anti-cheating wedge, parent voice** *(highest priority; Block B1)*
> **Primary:** Most AI homework apps finish the assignment. Lune Synth waits until your child has written something down, reads the handwriting, and points at the one step where the reasoning broke. It does not give the answer. That is the entire design.
> **Headline:** AI that won't do the homework
> **Description:** Feedback on the work, not the answer
> **CTA:** Learn More → `/for-parents/ai-and-homework/`

**P2 — The nightly homework conflict**
> **Primary:** "I don't get it" is not enough information to help with. Your child photographs the page they already worked on. Lune Synth keeps what they got right, names the line that went wrong, and hands back one small problem aimed at that step. No reteaching the lesson at the kitchen table.
> **Headline:** Find the step, not the argument
> **Description:** Calmer homework, still theirs
> **CTA:** Sign Up → `/for-parents/homework-help/`

**P3 — Confidence / falling behind**
> **Primary:** A child can lose one step and conclude they are bad at math. Usually it is a sign, a carry, or a rule — not the whole subject. Lune Synth reads their handwritten attempt, narrows the problem down to something repairable, and builds a short practice set around exactly that.
> **Headline:** One step, not the whole subject
> **Description:** Rebuild the missing skill
> **CTA:** Learn More → `/for-parents/math-help/`

**P4 — Teenager, fall test season** *(run Sep 1 – Oct 20; note trademark caution below)*
> **Primary:** Your teenager can review answer explanations all fall and still make the same mistake in November. Lune Synth grades the actual attempt on paper, separates a concept gap from a rushed misread, and sends the next practice set at that exact skill. Fall test dates are already on the calendar.
> **Headline:** Practice that knows what they missed
> **Description:** For juniors and seniors testing this fall
> **CTA:** Sign Up → `/for-parents/high-school-math/`

**P5 — Homeschool**
> **Primary:** You already chose the curriculum. Lune Synth adds a feedback layer around the work your student is already doing on paper — reading the attempt, naming the gap, assigning the practice — without asking you to move anything onto another platform.
> **Headline:** Keep your curriculum. Add feedback.
> **Description:** For homeschool families
> **CTA:** Sign Up → `/for-families/homeschool/`

---

### Adult-learner angle

**A1 — Organic chemistry** *(R1 launch)*
> **Primary:** You can follow a mechanism perfectly and still not be able to push the arrows yourself. Draw it by hand, photograph it, and Lune Synth tells you which electron source you chose wrong — then gives you three more of exactly that. It never draws the product for you.
> **Headline:** Reason through the mechanism
> **Description:** Orgo practice built on your work
> **CTA:** Sign Up → `/study/organic-chemistry/`

**A2 — MCAT** *(R1 launch)*
> **Primary:** A wrong answer on a practice passage tells you almost nothing. Was it the content, the inference, or the clock? Work it out on paper, submit the page, and Lune Synth names the break in the chain and builds the next set around it.
> **Headline:** Diagnose the miss, not the score
> **Description:** Practice with visible reasoning
> **CTA:** Learn More → `/test-prep/mcat/`

**A3 — Nursing** *(R1 launch)*
> **Primary:** Choosing the right answer and being able to defend it are different skills, and only one of them survives a shift. Write the rationale out by hand. Lune Synth checks the reasoning behind the priority, not just the letter you circled.
> **Headline:** Practice the rationale
> **Description:** Clinical reasoning, written out
> **CTA:** Sign Up → `/study/nursing/`

**A4 — GED / adult returning** *(R1 launch)*
> **Primary:** You do not have to start school over. Most of what is blocking you is a handful of steps that stopped making sense years ago. Make one real attempt, get one correction you can act on, and practice that one thing. Ten minutes at a time.
> **Headline:** Start where it stopped making sense
> **Description:** One clear step at a time
> **CTA:** Sign Up → `/test-prep/ged/`

**A5 — LSAT**
> **Primary:** If you cannot say why the wrong answers are wrong, you got the question right by accident. Diagram the conditional on paper. Lune Synth reads the diagram and finds where the logical move actually failed.
> **Headline:** Make the logical move visible
> **Description:** LSAT logic, worked on paper
> **CTA:** Learn More → `/test-prep/lsat/`

**A6 — College STEM / calculus**
> **Primary:** The solution video makes sense while you are watching it and disappears the moment you close the tab. Do the problem on paper first. Lune Synth reads your steps, finds the first line that broke, and hands you a mission for that rule — not a finished answer.
> **Headline:** The video is not the practice
> **Description:** Feedback on your own work
> **CTA:** Learn More → `/study/calculus/`

---

### Anti-cheating wedge (broad / brand)

**W1 — The line**
> **Primary:** An answer is not feedback. Every other AI study tool will finish the problem for you, which is precisely why it does not work. Lune Synth waits until you have written something, reads the handwriting, and tells you the exact step where your reasoning changed direction.
> **Headline:** An answer is not feedback
> **Description:** The anti-slop learning app
> **CTA:** Learn More → `/study/math/`

**W2 — Self-aware student** *(Block B2)*
> **Primary:** You already know you can get the answer in four seconds. You also know what your last exam looked like. Lune Synth is built for the gap between those two facts: do the work by hand, find out precisely where it broke, practice that.
> **Headline:** You know the shortcut isn't working
> **Description:** Do the work. Get real feedback.
> **CTA:** Sign Up → `/for-students/behind-in-math/`

**W3 — Not bad at math**
> **Primary:** Falling behind rarely starts with the whole subject. It starts with one idea that did not land, and then every lesson after it depends on that idea. Lune Synth reads what you can already do, finds the earliest broken connection, and gives you something small enough to actually fix.
> **Headline:** There is a step you need to rebuild
> **Description:** Start where the confusion began
> **CTA:** Learn More → `/for-students/behind-in-math/`

---

### Feature-led

**F1 — Quick Missions**
> **Primary:** Most study sessions die during the planning. A Quick Mission is one problem, about five minutes, and a specific correction at the end — small enough that you will actually start it tonight.
> **Headline:** Five minutes. One real attempt.
> **Description:** Start before you feel ready
> **CTA:** Sign Up → `/for-students/study-consistency/`

**F2 — Constellations**
> **Primary:** "Study for the exam" is too large to begin. Lune Synth breaks a course into a visible path of missions, so the next step is always one specific skill instead of an entire syllabus.
> **Headline:** See the path to exam day
> **Description:** A syllabus you can walk
> **CTA:** Learn More → `/for-students/college-study/`

**F3 — Handwritten feedback**
> **Primary:** Keep the paper. Photograph what you wrote and Lune Synth reads the actual steps — the substitution, the sign, the diagram — and responds to the reasoning instead of scoring a final box.
> **Headline:** Keep the paper. Add the feedback.
> **Description:** It reads your handwriting
> **CTA:** Learn More → `/study/math/`

**F4 — Recovery Missions**
> **Primary:** One bad result should produce a target, not a spiral. When you miss, Lune Synth names the skill underneath the miss and builds a short recovery set for that skill only. Then you move on.
> **Headline:** A miss should create a target
> **Description:** Repair one skill, then continue
> **CTA:** Sign Up → `/for-students/behind-in-math/`

---

**Trademark caution.** SAT, ACT, PSAT/NMSQT, AP, IB, GRE, GMAT, LSAT, MCAT, USMLE, GED and NCLEX are third-party marks. The landing pages already carry the correct disclaimers (`disclaimer` field in `pages.json`). In **ad copy**, prefer generic phrasing in the headline ("college entrance exam math", "the nursing licensure exam") and keep the mark in the primary text where the nominative-fair-use context is clear. Meta occasionally rejects trademark-heavy headlines; having the generic variant pre-written prevents a two-day stall. Never imply endorsement or affiliation.

---

## 8. Landing page ↔ ad matching, and the CRO work

### 8.1 The matching rule

**The ad's headline promise must appear, in recognizable form, in the H1 or eyebrow of the destination page, above the fold, on a 390×844 viewport.** If a visitor has to scroll to confirm they are in the right place, the click is wasted. Test this manually on a real iPhone for every ad before it launches; it takes 30 seconds and prevents the most common cause of a good CTR with a dead conversion rate.

Matching is already mostly solved by construction: each of the 26 creatives was generated against a specific `pages.json` variant, and the generator emits `data-campaign-family/variant/audience` on `<html>`, which `analytics.js` reads. The failure mode is the **10 orphan pages** (§5.5) and the **six minor-facing creatives** (§5.3) that must be repointed:

| Creative | Current implied destination | Repoint to | Reason |
|---|---|---|---|
| `04-sat` | `/test-prep/sat/` | `/for-parents/high-school-math/` | Ad must run to parents; the SAT page is written in learner voice |
| `10-act` | `/test-prep/act/` | `/for-parents/high-school-math/` | Same |
| `11-ap-biology` | `/test-prep/ap-exams/` | `/for-parents/high-school-math/` | Same |
| `12-ib-math` | `/test-prep/ib-exams/` | `/for-parents/high-school-math/` | Same |
| `05-arithmetic` | `/study/arithmetic/` | `/for-parents/homework-help/` | Buyer is the parent of an elementary student |
| `02-history` | `/study/history/` | `/for-parents/ai-and-homework/` | The history creative's real hook is "before asking AI to write it" — that is the parent's fear, and the parent page says it better |

**Longer term the right fix is different:** add a `parent` variant of the four test-prep pages to `pages.json` (e.g. `/for-parents/sat-prep/`) so parent-targeted test-prep traffic lands on parent-voice copy about a test, rather than on generic high-school-math. That is four JSON entries and a rebuild. Deadline: **Sep 30**, gated on R3 showing the parent lane is viable.

### 8.2 Landing page problems to fix (ranked by expected conversion impact)

Observed by reading the generated template in `scripts/generate-lune-campaign-pages.js` and the shared components.

| # | Problem | Fix | Deadline |
|---|---|---|---|
| **1** | **Zero trust signal anywhere on the page.** No count, no testimonial, no founder identity, no "who built this." A stranger arriving from a cold ad is asked for an email by an unknown entity. This is almost certainly the largest single conversion leak. | Add one line beneath the CTA: the number of people on the waitlist once it is credible, or a founder line ("Built by Coherascent Labs. We do not sell your email."). Once beta users exist (C2), one real quote. | **Aug 14** |
| **2** | **No "what happens next."** The success popup says invites will come "as soon as they are ready." With the beta shipping in 1–2 weeks (C2), that is now a concrete, compelling promise and it is being wasted. | Change `cta-config.js` `successMessage` to state the actual timeline: "TestFlight invites go out in batches starting this month. You'll get an email from griffin@lunesynth.com." One file, propagates to all 43 pages. | **Aug 10** |
| **3** | **Google Fonts stylesheet is render-blocking** (`fonts.googleapis.com` `<link rel="stylesheet">` in the head of every generated page). On a 4G phone this delays first paint by 300–600ms, which shows up directly as a low LP-view rate in Ads Manager. | Self-host Plus Jakarta Sans + Roboto Mono as woff2, or add `media="print" onload="this.media='all'"` async pattern with a `<noscript>` fallback. | **Aug 12** |
| **4** | **No sticky mobile CTA.** The hero CTA scrolls away and the next one is at the page bottom, past five sections. | Add a sticky bottom bar on viewports < 768px that appears after the hero CTA scrolls out: one line of offer + "Join" button that scrolls to `#join-beta`. Ship it as an A/B test (§8.3). | Aug 21 |
| **5** | **The anti-cheating guarantee is not above the fold on subject pages.** It is the sharpest differentiator the brand has and on most `/study/*` pages it appears only in the problem section. | Add an optional `heroGuarantee` field to `pages.json`, rendered as one line under `heroBody`: "Lune Synth never gives you the finished answer." | Aug 19 |
| **6** | **`fbclid` and UTMs pollute the canonical URL** in the address bar and in any shared link. | Strip tracking params from the visible URL with `history.replaceState` in `analytics.js` **after** attribution has been captured to `localStorage`. Canonical tags are already correct. | Aug 14 |
| **7** | **No exit-intent or scroll-triggered re-ask on desktop.** | Low priority at this budget — desktop is a minority of Meta traffic. Skip in the 90 days. | — |
| **8** | **`api/waitlist.js` returns a generic error string to the user on any Resend failure.** A stranger who typed their email and saw "Something went wrong" does not come back. | The §1.3 rewrite already fixes this by always returning 200 once the DB row is written; Resend failure becomes a background retry, not a user-visible error. | Aug 5 |

### 8.3 A/B testing on the landing pages, with no A/B framework

There is no experiment framework and building one is not worth the founder's hours. Build the **minimum viable version inside `analytics.js`**, ~15 lines:

```js
/* deterministic 50/50 bucketing, sticky per visitor */
var v = localStorage.getItem('lune_ab');
if (!v) { v = Math.random() < 0.5 ? 'control' : 'variant'; localStorage.setItem('lune_ab', v); }
window.LUNE_AB_VARIANT = v;
document.documentElement.dataset.abVariant = v;   // CSS can key off [data-ab-variant="variant"]
```

`LUNE_ATTRIBUTION()` already includes `lp_variant`, `waitlist_signups` already has an `lp_variant` column, and the Pixel/GA4 events already carry it. So the read-out is a single SQL group-by. CSS-only variants (show/hide the sticky bar, swap a headline) need no JS beyond this.

**Test queue — one at a time, minimum 250 LP views and 20 conversions per arm (≈ 2–3 weeks each at this traffic). Run these only on the single highest-traffic winning page, never across the whole site.**

| Order | Test | Hypothesis | Window |
|---|---|---|---|
| 1 | Sticky mobile CTA bar vs. none | +15–30% CVR; the highest-confidence win available | Aug 21 – Sep 10 |
| 2 | `successMessage` timeline promise vs. vague (already shipped as a fix — validate) | Reduces the "why did I do that" regret that suppresses forwarding | Sep 10 – Sep 30 |
| 3 | Submit label: "Join Waitlist" vs. "Get my invite" | With the beta shipping, "invite" is now literally true and more concrete | Sep 30 – Oct 20 |
| 4 | Post-submit one-tap segment chip in the success popup (Student / Parent / Teacher) | Adds the missing segmentation for nurture **without** touching pre-submit friction. Writes to `waitlist_signups.role`. | Oct 20 – Nov 10 |

Test 4 deserves emphasis: it solves the "no role/segment data" gap identified in the brief **at zero conversion cost**, because it happens *after* the email is already captured. Never put a segment question before the email field.

**Do not run:** multivariate tests, headline tests across multiple pages simultaneously, or anything requiring more than 4 weeks to reach significance. At this traffic volume they will not conclude.

---

## 9. Secondary channels, ranked

Ranking criterion: **expected leads per dollar *and* per founder-hour**, given C1 (no money) and C3 (much time).

### Rank 1 — Google Search. Open Sep 7. $6–9/day.

The highest-efficiency paid channel available, and it is under-exploited by an enormous margin: **43 landing pages already exist, each written against a specific intent, each with correct meta titles and canonical tags.** The infrastructure cost of entering this channel is zero. Meta interrupts people; Google answers them — and a person typing "app that grades handwritten math" is worth ten scrollers.

**Structure (deliberately tiny — three campaigns is already too many at $9/day):**

- **Campaign 1 — `LS_search_exact`** — $6/day, Manual CPC with Enhanced CPC (not Maximize Conversions; that needs 30 conversions/month to function). Exact and phrase match only. Broad match at this budget is a donation to Google.
- **Campaign 2 — `LS_dsa`** — $3/day, Dynamic Search Ads targeting `/study/` and `/test-prep/` page feeds. **This is the real reason to be on Google:** it discovers which of the 43 pages have actual query demand, for $3/day, without you guessing keywords. Treat it as market research that occasionally converts.

**Keyword themes for Campaign 1** (start with ~40 exact keywords across these, not 400):

| Theme | Example keywords |
|---|---|
| Category, high intent | `app that checks my math work`, `app that grades handwritten math`, `ai that shows where i went wrong` |
| Competitor-adjacent | `photomath alternative`, `alternative to chegg`, `better than gauth` |
| Anti-cheating intent (the wedge, and nobody is bidding here) | `how to stop using ai for homework`, `ai homework help that doesnt give answers`, `how to actually learn math instead of copying` |
| Parent | `how to help my child with math homework`, `is my kid using ai to cheat`, `math help for kids without giving answers` |
| High-ticket verticals | `organic chemistry help app`, `nclex practice questions app`, `mcat study app`, `ged math practice` |

**Negative keyword list — this is not optional given the counter-positioning.** Add as campaign-level negatives on day one: `answers`, `answer key`, `solver`, `solution manual`, `free answers`, `cheat`, `cheating`, `hack`, `chegg answers`, `course hero unlock`, `pdf`, `torrent`, `crack`, `jobs`, `salary`, `worksheet printable`. Without these, half the budget goes to people who want exactly the thing the product refuses to do — and they will bounce.

**Conversion import:** link GA4 → Google Ads, mark `waitlist_success` as a key event, import it as a conversion. GA4 is already installed per §1.1, so this is a 10-minute task.

### Rank 2 — Meta retargeting. Opens Sep 7. $2/day. (Covered in §3.5.)

Lowest CPL in the account, structurally. It is listed second only because it depends on prospecting traffic existing first.

### Rank 3 — Reddit: **organic, not ads.** $0. 5 hrs/week of founder time.

The recommendation is to **not buy Reddit ads in the 90 days**, and this is a C3 judgment rather than a channel judgment. Reddit's education CPMs are cheap but its CTR is poor and its conversion intent is weak; $15/day there buys perhaps 3–4 leads. The same $15/day of founder *time* — genuinely participating in r/premed, r/MCAT, r/nursing, r/StudentNurse, r/OrganicChemistry, r/GetStudying, r/GED, r/LSAT, r/homeschool, r/Professors — is worth far more, because these communities have a real and articulate grievance about AI destroying student reasoning, which is Lune Synth's exact thesis.

Rules that make this work rather than get you banned: participate for weeks before mentioning the product; answer study questions with actual help; disclose founder status every single time; never post the same text twice; never use an alt account. r/Professors and r/Teachers in particular are full of people who will evangelize an anti-cheating study tool for free if it is presented honestly.

**Revisit Reddit ads only at G2** (§4.4), and then only Conversation Placement against the specific subreddits that produced organic traction.

### Rank 4 — YouTube. Open only after V-01 and V-02 exist (Aug 26+). $0 in the 90 days; ~$5/day at G1.

Cheapest video reach in advertising, and Shorts inventory is materially underpriced. But it requires video that does not exist yet, and Google Ads' video campaigns need more daily budget than $9/day to leave learning. **Correct action in the 90 days: post V-01 through V-05 to YouTube Shorts organically** (zero cost, C3-aligned), build custom segments from the §9 Rank-1 keyword list so the audience is ready, and buy nothing until G1.

### Rank 5 — TikTok ads. **Do not run in the 90 days.**

Three independent reasons: (a) the under-18 restrictions are *stricter* than Meta's and the platform's education audience skews heavily toward the exact demographic you cannot target or bill; (b) it demands a high-volume native video cadence the founder cannot sustain alongside everything else; (c) its pixel and CAPI would be a fourth tracking integration for the least promising audience. **Organic TikTok is different and worth 2 hrs/week** — post the same V-01…V-05 assets; the anti-cheating angle is inherently controversial and controversy is the platform's currency.

### Rank 6 — Apple Search Ads. **Blocked, then Rank 1.**

Cannot run without a live App Store listing. The moment the listing is approved, ASA becomes the single highest-intent, lowest-CAC channel available to this product — someone searching "math homework help" in the App Store has already decided to install something. **Pre-work to do now, at zero cost:** draft the keyword list (reuse §9 Rank 1), write the App Store title and subtitle to include "handwriting" and "practice", and prepare screenshots (Block F4, due Oct 7). Budget $10/day from ASA the week the listing goes live, taken out of Meta, not added.

### Explicitly not doing, with reasons

| Channel | Why not |
|---|---|
| X/Twitter ads | Ad platform quality has degraded; education targeting is poor; audience mismatch |
| LinkedIn ads | $8–14 CPC; correct for B2B school sales, wrong for consumer learners |
| Pinterest | Real homeschool audience, but conversion path is long and it needs a content library you do not have |
| Snapchat | Audience is majority under-18 — see §2 |
| Influencer/creator paid placements | $500–2,000 per placement is 1–2 months of total budget for one unmeasurable shot |
| Podcast ads | Minimum buys exceed the quarterly budget |

---

## 10. Week-by-week execution calendar

Dates are Monday-start weeks. **W0 is a partial week (Aug 3–9) containing all blocking tracking work plus a 3-day smoke test.**

| Week | Dates | Paid state | Meta spend | Ships / deadlines | Decision gate at week end |
|---|---|---|---|---|---|
| **W0** | **Aug 3–9** | Build + smoke test Aug 7–9 | $75 | FB Page + IG + BM + Pixel + GA4 (Aug 3) · `analytics.js` (Aug 4) · `cta.js` `event_id` edit (Aug 4) · Postgres + `api/waitlist.js` rewrite (Aug 5) · domain verification + AEM order (Aug 5) · privacy policy update (Aug 5) · **Block A reformat, all 26 creatives (Aug 5–6)** | **GO/NO-GO:** ≥3 deduped `Lead` events in Ads Manager reconciling to 3 `waitlist_signups` rows with `fb_ad_id` populated. If no, do not proceed. |
| **W1** | **Aug 10–16** | **R1 launches.** 1 ad set `broad_us_18-54`, optimize `WaitlistFormStart`, $20/day. Ads: 06-mcat, 17-orgo, 24-ged, 26-nursing | $140 | `cta-config.js` `successMessage` → real invite timeline (Aug 10) · **B1 parent anti-cheating static (Aug 12)** · **B2 behind-in-math static (Aug 12)** · self-host fonts (Aug 12) · **C3 free video from existing repo footage (Aug 14)** · trust line under CTA (Aug 14) · strip tracking params from URL (Aug 14) · TestFlight build expected | Do **not** judge creative. Only check: is delivery normal, CPM < $30, LP view rate > 65%? |
| **W2** | **Aug 17–23** | R1 continues, untouched | $140 | B3, B4 statics (Aug 19) · `heroGuarantee` field + rebuild (Aug 19) · **C1 "the whole loop" video shot & cut (Aug 19)** · sticky mobile CTA + A/B test 1 live (Aug 21) · first TestFlight invite cohort by source (Aug 17) | **R1 VERDICT.** Each ad now has ~$70. Kill the bottom 2 on cost/FormStart. Record the winner. |
| **W3** | **Aug 24–30** | **R2 launches** — hook test. 4 ads, all on the R1-winning niche/frame: anti-cheating wedge · get-unstuck · precise-feedback · exam urgency | $140 | B5, B6 statics (Aug 26) · **C2 "an answer is not feedback" video (Aug 26)** · D1 carousel (Aug 28) · CAPI `CompleteRegistration` from app activation live (Aug 24) · AEM slot 8 filled (Aug 24) · `cta-config` → "Get your TestFlight invite" (Aug 24) | Mid-round check only. No changes unless an ad is red on CTR at ≥$40. |
| **W4** | **Aug 31–Sep 6** | R2 continues | $120 | B7 homeschool, B8 Quick Missions statics (Sep 2) · E2 feature statics (Sep 2) · **Google Ads account + conversion import built, not yet spending (Sep 4)** | **R2 VERDICT.** Winning hook declared on outbound CTR + cost/FormStart. This is the message that everything else inherits. |
| **W5** | **Sep 7–13** | **R3 launches.** Second ad set `parents_us_35-55` ($6/day) with parent-voice creative; `broad_us_18-54` drops to $12/day; **retargeting opens $2/day**. **Google Search opens $6/day.** | $140 | B9, B10 statics (Sep 9) · real-build screenshots replace mockups (Sep 7) · Meta iOS SDK installed, not optimized on (Sep 7) · Google `LS_search_exact` + `LS_dsa` live (Sep 7) | Check parent ad set is delivering at all. A $6/day ad set against a behavioral audience can under-deliver; if impressions < 3,000/wk, widen age band. |
| **W6** | **Sep 14–20** | R3 continues | $140 | C4 parent-voice video (Sep 16) · first 3 real user-feedback screenshots as social proof (Sep 21) · **Lead-quality readout: what % of each source's invites installed TestFlight** | **R3 VERDICT.** Parent lane vs. broad lane on cost/FormStart. Also: first honest lead-quality number. |
| **W7** | **Sep 21–27** | **R4 launches** — format test on the winning hook+audience: 4:5 static vs. 9:16 video (C1) vs. carousel (D1) | $140 | D2 parent carousel (Sep 23) · A/B test 2 concludes | Check hook rate on video ≥ 20%. If video hook rate < 12%, the edit is wrong, not the format. |
| **W8** | **Sep 28–Oct 4** | R4 continues | $140 | **Switch optimizer `WaitlistFormStart` → `Lead` if and only if the §3.2 gate is met** (≥120 total Leads and ≥45/wk) · parent test-prep pages added to `pages.json` if R3 was positive (Sep 30) · C5 beta-user UGC collected (Sep 30) | **R4 VERDICT.** Winning format. Also the first real 30-day blended CPL number. |
| **W9** | **Oct 5–11** | **R5 launches** — landing-page test. Same winning ad, 3 destinations: matched subject page vs. `/for-students/behind-in-math/` vs. `/for-parents/ai-and-homework/`. Meta $17/day, Google $9/day. | $119 | E1 build `/features/quick-missions/` + `/features/handwritten-feedback/` **only if** feature angle beat subject angle in R4 (Oct 7) · **F4 App Store screenshots + ASA keyword list pre-built (Oct 7)** | Check LP view → Lead CVR per destination. Needs 250 LP views/arm; if not reached, extend into W10. |
| **W10** | **Oct 12–18** | R5 continues | $119 | A/B test 3 (submit label) live · organic YouTube Shorts + TikTok posting of V-01…V-05 begins | **R5 VERDICT.** Winning destination page. |
| **W11** | **Oct 19–25** | **R6 launches** — concentration. Kill everything that lost. Full prospecting budget behind one audience × one creative × one page. A/B the CTA clarifier text only. | $119 | A/B test 4 (post-submit segment chip) built · Google Search negative-keyword audit from 6 weeks of search-terms report | Watch frequency; a single creative at full budget fatigues faster. Refresh at freq > 3.0. |
| **W12** | **Oct 26–Nov 1** | R6 continues. **90-day readout.** | $119 | **Write the G1 decision memo**: 30-day blended CPL, TestFlight invite acceptance rate by source, cost per activated user, and the explicit recommendation — raise to $50/day, hold at $20/day, or move the entire budget to founder time | **G1 GATE (§4.4).** CPL ≤ $6 **and** ≥25% invite acceptance → raise to $50/day in November. Otherwise hold or exit. |

### Season-timing notes for the calendar

[ASSUMPTION — verify against official 2026 calendars before committing spend to these dates] Fall 2026 test dates that make the parent lane time-sensitive: SAT administrations in late Aug, mid-Sep, early Oct, and early Nov; ACT in mid-Sep and late Oct; PSAT/NMSQT in mid-Oct. **Copy P4 should run Sep 1 – Oct 20 and be paused after the October test window**, because "fall test dates are already on the calendar" stops being true in November and the ad's urgency collapses.

Back-to-school itself (Aug 3–Sep 7) favors the **parent** lane and the **behind-in-math** angle. The adult-learner lane (GED, nursing, MCAT, orgo) is essentially non-seasonal except for the September term start, which lifts orgo and nursing specifically in W5–W8.

### The three numbers this whole document exists to produce

By Nov 1, 2026, this program should be able to state, with first-party evidence:

1. **Which single message works** — one hook, proven on outbound CTR across ~$500 of spend against strangers.
2. **Which single audience is cheapest to reach** — parents, or adult learners, with a cost-per-form-start number attached.
3. **Whether a paid-acquired lead becomes an activated user** — the TestFlight invite acceptance rate and first-mission-completion rate, segmented by acquisition source.

Nothing else in this document matters as much as those three. If the budget has to be cut further, cut scope until only these three questions are still being answered.
