<!-- markdownlint-disable MD013 -->

# SMS and messaging outreach — plan and gating

_Drafted 2026-08-12. Not legal advice; the consent language and TCPA posture
below are worth a short review with counsel before any outbound program starts._

## Summary

**Do not build outbound SMS yet.** It is gated on the LLC (10DLC registration
needs an EIN), carries per-message statutory damages if consent is wrong, and is
heavy machinery for a 31-person beta.

**Do use inbound messaging now.** A published number people can text, plus an
opt-in group link, gets most of the benefit at zero cost and zero regulatory
exposure. Both belong in the **access** email, not the waitlist backfill.

## The four tiers, ranked by cost

| Tier | What it is | Regulatory burden | Status |
| --- | --- | --- | --- |
| **0. Personal P2P** | You text people you actually know, individually, from your own phone | **None** — not an automated system | Do now |
| **1. Inbound** | Publish a number, invite people to text you | **None** — the recipient initiates | Do now |
| **2. Opt-in group** | WhatsApp/Discord invite link in an email | **None** — joining is the opt-in | Do now |
| **3. Outbound A2P** | A tool sends SMS to collected numbers on your behalf | TCPA consent + A2P 10DLC + carrier fees | Blocked; revisit later |

The gap between tier 2 and tier 3 is enormous, and at beta scale tiers 0–2
deliver nearly the same practical result: fast two-way contact with testers.

## Tier 0: personally texting people you know

**This is fine, and it is the highest-converting thing available right now.**

TCPA and 10DLC are aimed at *application-to-person* messaging: automated
systems, dialers, and platforms sending on your behalf. Typing a message on your
own phone and sending it to one person you have an actual relationship with is
person-to-person communication. It is not an automated telephone dialing system,
there is no campaign to register, and no consent form is required to text a
friend, classmate or colleague.

Several addresses on the current waitlist are clearly people in your orbit
(`mines.edu`, family addresses, personal contacts). Texting them individually
will out-convert every email in this repo, by a wide margin.

### Where the line actually is

| Fine | Not fine |
| --- | --- |
| Your phone, your thumbs, one person at a time | Any tool that sends on your behalf |
| Genuinely different messages per person | One message merge-fielded across a list |
| People you know | Numbers you obtained from the signup form |
| "Hey, you signed up for my thing — Android or iPhone?" | Anything that reads as a campaign |

The moment a **tool** does the sending — even with personalisation tokens, even
in small batches — it is A2P and every requirement in tier 3 applies. The
distinction is not how personal the text *reads*; it is whether a system sent it.

Equally: do not pull numbers from the waitlist form to text strangers. Tier 0
covers people whose numbers you already have because you know them.

### How to make these count

- Say who you are and reference the signup, so it is not a cold ping
- Ask the same one-word question the email asks (Android or iPhone), so the
  answer flows into the same `platform` property
- Ask what they were hoping the product would do — the reason to text someone
  you know is a conversation, not a data-collection exercise
- Log the answers into Resend yourself, or just reply to your own copy of the
  email so the record lands in one place
- Do not send the same wording to everyone; if it would work as a broadcast,
  send it as one

Realistically this covers maybe five to ten people. Do those by hand, and let
the email handle the rest.

## Why tier 3 is blocked right now

**A2P 10DLC registration requires an EIN.** Any provider sending
application-to-person SMS to US numbers (Twilio, MessageBird, Telnyx…) must
register the brand and campaign with The Campaign Registry. Brand registration
requires a legal entity and EIN. That is the same Tano Holdings LLC filing
blocking the legal pages, so this unblocks itself when that does.

Unregistered traffic is filtered or blocked outright by carriers, so there is no
"just send it anyway" path.

**TCPA exposure is per message, not per campaign.** Marketing SMS to a mobile
number requires *prior express written consent*: a clear disclosure at the point
of collection, affirmatively agreed to, and retained as a record. Statutory
damages run **$500–$1,500 per message**, and the plaintiff bar is active. Thirty
recipients is enough to matter.

**Our users can be 13+.** Terms §3 sets the floor at 13 for direct accounts.
Texting minors adds sensitivity beyond the baseline analysis.

## What to do now

### Publish a number for inbound only

A Google Voice number is free and takes about five minutes. Put it in the
**access** email, phrased so it is unambiguously inbound:

> Text me at (xxx) xxx-xxxx if anything's broken. Fastest way to reach me.

Do **not** phrase it as "send us your number" — that starts collecting, which
starts the consent question.

### Opt-in group link

A WhatsApp or Discord invite link in the access email. Joining is the opt-in, so
there is nothing to document. Useful for beta feedback specifically, because
testers see each other's reports and stop filing duplicates.

Keep the group link out of the waitlist backfill — that email asks for exactly
one thing, and a second call to action reduces the reply rate on the first.

### Do not add either to the backfill email

The backfill is deliberately a relationship message with one ask. Adding
channels dilutes it and, if a promotional framing creeps in, reintroduces the
CAN-SPAM physical-address requirement we removed to unblock the send.

## When tier 3 becomes worth it

Revisit when **all** of these are true:

- [ ] Tano Holdings LLC is filed and has an EIN
- [ ] More than a few hundred users, so per-message tooling pays for itself
- [ ] Someone has reviewed the consent language
- [ ] A real reason SMS beats email — invite expiry, session-critical alerts,
      time-boxed cohort windows

If the only argument is "email lands in Promotions," that is not sufficient.
Replies fix Primary placement permanently and cost nothing.

## Implementation checklist for when it is time

**Collection**

- [ ] Phone field is **optional** at signup, never required
- [ ] Unticked checkbox beside it with explicit consent language, for example:
      *"Text me about my Lune Synth beta invite. Message and data rates may
      apply. Reply STOP to opt out."*
- [ ] Store **what** they consented to, **when**, and **from which page** — the
      consent record is the defence, not the number itself
- [ ] Never pre-tick, never bundle with the terms acceptance

**Registration**

- [ ] Brand registration with The Campaign Registry (needs EIN)
- [ ] Campaign registration, use case declared accurately
- [ ] Expect a few days and a modest one-time plus monthly fee

**Sending**

- [ ] Honour STOP / UNSUBSCRIBE / CANCEL immediately and permanently
- [ ] Include sender identity in the first message
- [ ] Respect quiet hours (before 8am / after 9pm recipient local time)
- [ ] Suppression list shared across every channel, so an email unsubscribe
      does not leave someone still receiving texts

**Documents that must change first**

- [ ] **Privacy Policy §3** — add phone number to "Information You Provide";
      it is not currently listed, so collecting one contradicts the policy
- [ ] **Privacy Policy §6** — add the SMS provider as a recipient
- [ ] **Apple nutrition labels** — Contact Info → Phone Number becomes
      Collected (see `docs/store-assets/apple-privacy-nutrition-labels.md`)
- [ ] **Play Data safety** — same addition, in the app repo package

## Note on comparables

Another startup visibly using phone numbers for waitlist retention tells you
little on its own. They may have an entity, counsel, and 10DLC already done, or
they may be quietly non-compliant. Neither is visible from outside, and the
downside is asymmetric: SMS done right is a modest gain, SMS done wrong is
per-message statutory damages.
