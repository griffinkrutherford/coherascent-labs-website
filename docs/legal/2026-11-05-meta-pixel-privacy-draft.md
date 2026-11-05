<!-- markdownlint-disable MD013 -->

# DRAFT: Privacy Policy changes for Meta Pixel / Conversions API

**Status: draft for owner + lawyer review. Not published. Not wired into
the live site. Describes code that exists but is dormant (no `META_PIXEL_ID`
set in production as of this writing).**

## Why this is a separate draft, not a live edit

`docs/legal/privacy-policy.md` / `lune-synth/privacy/index.html` currently
state, as affirmative commitments:

> Product analytics are first-party. We do not use a third-party analytics,
> attribution, or advertising SDK.

> We do not disclose personal information to a third-party analytics,
> attribution, crash-reporting, or advertising provider. Product analytics
> are collected and stored by us, as described in Section 3.

> We do not sell personal information for money. We do not share personal
> information for cross-context behavioral advertising, and we do not use
> third-party ad networks in the controlled beta.

Turning on the Meta Pixel/CAPI infrastructure built in
`docs/2026-11-05-ad-tracking-setup.md` makes these sentences false the
moment `META_PIXEL_ID` is set in production. This draft is written so a
lawyer can revise the specific sentences above (not just add a new section)
before that env var is ever set. **Do not set `META_PIXEL_ID` in
production until this revision has actually happened on the live page.**

## Sentences in `privacy-policy.md` that need revision

1. Section 2, "Key Commitments": the "We do not use a third-party
   analytics, attribution, or advertising SDK" bullet needs qualification
   (e.g., "...except an opt-in advertising Pixel described in Section X,
   which only runs after you accept it").
2. Section 3, the paragraph beginning "Product analytics are first-party.
   The app emits a fixed, predefined set of product events...": this is
   about in-app product analytics specifically (screen views, missions,
   etc.), which remains entirely true and first-party -- the Pixel is a
   website-only, opt-in, separate system. Worth an explicit sentence
   distinguishing the two so a reader does not read the Pixel disclosure
   below as contradicting this paragraph.
3. Section on third-party disclosure ("We do not disclose personal
   information to a third-party analytics, attribution, crash-reporting,
   or advertising provider..."): needs a carve-out for the Pixel/CAPI,
   scoped to only the hashed email + event metadata actually sent, only
   after consent.
4. The "no third-party ad networks in the controlled beta" sentence: needs
   either removal, scoping to "beyond an opt-in Meta Pixel described in
   Section X," or a decision from the owner that this should stay true and
   the Pixel should launch somewhere other than "the controlled beta" is
   describing.

## Proposed new section (draft language, not final)

> ### Advertising Pixel and Conversions API (opt-in)
>
> On lunesynth.com (not in the mobile app), we may use the Meta Pixel and
> Meta Conversions API to measure whether our ads led to a waitlist
> signup. This is off by default. A banner asks for your consent before
> anything loads; declining or ignoring the banner means nothing is sent to
> Meta. If you accept:
>
> - A small Meta script loads in your browser and may set cookies used by
>   Meta to connect your visit to an ad you saw or clicked.
> - If you join the waitlist, we send Meta a one-way, irreversibly hashed
>   version of your email address (never the address itself), your IP
>   address, browser user-agent, the page you signed up from, and which ad
>   campaign (if any) brought you here. We do not send your name, your
>   platform answer, or anything else you provide.
> - You can withdraw consent at any time via the "Privacy choices" link in
>   the site footer, which stops any further Pixel activity for future
>   visits in that browser. It does not retroactively delete an event
>   already sent to Meta; for that, use Meta's own ad-preferences controls
>   or contact us at griffin@lunesynth.com.
> - [OWNER/LAWYER TO CONFIRM]: data retention, Meta's role as an
>   independent controller for data it receives, and whether this needs its
>   own "Do Not Sell/Share" mechanism beyond GPC/DNT under applicable state
>   law (the code already treats GPC/DNT as an automatic decline; confirm
>   that satisfies the legal requirement, not just the technical one).

## Opt-out, as actually implemented in code (for the lawyer to verify against)

- `navigator.globalPrivacyControl` or any Do Not Track signal is treated as
  an automatic decline -- no banner shown, nothing loads, consent recorded
  as `denied`. See `hasPrivacySignal()` in
  `lune-synth/campaign/ad-tracking.js`.
- The footer's "Privacy choices" button (`site-footer.js`) reopens the
  banner at any time so a visitor who accepted can later decline.
- Declining, or never accepting, means `window.LuneAdTracking` either never
  loads the Pixel or reports a non-`granted` consent status, and
  `api/waitlist.js` checks that same status server-side before ever calling
  Meta's Conversions API -- consent is enforced in two places, not just the
  banner's UI.

## COPPA / under-13

This draft does not resolve whether firing Pixel/CAPI events from the
waitlist form is acceptable given the product's existing under-13 posture
(Section 9 of the current policy). The code does not distinguish a child's
visit from an adult's -- the banner and Pixel behave identically for every
visitor. **Flagging this explicitly, as the task required: get an
owner/lawyer decision on this before `META_PIXEL_ID` is set in
production**, not just a decision on the wording above.

## Next steps

1. Owner + lawyer review this draft and the four flagged sentences above.
2. Land the revised `privacy-policy.md` / `lune-synth/privacy/index.html`
   as its own change, with its own effective-date bump, before
   `META_PIXEL_ID` is ever set in production.
3. Delete or archive this draft file once its content has been incorporated
   into the real policy.
