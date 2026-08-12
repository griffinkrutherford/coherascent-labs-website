<!-- markdownlint-disable MD013 -->

# Apple App Privacy ("nutrition labels") — Lune Synth

_Drafted 2026-08-12. Derived from `docs/legal/privacy-policy.md` §3–§7._

This is the answer key for the **App Privacy** questionnaire in App Store
Connect (*App Store → App Privacy → Edit*). Apple requires the declaration to
match your published Privacy Policy; §3 of ours is unusually detailed, so the
easy failure here is **under-declaring**, not over-declaring.

Play's equivalent is already drafted in the app repo at
`docs/2026-08-02-play-console-submission-package.md`. This is the Apple side,
which had no draft anywhere.

## The three answers Apple wants per data type

1. **Collected?** — does it leave the device to you or a service provider
2. **Linked to the user?** — tied to identity/account (for us: almost always yes)
3. **Used for tracking?** — cross-app/site linkage for ads or data brokers

> **Tracking is "No" for every single item below.** Privacy Policy §7: we do not
> sell personal information, do not share for cross-context behavioural
> advertising, and use no third-party ad networks. That answer is what keeps
> Lune Synth out of App Tracking Transparency — so if an attribution or ad SDK
> is ever added, this whole section must be revisited **before** that build
> ships.

## Declare as COLLECTED

| Apple category | Data type | Linked | Purposes | Source in policy |
| --- | --- | --- | --- | --- |
| Contact Info | Email Address | Yes | App Functionality | §3 waitlist + account |
| Contact Info | Name | Yes | App Functionality | §3 account (name, username) |
| User Content | Photos or Videos | Yes | App Functionality | §3 photos/scans of handwritten work |
| User Content | Audio Data | Yes | App Functionality | §3 voice recording sent for transcription |
| User Content | Customer Support | Yes | App Functionality | §3 messages, bug reports, grading disputes |
| User Content | Other User Content | Yes | App Functionality, Product Personalization | §3 typed answers, prompts, notes, course documents, syllabi |
| Identifiers | User ID | Yes | App Functionality | §3 authentication identifiers, account identifiers |
| Identifiers | Device ID | Yes | App Functionality, Analytics | §3 cookie/local-storage or similar identifiers |
| Usage Data | Product Interaction | Yes | Analytics, App Functionality, Product Personalization | §3 screens viewed, feature interactions, first-party event stream |
| Diagnostics | Crash Data | Yes | App Functionality | §3 crash logs; TestFlight/Play Console return these |
| Diagnostics | Performance Data | Yes | App Functionality | §3 processing status, response time |
| Diagnostics | Other Diagnostic Data | Yes | App Functionality | §3 auth/network/request/security logs, error information |
| Purchases | Purchase History | Yes | App Functionality | §3 subscription tier, purchase status, renewal date |

### Notes on the non-obvious ones

**Usage Data → Product Interaction is the one people get wrong.** Our analytics
are first-party — a fixed ~31-event allowlist to our own API and Postgres, no
third-party SDK. Being the controller does **not** exempt it. Apple asks what
you collect, not who processes it. Declare it, purpose **Analytics**.

**User Content → Other User Content** carries the heart of the product:
handwritten work, typed answers, course materials. Purpose includes **Product
Personalization** because §4 uses it to generate study paths, missions and
recommendations — not only to run the feature the user invoked.

**Audio Data is collected even though it is not retained.** Retention §8 says
raw voice audio is never written to a durable account record. Apple's question
is about *collection*, not storage — it leaves the device, so it is collected.

**Purchases** applies once IAP is live. Terms §13 currently says the beta is
free. Declare it if the reviewed build contains any purchase capability, even
unused, since a reviewer can see the entitlement.

## Declare as NOT COLLECTED

| Apple category | Why |
| --- | --- |
| Contacts | §3: "We do not collect … address-book contacts" |
| Health & Fitness | Not collected in any form |
| Financial Info | §3: payment processors handle complete card details; we see only tier/status metadata, declared under Purchases |
| Location → Precise | §3: "We do not collect precise geolocation" |
| Sensitive Info | Not solicited; §3 explicitly asks users **not** to submit it — see risk note below |
| Browsing History | No web-browsing history collected |
| Other Data | Nothing that does not fit above |

## Three judgement calls — confirm before submitting

These are genuinely ambiguous. I have taken the conservative position in each
case, but they need someone with the running code to confirm.

**1. Location → Coarse Location: I recommend declaring it.**
§3 says we collect "IP address and approximate region derived from it". An IP
alone is arguably just an identifier, but *deriving region* from it is what
Apple means by coarse location. Declaring costs nothing (purpose: App
Functionality, for fraud prevention and security); omitting it while the policy
openly describes region derivation is the kind of mismatch reviewers catch.
**Confirm:** does the app or API actually derive/store region, or only log the
raw IP?

**2. Search History: probably collected — confirm.**
The app has in-app search (e.g. "Search constellations"). Apple's *Search
History* means searches performed **inside the app**. If those queries reach our
analytics events or server logs, declare it (Linked: Yes, purpose: App
Functionality, Analytics). **Confirm against the ~31-event allowlist:** is any
search query captured?

**3. Sensitive Info: declared as not collected, with a caveat.**
We do not solicit it and §3 tells users not to upload it, but a photo of
handwritten work could contain anything. Apple's question is about what you
*collect by design*, so "No" is correct. The mitigation is the existing warning
in §3 — keep it there.

## Consistency checks before you submit

- [ ] Every "Collected" row above has a matching disclosure in Privacy Policy §3
- [ ] Tracking = **No** everywhere, and no attribution/ad SDK is in the build
- [ ] Privacy Policy URL in App Store Connect resolves and is **not** the draft
      version — currently gated by `DRAFT` in `scripts/build-legal-pages.js`
- [ ] Account deletion is reachable in-app (Apple 5.1.1(v)) — Privacy §11
- [ ] Apple's answers do not contradict the Play Data safety form in the app repo
- [ ] If Sentry is added, revisit: it introduces a third-party processor for
      Diagnostics and changes both stores' answers

## What forces a re-review of this document

- Any third-party analytics, attribution, crash or advertising SDK
- Enabling IAP (Purchases moves from theoretical to actual)
- Collecting phone numbers (Contact Info → Phone Number; also needs a §3 update)
- Launching the school/organization deployment, which adds education records
- Any change that makes an answer to "used for tracking" anything but No
