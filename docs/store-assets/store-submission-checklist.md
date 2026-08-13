<!-- markdownlint-disable MD013 -->

# Store submission checklist — closed beta

_Drafted 2026-08-13. Covers App Store Connect (TestFlight external testing) and
Play Console (closed testing). Assumes the four public URLs below are live._

## URLs to paste (all live as of 2026-08-13)

| Field | URL |
| --- | --- |
| Privacy policy | `https://lunesynth.com/privacy/` |
| Terms of service | `https://lunesynth.com/terms/` |
| Support | `https://lunesynth.com/support/` |
| Account deletion | `https://lunesynth.com/delete-account/` |
| Support email | `griffin@lunesynth.com` |

---

## Two things that cause most first-submission rejections

### 1. Demo account

**Both stores require working credentials if the app has a sign-in wall**, and
reviewers do not create their own. Apple rejects under 2.1 for this constantly;
Play blocks it in *App access*.

Create a dedicated review account, seed it with a little content so the app is
not empty, and never delete it. Note it here once it exists:

- Email: _(fill in)_
- Password: _(fill in)_

If any part of the app works without signing in, say so explicitly in the notes
— it shortens review.

### 2. "Pre-K through PhD" versus a 13+ age gate

Terms §3 sets the account floor at **13**, and Privacy §9 says under-13 is not
supported in the beta. But the landing page markets "from the Pre-K through the
PhD level".

Play's *Target audience and content* questionnaire asks who the app appeals to,
and it weighs store listing and marketing, not just the age gate. Declaring 13+
while the listing implies young children invites a mismatch finding — and being
pulled into the **Families policy** brings much stricter requirements.

**Decide before filling the form:** either keep the listing copy strictly 13+
in tone, or accept Families-policy obligations. Terms §2 already contains the
disclaimer that the phrase describes subject range rather than supported ages;
mirror that framing in the store listing.

---

## Apple — App Store Connect

**App record**

- [ ] App created: bundle ID, name, SKU, primary language
- [ ] *App Information* → Privacy Policy URL
- [ ] *App Information* → Support URL (required; reviewers open it)

**App Privacy** — answers are in
`docs/store-assets/apple-privacy-nutrition-labels.md`

- [ ] Declare each collected type with Linked = Yes
- [ ] **Tracking = No everywhere** (this is what keeps you out of ATT)
- [ ] Confirm the three flagged items first: coarse location from IP, in-app
      search history, and whether the build has IAP capability
- [ ] Answers must not contradict Privacy §3

**Account deletion — guideline 5.1.1(v)**

- [ ] In-app deletion reachable, not email-only. It exists; confirm the path
      still matches what `/support/` and `/delete-account/` describe

**TestFlight**

- [ ] Upload a build (Xcode or EAS)
- [ ] Export compliance answered (usually "uses standard encryption only")
- [ ] **Internal testing** — up to 100 App Store Connect users, **no review**.
      Start here; it needs none of the above finalised
- [ ] **External testing** — create a group, then *Beta App Review*:
  - [ ] What to test (be specific; vague notes slow review)
  - [ ] Beta App Description
  - [ ] Demo account credentials
  - [ ] Contact email
- [ ] Public link enabled → **this is the `--testflight-url` for the access email**

---

## Google — Play Console

**App content** (the long one; every section must be green to publish)

- [ ] Privacy policy URL
- [ ] **App access** — demo credentials, or declare no restricted content
- [ ] Ads — declare **no ads** (consistent with Privacy §7)
- [ ] Content ratings questionnaire → IARC rating
- [ ] **Target audience and content** — see the Pre-K note above
- [ ] **Data safety** — answers drafted in the app repo at
      `docs/2026-08-02-play-console-submission-package.md`. Must match Privacy §3
- [ ] Data deletion → point at `https://lunesynth.com/delete-account/`
- [ ] Advertising ID — declare **not used**
- [ ] Government / financial / health features — no

**Store listing**

- [ ] Title, short description, full description
- [ ] Icon, feature graphic, phone screenshots
- [ ] Support email `griffin@lunesynth.com`

**Closed testing**

- [ ] Create a closed testing track
- [ ] Add testers by email list or Google Group — **these must be the Google
      account addresses collected as `google_account`**, not signup emails
- [ ] Upload AAB
- [ ] Copy the opt-in URL → **this is the `--play-url` for the access email**

**The 12 × 14 rule**

New **personal** developer accounts must run closed testing with at least 12
testers opted in continuously for 14 days before production access. Organisation
accounts are exempt.

- [ ] Decide account type **before** creating it — hard to change later. If the
      LLC is filed tomorrow, registering as an organisation may avoid this
      entirely

---

## Order I would do it in

1. **Internal TestFlight now** — needs no review and no forms. Gets a build into
   your own hands today
2. Confirm the three flagged Apple items against the code
3. Fill Apple App Privacy, then Play App content
4. Resolve the Pre-K / 13+ listing question before submitting either
5. External TestFlight review + Play closed testing track
6. Collect opt-in URLs, add a postal address, then send the access email

## Still outstanding elsewhere

- **Postal address** — required by CAN-SPAM for the access email, which names
  the offer. `sendAccessEmail` refuses without it. Not needed for either store
- **Operator swap** when the LLC files — see `docs/legal/README.md`
- **Support page claims** — the password-reset flow and *Send Feedback* wording
  were written from description, not from the code. Verify before a reviewer does
