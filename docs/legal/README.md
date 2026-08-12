<!-- markdownlint-disable MD013 -->

# Lune Synth legal documents — status & finalization checklist

_Last updated: 2026-06-06._

## Update Log

### 2026-08-10

- Removed the `TODO(legal)` comments and all hedged/uncertain phrasing from both
  documents ("current architecture may use…" → "we use…", "access should be
  logged" → "is logged", and so on). Substance unchanged.
- Moved the draft banner and `noindex` behind a `DRAFT` flag in
  `scripts/build-legal-pages.js`. The build now **refuses** to publish
  (`DRAFT = false`) while any `[[TOKEN]]` remains, so the pages cannot ship with
  visible placeholders.
- Confirmed these pages are **not** unlinked: `campaign/site-footer.js` injects
  Privacy/Terms site-wide and every blog page hardcodes them. The root README
  claim to the contrary was stale and has been corrected.
- Operator resolved: **Tano Holdings LLC, d/b/a Coherascent Labs** (single
  entity; Coherascent Labs is a brand, not a separate registration). Filing
  expected week of 2026-08-10.

### 2026-06-06

- Added the entity, contact, governing-law, venue, arbitration, DMCA, and
  hosting checklist required before the legal drafts are published.

Files in this folder:

- `privacy-policy.md`
- `terms-of-service.md`
- `delete-account.md` — ported from the app repo's
  `docs/store-assets/account-deletion-page.md`; that file remains the origin of
  the copy, so keep the two in sync if either changes

## Status: FINAL PENDING TOKENS — not yet publishable

- The **substantive** content was audited against actual product behavior: data
  collected, AI processing via the OpenAI API, Supabase + Railway
  infrastructure, raw voice audio not written to a durable account record, no
  location/contacts/biometric collection, and no analytics/crash SDK in the
  build. Those sections do **not** depend on the entity and are stable.
- **Operator details remain incomplete.** The five `[[…]]` tokens below are
  still unresolved and render literally on the built pages. Do not deploy
  `/privacy/` or `/terms/` until they are replaced.
- **The website publication trigger has fired.** The deployed Lune Synth
  waitlist collects email addresses, so finalization is overdue.

## Beta cohort (TestFlight + Play closed testing)

Both documents are scoped to the closed beta as written. Phase-specific facts
now baked in, and what invalidates each:

| Documented as | Where | Invalidated by |
| --- | --- | --- |
| Product analytics are first-party; fixed ~31-event allowlist to our own API and Postgres | Privacy §2, §3, §6 | Adding **any** third-party analytics/attribution SDK |
| No third-party crash SDK; crash data comes from TestFlight / Play Console | Privacy §3, §6 | **Adding Sentry — currently under consideration.** Needs a processor row in §6, a source line in §3, and a Play Data safety update |
| Beta cohort is free; IAP may be enabled mid-beta | Terms §13 | Nothing — worded to cover the flip. Confirm §6 offer terms are live before charging |
| In-app deletion for **account holders**; guests convert to an account in place (data carries over) and then delete, or uninstall | Privacy §11, Terms §15, `/delete-account` | Shipping without in-app deletion (breaks Apple 5.1.1(v)); changing guest upgrade so it no longer preserves identity (`guestAccountUpgrade.ts` enforces id equality) |
| Voice audio is never stored — transcribed and discarded in-request | Privacy §8, `/delete-account` | Any audio path in the API performing an insert, storage upload, or file write |
| Beta builds via TestFlight / Play tracks, subject to Apple's and Google's terms | Terms §5 | Changing distribution channel |

### BLOCKER: apex mail is misconfigured

`lunesynth.com` publishes **both** a CNAME (`gpilo7pa.up.railway.app.`) and an
MX (`smtp.google.com`) at the apex. RFC 1034 §3.6.2 forbids any other record
coexisting with a CNAME, so resolvers that follow the CNAME never see the MX and
mail to `@lunesynth.com` can silently disappear for some senders.

This is not only a `support@` problem. **Every published contact address is
affected, including the `griffin@lunesynth.com` already printed throughout the
Privacy Policy and Terms.** A privacy policy whose contact address drops mail is
a compliance failure, not just a failed reviewer test — a deletion or
access request that never arrives is still a request you were obligated to
answer.

Fix before publishing any of these pages. The usual remedy is to drop the apex
CNAME and use A/ALIAS/ANAME records (Railway supports this), keeping MX intact.
Verify with `dig lunesynth.com CNAME` returning empty and `dig lunesynth.com MX`
returning the Google host, then send a live test to the published address.

**Also decide which address is canonical.** `/delete-account` uses
`support@lunesynth.com`; the Privacy Policy and Terms use
`griffin@lunesynth.com`. Two different addresses across legal surfaces is a
defect regardless of DNS.

### Contact addresses — verified 2026-08-12

Resend delivery logs settled which published addresses actually work:

| Address | Result |
| --- | --- |
| `griffin@lunesynth.com` | **delivered** — apex mail works inbound despite the CNAME/MX conflict |
| `support@lunesynth.com` | **permanent bounce** — no mailbox exists |

`/delete-account` originally published `support@`. Switched to `griffin@`
because a deletion contact that bounces is worse than an imperfect one, and
Google exercises that address during Play review.

**If you create `support@` later** (a Google Workspace alias onto `griffin@` is
enough), revert `docs/legal/delete-account.md` to it and rebuild — it is the
better long-term address. Until then it must not appear in published copy.

This also downgrades the apex-DNS item below: the CNAME/MX coexistence is still
invalid per RFC 1034, but it is demonstrably not blocking inbound mail.

### Store submission checklist

- **`/delete-account` now exists in this repo** (`docs/legal/delete-account.md`
  → `lune-synth/delete-account/index.html`), draft-gated like the other two.
  Google requires this URL reachable **without installing** the app. Privacy §11
  deliberately does **not** link it yet — add the link only once it is live.
  Consider whether it also belongs in `campaign/site-footer.js`.
- **Apple privacy nutrition labels: drafted** at
  `docs/store-assets/apple-privacy-nutrition-labels.md`. Answers every App
  Privacy question with the Privacy Policy section it derives from. Three items
  flagged there need confirmation against the running code before submission:
  coarse location (do we derive region from IP, or only log it?), in-app search
  history (is any query captured in the event allowlist?), and the timing of the
  Purchases declaration.
- **Play Data safety: already drafted correctly**, in the app repo at
  `docs/2026-08-02-play-console-submission-package.md` (declares App activity →
  App interactions: Collected, citing `analytics_events`). The draft is right;
  only the console form is unfilled. Do not "fix" the draft.
- **External TestFlight** (beyond internal testers) goes through Beta App Review
  and needs a reachable privacy-policy URL. Internal testing does not, so an
  internal cohort can start before these pages are final.
- Google OAuth can stay in Testing mode for a closed cohort (100-user cap).
  Flipping to Production requires both URLs live on the verified `lunesynth.com`
  domain — see the publish triggers below.
- Keep the account-deletion menu path **out** of the published policy. It is
  Settings → Delete Account today, but naming it means the policy goes stale on
  the first nav change. Put the exact path on `/delete-account`, which is
  trivially updatable.

## Publish triggers (first one to fire forces a live Privacy Policy)

1. A public **waitlist/landing page** that collects emails.
2. **App Store / Play Store submission** (both require a privacy-policy URL).
3. Flipping **Google OAuth from Testing → Production** (needs both URLs on the
   verified domain `lunesynth.com`).

Until one of these fires, the recommended path is to leave these as drafts and
treat **"form the operating entity"** as the gating milestone.

## To finalize (entity version): replace these tokens everywhere they appear

Then set `DRAFT = false` in `scripts/build-legal-pages.js` and re-run
`npm run build:legal`. The build blocks if any token is left.

| Token | Value |
| --- | --- |
| `[[LEGAL ENTITY NAME]]` | `Tano Holdings LLC` — confirm exact spelling against the filed articles |
| `[[MAILING ADDRESS]]` | Principal / registered-agent address |
| `[[PHONE NUMBER]]` | Business phone (Google Voice is fine) |
| `[[GOVERNING-LAW STATE]]` | The entity's state of formation / principal place of business — **do not** default from current physical location; confirm with counsel |
| `[[VENUE]]` | County + state |

Also update the **operator-identification line in Section 1** of each document,
not just the contact block — that line is the legally load-bearing place for the
entity name. It currently reads "Coherascent Labs, a Tano Holdings company,"
which names no registered entity. It must become **"Tano Holdings LLC, doing
business as Coherascent Labs."**

Keep the effective date in sync with the actual publish date. It currently reads
June 6, 2026. Run `npm run build:legal` after any source change.

## Deferred decisions (intentionally omitted; revisit with counsel)

- **Arbitration / class-action waiver** — omitted for the closed beta. Silence
  here is a deliberate choice, not an oversight.
- **DMCA §512 safe harbor** — needs a designated agent registered with the U.S.
  Copyright Office, not just policy text; low urgency for private coursework
  uploads.

## Interim option — entity formation does NOT block publishing

**Do not treat the LLC filing as being on the critical path for a beta cohort.**
A reachable privacy-policy URL is blocked by a decision plus five values, not by
a company formation. If a publish trigger fires first, publish an
**individual-operator** variant instead of waiting or guessing an entity name.
Four of the five tokens (address, phone, governing-law state, venue) are
identical under either path, so the work is not wasted:

- Operator = "**[Your Full Legal Name], an individual doing business as
  'Coherascent Labs'**". An individual is a valid contracting party; a
  nonexistent LLC is not.
- Governing law = **your home state of residence** (the honest default for an
  individual operator now).
- Real contact: a public-facing mailing address (a **PO box** is the usual
  move), phone, and the `griffin@lunesynth.com` address.
- Add a transition sentence (operated by an individual; will transfer to a newly
  formed affiliated entity; continued use after the posted update constitutes
  acceptance). The existing Assignment + Changes sections make that valid.
- All substantive sections stay identical.
- **Caveat:** this protects you as a person, not via an LLC shield — fine for a
  tiny invite-only beta with no payments; form the entity before opening sign-ups
  broadly or taking money.

## Hosting / publish mechanics

- Render both to public HTTPS pages: `https://lunesynth.com/privacy` and
  `https://lunesynth.com/terms`.
- Swap the repo-relative ToS → Privacy link (`privacy-policy.md`) for the public
  `/privacy` URL at web-build time (left relative in the source so the repo link
  keeps working).
- Apple: `terms-of-service.md` §12 references Apple's Standard EULA by URL, so no
  custom Apple rider is required.

> Not legal advice. The individual-vs-entity choice, governing-law selection, and
> the arbitration/DMCA decisions are worth a brief review with counsel before
> these documents are relied upon.
