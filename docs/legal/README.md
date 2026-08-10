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

## Interim option (only if a publish trigger fires before the LLC exists)

Publish an **individual-operator** variant instead of guessing an entity name:

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
