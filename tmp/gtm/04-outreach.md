# 04 — Outreach: the primary growth channel

Owner: Griffin Rutherford (solo, 20–40 hrs/week). Window: Aug 3 – Oct 25, 2026 (weeks 1–12).

**This document is the engine, not a supporting section.** Paid media is capped at
~$30/day, which buys visibility, not customers. Outreach is where the first thousand
real users come from, and the founder has the one resource that outreach consumes:
hours. Every recommendation below prefers an hour over a dollar.

### The three constraints that shape everything

1. **A working build exists in days, not quarters.** Apple developer account is
   processing; a TestFlight build is expected **Aug 10–17, 2026**. Every message in this
   document is written on that basis. "I can put this on your phone this week" is a
   fundamentally different ask than "join the waitlist," and it arrives in the exact week
   American schools start. Nothing in the calendar matters more than compressing the gap
   between a positive reply and an installed app.
2. **Paid budget is ~$900/month total.** Tooling recommendations carry an actual price
   and a $0 manual alternative. The default is manual.
3. **Time is abundant, money is not.** Hand-researched emails, DMs, phone calls, and
   walking into tutoring centers with the app on a phone are not fallbacks — they are the
   correct strategy at this stage, and they convert 3–8× better than automation.

### Targets

| # | Target | Date | Number |
|---|---|---|---|
| T1 | **Founding Cohort** (deep design partners, biweekly calls) | Fri Oct 16, 2026 | **30** |
| T2 | **Charter Educators** (light-touch partners, async feedback) | Fri Oct 23, 2026 | **120** |
| T3 | **Installed TestFlight testers** | Fri Oct 23, 2026 | **1,500** |
| T4 | Students reachable through partners | Fri Oct 23, 2026 | **≥900** |
| T5 | Published case studies | Fri Oct 23, 2026 | **4** |
| T6 | Earned media placement or op-ed | Fri Oct 23, 2026 | **1** |

**Standing rule:** never promise a feature that is not in the build the person can
install today. The credibility of the anti-cheating position depends on us being the
one company in this category that does not overstate.

---

## 0. Decisions to confirm before Week 1 sending

| # | Decision | Recommendation | Status |
|---|---|---|---|
| D1 | Founding Cohort compensation | **Free lifetime Pro** (public offer is 2 months free + lifetime 50% off) | **[ASSUMPTION]** — founder approval required; the program's leverage depends on it |
| D2 | Minimum tester age | **13+ / grade 9+** until a COPPA parental-consent flow exists | **[ASSUMPTION]** |
| D3 | Cold email sends from a separate domain, never lunesynth.com, never Resend | Yes — §4.3 | Recommended |
| D4 | `cta-config.js` gains an `app` mode with the TestFlight URL | Required the day the build lands; owned by the site workstream | **Blocked — critical path** |
| D5 | `/api/waitlist` accepts a `ref` / `source` field | Required for referral + channel attribution | Blocked (workaround: TestFlight groups, §2.3 and §3.5) |
| D6 | Cold email geography | **US only.** No EU/UK (GDPR) or Canada (CASL) | Recommended |
| D7 | Founder weekly hours committed to outreach | **32 hrs/week**, time-blocked (§9) | **[ASSUMPTION]** — midpoint of the stated 20–40 |
| D8 | Monthly outreach tooling spend | **$150/mo recommended; $0 path documented** | Founder approval |

---

## 1. ICP definition and prioritization

### 1.1 Scoring method

Each segment scored 1–5 on three axes; Priority = R × V × W.

- **R — Reach:** can I find a named human and a working address, free, today?
- **V — Volume:** how many students sit behind one converted contact?
- **W — Willingness:** will they install a TestFlight build this month, with no
  procurement process?

Willingness is the axis that kills edtech GTM plans. A district with 40,000 students
scores V=5 and W=1, and 5 × 1 is still a wasted autumn. **A shipped build raises W for
every segment by roughly one point** — that is the whole difference this month makes.

### 1.2 The ranking

| Rank | Segment | R | V | W | Score | Verdict |
|---|---|---|---|---|---|---|
| 1 | Homeschool co-op leaders + homeschool curriculum reviewers | 4 | 4 | 5 | **80** | Attack now |
| 2 | Independent tutors + 1–10 person tutoring businesses | 5 | 3 | 5 | **75** | Attack now |
| 3 | **Local tutoring/test-prep centers reachable in person** | 5 | 4 | 4 | **80** | Attack now — highest conversion per hour |
| 4 | Individual HS math/science teachers (AP/honors/dept heads *as individuals*) | 4 | 4 | 4 | **64** | Attack now |
| 5 | Independent + small regional test-prep operators | 4 | 4 | 4 | **64** | Attack now |
| 6 | Math/science educator creators, IG/TikTok/YouTube, 5k–250k | 4 | 5 | 3 | **60** | Attack now (DM motion) |
| 7 | Edtech newsletter writers + podcasters | 4 | 5 | 3 | **60** | Attack now (distribution, not users) |
| 8 | Adult self-studiers: MCAT/LSAT/USMLE/GMAT/GED | 5 | 1 | 5 | **25** | Community motion, never 1:1 |
| 9 | College learning centers / academic support / TRIO | 3 | 4 | 3 | **36** | Seed Sept, close January |
| 10 | Education researchers (productive struggle, desirable difficulties) | 4 | 2 | 3 | **24** | Credibility, capped at 12 sends |
| 11 | Nursing + pre-health program advisors | 3 | 4 | 2 | **24** | Seed only |
| 12 | National tutoring / test-prep franchise HQs | 2 | 5 | 1 | **10** | **Trap** |
| 13 | School districts, curriculum directors, CTOs | 2 | 5 | 1 | **10** | **Trap** |
| 14 | State education agencies / ESSA-evidence buyers | 1 | 5 | 1 | **5** | **Trap** |

### 1.3 Segment detail

Format: **why they care → what they get → the ask → where they live → honest caveat.**

---

**1. Homeschool co-op leaders and curriculum reviewers**

The most underrated segment in education GTM. No procurement, no IT department, no
device policy. One co-op leader speaks to 20–200 families, and the community's stated
pedagogy — mastery, work on paper, resistance to screen-first learning — *is already our
thesis*. They read "The classroom does not need another screen" and nod.

- **Why they care:** a homeschool parent teaches math they last did in 1998. The failure
  mode is "I can't tell whether she understood it or copied it off a screen." A
  diagnostic that reads the handwritten page is the missing teacher, and it does not
  put another device between the child and the work.
- **What they get:** free lifetime Pro, TestFlight access this week, seats for their
  co-op families, and an early-access walkthrough they can run as co-op programming.
- **The ask:** install it, use it with your own kids for two weeks, then bring five
  families in; one co-op announcement; 20 minutes with me every other week.
- **Landing page to send:** `lunesynth.com/for-families/homeschool/`
- **Where they live:** HSLDA state group lists, TheHomeSchoolMom co-op directory,
  Classical Conversations regional directories, state homeschool association sites,
  Well-Trained Mind forums, Cathy Duffy Reviews, Rainbow Resource Center community,
  Great Homeschool Conventions and Teach Them Diligently speaker/exhibitor lists, and the
  orbit around Math-U-See (Demme), Saxon, Teaching Textbooks, Mr. D Math, Beast Academy.
- **Honest caveat:** allergic to marketing language and to anything that smells like Big
  Tech in the schoolhouse. Lead with what the product refuses to do. Never use the word
  "solution."

**2. Independent tutors and small tutoring businesses (1–10 tutors)**

A tutor is a business owner who can say yes in one conversation, has 8–25 students, and
is paid to care about exactly what the product does: locating where reasoning broke.

- **Why they care:** their competitive threat is a free chatbot that parents mistake for
  a tutor. A tool that refuses to answer is an argument *for* their value. Second: they
  burn unbillable hours diagnosing between sessions.
- **What they get:** free lifetime Pro, the build today, and 10 seats to hand their own
  students — a retention gift that costs them nothing.
- **The ask:** 3 students, 4 weeks, 20 minutes biweekly.
- **Landing pages:** `/for-parents/math-help/`, `/for-students/behind-in-math/`
- **Where they live:** Wyzant, Preply, Superprof, Tutors.com, Varsity Tutors public
  profiles; Google Maps "math tutor {city}"; r/tutor; tutor Facebook groups; local
  Nextdoor recommendations.
- **Honest caveat:** franchisees of Kumon, Mathnasium, Sylvan, Huntington, Eye Level and
  Best in Class are contractually restricted to HQ curriculum. Approach the **owner as an
  individual educator** — most run private clients on the side — never as the center.

**3. Local tutoring and test-prep centers, reached in person**

Separated out because the channel changes the economics entirely. Walking into a
tutoring center at 3:30pm with the app open on a phone converts at roughly 25–35%,
versus 2% for a cold email. It costs two hours and zero dollars, and it is only
available because the founder has hours to spend and a build to show.

- **Why they care:** identical to #2, but a live demo removes every objection an email
  cannot.
- **What they get:** the same, plus you install it on their phone before you leave.
- **The ask:** "Can I show you ninety seconds of this? If it's useless, say so and I'll
  go." Then install it before leaving.
- **Where they live:** every strip mall. Google Maps, filtered to "tutoring", "learning
  center", "test prep", within 30 minutes' drive. **[ASSUMPTION: founder is in a metro
  with ≥60 such businesses within 45 minutes. If not, this becomes a scheduled-call
  motion using the same script.]**
- **Honest caveat:** go 3:00–6:00pm on Tue/Wed/Thu. Never a Monday, never during the
  first ten minutes of a session block. Ask for the owner or the center director by role,
  not by name you looked up — it reads as surveillance.

**4. Individual high-school math and science teachers**

Teachers *as individuals*, not schools as accounts. A teacher can try something with one
class period without asking anyone. A school cannot.

- **Why they care:** August 2026 is the third back-to-school of the ChatGPT era and they
  have lost trust in take-home work. They want evidence of thinking. A photographed
  handwritten page is evidence of thinking.
- **What they get:** free lifetime Pro, seats for students, co-design credit, and first
  access to the teacher view the cohort will define.
- **The ask:** one section, four weeks, two 20-minute calls.
- **Landing pages:** `/for-parents/high-school-math/`, `/study/algebra/`,
  `/study/calculus/`, `/study/chemistry/`, plus `/test-prep/ap-exams/`
- **Where they live:** NCTM and NSTA state affiliates, AP teacher Facebook groups
  ("AP Calculus Teachers", "AP Biology Teachers"), #MTBoS on X and Bluesky,
  r/matheducation, r/ScienceTeachers, public school department staff directories,
  state and regional math conference programs.
- **Honest caveat:** a department head is not automatically better than a classroom
  teacher pre-launch — the title adds procurement, not speed. Take the head only if they
  also teach. And September is the worst month of their year; offer January explicitly as
  an acceptable answer and you will get a real yes instead of silence.

**5. Independent and small regional test-prep operators**

Applerouth, Marks Education, Compass Education Group, Summit Educational Group,
ArborBridge, Method Test Prep, Testive, and hundreds of single-city SAT/ACT shops.
Owner-operated, seasonally busy in Aug–Oct, selling outcomes.

- **Why they care:** their entire product is diagnostics plus targeted practice. Their
  students are doing timed practice *right now* and reviewing it badly.
- **What they get:** free Pro across tutor staff, input on the test-prep Worlds, seats
  for families.
- **Landing pages:** `/test-prep/sat/`, `/test-prep/act/`, `/test-prep/psat/`
- **The ask:** 5 students, 4 weeks, biweekly feedback.

**6. Math and science educator creators (5k–250k)**

One post from a 60k-follower math teacher outperforms a week of cold email, and the DM
is open and free. Now that a build exists, the ask is no longer "believe me" — it is
"here's the link, break it."

- **Why they care:** their content *is* the anti-shortcut argument. We are the product
  version of what they already say.
- **What they get:** access before anyone, a named advisory role, an affiliate
  arrangement at public launch, and — for the top tier — a co-designed mission set
  carrying their name.
- **The ask:** install it, tell me what's wrong, and *only if it earns it*, one post.
- **Named targets to research first:** Howie Hua, Eddie Woo, Vanessa Vakharia (Math
  Therapy), Christina Tondevold (Build Math Minds), Sarah Carter (Math = Love), Robert
  Kaplinsky, Jennifer Gonzalez (Cult of Pedagogy). The 5k–50k long tail converts far
  better than the famous ones and should be 80% of the volume.
- **Honest caveat:** do not pay for a post before the public App Store launch. Paid
  creator spend against a TestFlight link wastes the audience.

**7. Edtech newsletter writers and podcasters** — treated as media, §8.

**8. Adult self-studiers (MCAT, LSAT, USMLE, GMAT, GED)**

High intent, high spend, extremely online, and **adults** — no FERPA/COPPA surface at
all, which makes them the safest population to grow fast in. But one contact equals one
student, so never run 1:1 outreach. Run the community motion (§7) and let them
self-select through the existing `/test-prep/` pages and `/for-students/adult-learners/`.
Communities: r/Mcat, r/LSAT, r/step1, r/GMAT, r/GED, 7Sage forums, UWorld and Blueprint
user communities, Study Together Discord.

**9. College learning centers, academic support offices, TRIO/SSS**

Real budget, real volume (a mid-size university tutoring center touches 3,000
students/year), publicly listed staff with .edu addresses — R is decent. But fall is
their busiest month, purchasing runs on a spring cycle, and TRIO funds are federally
restricted. **Seed now, close in January.** The September ask is not a pilot; it is a
20-minute call and a booked follow-up for the week of Jan 11, 2027. Directories: IPEDS
institution exports, NCLCA and CRLA member institution pages, university "academic
support" staff pages, AMATYC for community colleges.
**Landing page:** `/for-students/college-study/`

**10. Education researchers**

Manu Kapur (productive failure), Robert and Elizabeth Bjork (desirable difficulties),
Jeffrey Karpicke, Henry Roediger III, Michelene Chi, Ken Koedinger, Pooja Agarwal,
Daniel Willingham, Rebecca Winthrop. Zero distribution value. Enormous credibility
value, and the only outreach that makes Coherascent's research pillar legible. The ask
is never a pilot: "here is the design constraint we adopted; tell me where we're wrong."
Many will answer because almost nobody in edtech asks them anything before building.
**Cap at 12 sends. Do not scale this.**

**11. Nursing and pre-health advisors** — high volume, but gatekeepers with liability
instincts and accreditation calendars. 25 emails in October to open the relationship;
expect nothing before spring. Landing pages: `/study/nursing/`,
`/study/anatomy-physiology/`, `/test-prep/usmle/`, `/test-prep/mcat/`.

### 1.4 The traps, stated plainly

- **National franchise HQs** (Kumon, Sylvan, Mathnasium, Huntington, Kaplan, The
  Princeton Review, C2 Education, Russian School of Mathematics). Multi-quarter
  evaluations, legal review, and a curriculum team whose job is to protect the existing
  curriculum. Cost: 20 hours for "let's revisit next year." **Do not pursue before the
  public App Store launch and 4 case studies.** Exception: individual franchisee owners.
- **School districts and curriculum directors.** 6–18 month cycles, RFPs, student data
  privacy agreements, ESSA evidence tiers we cannot satisfy, and a purchase calendar that
  closed in spring 2026. A district pilot this fall is a decoy that eats the quarter.
- **State education agencies.** Not a 2026 conversation.
- **Anyone who requires student roster data to say yes.** Pre-launch we have no DPA, no
  FERPA school-official designation, and no COPPA consent flow. Disqualified until legal
  exists.

---

## 2. TestFlight: turning a reply into an installed app

This section is operationally the most important in the document. Every hour of outreach
is wasted at the moment a willing person cannot get the app onto their phone in under
three minutes.

### 2.1 Mechanics and limits

| Item | Reality | Consequence for outreach |
|---|---|---|
| **Internal testers** | Up to 100, must be App Store Connect users, **no Beta App Review**, builds available in minutes | Use for the founder, advisors, and the first 5–10 design partners while review is pending |
| **External testers** | Up to **10,000**, requires **Beta App Review** for the first build of each new version number | The real capacity. 10,000 is 6× our 1,500 target — capacity is not the constraint |
| **Beta App Review** | Typically 24–48 hours for the first build of a version; subsequent builds of the same version usually skip it **[ASSUMPTION — verify on first submission]** | Submit the first build the day the account clears. Do not batch outreach behind it |
| **Public link** | `testflight.apple.com/join/XXXXXXXX` — anyone with the URL joins, no email needed, no manual approval | The default distribution mechanism. Put it in DMs, Reddit comments (where allowed), and the site |
| **Email invite** | Per-address, sent from App Store Connect | Use for Founding Cohort only — it tells you exactly who installed |
| **Tester groups** | Multiple groups allowed, **each with its own public link** | **Use groups as free channel attribution.** See 2.3 |
| **Build expiry** | 90 days | A build shipped Aug 14 dies Nov 12. Ship a new build at least every 6 weeks or the cohort silently goes dark |
| **OS requirement** | Recent iOS **[ASSUMPTION: iOS 16+]** | Ask on the call. An older iPad in a tutoring center is a real failure mode |
| **Android** | No TestFlight. Google Play closed testing on a new personal developer account requires 12 testers for 14 continuous days before production access **[ASSUMPTION — verify account type]** | **iOS-only for weeks 1–12.** Say so plainly in outreach; do not let an Android user think a build is coming and then go quiet |

### 2.2 The install experience, honestly

A non-technical teacher or parent must do four things: install the **TestFlight** app
from the App Store, tap our link, tap **Accept**, tap **Install**. Roughly 90 seconds on
good wifi. Two things reliably go wrong:

1. **They don't know what TestFlight is** and stop, because installing a second unknown
   app feels like a trick. Pre-empt it in one sentence, every time: *"TestFlight is
   Apple's own app for testing apps before release — it's from Apple, not from us."*
2. **They see "expires in 90 days"** and assume the product is temporary. Pre-empt it:
   *"The 90-day note is just how Apple versions test builds; I'll push you a fresh one
   before it lapses."*

**Founder rule: install it *with* them.** On a walk-in or a call, do not send a link and
hope. Screen-share or stand there, watch the four taps, and confirm the first screen
loads. Install-with-them conversion is near 100%; send-and-hope is roughly 40%.

### 2.3 Tester groups as free attribution

App Store Connect gives every tester group its own public link. Since `/api/waitlist`
has no source field (D5), groups are the only zero-cost channel attribution available.
Create these on day one:

`cohort-founding` · `cohort-charter` · `walk-in` · `cold-email` · `warm-network` ·
`reddit` · `discord` · `facebook` · `creator-{{handle}}` (one per creator) ·
`waitlist-existing` · `press`

Weekly, export tester counts per group. That table is the only honest channel report
this company will have before analytics ships.

### 2.4 From reply to installed — the 3-minute path

1. Positive reply arrives → respond within **4 business hours** (hard SLA).
2. Reply contains exactly three things: the one-line pre-empt about TestFlight, the
   group-specific link, and a calendar link for a 20-minute call.
3. If no install within 48 hours → one message: *"Did the TestFlight install work? It's
   the part people get stuck on and I'd rather fix it than let you disappear."*
4. If still no install after 96 hours → offer to do it live on a 10-minute call. This
   recovers roughly a third.
5. On install → automatic Day-1 message (see §5.7).

**Installation-assist template (send immediately on any positive reply):**

> Great — here it is: {{group link}}
>
> One thing so it doesn't confuse you: it opens in TestFlight, which is Apple's own app
> for trying apps before they're released. You install TestFlight from the App Store,
> tap my link, then Accept and Install. About ninety seconds. The "expires in 90 days"
> note is just how Apple versions test builds; I'll push you a fresh one before then.
>
> iPhone/iPad only right now — Android is not ready and I'd rather say that than
> pretend.
>
> If you want, grab 20 minutes here and I'll install it with you and walk you through
> the first mission: {{calendar link}}
>
> Griffin

### 2.5 Site dependency — critical path

The moment the build clears review, `lune-synth/campaign/cta-config.js` must gain an
`app` mode carrying the public TestFlight URL, so all 43 landing pages switch from
"Join Waitlist" to "Get the beta." **[D4 — blocked, owned by the site workstream. This is
the single highest-value non-outreach task in the company this month.]** Until it ships,
every landing-page visitor is a lost tester.

Also required the same day: an email to the entire existing Resend waitlist with the
link (§3.4, Template A6). That list is the highest-intent audience the company has and
has heard nothing since signing up.

### 2.6 If the Apple account slips

Contingency, decided in advance so no week is lost:

- **Slip to Aug 24:** unchanged plan. Weeks 1–3 are warm outreach, list building, and
  community anyway. Replace "install it this week" with "install it a week Monday" and
  book the calls now — a scheduled call with a date beats a link every time.
- **Slip past Sep 1:** switch the ask from "install" to "watch me use it for six
  minutes on a call." A live screen-share demo of a real build converts nearly as well
  as a self-install and requires no Apple approval at all. Book demos at volume.
- **Never:** revert the copy to waitlist language. Once you have shown people a working
  product, going back to "coming soon" costs more credibility than the delay does.

---

## 3. Warm outreach

Warm converts at 5–15× cold per hour. Do all of it in weeks 1–3, while inbox warmup
runs and the build clears review.

### 3.1 Building the list — six sources

Target: **400 named warm contacts by Fri Aug 7, 2026.** (Raised from a conventional 250
because hours are available and this list is free.)

1. **LinkedIn connections export.** Settings → Data Privacy → Get a copy of your data →
   Connections. CSV with name, company, title, connected-on date. Free. Filter titles for
   `teacher, professor, tutor, principal, instructor, lecturer, curriculum, learning,
   education, coach, dean, advisor, counselor`.
2. **Gmail thread frequency.** Google Takeout → Contacts, plus a search of the last three
   years for anyone with >5 threads. Weak ties outperform strong ties for introductions,
   and this surfaces the ones you have forgotten.
3. **Alumni networks.** University alumni directory plus LinkedIn's Alumni tool filtered
   to Education, and to employers like school districts, universities, Kaplan, Khan
   Academy, Pearson, Chegg, Duolingo, IXL, Curriculum Associates. Shared-school email is
   functionally warm and replies at 3–5× cold.
4. **Anyone you know with a 12–18 year old.** Facebook and Instagram are the data source
   here, not LinkedIn. Every such parent is both a potential beta family and a referral
   into a teacher or tutor.
5. **The existing Lune Synth waitlist.** Export from the Resend audience **Tue Aug 4**.
   Highest-intent list in the company, currently being wasted.
6. **Second-degree asks.** One question to every Tier-1 contact: *"Who's the best math
   teacher or tutor you know?"* This is the highest-yield sentence in the document.

### 3.2 Tiering

| Tier | Definition | Volume | Channel | Cadence |
|---|---|---|---|---|
| **W1 — Close** | Would answer your call today | ~30 | Text / voice note / call | Personal, one-off, **no template** |
| **W2 — Strong professional** | Worked together; recognizes your name instantly | ~70 | Email + LinkedIn | Template A2, 2 personalized lines |
| **W3 — Weak tie** | Connected, low context, real overlap | ~180 | Email or LinkedIn DM | Template A3 |
| **W4 — Alumni / affinity** | No prior relationship, shared institution | ~80 | Email | Template A4 |
| **W5 — Waitlist** | Already opted in | all | Email from lunesynth.com | Template A6 |
| **W6 — Parents you know** | 12–18 year old at home | ~40 | Text | Template A5 |

Rule: **W1 gets no template.** Sending a close friend something that reads like a
sequence spends trust to save four minutes.

### 3.3 "Advice, not a favor" — done properly

Most founders do this badly: they ask for advice, then three sentences later ask for the
favor anyway. That is worse than asking directly, because it adds a lie.

Done properly it has four parts:

1. **A question only this person can answer.** Not "what do you think of my idea."
   *"You taught Algebra II for nine years. When a kid turns in correct work they can't
   reproduce a week later, what did you actually do about it?"*
2. **A real constraint you are wrestling with**, which invites them into the design.
   *"We refuse to show the finished answer. I think that's right, and I also think it's
   why some students will quit in week two. I don't know how to hold both."*
3. **No ask in the first message.** None. The ask appears in message two, only if they
   engaged.
4. **Use the advice and tell them you did.** *"You said the hint has to preserve their
   own method. We rewrote the feedback template around that."* This is what converts an
   advisor into a design partner, and it is the entire mechanism.

Now that a build exists, there is a fifth move available and it is the strongest:
**close the loop with an install.** *"You said X. Here's the build where we did it —
{{link}}."* Nobody ignores that message.

### 3.4 Templates

Plain text. No images, no tracking pixels, no signature graphics. Subject lines
lowercase and specific.

---

**Template A1 — Close friend / family (text, W1)**

> Quick thing. The study app I've been building — Lune Synth — is on my phone and
> working, and it goes out to testers this week.
>
> Student does the problem on paper, photographs it, and it finds the exact step where
> they went wrong and builds a five-minute practice set for that one skill. It never
> shows them the answer. That's the whole point of it.
>
> Two things I need: people who'll actually use it, and a name. Do you know a tutor or
> a math teacher who'd have opinions? That's it.

---

**Template A2 — Strong professional tie (email, W2)**

> Subject: a question about how you taught {{subject}}
>
> {{First name}} — {{one specific, true, non-flattering line of shared history}}.
>
> I want your read on one design decision, because you're one of the few people I know
> who'd argue with me about it.
>
> Lune Synth reads a student's *handwritten* work, finds the exact line where the
> reasoning broke, and generates a short practice mission for that skill. It does not
> show the finished answer. Ever. Not a setting, not a fallback.
>
> The bet is that the answer was never the useful part. The risk is obvious: some
> students will want the answer and leave.
>
> When you were teaching, would that constraint have helped you or annoyed you?
>
> It's a working build as of this week — I can put it on your phone in two minutes if
> you'd rather argue with the thing than with me.
>
> Griffin

---

**Template A3 — Weak-tie professional (email or LinkedIn, W3)**

> Subject: {{their specialty}} question, 2 minutes
>
> {{First name}} — we connected {{honest when/where}}. Low stakes question.
>
> I've built a study app that reads a student's handwritten work, identifies the exact
> step where they went wrong, and turns it into targeted practice. It won't produce the
> finished answer.
>
> You've spent {{N}} years around {{their domain}}. Does that constraint sound useful to
> you, or precious?
>
> That's the whole email. It's in beta testing now, so if you want to see it rather than
> take my word for it, say the word and I'll send the link.
>
> Griffin
> lunesynth.com

---

**Template A4 — Alumni (email, W4)**

> Subject: {{School}} '{{year}} — building something in education
>
> {{First name}} — {{School}} {{year}} here, so this is a cold email with a thin excuse
> attached.
>
> I saw you're {{current role}} at {{org}}. I've built Lune Synth: a student solves a
> problem on paper, photographs the page, and the app finds the precise step where the
> reasoning broke and builds a five-minute practice mission for that skill. It never
> gives the finished answer.
>
> It's in beta this month, and I'm putting 30 educators into a founding cohort before
> the public launch. If you have twenty minutes in the next two weeks, I'd rather hear
> where this is wrong than where it's right.
>
> Griffin Rutherford
> Coherascent Labs / lunesynth.com

---

**Template A5 — Someone with a kid the right age (text or email, W6)**

> Subject: {{Kid's name}} and math homework
>
> {{First name}} — slightly strange question. Is {{kid's name}} still doing
> {{Algebra II / chemistry / whatever}} this year?
>
> I've built something and it's in beta testing right now. Short version: they solve the
> problem on paper, take a photo, and the app tells them which step broke — not the
> answer. Then five minutes of practice on exactly that skill.
>
> Free for you permanently if you're in. What I need back is honesty: does {{kid's name}}
> actually open it in week three, or does it die on the home screen? That's the one
> thing I can't learn any other way.
>
> Takes about two minutes to install and I'll do it with you on the phone if that's
> easier. iPhone only for now.
>
> Griffin

---

**Template A6 — Existing waitlist → beta (send the day the build clears review)**

Send to the full Resend export. Segment on reply — we have no role data.

> Subject: the thing you signed up for is ready
>
> You joined the Lune Synth waitlist and then heard nothing from us. That was our
> mistake, and this is me fixing it.
>
> The beta is open today. Here's the link: {{waitlist-existing group link}}
>
> What it does: you work the problem on paper, photograph the page, and it finds the
> exact step where your reasoning broke and builds a five-minute mission on that one
> skill. It does not produce the finished answer. That is the product, not a limitation.
>
> It opens in TestFlight, which is Apple's own app for testing apps before release.
> iPhone and iPad only right now — Android isn't ready and I'd rather say so.
>
> Your beta terms stand: two months free and lifetime 50% off Pro.
>
> One ask. If you're a tutor, a teacher, a homeschool parent, or a student who studies
> seriously, reply with one word telling me which. I'm taking 30 people into a founding
> cohort — free for life, direct line to me, and their names in the product — and I'd
> rather they came from this list than from strangers.
>
> Griffin Rutherford
> Founder, Coherascent Labs

---

**Template A7 — Referral ask (after any positive reply, warm or cold)**

> One more thing, then I'll stop.
>
> The people I most need are tutors and math teachers who'd have strong opinions about a
> tool that refuses to give the answer. Is there one person you'd forward this to?
>
> Paste-ready, if it's easier:
>
> ---
> *Griffin built a study app that reads handwritten work and finds the exact step where
> a student went wrong. It won't show them the answer — that's deliberate. It's in beta
> now and he's picking 30 educators to shape it; they get it free for life. {{link}}*
> ---

### 3.5 The referral mechanic

Make sharing an act of generosity, not a promotion.

- Every Founding Cohort member gets **10 invite seats**; every Charter Educator gets 5.
  Each seat carries the full public offer (2 months free + lifetime 50% off Pro), so
  forwarding it is giving a gift.
- Delivery: a **per-partner TestFlight group link** plus a one-paragraph paste-ready
  blurb (above). Groups give attribution for free, today, with no engineering.
  When D5 ships, migrate to `lunesynth.com/join/{{name}}`.
- Partners whose seats fill get a **sixth ask, not a sixth reward:** co-design credit on
  the feature their students used most. Status beats discounts with educators.
- Track `referrals_sent` and `referrals_converted` per partner. A partner who refers will
  give you a testimonial. A partner who has not referred in three weeks is not really
  using the product — call them.

---

---

## 4. Cold outreach

**Volume target: 3,200 hand-personalized first-touch cold emails, Aug 17 – Oct 23**,
plus ~5,000 automated follow-ups, plus 900 LinkedIn touches, 700 creator/community DMs,
and 90 in-person visits.

The governing principle: **the founder has hours and does not have money, so the list is
small and the research is deep.** A hand-written first line referencing a real fact about
the recipient moves reply rate from 2–4% to 12–18%. At 32 hrs/week that is affordable,
and it is the single biggest lever in this document.

### 4.1 List building — sources, method, cost, and the free path

| ICP | Source | Method | Paid tool | **$0 alternative** |
|---|---|---|---|---|
| Independent tutors | Wyzant, Preply, Superprof, Tutors.com, Varsity Tutors public profiles | Profiles give name, subjects, city, sometimes a personal site | Apollo $49/mo | Most tutors list a website; email is on it. Otherwise message *inside the platform* — free, and it lands in an inbox they check |
| Small tutoring businesses | Google Maps "math tutoring" across your metro + the 150 largest US metros | Business name → site → contact page | Sales Navigator $99/mo | Google Maps + the business's own site. 100% free, ~25 contacts/hour |
| Local centers (walk-in) | Google Maps within 45 min | Address list, route-planned | — | Free by definition |
| Test-prep operators | Google "SAT tutoring {{metro}}"; Applerouth / Compass / Summit / ArborBridge / Marks staff pages; IECA member directory | Manual, ~40/hr, highest-quality list in the plan | — | Free |
| Homeschool co-op leaders | HSLDA state group lists, TheHomeSchoolMom co-op directory, Classical Conversations regional directories, state association sites | Co-op pages publish a contact email directly | — | Free. This is the best free list in education |
| Homeschool reviewers/creators | Cathy Duffy Reviews, Well-Trained Mind forums, YouTube/IG "homeschool math curriculum" | DM-first, not email-first | — | Free |
| HS math/science teachers | Public school department staff directories; NCTM/NSTA state affiliate member lists; state math conference programs | Districts publish `first.last@district.org` in a predictable pattern | Clay $149/mo for crawling | Free — staff directories are public web pages. 30–60 contacts/hour by hand |
| K-12 educators at scale | **Licensed vendors: MDR (Market Data Retrieval), Agile Education Marketing** | Permissioned, opt-out-managed | ~$0.10–0.30/record | Skip entirely. At our volume, hand-sourcing is cheaper and the data is better |
| College learning centers | IPEDS institution export → each institution's academic-support staff page; NCLCA + CRLA member lists | Semi-manual | — | Free |
| Creators | Hashtag search: #mathteacher #algebra #apcalculus #chemteacher #homeschoolmath, then "similar accounts" | DM channel, no email needed | — | Free |
| Researchers | Google Scholar: "productive failure", "desirable difficulties", "retrieval practice" → faculty pages | 12 total | — | Free |

**Recommended tooling spend: $150/mo** — one sequencer (~$97) plus one enrichment tool
(~$49). **$0 path: Google Sheets + a Gmail mail-merge Apps Script + hand-sending.** At
250 first-touch emails/week the $0 path costs roughly 3 extra hours/week, which the
founder has. **Recommendation: run the $0 path in weeks 1–4, and buy the sequencer in
week 5 only if follow-up discipline is measurably slipping.**

### 4.2 The legal and ethical line — read before the first send

1. **Never contact a minor.** No student under 18 receives outreach in any channel. This
   is not only COPPA caution; it is the product's moral position, and one screenshot of
   us DMing a fifteen-year-old would end the anti-cheating narrative permanently.
2. **CAN-SPAM** applies to every cold email: accurate From/Reply-To and subject lines, a
   working unsubscribe honored within 10 days, and a **valid physical postal address in
   the footer**. A USPS-registered P.O. box is compliant. Put it in every cold template.
3. **US only.** GDPR (EU/UK) and CASL (Canada) require a lawful basis or prior consent
   cold prospecting does not satisfy. CASL penalties are per-message. Filter by country
   before import.
4. **FERPA.** Never ask an educator for student names, grades, IDs, or identifiable work.
   If a teacher offers a photographed student page, require de-identification. We are not
   a school official and hold no DPA.
5. **COPPA.** No tester under 13. Pilots are grade 9+ **[D2]**. If a co-op leader wants
   younger children in, decline and offer parent-mediated observation instead.
6. **Do not scrape behind a login.** LinkedIn, Facebook groups and Discord member lists
   are off-limits to automated extraction — it violates their terms and yields the worst
   data you will ever email. Community members are approached *in the community*, by
   hand. Public staff directories, public marketplace profiles, and published conference
   programs are fair game.
7. **Suppression list from day one.** Any no, unsubscribe, or bounce goes onto a
   permanent suppression list imported everywhere. Never re-add. Never "re-engage."

### 4.3 Infrastructure

**Cold email must not touch lunesynth.com and must not go through Resend. Two reasons,
both fatal:**

- **Reputation.** lunesynth.com's domain reputation is the only thing keeping TestFlight
  invites, beta instructions, and launch emails out of spam. Cold email produces spam
  complaints at 0.1–0.3% even when done well. Burning that domain in September means the
  launch email in November does not arrive. There is no undo, and right now that domain
  is carrying the most important message the company will ever send.
- **Provider policy.** Resend — like every transactional/marketing ESP — prohibits
  unsolicited email and non-opt-in lists in its acceptable use policy, and runs shared IP
  pools where your complaints damage other senders. A cold campaign through Resend
  Audiences risks account suspension, which would take the waitlist and every beta invite
  down with it. Resend is for people who asked to hear from us. Cold outreach is for
  people who did not. Different tool, different domain, different reputation.

**Build — deadline Wed Aug 5, 2026:**

1. **Domains.** Register 3 lookalikes: `trylunesynth.com`, `lunesynth.app`,
   `getlunesynth.com`. ~$36/yr total. Each 301-redirects to lunesynth.com.
2. **Inboxes.** 4 per domain = **12 inboxes**. Google Workspace $7.20/user/mo = **$86/mo**,
   or the sequencer's hosted inboxes at $3–4 each. Addresses: `griffin@`,
   `griffin.rutherford@`, `g.rutherford@`, `hello@`. Real display name, real human. No
   `noreply`, no `team`, no `info`. **$0 alternative: 2–3 free Gmail accounts sending 30/day
   each, hand-sent.** Deliverability is worse but at 250/week it is survivable, and it is
   what a founder with no budget should do in weeks 1–4.
3. **DNS on every sending domain:**
   - **SPF** — one record, under 10 DNS lookups.
   - **DKIM** — 2048-bit, published and verified per domain.
   - **DMARC** — `v=DMARC1; p=none; rua=mailto:dmarc@lunesynth.com;` for two weeks, then
     `p=quarantine`. Google and Yahoo bulk-sender rules make this non-optional.
   - **Custom tracking domain** per sending domain — never the sequencer's shared one.
   - **MX plus a real reply mailbox you actually read.**
4. **Warmup.** Start on all inboxes **Aug 5**, run **12 days minimum** (shortened from
   the usual 21 because volume per inbox stays low). **First automated cold send:
   Mon Aug 17.** Hand-sent email from an aged personal inbox can begin earlier — that is
   how weeks 1–2 get cold volume without waiting.
5. **Ramp per inbox:** week 1 live 8/day → week 2 15/day → week 3+ 25/day hard cap.
   12 inboxes × 25 = **300/day** ceiling.
6. **Sequencer.** Instantly.ai ($97/mo) or Smartlead ($94/mo) — inbox rotation, warmup,
   per-inbox caps. Lemlist if LinkedIn steps belong in the same sequence (week 7+).
   Do **not** send through Apollo's sequencer; shared-infrastructure deliverability is
   materially worse. **$0 alternative: Google Sheets + Apps Script mail merge**, or
   GMass's free tier (50/day). Follow-ups then get scheduled by hand from a CRM view —
   works up to about 300 active threads, which covers weeks 1–6.
7. **Open tracking OFF.** Apple Mail Privacy Protection makes open rates fiction, and
   pixels are a spam signal. Track **replies and link clicks only**. TestFlight group
   counts are the real conversion metric anyway.
8. **Verify every address** before import. Bounce under 2%. Above 4%, stop and rebuild.

**Monthly cost: $150 recommended / $0 possible / $250 if Workspace inboxes are used.**

### 4.4 The walk-in motion (highest conversion per hour, zero dollars)

Two afternoons a week, 3:00–6:00pm Tue and Thu, 4 hours total. Route-plan 5–7 tutoring
centers, learning centers, and test-prep shops per outing using Google Maps.

**What to bring:** a charged iPhone with the build, a second device if you have one, and
20 index cards with your name, number, and the TestFlight link handwritten. Not
brochures. Handwritten cards get kept.

**The doorway script (under 25 seconds, then stop talking):**

> "Hi — I'm Griffin, I build a study app and I live about twenty minutes from here.
> I'm not selling anything; it's in beta and it's free. It reads a student's handwritten
> work and finds the exact step where they went wrong — and it refuses to give them the
> answer. Can I show you ninety seconds of it? If it's useless, tell me and I'll go."

**Then:** show the loop on the phone. Page → photo → located error → mission. Say out
loud, *"There's no solve button. There's no setting to turn that off."* Watch their face.

**Close:** *"Want it on your phone before I go? Takes two minutes and it's free for you
permanently."* Install it with them, on the spot, using the `walk-in` group link.

**If the owner isn't in:** leave a card with the front desk and one sentence — *"Ask him
to text me, it's a free beta for the center."* Log the visit and return in 8 days. Second
visits convert better than first ones.

**Expected performance [ASSUMPTION, revise after week 4]:** 6 centers per outing, 2
outings per week = 12 visits/week; 55% get a live demo; 30% of demos install on the spot
→ **~2 partners per week, ~20 over the program**, for four hours a week and a tank of gas.
Track every visit in the CRM with `channel = walk-in`.

**Schools, same motion, different rules:** do not walk into a K-12 school unannounced.
Email the teacher directly (Sequence C), and if they say yes, offer to come to their
classroom or their prep period. An in-person visit to a teacher who invited you is the
strongest version of this channel; an uninvited one gets you a call to the front office.

### 4.5 Sequence A — Independent tutors and small tutoring businesses

4 emails / 15 days. Every `{{ }}` must be filled with a real researched fact. If a token
cannot be filled honestly, drop the contact — do not send a generic version.

---

**A1 — Day 0. Subject: `the step where they broke`**

> {{first_name}} — you tutor {{subject}} in {{city}}. So you've had this happen: a
> student's homework is finished and correct, and on Thursday they can't reproduce any
> of it.
>
> I built Lune Synth for that. The student solves the problem on paper, photographs the
> page, and it finds the exact step where the reasoning broke — then builds a five-minute
> practice mission for that one skill. It never shows the finished answer. That's a
> product decision, not a limitation.
>
> It's in beta right now and it's free. I can put it on your phone today.
>
> I'm also taking 30 tutors into a founding cohort: free for life, and you tell me what's
> wrong with it every other week.
>
> Want the link, or would you rather I showed you first?
>
> Griffin Rutherford
> Founder, Coherascent Labs
> {{postal address}} · unsubscribe: {{link}}

---

**A2 — Day 3. Subject: `what the feedback actually says`**

> The concrete version, because "AI reads handwriting" is a sentence anyone can say.
>
> Student attempt: correct product-rule setup, then writes the derivative of ln(x) as x
> instead of 1/x.
>
> What Lune Synth returns:
> *"Your structure is right. Recheck only the derivative of ln(x) on line three."*
> Then: *"What function multiplied by x gives 1?"*
> Then a four-problem mission on logarithmic differentiation.
>
> No worked solution. No rewritten answer. The student keeps their own method and repairs
> one line of it.
>
> If that's how you already tutor, I'd like your read on where it breaks. Link's yours if
> you want it: {{cold-email group link}}
>
> Griffin

---

**A3 — Day 7. Subject: `the objection I keep hearing`**

> {{first_name}} — the objection I get most from tutors: "students will just go to
> ChatGPT for the answer anyway." Correct. They will. We lose the moment a kid wants to
> be done.
>
> We're competing for the twenty minutes before a test, when they know the answer won't
> save them.
>
> Most of the tutors in the cohort so far are people who sell that distinction to parents
> every week and are tired of doing it alone.
>
> Twenty minutes this week? I'll install it with you on the call so you're not doing it
> alone either.
>
> Griffin

---

**A4 — Day 15 (breakup). Subject: `closing your file`**

> {{first_name}} — assuming the timing's wrong, so I'll stop. No follow-up sequence.
>
> If it's ever useful, the app is free during beta: {{link}}. And we wrote about why an
> answer isn't feedback — lunesynth.com/blog/an-answer-is-not-feedback. That one isn't
> about the product.
>
> Reply any time and I'll pick it up.
>
> Griffin

### 4.6 Sequence B — Homeschool co-op leaders

---

**B1 — Day 0. Subject: `{{co-op name}} — a math question`**

> {{first_name}} — I found {{co-op name}} through {{specific true source}}. You're
> coordinating {{N}} families this year, which means you've heard some version of this: a
> parent can't tell whether their kid understood the math or copied it off a screen.
>
> I built Lune Synth. The student works the problem on paper. They photograph the page.
> The app finds the exact step where the reasoning broke and builds five minutes of
> practice on that skill. It will not give the finished answer — not as a setting, not as
> a fallback.
>
> That constraint is the entire product. It's also why I'm writing to a homeschool co-op
> and not a school district.
>
> It's live in beta and free. Details for families are here:
> lunesynth.com/for-families/homeschool/
>
> Can I show you what it does — twenty minutes, and I'll install it with you?
>
> Griffin Rutherford
> Coherascent Labs · {{postal address}} · unsubscribe: {{link}}

---

**B2 — Day 4. Subject: `paper first`**

> The part I'd want to know if I were you: this does not put another screen between the
> child and the work.
>
> The child works on paper. The phone is used for eleven seconds to photograph the page.
> The feedback names one line. The practice can be printed.
>
> Why we built it that way:
> lunesynth.com/blog/the-classroom-does-not-need-another-screen
>
> If that doesn't match how {{co-op name}} runs, say so and I'll stop.
>
> Griffin

---

**B3 — Day 9. Subject: `what the cohort actually involves`**

> {{first_name}} — being specific so you can decide fast.
>
> What you'd give: use it with your own kids for two weeks, then five families for four
> weeks; one announcement to the co-op; twenty minutes with me every other week.
>
> What you'd get: Lune Synth Pro free permanently, beta seats for every family in
> {{co-op name}}, your name in the product credits, and real influence — this cohort is
> deciding how the feedback is worded and how hard the practice ramps.
>
> Free, iPhone/iPad only for now, and I'll do the install on the call.
>
> Griffin

---

**B4 — Day 14. Subject: `wrong person?`**

> If co-op tools aren't your area, is there someone at {{co-op name}} who handles
> curriculum? I'd rather be redirected than ignored.
>
> Griffin

---

**B5 — Day 20 (breakup). Subject: `last one from me`**

> Closing this out, {{first_name}}. Thanks for the work you do — running a co-op is a
> genuinely hard job nobody funds.
>
> If a family in {{co-op name}} ever needs it, the beta's free: {{link}}
>
> Griffin

### 4.7 Sequence C — High school math and science teachers

Send Tue–Thu, 6:30–7:15am or 3:30–5:00pm local. Never Monday morning.

---

**C1 — Day 0. Subject: `handwritten work, third year of this`**

> {{first_name}} — you teach {{course}} at {{school}}. This is the third September where
> you can't fully trust work that was done at home.
>
> I built Lune Synth. The student solves the problem on paper, photographs it, and the
> app identifies the exact step where the reasoning broke, then generates a short
> practice mission for that specific skill. It never produces the finished answer.
>
> The point isn't detection. It's that handwritten work is evidence of thinking, and we
> built the whole system around reading it.
>
> It's in beta, it's free, and it's on my phone right now. One section, four weeks,
> twenty minutes of your time every other week. Free permanently for you either way.
>
> Interested — or is September the worst possible month to ask?
>
> Griffin Rutherford
> Coherascent Labs · {{postal address}} · unsubscribe: {{link}}

---

**C2 — Day 4. Subject: `smaller than an answer`**

> The design rule, useful to you whether or not you ever install this:
>
> Good feedback is *smaller* than an answer. If a student has the setup right and drops a
> sign, a full worked solution is mostly noise — it makes them compare two whole solutions
> to find one break, and it invites them to abandon their own method.
>
> So: "your substitution was valid; the exponent changed incorrectly on line three; fix
> that and continue." Then practice on that one thing.
>
> Longer version: lunesynth.com/blog/an-answer-is-not-feedback
>
> Griffin

---

**C3 — Day 9. Subject: `what I'd need from you`**

> {{first_name}} — concretely, so it's easy to say no.
>
> One section. Four weeks. Students photograph their worked problems; you keep teaching
> exactly as you do. Two twenty-minute calls with me across the four weeks.
>
> You get Pro free for life, seats for your students, co-design credit, and first access
> to the teacher view — which this cohort is going to define, because it isn't built yet
> and I'm not going to guess.
>
> If your answer is "not in September, ask me in January," that's a completely acceptable
> answer and I'll put it in the calendar.
>
> Griffin

---

**C4 — Day 15. Subject: `January instead?`**

> Assuming September is buried. Want me to come back the week of Jan 11, 2027?
>
> Reply "January" and I'll do exactly that — nothing in between.
>
> Griffin

---

**C5 — Day 21 (breakup). Subject: `done`**

> Last one, {{first_name}}. Thanks for reading any of these during the first month of
> school.
>
> Everything we've written about AI and learning is at lunesynth.com/blog — free, no
> signup, and it's the part I'd want a teacher to have even if the app never touches
> your classroom.
>
> Griffin

### 4.8 LinkedIn

**30 connection requests/day, 150/week** — near LinkedIn's practical ceiling. Targets:
tutoring business owners, learning-center directors, department heads, edtech operators.

- **Step 1 (Day 0) — connection note, 280 characters:**
  > {{first_name}} — I built a study app that grades handwritten work and refuses to give
  > students the answer. It's in beta now. You've spent {{N}} years in {{their world}} —
  > I'd value your read on whether that constraint survives contact with real students.

- **Step 2 (Day 1 after accept) — no pitch:**
  > Thanks for connecting. Genuine question, not a setup: what's the most common way you
  > see students fake understanding?

- **Step 3 (Day 4) — give something:**
  > Wrote this on why instant explanations feel like studying and mostly aren't:
  > lunesynth.com/blog/ai-is-breaking-how-we-learn. Curious whether it matches what you
  > see.

- **Step 4 (Day 9) — the ask, now concrete:**
  > It's in TestFlight beta this month and it's free. Want the link, or twenty minutes
  > where I show you the loop and you tell me what's wrong with it?

- **Step 5 (Day 16) — close:**
  > Leaving it here. If it's ever relevant, my inbox is open.

**Profile prerequisite, deadline Wed Aug 5:** headline reads *"Building Lune Synth — AI
that reads a student's handwriting and refuses to give them the answer."* Featured
section links the blog and, from Aug 17, the beta. Three build-in-public posts live
before the first connection request, so the profile answers the question the request
creates.

### 4.9 Instagram / TikTok DMs to educator creators

Never a copy-paste block. Watch one piece of their content and reference it in the first
sentence. **15 DMs/day maximum** from a real, populated account. Follow, watch, and
comment for three days before DMing anyone above 50k.

**DM-1 — mid-tier creator (5k–100k)**

> Your video on {{specific thing}} is the argument I've been making to investors, badly.
>
> I built Lune Synth — students solve on paper, photograph it, and it finds the exact
> step that broke and gives them practice on that skill. It won't show the answer.
>
> It's in beta now, free, no sponsorship pitch attached. I want to know what someone who
> teaches this every day thinks is wrong with it. Can I send you the link?

**DM-2 — larger creator (100k+)**

> Not a sponsorship pitch — there's nothing to sell yet.
>
> I've built the opposite of a homework-answer app: it reads handwritten work, names the
> one line that broke, and makes practice out of it. It cannot produce a solution.
>
> It's in closed beta and I'm giving access to a small number of educators whose opinion
> would actually change the product. You'd be one. Want it before anyone else does?

**DM-3 — after a positive reply**

> Sending it now: {{creator-specific group link}}
>
> Two things I'd love you to be blunt about:
> 1. Does the feedback sound like a teacher or like a chatbot?
> 2. Where would a real student quit?
>
> If it turns into something you'd want to show your audience at launch, we'll build that
> properly then — with a real affiliate arrangement. Right now I just want it to be right.

**DM-4 — the creator-specific link, once they're in**

> Here's a link that's yours: {{creator-{{handle}} group link}}. Anyone who joins through
> it gets the beta plus lifetime 50% off Pro. No obligation to use it — it just means I
> can tell what came from you when we do the affiliate program properly.

### 4.10 Metrics

**[ASSUMPTION] — hand-personalized, low-volume, US B2B benchmarks with a real product to
give away. Replace with actuals at the Week 5 review.**

| Metric | Templated cold | **Hand-personalized (our plan)** |
|---|---|---|
| Delivery | 97% | 98% |
| Bounce | <2% | <1% |
| Open rate | **not tracked** — Apple MPP makes it fiction and pixels hurt deliverability | not tracked |
| Reply rate | 3–5% | **12–18%** |
| Positive reply | 1.5% of sent | **5–7% of sent** |
| Reply → call or install | 45% | 60% |
| Call → partner | 55% | 65% |
| Spam complaints | 0.2% | <0.05% |

**Funnel math to T1 + T2 (30 Founding + 120 Charter = 150 partners):**

```
Cold email   3,200 sent × 14% reply         = 448 replies
             448 × 42% positive             = 188 positive
             188 × 60% install or call      = 113
             113 × 65% become a partner     =  73 partners
Warm           400 contacts × 38% reply     = 152 replies
             152 × 40% relevant             =  61
              61 × 62% become a partner     =  38 partners
Walk-ins        90 visits × 22% net         =  20 partners
LinkedIn       900 touches × 2.2%           =  20 partners
Creator DMs    700 DMs × 1.5%               =  11 partners
Community + inbound + referral              =  25 partners
                                              ------------
                                      TOTAL = 187 → 150 target, 25% slack
```

**Installed testers (T3 = 1,500):** 150 partners × ~6 seats redeemed = 900; existing
waitlist + organic landing-page traffic once D4 ships ≈ 400; community + creator posts
≈ 200. Total ≈ 1,500. **The binding constraint is D4 (the site CTA switch), not outreach
volume.**

**Daily send discipline:**
- First-touch cold: **60/day, Mon–Thu.** No new cold sends Friday — replies land Fri/Mon
  and you want to be at the desk for them.
- Total emails leaving all systems: ≤300/day.
- **Reply SLA: 4 business hours.** A cold reply cools in a day. This is the single
  highest-return rule in this document.
- Every negative reply is suppressed the same day.
- Friday, 20 minutes: read 20 sent emails at random. If any reads like a template,
  rewrite it before Monday.

---

## 5. The design partner program

Name: **The Founding Cohort** (deep tier) and **Charter Educators** (light tier).
Public page: `lunesynth.com/founding-cohort`, live **Fri Aug 28, 2026**.

Two tiers exist for one reason: 150 partners on a biweekly call is 50 hours a week and
therefore fiction. The deep tier is capped at the number one founder can genuinely serve.

### 5.1 Structure

| | **Founding Cohort** | **Charter Educators** | **Beta testers** |
|---|---|---|---|
| Size cap | **30** (hard) | **120** | Unlimited to 10,000 |
| Who | Tutors, teachers, co-op leaders, prep-center owners with ≥3 students | Same profile, lighter commitment; plus serious adult self-studiers | Anyone 13+ who installs |
| Selected by | 20-min onboarding call | Application form + install | Self-serve link |
| Their commitment | 3+ students, 4+ weeks, 20-min call every 2 weeks, 1 artifact/month | Install, use with ≥1 student, 5-min async form every 2 weeks | None |
| What they get | Free lifetime Pro, 10 seats, named credit, direct phone line, feature naming right | Free lifetime Pro, 5 seats, named credit on the page | 2 months free + lifetime 50% off Pro |
| Founder time each | ~35 min/week | ~6 min/week | ~0 |
| Total founder load | **8.75 hrs/week at full 30** | **~4 hrs/week at full 120** | — |

Total cohort management at full scale: ~13 hrs/week of the 32. That is the real reason
for the 30 cap, and it should not be raised.

### 5.2 What a Founding Cohort member gives

1. **A real cohort of students.** ≥3, actually using it, not hypothetical. **[D2: 13+.]**
2. **Feedback on a cadence.** One recorded 20-minute call every two weeks, booked in
   advance for the whole program on day one — never "I'll follow up."
3. **Two artifacts per month:** an annotated screenshot set or session recording of a
   student using it, and one *"where it failed"* note.
4. **A testimonial at launch** — written into the agreement as *"if you'd recommend it."*
   Never as an obligation. An obligated testimonial is worthless and everyone can tell.
5. **Case study participation** for 8 of the 30 — named, with permission, and with
   de-identified student outcomes only (§4.2 rule 4).

### 5.3 What they get

1. **Lune Synth Pro, free, permanently. [D1 — needs approval.]** This is the offer. It
   costs nothing today and it is why a busy teacher replies in September.
2. **The build, this week**, installed with them on a call — not a promise.
3. **10 seats to distribute**, each carrying the public offer, delivered as a
   partner-specific TestFlight group link.
4. **Named credit** on `/founding-cohort` and in the app's credits — name, and
   school/practice if they want it. This page is also a landing page for the outreach
   itself; social proof compounds from Week 5 onward.
5. **Direct line to the founder** — phone number, plus a private group of ≤30.
6. **Demonstrated influence.** Every shipped change traceable to a member is attributed
   by name in the monthly changelog. This, not the free Pro, is what makes people stay.
7. **First look at the teacher view, and the right to name a feature.** **[ASSUMPTION]**

### 5.4 Recruiting targets, dated and numeric

| Date | Founding Cohort | Charter Educators | Installed testers | Students represented |
|---|---|---|---|---|
| Fri Aug 14 | 3 | 6 | 25 | 40 |
| Fri Aug 21 | 7 | 20 | 90 | 110 |
| Fri Aug 28 | 12 | 38 | 200 | 220 |
| Fri Sep 4 | 16 | 55 | 340 | 330 |
| Fri Sep 11 | 19 | 70 | 490 | 430 |
| Fri Sep 18 | 22 | 84 | 660 | 540 |
| Fri Sep 25 | 25 | 96 | 840 | 640 |
| Fri Oct 2 | 27 | 106 | 1,020 | 730 |
| Fri Oct 9 | 29 | 114 | 1,220 | 820 |
| **Fri Oct 16** | **30 — CAP REACHED** | **118** | **1,380** | **880** |
| Fri Oct 23 | 30 | **120** | **1,500** | **900** |

Stop deep-tier recruiting at 30. A cohort you cannot personally call every two weeks is
a mailing list with extra steps.

### 5.5 Onboarding call script — 20 minutes

Zoom or phone. Record with permission. Never screen-share a deck.

**0:00–0:02 — Frame.**
> "Twenty minutes. Seven of it is me asking you questions, seven is me showing you the
> thing, and the last few are you telling me what's wrong with it. I'm not going to pitch
> you — if this isn't right for your students I'd genuinely rather find that out now."

**0:02–0:09 — Diagnose. Ask, then be quiet. Write their exact words.**
1. "Walk me through a student you're working with right now who's stuck. What's actually
   going wrong for them?"
2. "When they hand you work, how do you figure out where the reasoning broke? What does
   that take you?"
3. "How much AI use are you seeing, and what do you do about it?"
4. "What have you already tried that didn't work?"
5. "If targeted practice appeared automatically for the skill they missed — what would
   you do with the time that frees up?"

Their exact phrasing becomes ad copy, landing-page copy, and the opening line of the
case study. This is the most valuable seven minutes in the company's week.

**0:09–0:15 — Show, then install.** The core loop only: page → photo → located error →
mission. Say out loud: *"There is no solve button, and no setting that turns that off."*
Watch their face — that reaction is the qualification signal. Then: *"Let's put it on
your phone right now, it takes two minutes."* **Never end an onboarding call without an
install.**

**0:15–0:19 — The agreement, out loud.**
> "Here's what I'd ask: three students, four weeks, and twenty minutes with me every
> other week. Here's what you get: Pro free permanently, ten seats to give your
> {{students/families}}, your name in the product, and real influence — this cohort is
> deciding how the feedback gets worded.
>
> Want in? And if not, tell me why. That's worth as much to me."

**0:19–0:20 — Close with dates, not intentions.**
- Book **all** biweekly calls now, to the end of October, before hanging up.
- Record: number of students, courses, grade levels, device type (iOS check).
- Send the one-page agreement + calendar invites within 2 hours.
- Ask A7 (referral) in that same email, while goodwill is at its peak.

### 5.6 The one-page agreement

Not a contract. A single email, so both parties can point at it later.

> **Lune Synth Founding Cohort — {{name}}, {{start date}} to {{start + 12 weeks}}**
>
> You give: at least 3 students using it for 4 weeks; a 20-minute call with me every
> other week (all booked); one "where it failed" note per month; and — only if you'd
> genuinely recommend it — a testimonial at launch.
>
> You get: Lune Synth Pro free for life; 10 beta seats for your students or families;
> your name on lunesynth.com/founding-cohort and in the app; my mobile number; and
> influence over what ships, attributed by name.
>
> Either of us can end this with one sentence and no hard feelings. If you stop using it,
> tell me why — that's the most useful thing you could give me.
>
> No student names, grades, or identifiable work ever come to us. If you share a
> photographed page, cover the name first.

### 5.7 Feedback capture loop

| Cadence | Mechanism | Founder action |
|---|---|---|
| Day 1 after install | Automatic message: *"Did the first mission make sense? One sentence is a complete answer."* | Reply within 4 hours. Day-1 silence predicts churn better than anything else |
| Day 4 | *"What's the first thing that annoyed you?"* | Log verbatim |
| Every 2 weeks | 20-min recorded call, transcribed | Tag each issue `bug / friction / missing / delight` with the member's name |
| Off weeks | 3-question form: *What did a student do that surprised you? Where did it fail? What would you delete?* | 48-hour response to every submission |
| Continuous | Private cohort group | Read daily, reply within a day |
| Monthly, by the 1st | **Cohort changelog email** — "here's what you changed," naming names | This is the retention mechanism. Never skip it |
| Monthly | One case-study interview, rotating | 45 min, recorded |

**Rule: every piece of feedback gets one of three replies within 48 hours — *shipped*,
*scheduled*, or *not doing it, and here's why*.** Silence is the only response that loses
a design partner.

### 5.8 Churn watch

Weekly, check the CRM view `Active partners, sorted by days since last contact`:

- **>10 days since last contact** → founder texts, does not email.
- **No student activity in 7 days** → call. The cause is usually a broken install, an
  expired build, or an Android family member. All three are fixable in ten minutes.
- **Missed two consecutive biweekly calls** → move to Charter tier without ceremony and
  backfill the deep slot. Say it kindly and directly; do not let a dead slot sit.
- **Build expiry** (90 days from each TestFlight build) → ship a fresh build every 6
  weeks. A silently expired build looks exactly like churn and is the most preventable
  loss in the program.

---

## 6. Partnerships and distribution

Sequenced by realistic time-to-value. "Do now" means start the conversation this
quarter; almost nothing here produces revenue in 2026, and pretending otherwise is how
founders lose an autumn.

| # | Partner type | The pitch | Deal shape | Time to revenue | Verdict |
|---|---|---|---|---|---|
| 1 | **Independent tutors / small tutoring cos** | "Your value is the diagnosis. This does the unbillable half of it, and it argues for you against the free chatbot." | Free Pro for the tutor; 20% recurring affiliate on their students' subscriptions at public launch | 1–3 months post-launch | **Do now** |
| 2 | **Homeschool co-ops** | "Your families work on paper. This tells them where it broke without doing it for them, and it doesn't add a screen." | Free for the leader, group seats, co-op affiliate code | 2–4 months post-launch | **Do now** |
| 3 | **Local centers, in person** | Live demo, install before you leave | Free Pro for staff; affiliate at launch | 2–4 months | **Do now — best hours-to-outcome ratio available** |
| 4 | **Small regional test-prep firms** | "Fall SAT/ACT season. Your students are reviewing practice tests badly, right now." | Staff seats free; per-student revenue share or flat seat license at launch | 3–6 months | **Do now** |
| 5 | **Educator creators (affiliate)** | "You already argue against answer-machines. Get paid when your audience agrees." | 25% of first-year revenue, unique code, no upfront fee, 60-day cookie | Launch + 1 month | **Recruit now, activate at launch** |
| 6 | **Campus student ambassadors** | "Run study missions in your dorm; get paid and get credit." | 15 ambassadors, $200/semester + free Pro **[ASSUMPTION]** | Launch + 1 month | **Recruit Oct, activate at launch** |
| 7 | **Homeschool curriculum providers** (Demme/Math-U-See, Teaching Textbooks, Mr. D Math, Thinkwell, AoPS) | "You sell the curriculum. We grade the paper it produces. Neither of us wants to build the other." | Co-marketing → bundled add-on; 20–30% revenue share | 6–12 months | Open the conversation in Oct; expect 2027 |
| 8 | **University learning centers / TRIO** | "Your tutors triage forty students an hour. This does the triage." | Departmental site license, $3–8k/yr **[ASSUMPTION]** | 6–9 months (spring start) | Seed Sept, book January |
| 9 | **Complementary edtech** (Desmos, GeoGebra, Anki/RemNote communities) | "Non-overlapping surface — they make the artifacts, we grade the handwriting." | Integration or cross-promotion, no money | 6–12 months | Low priority |
| 10 | **Education nonprofits** (college-access orgs, AVID sites, Boys & Girls Clubs) | "Students without a tutor get the diagnosis a tutor would give." | Donated seats; case-study rights; grant co-application | 9–18 months | Relationship only |
| 11 | **School districts** | — | — | 12–18 months | **No. §1.4** |
| 12 | **National franchise HQs** | — | — | 12–24 months | **No. §1.4** |

**Weeks 1–12 in practice:** run 1–4 hard; recruit 5 and 6; open 7 and 8 with a booked
January follow-up; ignore the rest until there is an App Store listing.

**Affiliate program spec — built by Oct 30, launch-ready, not before:** unique code per
partner, 25% of first-year revenue, 60-day cookie, monthly Stripe/PayPal payouts, and —
entirely acceptable at this stage — a monthly emailed statement instead of a dashboard.
Do not build software for this until there are 20 active affiliates. **[ASSUMPTION on
rates; confirm against unit economics.]**

---

## 7. Community-led motion

### 7.1 The rule

**Four weeks of contribution before the product is mentioned once, in every community.**
No exceptions, no "this one's different."

The founder participates under his own name with a profile that says what he is
building, so nothing is concealed — but the *posts* give value and do not link. The link
appears only when (a) someone asks what you're building, (b) a moderator approves a
launch or AMA post, or (c) a thread is directly about the problem and the disclosure is
explicit: *"I build a product in this space, so discount me accordingly."*

Having a working build makes this harder to resist and more damaging to get wrong. The
discipline matters more now, not less.

### 7.2 Target communities

| Community | Approx size **[ASSUMPTION]** | Rules reality | Contribution mode | Mention allowed |
|---|---|---|---|---|
| r/matheducation | ~40k | Friendly to practitioners, hostile to promo | Answer pedagogy questions with real specificity | Week 5+, AMA with mod permission |
| r/Teachers | ~2M | Zero tolerance for self-promo, aggressive mods | Comment only; never post about the product | Never post; respond only if asked |
| r/homeschool | ~200k | Moderate; vendor flair sometimes required | Curriculum and math-help answers | Week 5+, disclosed |
| r/HomeschoolMath, state homeschool subs | small | Warm | Answer directly | Week 4+ |
| r/ScienceTeachers | ~50k | Practitioner-friendly | Lab and assessment threads | Week 5+ |
| r/learnmath | ~500k | Answer-focused | **Answer questions without giving the answer** — model the product's behavior in public | Week 6+ |
| r/Sat, r/ACT, r/APStudents | large, teen-heavy | **Minors present** | Content help only. **Never DM, never recruit** | Do not promote |
| r/Mcat, r/LSAT, r/step1, r/GMAT | 100k–400k | Promo bans strictly enforced | Study-strategy answers | Only via mod-approved AMA |
| r/tutor | ~30k | Small, practitioner | Business and pedagogy answers | Week 4+, disclosed |
| r/edtech, r/EdTechStartups, r/SaaS | ~30k each | Tolerant of build-in-public | Build logs with numbers | Week 1 |
| FB: "AP Calculus Teachers", "AP Biology Teachers", state math teacher groups | 10k–60k each | Admin approval required for anything vendor-ish | Answer first; **ask admins before mentioning** | Week 4, with permission |
| FB: homeschool math groups, Classical Conversations regional groups | varies | Very promo-sensitive, very word-of-mouth-driven | Be a useful voice, not a vendor | Week 5, with admin permission |
| Discord: Study Together, exam-specific servers | 100k–1M | Promo channels exist — use them properly | Study in public; post in the designated channel | Week 2, correct channel only |
| X / Bluesky #MTBoS | — | Open | Build in public daily | Week 1 |

**Absolute rule: no direct messages to anyone who might be a minor, in any channel.** On
r/Sat, r/ACT and r/APStudents we contribute and never recruit. If a student DMs us first,
answer the academic question and do not pitch.

### 7.3 What the founder actually posts

Five recurring formats, ~6 posts and ~15 substantive comments per week:

1. **"Answer without answering."** In r/learnmath and exam subs, reply to a stuck student
   by locating their error and asking one question — never a solution. This *is* the
   product, performed by a human, in public. It is the best marketing asset available and
   it costs nothing but the hours we have.
2. **Build-in-public log** (X/Bluesky/LinkedIn, 3×/week): one decision and its tradeoff,
   with a number. *"Removed the 'show solution' button. Session length dropped 14%.
   Retention on day 7 went up 9. Posting both numbers because the first one is the
   uncomfortable one."*
3. **The refusal series.** "Things we decided not to build": a solve button, a punishing
   streak, an essay generator, a chat box. Educators share these.
4. **Research summaries.** One paragraph each on productive failure, desirable
   difficulties, retrieval practice — with citations, no product mention. Repurpose the
   six existing blog posts.
5. **Ask real questions.** *"Teachers: when a student photographs their work, what's the
   first thing you want the software to say?"* Then ship an answer and credit the person
   publicly by name. Do this at least twice in twelve weeks.

### 7.4 The AMA

Target: **r/matheducation and r/homeschool, week of Sep 14**, plus one Discord AMA in
Study Together. Message mods 10 days ahead:

> Hi — I've been commenting here since early August (u/{{handle}}). I build a study tool
> that reads handwritten work and deliberately refuses to output the answer, and I'd like
> to do an AMA about the design tradeoffs, including the ones I'm getting wrong. No links
> unless someone asks, and I'll flair it however you want. Would that be welcome, or
> would you rather I didn't?

Title: **"I built an AI study app that refuses to give students the answer. AMA,
including about why that might be a bad idea."**

Bring the actual failure modes: how often the handwriting read is wrong, a decision you
reversed because a teacher told you to, and a number you're not proud of. Self-criticism
is the price of admission in these rooms, and here it is also true.

### 7.5 Handling "is this just another AI homework app?"

It will come up in every thread. Under 100 words, always the same, never defensive:

> Fair question — most of them are.
>
> The test is simple: ask it for the answer. It can't produce one. There's no solve
> button, no "show me," no chat box you can talk into giving it up. It reads what the
> student wrote, names the line where the reasoning changed direction, and makes practice
> out of that skill.
>
> If we're wrong, we'll be wrong in an obvious direction: some students will find it
> annoying and leave. We decided that was the better failure.

**Variant — accused of anti-AI marketing spin:**
> We're an AI company. The model reads handwriting, which is genuinely hard, and
> localizes an error inside someone else's method, which is harder than generating a
> correct solution from scratch. We spent the capability on diagnosis instead of
> generation. That's a claim about where the value is, not a moral pose.

**Variant — "kids will just photograph someone else's work":**
> Some will. That's a real hole and I'm not going to pretend it isn't. What it buys them
> is feedback on work they didn't do, which is worthless to them — there's no answer at
> the end to copy onto the assignment. The incentive to game it mostly evaporates when
> gaming it produces nothing you can hand in.

---

## 8. PR and earned media

### 8.1 The story

*A company deliberately built AI that refuses to give students the answer, and shipped it
in the week American schools started, in the third year of a national argument about AI
and cheating.*

Real peg, contrarian shape, and — as of mid-August — an actual product a reporter can
install. That last part changes the pitch from a thesis to a demonstration, which is the
difference between a reply and silence.

Sequence: **newsletters and podcasts in August** (they need content weekly and they
reply), **op-ed in September**, **news outlets in October** with cohort numbers attached.

### 8.2 Target list

Verify current beats before sending — reporters move.

| Outlet | Angle | Note |
|---|---|---|
| **EdSurge** | Product and pedagogy; runs contributed pieces | Best first target |
| **Education Week** | K-12 classroom AI; Alyson Klein, Lauraine Langreo, Mark Lieberman cover ed-tech/AI | Slow, credible, teacher-read |
| **The Hechinger Report** | Jill Barshay's *Proof Points* is explicitly about learning-science evidence — the single best fit here | Pitch the research, not the company |
| **The 74** | AI-and-cheating coverage; opinion section open to practitioners | |
| **Chalkbeat** | Local/district lens | Only once a named school is using it |
| **K-12 Dive** | Industry/product news | Easiest placement, lowest reach |
| **Inside Higher Ed** | Higher-ed AI and academic integrity; "Views" takes op-eds | Good for the learning-center ICP |
| **TechCrunch** | Education covered opportunistically, no dedicated beat | Only at funding or App Store launch. Do not spend August here |
| **Forbes / Fast Company** | Contributor-led; Natalie Wexler writes on AI and learning | Op-ed path |
| **Newsletters** | Edtech Insiders (Alex Sarlin, Ben Kornell); e-Literate (Michael Feldstein); Phil Hill's *On EdTech*; Michael Horn's *The Future of Education*; Matt Tower's ed-tech newsletter; Craig Barton's *Tips for Teachers* (UK, huge math-teacher reach) | **Start here. Newsletters reply; newspapers don't** |
| **Podcasts** | Edtech Insiders; Class Disrupted (Michael Horn / Diane Tavenner); Mr Barton Maths; Math Therapy (Vanessa Vakharia); Cult of Pedagogy; The Learning Scientists; Teaching in Higher Ed | Pitch 10, expect 2–3 |

### 8.3 The pitch emails

Individually sent from `griffin@lunesynth.com`. Plain text, no attachments, no embargo
language, subject under 8 words.

**Pitch — reporter**

> Subject: an AI study app that can't give the answer
>
> {{First name}} — your piece on {{specific article, and in one clause what you actually
> took from it}} is why I'm writing to you rather than to a list.
>
> I've shipped Lune Synth into beta this month. Students solve problems on paper,
> photograph the page, and the system finds the exact step where the reasoning broke and
> generates targeted practice for that skill. It has no ability to output the finished
> answer — not a setting, not a jailbreakable chat box. The capability isn't there.
>
> Why I think this is a story rather than a press release: every current answer to AI
> cheating is detection, proctoring, or bans, and all three are losing. Almost nobody is
> arguing that the fix is to build AI that is deliberately less capable at the thing
> students want most. We're betting a company on that, in the school year where the
> argument is hardest to make.
>
> {{One number: "N educators are running it with students right now" / "N students
> reworked problems by hand through it in September."}}
>
> I can put it on your phone in two minutes, put you on the phone with teachers and
> tutors using it, show you the system failing as well as working, and tell you how often
> the handwriting read is wrong.
>
> Worth fifteen minutes?
>
> Griffin Rutherford
> Founder, Coherascent Labs · lunesynth.com · {{phone}}

**Pitch — newsletter or podcast**

> Subject: guest idea — "AI that refuses to answer"
>
> {{First name}} — {{one true sentence about a recent issue or episode}}.
>
> Guest angle: I run Coherascent Labs, and we've just shipped a study app whose defining
> feature is a refusal. It reads a student's handwritten work, localizes the error, and
> builds practice — and it cannot produce a solution. Counter-positioned directly at
> Photomath, Gauth and general-purpose chatbots.
>
> Things I can be specific and non-promotional about: why localizing an error inside
> someone else's method is a much harder ML problem than generating a correct one; where
> our system fails; what thirty educators told us they needed instead of what we built;
> and the business risk of shipping a product that is deliberately less satisfying.
>
> Happy to send a one-pager, or just talk.
>
> Griffin

### 8.4 Press kit outline

`lunesynth.com/press`, live **Fri Aug 28, 2026**.

1. **Boilerplate** — Coherascent Labs and Lune Synth in 60 words, copy-pasteable.
2. **The one-line story** — "AI that reads your handwriting and refuses to give you the answer."
3. **Founder bio** (75 words) and a high-res, unretouched headshot.
4. **Product explainer** — the loop in five steps with the real calculus example
   (attempt → observation → hint → next mission), plus a paragraph on what it
   deliberately cannot do.
5. **Screenshots** — 6 images from `mobile-app-assets/screenshots/applied/question-prompts/`,
   direct download, no form.
6. **Logo pack** — light/dark, PNG + SVG, usage note.
7. **The research position** — three paragraphs on productive failure, desirable
   difficulties, and retrieval practice, using citations already in the blog posts.
8. **Beta facts, updated monthly** — educators, students, subjects, states, install count.
9. **Quotes available on request** — 3 pre-cleared cohort quotes with names and roles.
10. **Contact** — a real email and a real phone number a person answers.
11. **"What we get wrong"** — what the system fails at and how often. Reporters will ask;
    volunteering it is a genuine credibility advantage in a category built on overclaiming.

### 8.5 The op-ed

**Title:** *"The fix for AI cheating isn't detection. It's building AI that can't do the
work."*

**Argument, 900 words:**
1. Schools are in year three of detection, proctoring and bans. Detectors misfire,
   accusations destroy trust, bans lose.
2. Both failure modes are worse than admitted: the cheating one, and the sincere student
   who reads AI explanations for an hour and mistakes fluency for understanding.
3. The learning science isn't ambiguous — retrieval, generation and desirable difficulty
   are where learning lives, and frictionlessness removes all three.
4. So the design question isn't "how do we catch them." It's "what should the machine be
   forbidden to do."
5. Concrete: a system that reads a student's own handwriting, names the line where the
   reasoning broke, and refuses to produce a solution. Harder to build than an answer
   generator and less immediately satisfying to use.
6. Cost, stated honestly: this is a worse business in the short term. Some students will
   leave for the app that just tells them.
7. Close: we should be asking edtech vendors what their products *refuse* to do.

**Placement order, exclusive, 10 business days each:** EdSurge → The 74 → Education Week
Opinion → Inside Higher Ed Views → self-publish to `lune-synth/blog/` and LinkedIn.
**Draft by Fri Aug 28; first submission Tue Sep 1.**

---

## 9. Weekly operating cadence

### 9.1 The time block — 32 hrs/week

| Day | Time | Hrs | Block | Weekly output target |
|---|---|---|---|---|
| **Mon** | 08:00–11:00 | 3.0 | List research and enrichment | 150 researched contacts |
| | 11:00–12:00 | 1.0 | Reply handling | inbox to zero |
| | 13:00–15:00 | 2.0 | Cold sending, hand-personalized | 50 emails |
| | 15:00–16:00 | 1.0 | Community: comments and answers | 5 substantive comments |
| **Tue** | 08:00–10:00 | 2.0 | Cold sending | 50 emails |
| | 10:00–11:00 | 1.0 | Reply handling | — |
| | 13:00–16:00 | 3.0 | **Calls** — onboarding and cohort | 6 calls |
| | 16:00–17:00 | 1.0 | LinkedIn: connects + follow-ups | 75 touches |
| **Wed** | 08:00–10:00 | 2.0 | Cold sending | 50 emails |
| | 10:00–11:00 | 1.0 | Reply handling | — |
| | 14:00–18:00 | 4.0 | **Walk-ins** — tutoring and prep centers | 6 visits |
| **Thu** | 08:00–10:00 | 2.0 | Cold sending | 50 emails |
| | 10:00–11:00 | 1.0 | Reply handling | — |
| | 13:00–16:00 | 3.0 | **Calls** — onboarding and cohort | 6 calls |
| | 16:00–17:00 | 1.0 | Creator DMs + build-in-public post | 45 DMs, 1 post |
| **Fri** | 08:00–09:00 | 1.0 | Reply handling + suppression hygiene | — |
| | 09:00–11:00 | 2.0 | Cohort feedback synthesis, changelog, case-study interviews | — |
| | 11:00–12:00 | 1.0 | PR pitches + partnership conversations | 5 pitches |
| | 12:00–12:30 | 0.5 | **Weekly review** | scoreboard filled |
| | | **32.5** | | |

**Steady-state weekly volume:** 200 hand-personalized first-touch cold emails, ~350
automated or scheduled follow-ups, 75 LinkedIn touches, 45 creator DMs, 6 walk-in visits,
12 calls, 5 community sessions, 3 build-in-public posts, 5 PR pitches.

**If the week is compressed to 20 hours**, cut in this order: community (1h), LinkedIn
(1h), PR (1h), list research to 2h, cold sending to 4h total. **Never cut calls, reply
handling, or cohort feedback.** Those three are the entire program; the rest is top of
funnel that can be rebuilt.

**If 40 hours are available**, add in this order: a second walk-in afternoon (+4h,
highest ROI), +2h calls, +2h cold sending.

### 9.2 The weekly review — Friday 12:00, ten fields, same doc every week

Contacts researched · first-touch emails sent · replies · positive replies · calls booked
· calls held · installs (by TestFlight group) · Founding Cohort signed (cumulative vs.
target) · bounce % · **the one sentence a prospect said this week that should go on the
landing page.**

### 9.3 Tracking system

**Tool: Airtable free tier, or Attio free tier.** Not a raw spreadsheet past week 3 — the
4-hour reply SLA needs views and reminders. Not HubSpot or Salesforce; setup eats a week
you should spend on calls. **$0 path: Google Sheets with five saved filter views and a
daily calendar reminder.** **[ASSUMPTION]**

**Object: Contact.** Fields:

`first_name` · `last_name` · `email` · `email_status` (verified / risky / bounced) ·
`linkedin_url` · `phone` · `icp_segment` (homeschool-coop / tutor / local-center /
hs-teacher / test-prep / learning-center / creator / media / researcher / adult-learner) ·
`channel` (warm / cold-email / walk-in / linkedin / dm / community / inbound / referral) ·
`warm_source` · `org` · `city` · `state` · `subjects` · `est_students` ·
`personalization_note` (the one true researched fact) · `sequence` · `first_touch_date` ·
`last_touch_date` · `status` · `next_action` · `next_action_date` ·
`testflight_group` · `installed_date` · `tier` (founding / charter / tester) ·
`referred_by` · `referrals_sent` · `referrals_converted` · `suppressed` · `notes`

**Status pipeline, strictly ordered:**

`Not started` → `Sequenced` → `Replied` → `Positive` → `Call booked` → `Call held` →
`Installed` → `Charter` → `Founding` → `Advocate`
Terminal: `Not now ({{revisit date}})` · `Not a fit` · `Unsubscribed` · `Bounced`

**Five views, built Thu Aug 6:**
1. **Needs a reply** — status = Replied, last_touch > 4 hrs. Empty by 17:00 daily.
2. **Positive but not installed** — the most valuable list in the company. Work it daily.
3. **Calls this week.**
4. **Cohort health** — tier = founding, sorted by days since contact. >10 days = text them.
5. **Weekly scoreboard** — counts by status, this week vs. last.

---

## 10. Weeks 1–12 — dated plan with numeric targets

All weeks start Monday. Deadlines are end-of-day Friday unless dated. Cumulative
partner and install targets restate §5.4.

### 10.1 Volume targets per week

| Wk | Dates | Cold 1st-touch | Warm msgs | LinkedIn | DMs | Walk-ins | Calls held | Installs (cum.) | Founding (cum.) | Charter (cum.) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Aug 3–7 | 0 | 120 | 60 | 0 | 0 | 4 | 5 | 1 | 2 |
| 2 | Aug 10–14 | 60 | 140 | 75 | 20 | 4 | 8 | 25 | 3 | 6 |
| 3 | Aug 17–21 | 150 | 100 | 75 | 45 | 6 | 12 | 90 | 7 | 20 |
| 4 | Aug 24–28 | 200 | 40 | 75 | 45 | 6 | 14 | 200 | 12 | 38 |
| 5 | Aug 31–Sep 4 | 250 | — | 75 | 45 | 6 | 14 | 340 | 16 | 55 |
| 6 | Sep 7–11 | 250 | — | 60 | 45 | 4 | 12 | 490 | 19 | 70 |
| 7 | Sep 14–18 | 300 | — | 75 | 60 | 6 | 14 | 660 | 22 | 84 |
| 8 | Sep 21–25 | 350 | — | 75 | 60 | 6 | 14 | 840 | 25 | 96 |
| 9 | Sep 28–Oct 2 | 350 | — | 75 | 60 | 6 | 12 | 1,020 | 27 | 106 |
| 10 | Oct 5–9 | 350 | — | 75 | 60 | 6 | 12 | 1,220 | 29 | 114 |
| 11 | Oct 12–16 | 350 | — | 75 | 60 | 6 | 12 | 1,380 | **30** | 118 |
| 12 | Oct 19–23 | 340 | — | 60 | 60 | 6 | 10 | **1,500** | 30 | **120** |
| | **Total** | **2,950** | **400** | **855** | **560** | **62** | **138** | | | |

Cold first-touch total of 2,950 plus ~250 re-sends to bounced-and-corrected addresses
reaches the 3,200 planned in §4.10.

### 10.2 Week-by-week focus and hard deadlines

**Week 1 — Aug 3–7. Infrastructure, warm list, and the pre-launch window.**
Focus: build everything that must exist before a build lands, and mine the warm network
while there is nothing else to do.
- **Tue Aug 4:** 3 cold domains registered. Resend waitlist exported to CSV. Google Maps
  walk-in list of 60 local centers built and route-grouped.
- **Wed Aug 5:** SPF/DKIM/DMARC verified on all sending domains; inbox warmup running.
  LinkedIn headline and Featured section rewritten. TestFlight groups created in App
  Store Connect (all 11 from §2.3).
- **Thu Aug 6:** CRM built with all fields and 5 views. Community accounts created;
  first build-in-public post published.
- **Fri Aug 7:** **400-contact warm list complete and tiered.** 120 warm messages sent.
  4 calls held. First 3 blog posts scheduled for community re-share.

**Week 2 — Aug 10–14. Build lands. Everything switches to "install it."**
- **Day the build clears Beta App Review:** email the entire Resend waitlist (Template A6)
  within 4 hours. Post to LinkedIn and X the same day. **This is the highest-value hour
  of the quarter.**
- **Mon Aug 10:** `cta-config.js` app mode live on all 43 landing pages **[D4 — chase this
  daily; the site converting to "Get the beta" is worth more than a week of sending]**.
- **Wed Aug 12:** first walk-in afternoon, 4 centers, app on the phone.
- **Fri Aug 14:** 3 Founding Cohort signed, 6 Charter, **25 installs**. Cold Sequences A
  and B loaded and verified. 140 warm messages sent.

**Week 3 — Aug 17–21. Cold sending begins; school year opens across the South.**
- **Mon Aug 17:** first cold sends, 30/day ramping to 50. Sequence A (tutors) and B
  (co-ops) live.
- **Wed Aug 19:** walk-ins, 6 centers.
- **Fri Aug 21:** **7 Founding, 20 Charter, 90 installs.** Bounce rate confirmed <2%.
  8 newsletter and podcast pitches sent.

**Week 4 — Aug 24–28. Sequence C launches; program page and press kit ship.**
- **Mon Aug 24:** Sequence C (high-school teachers) live, timed to the first full week of
  school in most of the country.
- **Fri Aug 28:** `/founding-cohort` page live with ≥12 named members. `/press` live.
  Op-ed drafted. **12 Founding, 38 Charter, 200 installs.**

**Week 5 — Aug 31–Sep 4. Full rate; first cohort feedback compounding.**
- **Tue Sep 1:** op-ed submitted to EdSurge (exclusive, 10 business days).
- **Wed Sep 2:** first cohort changelog email — every change attributed by name.
- **Fri Sep 4:** **16 Founding, 55 Charter, 340 installs.** First 3 testimonials
  requested. Decide on the $97 sequencer based on whether follow-ups are slipping.

**Week 6 — Sep 7–11. Labor Day week; review checkpoint.**
- **Mon Sep 7:** Labor Day — no sends. Use the day for case-study interview #1.
- **Fri Sep 11:** **19 Founding, 70 Charter, 490 installs.** **Kill-criteria review
  (§10.3) — this is the go/no-go on the current list and copy.** 10 reporter pitches sent.

**Week 7 — Sep 14–18. AMA week; creator motion scales.**
- **Mon Sep 14:** mod-approved AMA posted in r/matheducation. Discord AMA midweek.
- **Fri Sep 18:** **22 Founding, 84 Charter, 660 installs, 540 students represented.**
  Second cohort changelog. 20 creators in beta with named group links.

**Week 8 — Sep 21–25. Partnerships open.**
- **Tue Sep 22–Thu Sep 24:** 6 partnership intro calls — tutoring companies, regional
  test-prep firms, one homeschool curriculum provider.
- **Fri Sep 25:** **25 Founding, 96 Charter, 840 installs.** Case study #1 drafted.
  Fresh TestFlight build shipped (Aug 14 build expires Nov 12; do not wait).

**Week 9 — Sep 28–Oct 2. Learning-center seeding; second case study.**
- **Wed Sep 30:** 40 college learning-center and TRIO contacts emailed, each with an
  explicit January follow-up offer. Book at least 8 January calls.
- **Fri Oct 2:** **27 Founding, 106 Charter, 1,020 installs.** Case study #2 interview
  recorded.

**Week 10 — Oct 5–9. Referral engine and affiliate recruiting.**
- **Wed Oct 7:** referral push to every active partner — 150 referral asks, target 40
  seats redeemed.
- **Fri Oct 9:** **29 Founding, 114 Charter, 1,220 installs.** 20 creator affiliates
  recruited for launch. Third cohort changelog.

**Week 11 — Oct 12–16. Target week.**
- **Fri Oct 16:** **30 Founding Cohort — CAP REACHED, PRIMARY TARGET.** 118 Charter,
  1,380 installs, 880 students represented. If short, extend calls into Sat Oct 17.
  Deep-tier recruiting stops here permanently.

**Week 12 — Oct 19–23. Consolidate and convert to launch assets.**
- **Wed Oct 21:** cohort survey closed; "would recommend" ≥60% required.
- **Fri Oct 23:** **120 Charter, 1,500 installs, 900 students.** 4 case studies published.
  8 testimonials cleared for the site and ad creative. November–December launch outreach
  plan written. App Store launch-week sequence drafted for all 150 partners.

### 10.3 Kill criteria — checked at the Week 6 review, Fri Sep 11

- **Cold reply rate <6% after 800 hand-personalized sends** → the list is wrong, not the
  copy. Stop sending, rebuild from a narrower source, restart Week 7.
- **Bounce >4%** → stop all sends same day, re-verify, re-warm.
- **Spam complaints >0.3%** → pause sequences, rewrite the first email, resume at half
  volume.
- **Positive reply → install <45%** → the problem is TestFlight friction, not outreach.
  Move every positive reply to a live install call for two weeks.
- **Call → partner <45% after 25 calls** → the onboarding script or the offer (D1) is
  wrong. Rewrite the script before sending another email.
- **Fewer than 15 Founding partners by Sep 11** → cut community, PR and LinkedIn blocks
  for two weeks and move all 8 hours into walk-ins and calls. Walk-ins convert ~10× cold
  email; when behind, concentrate where the conversion is.
- **Day-7 retention among installed testers <25%** → **stop all top-of-funnel outreach for
  one week.** Filling a leaking bucket with 1,500 people is how a pre-launch company burns
  its only warm audience. Fix the product, then resume.

---

## 11. What this program hands to the rest of the company by Oct 23

1. **150 named educator partners** and **1,500 installed testers** — the App Store launch
   cohort, and the only pre-launch proof of value that exists.
2. **900 students** with real handwritten work in the system: the training and evaluation
   signal the research pillar needs.
3. **8 cleared testimonials and 4 case studies** — inputs to the homepage, the 43 campaign
   landing pages, and the 26 Meta ad creatives.
4. **A verbatim vocabulary file:** every exact sentence a tutor, teacher or co-op leader
   said on a call about the problem. Worth more to the paid-ads workstream than any
   copywriter, and it costs nothing but writing things down during calls you were having
   anyway.
5. **Channel attribution via TestFlight groups** — proof of which channels produce
   installs, available immediately and free, and a hard evidence base for prioritizing
   D5 (`/api/waitlist` source capture) and the analytics workstream.
6. **One earned-media placement or op-ed** to link from the press kit, the ads, and every
   cold email footer thereafter.
