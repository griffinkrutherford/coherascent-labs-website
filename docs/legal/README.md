<!-- markdownlint-disable MD013 -->

# Lune Synth legal documents — status & finalization checklist

_Last updated: 2026-06-06._

## Update Log

### 2026-06-06

- Added the entity, contact, governing-law, venue, arbitration, DMCA, and
  hosting checklist required before the legal drafts are published.

Files in this folder:

- `privacy-policy.md`
- `terms-of-service.md`

## Status: DRAFT — not published

- The **substantive** content is drafted and was audited against actual product
  behavior: data collected, AI processing via the OpenAI API, Supabase + Railway
  infrastructure, raw voice audio not written to a durable account record, no
  location/contacts/biometric collection, and no analytics/crash SDK in the
  build. Those sections do **not** depend on the entity and are considered
  stable.
- **Operator details remain incomplete.** The exact registered operator name
  still needs to replace the unresolved legal-entity token before release.
- **The website publication trigger has fired.** The deployed Lune Synth
  waitlist collects email addresses. The documents therefore need to be
  finalized promptly, but they must not be published with unresolved entity,
  contact, governing-law, or venue details.

## Publish triggers (first one to fire forces a live Privacy Policy)

1. A public **waitlist/landing page** that collects emails.
2. **App Store / Play Store submission** (both require a privacy-policy URL).
3. Flipping **Google OAuth from Testing → Production** (needs both URLs on the
   verified domain `lunesynth.com`).

Until one of these fires, the recommended path is to leave these as drafts and
treat **"form the operating entity"** as the gating milestone.

## To finalize (entity version): replace these tokens everywhere they appear

| Token | Value |
| --- | --- |
| `[[LEGAL ENTITY NAME]]` | Exact registered name on the filed articles |
| `[[MAILING ADDRESS]]` | Principal / registered-agent address |
| `[[PHONE NUMBER]]` | Business phone (Google Voice is fine) |
| `[[GOVERNING-LAW STATE]]` | The entity's state of formation / principal place of business — **do not** default from current physical location; confirm with counsel |
| `[[VENUE]]` | County + state |

Also update the **operator-identification line in Section 1** of each document
(marked `TODO(legal)`), not just the contact block — that line is the legally
load-bearing place for the entity name.

Keep the effective date in sync with the actual publish date, and **remove the
DRAFT banner** comment from each file when publishing.

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
