# 03 — Organic Content & SEO Program

**Owner:** Griffin Rutherford
**Window:** Aug 3 – Nov 22, 2026 (weeks 1–16)
**Product status:** TestFlight beta ships ~Aug 10–17, 2026. Content and email are written against a **real, usable product** — real screenshots, real feedback examples, real tester quotes.
**Budget reality:** paid is under $1,000/mo (~$30/day). **Organic is the primary acquisition channel, not a supporting one.** This plan is weighted accordingly and is deliberately more aggressive than a typical solo-founder program.
**Time reality:** 20–40 hrs/week, solo. Time is abundant relative to money, so labor-intensive organic work is the correct trade. Hours are budgeted explicitly in §8.

Voice rule for everything below: restrained, precise, respects the learner. We do not sell urgency. We make an argument and let it be checked. No "unlock," no "hack," no "10x," no exclamation points in subject lines.

---

## 0. Corrections to the brief, verified against the repo

| Brief said | Reality |
| --- | --- |
| 33 landing pages | **43.** 20 `/study/`, 13 `/test-prep/`, 5 `/for-parents/`, 4 `/for-students/`, 1 `/for-families/`. Confirmed: `lune-synth/campaign/pages.json` is a 43-element array. |
| — | The 10 audience pages (`/for-parents/*`, `/for-students/*`, `/for-families/homeschool/`) are the **highest commercial-intent pages on the site** and currently receive zero blog traffic. Primary destination for Pillar 5. |
| Waitlist = months-long holding pen | **No longer true.** The waitlist is a short invite queue. The email program's critical job is now *getting an installed tester to first value*, not keeping someone warm. See §6. |
| — | `docs/lune-campaign-phone-footage-plan.md` says "42 campaign landing pages." One has been added since. Fix that count when the doc is next touched. |

---

## 1. Content pillars

Five on-site pillars. A sixth (founder/research POV) lives off-site — §5.

### Pillar 1 — The anti-answer-engine thesis
**The belief:** general-purpose AI is optimized to produce the answer, and that is close to the worst possible default for learning, because in learning the output is not the point.

- **Audience:** teachers, school leaders, edtech press, other founders, thoughtful parents.
- **Funnel stage:** top. The linkable, quotable, PR-able pillar. It earns citations and the right to an opinion; it is not measured on this week's signups.
- **Conversion path:** post → in-article waitlist/TestFlight CTA. Converts on *belief*, not need — lowest volume, highest retention, and the source of nearly every inbound press and pilot conversation we'll get.
- **Existing anchors:** `ai-is-breaking-how-we-learn`, `an-answer-is-not-feedback`, `the-classroom-does-not-need-another-screen`.
- **Not yet said:** the assignment-design argument (what teachers should assign now), and a citable plain definition of "anti-slop."

### Pillar 2 — Productive struggle
**The belief:** the studying that feels productive usually isn't; friction is where learning was hiding.

- **Audience:** students, grade 9 through graduate.
- **Funnel stage:** top-to-mid. The volume pillar — "how to study X," "why can't I do the problems," "how to review a wrong answer."
- **Conversion path:** post → contextual link to the matching `/study/<subject>/` or `/test-prep/<exam>/` → that page's `#join-beta`. Two hops, both intent-preserving.
- **Rule:** every Pillar 2 post names a *specific* subject or exam in the title. Generic "how to study better" posts don't rank and don't route.

### Pillar 3 — The hand and the page
**The belief:** the friction of the pencil is not the tax you pay to learn; it's the thing you're paying for.

- **Audience:** parents, teachers, curriculum people, the handwriting-in-schools press cycle.
- **Funnel stage:** top. Our most defensible differentiator and the one nobody else is arguing. Reliably attracts links.
- **Conversion path:** post → homepage `/#platform-title` → beta. The one pillar where the homepage beats a landing page, because the homepage *shows* handwriting capture.
- **Existing anchor:** `why-handwriting-still-wins`.
- **Extension:** move from "handwriting helps memory" (done) to **"handwriting is evidence"** — the page is the only artifact showing what the student actually thought. That reframe connects the pillar to the product.

### Pillar 4 — What real feedback is
**The belief:** an answer is information; feedback is information about something the learner actually did. Good feedback is *smaller* than an answer.

- **Audience:** serious students, tutors, test-preppers, teachers.
- **Funnel stage:** mid. Highest intent-to-product fit — someone searching "how to review a missed SAT question" is describing our core loop back to us.
- **Conversion path:** post → `/test-prep/<exam>/` or `/study/<subject>/` → beta. Also the best pillar for an in-article demo using the same `attempt` / `observation` / `hint` / `nextPractice` structure the landing pages already use.
- **Post-TestFlight upgrade:** this pillar can now show **real app output on real student handwriting**. That is a moat no competitor's blog can copy, and it should appear in every Pillar 4 post from Aug 20 onward.

### Pillar 5 — The parent's dilemma
**The belief:** the parent is not confused about whether AI homework help is bad. They are confused about what to do on a Tuesday night at 9pm.

- **Audience:** parents of grade 6–12 students; homeschool parents.
- **Funnel stage:** mid-to-bottom. Highest commercial intent on the site. Parents buy; students adopt.
- **Conversion path:** post → `/for-parents/ai-and-homework/`, `/for-parents/homework-help/`, `/for-parents/math-help/`, `/for-parents/middle-school-math/`, `/for-parents/high-school-math/`, `/for-families/homeschool/` → beta.
- **Existing anchors: none.** **Zero blog coverage today, six dedicated landing pages waiting.** Largest single gap in the program, and the reason this calendar publishes a parent post every Saturday without exception.
- **Tone constraint:** never scold, never scare. The parent already feels guilty. The post's job is to give them one thing to say and one thing to do.

**Target mix across 48 posts:** P5 33% (16) · P2 29% (14) · P4 19% (9) · P1 15% (7) · P3 4% (2). Volume pillars carry the calendar; P1 and P3 carry the reputation.

---

## 2. Editorial calendar, weeks 1–16

### Cadence: 3 posts/week, and why

**Tuesday · Thursday · Saturday.** 48 posts by Nov 21.

Each day has one fixed job, which is what makes the cadence survivable — there is never a decision about what to write, only which item on the list:

- **Tuesday = the student.** Long-tail informational SEO, subject- or exam-specific. Published Tuesday because that's when someone searches "how to study for my calc test."
- **Thursday = the argument.** Thought leadership, feedback craft, build-in-public. Published Thursday because edtech discourse on X/LinkedIn peaks Thu–Fri, and because these are the posts that get shared rather than found.
- **Saturday = the parent.** Every Saturday, without exception, for sixteen weeks. Parents read on weekends, and Pillar 5 has six landing pages and no content.

**Why three and not two.** Paid is capped at ~$30/day, which buys almost no learning and no volume. Organic has to carry acquisition, and organic in education queries is a volume-and-patience game — 48 indexed, internally linked posts is roughly the threshold where a new domain starts compounding rather than trickling. At two per week we reach that threshold in February; at three we reach it in November, which is the difference between entering next spring's test season with authority and entering it cold. The founder has the hours (§8 budgets 10.5 of them to writing). This is the correct place to spend the surplus.

**Sustainability guard:** if a week must be cut, cut **Tuesday** and keep Thursday and Saturday. Arguments and parent content compound; a "how to study statistics" post is replaceable. Never cut Saturday — it is the only pillar with commercial intent and no coverage.

### Seasonal and launch hooks this calendar is built around

| Window | Hook | Weeks |
| --- | --- | --- |
| Aug 3–21 | Back-to-school. Sun Belt districts start Aug 5–12; Midwest/West Aug 17–24. Peak "study system" volume. | 1–3 |
| **Aug 10–17** | **TestFlight beta ships.** Launch-announcement post (Thu Aug 13) + founder POV post (Thu Aug 20). Content pivots from "we believe" to "here's what it does." | 2–3 |
| Aug 24–Sep 7 | Northeast start + Labor Day (Mon Sep 7). First graded assignments come back — the parent panic moment. | 4–5 |
| Aug 29 / Sep 12 | SAT Aug 29; ACT Sep 12. **[ASSUMPTION]** — 2026 national dates unverified; confirm at collegeboard.org and act.org **by Aug 10** and shift W3/W6 posts if wrong. | 3, 6 |
| Sep 28–Oct 17 | **PSAT/NMSQT window (primary ~Oct 14).** [ASSUMPTION] Highest-intent two weeks for a junior audience and the *least* competitive, because most test-prep content ignores the PSAT — it doesn't monetize for them. It monetizes for us because it opens the SAT relationship. | 9–11 |
| Oct 3 / Oct 24 / Nov 7 | SAT Oct 3, ACT Oct 24, SAT Nov 7. [ASSUMPTION] | 10, 12, 14 |
| Oct 19–Nov 7 | Midterms + first-quarter report cards. "Grades are fine, skills aren't." | 12–14 |
| Nov 16–21 | College finals runway + Thanksgiving break. Last high-intent window before the December dead zone. | 16 |

### Calendar conventions

- **Draft due = 4 days before publish.** Tuesday drafts Friday; Thursday drafts Sunday; Saturday drafts Tuesday.
- **Publishing = the `CLAUDE.md` ritual, every time:** new post at `lune-synth/blog/<slug>/index.html`, preview card at the **top** of `data-post-list` in `lune-synth/blog/index.html`, **and** at the start of `.blog-preview` in `lune-synth/index.html` — homepage kept to the **three newest**. URL, image, tag, date, author, title, summary consistent across all three.
- **Links to** = the landing pages and existing posts each piece must link. This column is not optional; it is the entire mechanism by which the blog lifts the 43 landing pages (§3, T12).

#### Weeks 1–4 · Back-to-school + TestFlight launch

| Date | Working title | Target query | Intent | Pillar | Words | Links to | Draft due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tue Aug 4 | How to build a study system in the first two weeks of school | "how to start the school year strong", "study routine for high school" | Informational | P2 | 1,400 | `/for-students/study-consistency/`, `/study/math/` · *an-answer-is-not-feedback* | Aug 3 |
| **Thu Aug 6** | **How to review a problem you got wrong** — *cornerstone #1* | "how to review wrong answers", "how to learn from mistakes in math" | Informational | P4 | **2,600** | `/study/math/`, `/study/calculus/`, `/test-prep/sat/`, `/test-prep/act/`, `/for-students/college-study/` · *an-answer-is-not-feedback*, *why-handwriting-still-wins* | Aug 3 |
| Sat Aug 8 | Is Photomath cheating? An honest answer for parents | "is photomath cheating", "is photomath bad for learning" | Parent-intent | P5 | 1,700 | `/for-parents/ai-and-homework/`, `/for-parents/high-school-math/` · *ai-is-breaking-how-we-learn* | Aug 4 |
| Tue Aug 11 | Why you keep making careless mistakes in algebra | "careless mistakes in math", "why do i make silly mistakes in algebra" | Informational | P2 | 1,300 | `/study/algebra/`, `/study/math/` · *cornerstone (Aug 6)* | Aug 7 |
| **Thu Aug 13** | **Lune Synth is in TestFlight** — *launch announcement* | branded | Announcement | P1 | 1,200 | `/`, `/study/math/`, `/test-prep/sat/` · *welcome-to-lune-synth* | Aug 10 |
| Sat Aug 15 | My kid uses AI for homework. What now? | "my child uses ai for homework", "should i let my kid use chatgpt for homework" | Parent-intent | P5 | 1,800 | `/for-parents/ai-and-homework/`, `/for-parents/homework-help/` · *ai-is-breaking-how-we-learn* | Aug 11 |
| Tue Aug 18 | The August SAT is in eleven days. Here is the only review that helps now. | "last minute sat prep", "week before sat what to study" | Informational | P2 | 1,200 | `/test-prep/sat/` · *cornerstone (Aug 6)* | Aug 14 |
| **Thu Aug 20** | **We built an AI that refuses to give you the answer. Here is why.** — *founder POV, timed to TestFlight* | "ai study app that doesn't give answers" | Thought leadership | P1 | 2,200 | `/`, `/study/math/`, `/for-parents/ai-and-homework/` · *ai-is-breaking-how-we-learn*, *an-answer-is-not-feedback* | Aug 16 |
| Sat Aug 22 | What to say the first time your kid says "I'm just bad at math" | "my child says they're bad at math", "math anxiety in kids what to do" | Parent-intent | P5 | 1,600 | `/for-parents/middle-school-math/`, `/for-students/behind-in-math/` · *why-handwriting-still-wins* | Aug 18 |
| Tue Aug 25 | How to study calculus when you understood the lecture and can't do the problems | "i understand calculus but can't do the problems" | Informational | P2 | 1,600 | `/study/calculus/` · *cornerstone (Aug 6)* | Aug 21 |
| Thu Aug 27 | Rewriting the correct answer is not studying | "how to study after getting a test back", "what to do with a graded test" | Informational | P4 | 1,400 | `/for-students/college-study/`, `/study/math/` · *cornerstone (Aug 6)* | Aug 23 |
| Sat Aug 29 | The first graded assignment came back bad. Don't panic — do this. | "my child failed their first test", "bad grade first week of school" | Parent-intent | P5 | 1,500 | `/for-parents/homework-help/`, `/for-students/behind-in-math/` · *an-answer-is-not-feedback* | Aug 25 |

#### Weeks 5–8 · Second wave, early fall tests, first beta data

| Date | Working title | Target query | Intent | Pillar | Words | Links to | Draft due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tue Sep 1 | The illusion of fluency, explained with one chemistry problem | "why do i understand it in class but not on the test" | Informational | P2 | 1,500 | `/study/chemistry/`, `/study/organic-chemistry/` · *ai-is-breaking-how-we-learn* | Aug 28 |
| Thu Sep 3 | Homework is not the problem. Homework nobody grades is. | "is homework useless", "does homework help learning" | Thought leadership | P1 | 1,800 | `/for-parents/homework-help/` · *the-classroom-does-not-need-another-screen* | Aug 30 |
| Sat Sep 5 | Alternatives to Photomath that don't do the problem for you | "photomath alternatives", "apps like photomath that show steps" | Comparison | P5 | 1,900 | `/for-parents/ai-and-homework/`, `/study/algebra/` · *an-answer-is-not-feedback* | Sep 1 |
| Tue Sep 8 | The night before the ACT: what is worth doing and what is not | "what to do night before act", "last minute act tips" | Informational | P2 | 1,100 | `/test-prep/act/` · *cornerstone (Aug 6)* | Sep 4 |
| **Thu Sep 10** | **What the first beta testers' handwriting taught us** — *real product data* | branded / thought leadership | Build-in-public | P4 | 1,800 | `/`, `/study/algebra/`, `/study/calculus/` · *why-handwriting-still-wins* | Sep 6 |
| Sat Sep 12 | The 9pm homework fight: a script | "homework battles with child", "how to help with homework without fighting" | Parent-intent | P5 | 1,600 | `/for-parents/homework-help/`, `/for-parents/middle-school-math/` · *an-answer-is-not-feedback* | Sep 8 |
| Tue Sep 15 | How to take notes in a class you are already behind in | "how to catch up in a class", "taking notes when you're lost" | Informational | P3 | 1,400 | `/for-students/behind-in-math/`, `/for-students/college-study/` · *why-handwriting-still-wins* | Sep 11 |
| Thu Sep 17 | "Show your work" was always the right instruction | "why do teachers make you show your work" | Thought leadership | P1 | 1,700 | `/study/math/`, `/study/geometry/` · *why-handwriting-still-wins* | Sep 13 |
| Sat Sep 19 | The homeschool feedback problem | "homeschool math feedback", "how to grade homeschool math" | Parent-intent | P5 | 1,700 | `/for-families/homeschool/`, `/for-parents/math-help/` · *an-answer-is-not-feedback* | Sep 15 |
| Tue Sep 22 | How to study organic chemistry mechanisms without memorizing them | "how to study orgo mechanisms", "organic chemistry study tips" | Informational | P2 | 1,700 | `/study/organic-chemistry/`, `/study/chemistry/` · *cornerstone (Aug 6)* | Sep 18 |
| Thu Sep 24 | The error log: the oldest test-prep technique still beats every app | "sat error log", "how to keep a mistake journal" | Informational | P4 | 1,800 | `/test-prep/sat/`, `/test-prep/act/` · *an-answer-is-not-feedback* | Sep 20 |
| Sat Sep 26 | How to help with math homework you don't remember how to do | "i can't help my child with math homework" | Parent-intent | P5 | 1,600 | `/for-parents/math-help/`, `/for-parents/high-school-math/` · *cornerstone (Aug 6)* | Sep 22 |

#### Weeks 9–12 · PSAT window + midterms

| Date | Working title | Target query | Intent | Pillar | Words | Links to | Draft due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tue Sep 29 | PSAT prep when the score doesn't count (and why it still does) | "how to prepare for psat", "does the psat matter" | Informational | P2 | 1,600 | `/test-prep/psat/`, `/test-prep/sat/` · *cornerstone (Aug 6)* | Sep 25 |
| Thu Oct 1 | What a Recovery Mission is, and why we rebuilt it twice | branded / "practice after getting something wrong" | Build-in-public | P4 | 1,600 | `/`, `/study/algebra/` · *an-answer-is-not-feedback* | Sep 27 |
| Sat Oct 3 | Is my middle schooler ready for algebra? | "is my child ready for algebra", "pre algebra readiness" | Parent-intent | P5 | 1,600 | `/for-parents/middle-school-math/`, `/study/arithmetic/`, `/study/algebra/` · — | Sep 29 |
| Tue Oct 6 | How to study for a physics exam when the formulas are not the problem | "how to study for physics exam", "why can't i solve physics problems" | Informational | P2 | 1,600 | `/study/physics/`, `/study/engineering/` · *cornerstone (Aug 6)* | Oct 2 |
| Thu Oct 8 | Lune Synth vs. answer-engine study apps — an honest comparison from the people building one | "lune synth vs photomath", "best ai study app that doesn't give answers" | Comparison | P1 | 2,000 | `/study/math/`, `/for-parents/ai-and-homework/`, `/test-prep/sat/` · *ai-is-breaking-how-we-learn* | Oct 4 |
| Sat Oct 10 | Screen time isn't the metric. What the screen is for is. | "screen time for homework", "how much screen time is ok for school" | Parent-intent | P5 | 1,600 | `/for-parents/homework-help/`, `/for-families/homeschool/` · *the-classroom-does-not-need-another-screen* | Oct 6 |
| Tue Oct 13 | What a PSAT score report actually tells you | "how to read psat score report", "what does my psat score mean" | Informational | P4 | 1,500 | `/test-prep/psat/`, `/test-prep/sat/` · *cornerstone (Aug 6)* | Oct 9 |
| Thu Oct 15 | The hardest part of reading handwriting is knowing when you're wrong | "ai handwriting recognition math", technical/branded | Thought leadership | P1 | 1,900 | `/`, `/study/math/` · *why-handwriting-still-wins* | Oct 11 |
| Sat Oct 17 | Your kid's grades are fine. Their skills might not be. | "good grades but doesn't understand", "good grades bad test scores" | Parent-intent | P5 | 1,700 | `/for-parents/high-school-math/`, `/for-parents/middle-school-math/` · *ai-is-breaking-how-we-learn* | Oct 13 |
| Tue Oct 20 | A study schedule you will actually keep, five minutes at a time | "how to stick to a study schedule", "short study sessions" | Informational | P2 | 1,400 | `/for-students/study-consistency/`, `/for-students/adult-learners/` · *cornerstone (Aug 6)* | Oct 16 |
| Thu Oct 22 | How to review a missed SAT math question | "how to review missed sat questions", "sat math mistakes how to fix" | Informational | P4 | 1,500 | `/test-prep/sat/`, `/study/algebra/` · *cornerstone (Aug 6)*, *error log (Sep 24)* | Oct 18 |
| Sat Oct 24 | What to look for in an AI study tool: a checklist for parents | "best ai tutor for kids", "how to choose an ai study app" | Parent-intent | P5 | 1,700 | `/for-parents/ai-and-homework/`, all `/for-parents/*` · *an-answer-is-not-feedback* | Oct 20 |

#### Weeks 13–16 · Midterm postmortem → finals runway

| Date | Working title | Target query | Intent | Pillar | Words | Links to | Draft due |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tue Oct 27 | Midterm postmortem: how to read your own exam | "what to do after a bad midterm", "how to review a failed exam" | Informational | P4 | 1,600 | `/for-students/college-study/`, `/study/statistics/` · *cornerstone (Aug 6)* | Oct 23 |
| Thu Oct 29 | Handwriting is disappearing from school. Here is what goes with it. | "is handwriting still taught", "cursive removed from schools" | Thought leadership | P3 | 1,900 | `/study/math/`, `/study/writing/` · *why-handwriting-still-wins*, *the-literacy-crisis-is-already-here* | Oct 25 |
| Sat Oct 31 | Tutoring costs $80 an hour. Here is what it is actually buying. | "is tutoring worth it", "how much does math tutoring cost" | Parent-intent | P5 | 1,800 | `/for-parents/math-help/`, `/for-parents/high-school-math/` · *an-answer-is-not-feedback* | Oct 27 |
| Tue Nov 3 | How to study statistics when you can compute but cannot interpret | "how to study statistics", "i can do the math but don't understand stats" | Informational | P2 | 1,600 | `/study/statistics/`, `/study/psychology/`, `/study/economics/` · *cornerstone (Aug 6)* | Oct 30 |
| Thu Nov 5 | AI detectors do not work. Assignments that cannot be faked do. | "ai detectors don't work", "how to stop students using chatgpt" | Thought leadership | P1 | 2,000 | `/study/writing/`, `/for-parents/ai-and-homework/` · *ai-is-breaking-how-we-learn*, *the-classroom-does-not-need-another-screen* | Nov 1 |
| **Sat Nov 7** | **The parent's guide to AI in school, 2026 edition** — *cornerstone #2* | "ai in schools guide for parents", "how to talk to your kid about ai homework" | Parent-intent | P5 | **2,800** | all 5 `/for-parents/*`, `/for-families/homeschool/` · *ai-is-breaking-how-we-learn*, *an-answer-is-not-feedback*, *the-classroom-does-not-need-another-screen* | Nov 1 |
| Tue Nov 10 | How to study nursing pharmacology without living in flashcards | "how to study pharmacology", "nursing school study tips" | Informational | P2 | 1,600 | `/study/nursing/`, `/study/anatomy-physiology/` · *cornerstone (Aug 6)* | Nov 6 |
| Thu Nov 12 | What we mean by anti-slop | "anti-slop", "ai slop in education" | Thought leadership | P1 | 1,500 | `/` , `/study/math/` · all six existing posts | Nov 8 |
| Sat Nov 14 | How to tell if your kid is actually studying | "is my child really studying", "how to know if my kid is studying" | Parent-intent | P5 | 1,600 | `/for-parents/high-school-math/`, `/for-students/study-consistency/` · *ai-is-breaking-how-we-learn* | Nov 10 |
| Tue Nov 17 | Finals are four weeks out. Here is the only plan that works from here. | "how to study for finals in college", "4 week finals study plan" | Informational | P2 | 1,700 | `/for-students/college-study/`, `/for-students/study-consistency/` · *cornerstone (Aug 6)* | Nov 13 |
| Thu Nov 19 | Three months of beta: what we got wrong | branded / build-in-public | Build-in-public | P4 | 1,800 | `/`, `/study/math/` · *launch post (Aug 13)*, *founder POV (Aug 20)* | Nov 15 |
| Sat Nov 21 | Thanksgiving break is five days. Here is what is worth doing. | "what to study over thanksgiving break", "holiday study plan" | Parent-intent | P5 | 1,400 | `/for-parents/homework-help/`, `/for-students/study-consistency/` · *cornerstone (Aug 6)* | Nov 17 |

### Notes on the comparison posts

Two comparison pieces (Sep 5, Oct 8). TestFlight materially de-risks these — we can now compare a product that exists — but the rules still hold:

1. **No performance claims we cannot demonstrate.** No accuracy percentages, no speed claims, no "better than."
2. **Compare designs, not products.** Photomath is optimized to finish the problem; Lune Synth is optimized to find where the reasoning broke. That framing is true and durable.
3. **Disclose in the first paragraph** that the author builds one of the tools. It is the only version a skeptical reader finishes.
4. **Ship Sep 5 before Oct 8.** The "alternatives" post is a category piece that includes us last — lower risk, and its response tells us whether the head-to-head is worth writing.
5. **Still no `/vs/<competitor>/` programmatic routes.** A generated page per competitor invites a thin-content problem and a trademark complaint simultaneously. Revisit after public App Store launch, and only as hand-written pages.

### What TestFlight changes about every post from Aug 20 on

- **Real screenshots replace mockups.** Screenshot the app reading an actual student page; that image is the most persuasive asset we have and it belongs in every Pillar 4 post.
- **Real feedback examples replace hypotheticals.** The `attempt` / `observation` / `hint` / `nextPractice` block in every relevant post should be a genuine app output, labeled as such.
- **Real tester quotes** once ~20 testers have submitted work (est. early Sep). Get written permission; use first name and grade level only.
- **Every CTA changes** from "join the waitlist" to "join the beta — TestFlight link in your inbox within a day." Update the in-article CTA paragraph template and `cta-config.js` in the same commit as the Aug 13 post.

---

## 3. Technical and programmatic SEO

### Audit — verified state as of Aug 3, 2026

I grepped the repo. This is what is actually there, not what should be.

| Item | State | Evidence |
| --- | --- | --- |
| `sitemap.xml` | **Does not exist.** Anywhere. | `find . -iname "sitemap*"` → 0 results |
| `robots.txt` | **Does not exist.** | `find . -iname "robots*"` → 0 results |
| Structured data (JSON-LD) | **Zero.** Not one `application/ld+json` block in any of the 64 HTML files, nor in any generator script. | `grep -rl "application/ld+json"` → 0 results |
| `rel=canonical` | 56 of 59 non-vendor pages. **Missing:** `lune-synth/privacy/`, `lune-synth/terms/`, `lune-synth/auth/confirm/`, plus dev artifacts `index-vibe.html`, `stars-banner.html` | per-file grep |
| `og:image` | 49 pages. **Missing on the two most important pages on the site:** `lune-synth/index.html` (homepage) and `lune-synth/blog/index.html`. Also privacy, terms, auth/confirm. | per-file grep |
| `twitter:card` | On **all 43 campaign pages** (emitted by `scripts/generate-lune-campaign-pages.js:213`). **Absent from the homepage, the blog index, and all 6 blog posts.** | grep |
| Internal link graph | **One-directional and broken.** 38 campaign pages link *out* to `/blog/`. **Zero blog pages link to any campaign page.** The 43 landing pages do not link to each other at all — a campaign page's only internal hrefs are `/`, `/blog/`, `/privacy/`, `/terms/`, `#join-beta`. | `grep -rl "/study/\|/test-prep/" lune-synth/blog/` → 0 |
| Homepage weight | `lune-synth/index.html` = **548,606 bytes**, single file, 2 inline `<style>` blocks, 14 `<script>` tags. No CSS split, no minification. | `wc -c` |
| Large binaries | 25+ PNGs over 2.9 MB in `mobile-app-assets/screenshots/applied/question-prompts/`. **But:** `-mid.webp`/`-low.webp` derivatives exist and the HTML references only those — grep for full-size `.png` references in HTML/JS returns **0**. These are deploy weight, not page weight. | grep + `ls -laS` |
| Repo size | `.git` 357 MB, `mobile-app-assets` 116 MB, `lune-synth/screenshots` 293 MB. Slows every Railway deploy. | `du -sh` |
| App Store / TestFlight URL | `cta-config.js` has `appStoreUrl: ""` and `playStoreUrl: ""`. No download route exists. | file read |

**Bottom line: the site is invisible to search infrastructure.** No sitemap means 43 landing pages are discoverable only by crawl. No structured data means zero rich-result eligibility. And the blog→landing-page link graph — the thing that makes writing 48 posts worth doing — does not exist in either direction.

Given a ~$30/day paid ceiling, these are not hygiene tasks. They are the acquisition channel.

### Fix tasks

#### P0 — this week (by Fri Aug 7). Blocks everything else in this document.

| # | Task | Deadline |
| --- | --- | --- |
| T1 | Create `robots.txt` at the Lune host root: allow all, `Sitemap: https://lunesynth.com/sitemap.xml`, disallow `/api/`, `/auth/`. Matching file for coherascentlabs.com. Wire both into `server.js` host routing. | Aug 5 |
| T2 | Write `scripts/generate-sitemap.js`: reads `pages.json` (43 routes) + globs `lune-synth/blog/*/index.html` + static routes, emits `lune-synth/sitemap.xml` with `<lastmod>` from git mtime. Add `"build:sitemap"` to `package.json` and chain into `build:campaigns`. **Must be regenerated on every post publish — add it to the §7 publish ritual.** | Aug 6 |
| T3 | Add `og:image` + full Twitter card block to `lune-synth/index.html` and `lune-synth/blog/index.html`. Use `/mobile-app-assets/screenshots/applied/question-prompts/1-mid.webp` — already preloaded, on-brand. | Aug 6 |
| T4 | Add `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` to all 6 blog posts (they have `og:*` already — 4 lines each). Add to the post template so the 48 new posts inherit it. | Aug 7 |
| T5 | Add `rel=canonical` to privacy, terms, auth/confirm. Add `<meta name="robots" content="noindex">` to `auth/confirm`, `index-vibe.html`, `stars-banner.html`. | Aug 7 |
| T6 | Verify both properties in **Google Search Console** and **Bing Webmaster Tools**; submit sitemaps. **Free, and without it nothing in §2 is measurable.** | Aug 7 |

#### P0.5 — TestFlight launch week (by Fri Aug 14)

| # | Task | Deadline |
| --- | --- | --- |
| T7 | Add `betaUrl` to `lune-synth/campaign/cta-config.js` and a `/beta/` route that redirects to the TestFlight public link. Never put the raw TestFlight URL in 48 blog posts — it will change. One redirect, one place to update. | Aug 12 |
| T8 | Update `cta-config.js` copy for beta mode: `headline: "Join the beta"`, and a success message that says the TestFlight link is on its way. Single source of truth — this propagates to all 43 landing pages plus the blog on rebuild. | Aug 13 |
| T9 | Add `/beta/` to the sitemap generator's static route list, `noindex` it (it's a redirect, not a page). | Aug 13 |

#### P1 — structured data (by Fri Aug 21)

| # | Task | Deadline |
| --- | --- | --- |
| T10 | **`Organization` + `WebSite` JSON-LD** on `lune-synth/index.html` and the Coherascent root. Include a `sameAs` array of the §4 social profiles — this is how Google associates the accounts with the brand. | Aug 17 |
| T11 | **`SoftwareApplication` JSON-LD** on `lune-synth/index.html`. `applicationCategory: EducationalApplication`, `operatingSystem: iOS`. **Omit `aggregateRating` and `offers` until the public App Store listing exists** — invented ratings are a manual-action risk. | Aug 17 |
| T12 | **`Article` JSON-LD** in the blog post template: `headline`, `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization), `image`. Backfill all 6 existing posts. | Aug 19 |
| T13 | **`FAQPage` JSON-LD** on the 6 `/for-parents/*` + `/for-families/homeschool/` pages. Parent queries are question-shaped and this is the single best rich-result opportunity on the site. Requires adding a `faq: [{q,a}]` array to `pages.json` and rendering it in the generator. | Aug 21 |
| T14 | **`BreadcrumbList` JSON-LD** on all 43 campaign pages via the generator, and on blog posts. Cheap; changes how the URL renders in results. | Aug 21 |
| T15 | Add an `author` block to the blog template with a real bio linking to the Coherascent research page. An unattributed education blog in 2026 is an E-E-A-T liability. | Aug 21 |

#### P1 — internal linking architecture (by Fri Aug 28)

Highest-leverage SEO work in this document, currently at zero.

| # | Task | Deadline |
| --- | --- | --- |
| T16 | **Blog → landing pages.** Add a "Related" block to the blog post template rendering 2–4 contextual landing-page links, populated from the `Links to` column of §2. Backfill the 6 existing posts: *why-handwriting-still-wins* → `/study/math/`, `/study/calculus/`, `/study/writing/`; *an-answer-is-not-feedback* → `/study/calculus/`, `/test-prep/sat/`; *ai-is-breaking-how-we-learn* → `/for-parents/ai-and-homework/`, `/study/writing/`; *the-classroom-does-not-need-another-screen* → `/for-parents/homework-help/`, `/for-families/homeschool/`; *the-literacy-crisis-is-already-here* → `/study/writing/`, `/for-parents/middle-school-math/`; *welcome-to-lune-synth* → `/study/math/`. | Aug 24 |
| T17 | **Landing page → sibling landing pages.** Add `related: []` to each `pages.json` entry; render 3–5 sibling links in the generator footer. Clusters: **math ladder** (arithmetic→algebra→geometry→calculus→statistics) · **science ladder** (chemistry→organic-chemistry→biology→anatomy-physiology→nursing) · **college admissions** (psat→sat→act) · **grad** (gre→gmat→lsat→mcat→phd-qualifying-exams) · **health** (nursing→anatomy-physiology→mcat→usmle) · **quantitative business** (economics→accounting→finance→statistics) · **parent** (all 5 `/for-parents/*` + `/for-families/homeschool/`) · **student situation** (behind-in-math→study-consistency→college-study→adult-learners). Turns 43 orphans into 8 topical clusters. | Aug 26 |
| T18 | **Landing page → blog.** Replace the bare `/blog/` footer link with 2 contextual deep links per page via a `relatedPosts: []` field in `pages.json`. E.g. `/for-parents/ai-and-homework/` → the Aug 8 Photomath post and the Aug 15 "my kid uses AI" post. | Aug 27 |
| T19 | **Cross-audience bridges.** Every grade 6–12 `/study/` page (arithmetic, algebra, geometry, math) gets a one-line link to its matching `/for-parents/*` page and vice versa. Students and parents search differently for the same problem; the site should route between them. | Aug 28 |
| T20 | **Cornerstone hub.** The Aug 6 post is the link target for ~20 of the 48 posts. Give it a permanent nav slot in the blog template ("Start here") so it accrues site-wide internal links, not just contextual ones. | Aug 28 |

#### P2 — performance (by Fri Sep 11)

| # | Task | Deadline |
| --- | --- | --- |
| T21 | Extract the two inline `<style>` blocks from `lune-synth/index.html` into `lune-synth/home.css`, keeping only above-the-fold critical CSS inline. Target: 548 KB → under 120 KB of HTML. | Sep 4 |
| T22 | Add `defer`/`type=module` to the non-critical members of the 14 `<script>` tags. Audit which are needed for first paint. | Sep 4 |
| T23 | Baseline PageSpeed Insights (free) on `/`, `/blog/`, `/study/calculus/`, `/for-parents/ai-and-homework/`. Record LCP/CLS/INP; re-run after T21/T22. **[ASSUMPTION]** campaign pages are already fast (small, external CSS, `-mid.webp` heroes); the homepage is the likely Core Web Vitals failure. | Sep 7 |
| T24 | Move full-size PNG/MP4 masters out of the deployed tree (`git lfs` or a `masters/` dir excluded from the Railway build). 400 MB of unreferenced binaries is a build-time tax on every ship. | Sep 11 |
| T25 | Add `width`/`height` to every `<img>` missing them (CLS). Sweep all 64 files. | Sep 11 |

### The programmatic landing-page play

**Is 43 enough? No — but the answer is not more of the same shape.**

The 43 pages are structurally sound: genuinely differentiated copy per page (`problemHeadline`, `contrastBefore`/`contrastAfter`, a worked `attempt`/`observation`/`hint`/`nextPractice`), unique metadata, unique hero imagery. That is more than most programmatic sets have. Their weakness is not thinness — it is **isolation**. 43 pages with no inbound internal links and no sitemap will not rank regardless of copy quality. **T2, T16, T17, T18 matter more than page 44.**

Fix the graph first, then expand in this order:

**Tier 2 — `/features/` (7 pages, build by Sep 18).** Already specified in `docs/lune-meta-ads-and-landing-pages-expansion-plan.md` and not yet built: `constellations`, `quick-missions`, `handwritten-feedback`, `precise-feedback`, `recovery-missions`, `voice-input`, `text-input`. Highest-value next routes because: (a) post-TestFlight they can carry `SoftwareApplication` + `FAQPage` schema **honestly, with real screenshots**; (b) they are the natural link target from every post that explains a mechanic; (c) they capture mechanism searches ("app that grades handwritten math," "study app that gives hints not answers") that no subject page targets. Requires a `variant: "feature"` branch in the generator.

**Tier 3 — `/study/<subject>/<topic>/` (build 12, not 200, by Oct 30).** The real long-tail is topic-level: `/study/calculus/related-rates/`, `/study/algebra/factoring-quadratics/`, `/study/chemistry/stoichiometry/`, `/study/organic-chemistry/sn1-sn2/`, `/study/statistics/hypothesis-testing/`.

**What makes these rank rather than duplicate is the worked example — and post-TestFlight we can generate real ones.** Each page must contain a genuinely different student attempt, a genuinely different broken step, and a genuinely different recovery mission, ideally a *real* app output on a *real* handwritten page. That is the only content on the page a competitor cannot also generate. If the worked example is templated, the page is a duplicate wearing a different `<h1>` and should not be built. Budget ~45 min per page. Twelve is what one founder can author honestly by Oct 30; two hundred is what gets the directory deindexed.

**Tier 4 — `/test-prep/<exam>/<section>/` (after public launch).** `/test-prep/sat/math/`, `/test-prep/mcat/cars/`. Same worked-example rule. Deferred because test-prep SERPs are the most competitive on the internet and we should have real user results before entering them.

**Do not build:** `/vs/<competitor>/`, geo-modified routes (`/study/algebra/austin/`), or a page per exam date.

**The governing rule:** a programmatic page earns its existence if a human who searched that exact query finds something on it they could not have gotten from the parent page. Worked example, specific misconception, specific recovery. Everything else is a duplicate.

---

## 4. Organic social from zero

Verified: **no social profiles are linked anywhere in the repo.** Not in the homepage footer, the blog footer, the campaign template, or any schema. Absolute zero on every channel.

With paid capped at ~$30/day, social is not a brand-awareness nicety — it is a distribution channel we cannot buy our way around.

### Profiles to create — by Wed Aug 5

| Channel | Handle (1st choice) | Fallback | Display name | Job |
| --- | --- | --- | --- | --- |
| TikTok | `@lunesynth` | `@lunesynthapp` | Lune Synth | Student reach. Highest ceiling, lowest control. |
| Instagram | `@lunesynth` | `@lune.synth` | Lune Synth | Reels mirror + parent reach via carousels |
| YouTube | `@lunesynth` | `@lunesynthapp` | Lune Synth | Shorts mirror + long-form home for the thesis |
| X (brand) | `@lunesynth` | `@lunesynthapp` | Lune Synth | Product clips, release notes, support |
| X (founder) | `@griffinkr` | `@grutherford` | Griffin Rutherford | **The primary X account.** §5 |
| LinkedIn (company) | `/company/coherascent-labs` | — | Coherascent Labs | Institutional credibility, teacher/admin reach |
| LinkedIn (founder) | existing personal | — | Griffin Rutherford — Coherascent Labs | **The primary LinkedIn account.** §5 |
| Reddit (founder) | `u/griffin_lunesynth` | `u/grutherford_ls` | — | Disclosed participation only |
| Pinterest | `/lunesynth` | `/lunesynthapp` | Lune Synth | Study-method infographics; longest asset half-life |

**Immediately after creation (Aug 5):** put every handle into the `Organization` JSON-LD `sameAs` array (T10) **and** into the site footer in three places — `lune-synth/blog/index.html` + post template, the campaign generator footer, and `lune-synth/index.html`. A profile the site doesn't link to is a profile Google doesn't associate with the brand.

**Bio, all channels (trim to fit):**
> Learn math by doing the work — not watching AI do it. We read your handwritten steps and find the exact line where the reasoning broke. Beta open ↓

Link in bio → `/beta/` (T7), never a raw TestFlight URL.

### The production system — one session, ~21 assets

This is what decides whether any of the rest happens. Per-channel creation is not sustainable even at 40 hrs/week. The only viable model is **one filming block per week that feeds everything.**

**Sunday, 90 minutes. Fixed.**

| Block | Time | Output |
| --- | --- | --- |
| A — Screen capture | 30 min | 6–8 portrait app recordings, 7–14 sec, per the spec **already written** in `docs/lune-campaign-phone-footage-plan.md` (1206×2622, 30fps, no chassis baked in, no cursor, loop-safe, poster frame exported). That spec is production-ready; reuse it verbatim. |
| B — Desk B-roll | 20 min | 8–10 overhead shots of a hand working a real problem on paper: writing, crossing out, hesitating, photographing the page. Fixed overhead rig, one lamp. Per the external B-roll spec in the same doc. |
| C — Talking head | 30 min | 5–6 takes, 45–90 sec, one idea per take, vertical, same wall. Scripts come from that week's three blog posts (§7). |
| D — Voiceover | 10 min | 5–6 VO reads for the B-roll and screen-capture cuts |

**Weekly yield from that one block:** 4 TikToks · 4 Reels (same files) · 4 YouTube Shorts (same files) · 1 YouTube long-form (monthly, assembled from accumulated C) · 3 X video posts · 1 LinkedIn native video · 5 Pinterest pins. **~21 assets from 90 minutes of shooting.**

Post-TestFlight, Block A gets dramatically better: it is now **real app output on real handwriting**, not a mock. Record a genuine wrong attempt every week.

**Priority order if a week collapses:** TikTok → LinkedIn (founder) → X (founder) → YouTube Shorts → Instagram → Reddit → Pinterest → LinkedIn (company) → YouTube long. Kill from the bottom. Never skip the Sunday block — one missed Sunday empties the following week across seven surfaces.

### Channel plans

#### TikTok — `@lunesynth`
**Format:** overhead desk shot of a real problem worked by hand, hard cut to the app reading the page. 20–40 sec. No face required, which is what makes it repeatable. The visual hook is always *the page*, never a UI tour.
**Cadence:** 5/week (Mon, Tue, Wed, Fri, Sun), 6pm ET. Five rather than four because this is the cheapest reach available and the algorithm rewards volume from new accounts.
**Why it fits:** the "AI is ruining school" conversation is native here and currently one-sided. A product that *refuses* to give the answer is genuinely counterintuitive, and counterintuitive is the only durable hook on this platform.

First 10:
1. *"I photographed my calculus homework into an AI. It gave me the answer. Watch what ours does instead."* — split screen, same problem, two outcomes. End on the Recovery Mission.
2. *"Your teacher said show your work. Here's the actual reason."* — overhead, one derivation, circle the step where the sign flips.
3. *"This student got the right answer. The work is wrong."* — a lucky-guess problem. Shows what an answer-checker structurally cannot catch.
4. *"Five minutes. One skill. That's the whole session."* — a Quick Mission run in real time, uncut.
5. *"Reading the solution feels like studying. It is not studying."* — illusion of fluency, 30 sec, one claim.
6. *"I gave it the messiest page I could write."* — crossed-out lines, arrows, half-steps. Post-TestFlight this is a real demo, and it is the single most convincing thing we can film.
7. *"Why we will never build a solve button."* — founder to camera, 40 sec.
8. *"The three things a chatbot removes from studying."* — retrieval, generation, desirable difficulty. Text on B-roll, no face.
9. *"What a Recovery Mission is."* — miss a problem, watch what gets generated.
10. *"Ask me to do your homework. I'll show you what happens."* — the reply to the inevitable comment, posted standalone.

#### Instagram — `@lunesynth`
**Format:** Reels mirror TikTok at zero extra cost. The additive format is the **carousel** — 6–8 slides, one blog argument. Carousels reach parents; Reels reach students.
**Cadence:** 5 Reels/week (mirrored) + 3 carousels/week (Tue, Thu, Sat — one per blog post, §7).

First 10 carousels:
1. "An answer is not feedback" — 7 slides, the two-students-one-derivative comparison.
2. "Is Photomath cheating? An honest answer." — 8 slides, parent-facing, ends with the one thing to say tonight.
3. "How to review a problem you got wrong" — 8 slides, the cornerstone as a checklist. Highest save rate of the set.
4. "The illusion of fluency" — 6 slides.
5. "What to say when your kid says they're bad at math" — 6 slides, three scripts.
6. "Typing vs. handwriting: what the bottleneck does" — 6 slides.
7. "Good grades, missing skills" — 7 slides, parent diagnostic.
8. "The error log" — 6 slides, one technique fully explained.
9. "Four questions before adding another app to a classroom" — 5 slides, teacher-shareable.
10. "What we mean by anti-slop" — 6 slides, brand definition.

#### YouTube — `@lunesynth`
**Shorts:** mirror of TikTok, 5/week, zero incremental cost. YouTube search retains value far longer than TikTok's feed.
**Long-form:** 1/month, 8–14 min. The asset that gets cited, embedded, and found two years out — and the podcast audition tape (§5).
**Long-form dates:** Aug 27, Sep 24, Oct 29, Nov 19.

First 10:
1. *(Long, Aug 27)* **"We built an AI that refuses to answer your homework."** — 12 min. The Aug 20 post to camera, with real app screen capture. The flagship, and the first video that can show the shipped product.
2. *(Short)* "The homework heist, in 45 seconds."
3. *(Short)* "Why 'instant' isn't automatically good feedback."
4. *(Short)* "Watch it find the exact line where a derivation broke." — real output.
5. *(Long, Sep 24)* **"How to review a problem you got wrong"** — 10 min, three worked examples across algebra, calculus, chemistry. The most searchable long-form we can make.
6. *(Short)* "What a Constellation is." — study-goal decomposition, visually.
7. *(Short)* "Sycophancy tax: why the model never lets you sit in being wrong."
8. *(Long, Oct 29)* **"The parent's guide to AI in school."** — 14 min. Video version of the Nov 7 cornerstone, published ahead of it.
9. *(Short)* "PSAT score report: what the numbers actually mean."
10. *(Long, Nov 19)* **"Three months of beta: what we got wrong."** — 11 min, build-in-public, and the honest-founder asset that earns podcast bookings.

#### X — brand + founder
Brand account mirrors and supports: 5/week, low effort — 2 blog links, 2 clips, 1 reply into an edtech thread. **The founder account does the actual work (§5).**

#### LinkedIn — founder-led (primary), company page (secondary)
**Format:** text-first, 900–1,600 characters, one argument, no link in the body (link in first comment). Occasional native video from Block C.
**Cadence:** founder 4/week (Mon–Thu, 8:00 ET); company page 2/week.
**Why it matters disproportionately:** this is the only channel where "the classroom does not need another screen" is read by someone with a purchasing decision — teachers, principals, district technology directors, curriculum directors, edtech operators, investors.

First 10 (founder):
1. "We just shipped a TestFlight beta of an AI study app that will never give a student the answer. Here's the reasoning, and the commercial risk we're accepting."
2. "A finished essay is evidence of thinking, not the cause of it."
3. "UNESCO's 2023 GEM report found good evidence for edtech's added value is scarce. I run an edtech company. Here's what I think that means for us."
4. "Four questions every school should ask before buying another tool."
5. "AI detectors don't work. I want to talk about what does: assignments that cannot be faked."
6. "PISA 2022: 30% of students report device distraction in most math lessons. Student-led device use was *negatively* associated with performance. Teacher-led wasn't."
7. "Teachers: what do you actually assign now that a machine can do all of it? Genuinely asking." — engagement post and real research input.
8. "The hardest engineering problem in our product is not reading handwriting. It's knowing when we're not sure."
9. "31% of American fourth-graders read at NAEP Proficient. 40% are below Basic. We built a company around the belief that easier access to answers won't fix that."
10. "What the first 50 beta testers' handwriting taught us." — ~mid-Sep, once real data exists.

#### Reddit — `u/griffin_lunesynth`
**Format:** comments, not posts. **Non-negotiable rules:** disclose affiliation in any comment mentioning the product; no links for the first 30 days; never drop the product into a thread that didn't ask for a tool. Reddit has the best-calibrated promotional immune system on the internet and one violation ends the account.
**Cadence:** 8 comments/week, ~25 min. Zero posts for the first six weeks.
**Where:** r/matheducation, r/Teachers, r/homeschool, r/Professors, r/APStudents, r/Sat, r/premed, r/OrganicChemistry, r/GetStudying, r/learnmath, r/artificial (education threads).
**What to comment:** the *content*, not the pitch. Answer the actual math question. Explain the error-log method. Give the parent the sentence to say. The signature — "I build a study app in this space, so weight accordingly" — is the entire promotion.
**First real post, Mon Sep 14 (after six weeks of comment history):** r/matheducation — *"I built a tool that grades handwritten work instead of giving answers. It's in TestFlight. What would make it useless in your classroom?"* A genuine request for failure modes is both the best research input available and the only post format that survives that subreddit.

#### Pinterest — `/lunesynth`
**Format:** vertical 1000×1500 infographic pins. Lowest effort per unit, longest half-life of any channel — an October pin still drives traffic in March.
**Cadence:** 8 pins/week, batched monthly (32 pins in one 75-minute sitting, re-cropped from Instagram carousel slides already made). Zero incremental creative work.
**Boards:** Study Methods · Math Help · Test Prep · For Parents · Homeschool · Handwriting & Notes.

First 10 pins: "How to review a problem you got wrong" (7-step checklist) · "The error log template" · "5-minute study session: what fits" · "Typing vs. handwriting for notes" · "3 things a chatbot removes from studying" · "What to say when your kid says 'I'm bad at math'" · "PSAT score report, decoded" · "A study schedule that survives a bad week" · "How to catch up in a class you're behind in" · "4 questions before adding another classroom app"

---

## 5. Founder-led / POV content engine

The Coherascent research pillar is the strongest credibility asset in the company and is currently invisible outside one page on coherascentlabs.com. Three arguments compose the POV, always delivered in this order:

1. **Education integrity** (accessible to everyone): AI is pointed at the answer instead of the understanding.
2. **Learning science** (accessible to educators): retrieval, generation, desirable difficulty — and the illusion of fluency that makes bad studying feel good.
3. **The technical argument** (the differentiator): neuro-symbolic, deterministic, truth-aligned systems. *Why a product that must be right about a student's reasoning cannot be built the way a chatbot is built.* This is what makes the first two credible rather than sanctimonious — anyone can complain about AI slop; almost nobody complaining is building the alternative architecture. **And as of mid-August, we shipped one.**

**Positioning line:** "I run a research lab that builds deterministic, truth-aligned AI. We built a study app to prove it matters."

### Cadence

| Channel | Cadence | Slot |
| --- | --- | --- |
| LinkedIn (founder) | 4/week | Mon–Thu 8:00 ET |
| X (founder) | 2 threads/week + 10 replies/day | Threads Tue & Thu 11:00 ET |
| Newsletter | weekly | Thursdays, from Aug 20 |
| YouTube long-form | monthly | last Thursday |
| Podcast guesting | 3 pitches/week from Aug 10 | Mondays, 45 min |
| Build-in-public beta log | weekly | Fridays, X + LinkedIn |

**The X reply habit is worth more than the thread habit.** Ten thoughtful replies a day in the edtech and AI-in-education conversation builds a followed account faster than any posting schedule, and it costs 20 minutes. Reply to Dan Meyer, Justin Reich, Benjamin Riley, Ethan Mollick, Audrey Watters, and the Hechinger Report / EdWeek / The 74 threads. Disagree specifically and without heat — that is the whole technique.

**The build-in-public beta log is new and is the best asset TestFlight unlocked.** Every Friday, one post: what shipped, what broke, one real (anonymized) example of the grader getting something right, and one of it getting something wrong. Publishing the failures is the credibility play — it is also true to the "we tell you the truth about your work" brand promise, applied to ourselves.

### Newsletter — "Field Notes from the Anti-Slop Lab"

Separate from the beta lifecycle emails (§6) and from the blog. **Weekly** (upgraded from biweekly given the hours available), Thursday, plain text, no images, ~700 words. Fixed format, ~45 min to write:

- **One thing we learned** (research or product)
- **One thing we got wrong** (the beta makes this section easy and it is the reason people stay subscribed)
- **One number** (a study, a benchmark, a metric)
- **One thing worth reading** (someone else's work)

First issue **Thu Aug 20**: *"Why we can't just fine-tune a model to be a good tutor."* Then weekly through Nov 19.
Seed list: beta testers and waitlist subscribers who opt in via the §6 nurture. **Run it on Resend** — already integrated, free to 3,000 emails/month.

### Podcast guesting — named targets

Three pitches per week from Aug 10. One paragraph, names their specific episode, offers **one argument, not a product**: *"AI in education is pointed at the wrong target, and I've shipped the alternative architecture — I can explain both."* The TestFlight beta is the credibility unlock here; "I'm building" gets ignored, "I shipped it and here's what the first testers' handwriting showed us" gets booked.

**Tier 1 — education/edtech:**
1. **EdSurge Podcast** (EdSurge/ISTE) — the industry outlet of record.
2. **Class Disrupted** (Michael Horn & Diane Tavenner) — innovation-skeptical framing suits us.
3. **TeachLab** (Justin Reich, MIT Teaching Systems Lab) — the most rigorous edtech skeptic working; surviving that interview is worth ten friendly ones.
4. **Future U** (Jeff Selingo & Michael Horn) — higher-ed; connects to `/for-students/college-study/` and grad test prep.
5. **The Cult of Pedagogy Podcast** (Jennifer Gonzalez) — large, loyal teacher audience.
6. **Truth for Teachers** (Angela Watson) — teacher-practitioner.
7. **The 10-Minute Teacher** (Vicki Davis) — high volume, low friction. Good first booking.
8. **House of #EdTech** (Chris Nesi) — accessible entry point.
9. **Silver Lining for Learning** — research-forward panel.
10. **Getting Smart Podcast** — edtech/innovation.

**Tier 2 — AI/tech, for the neuro-symbolic argument:**
11. **Latent Space** — determinism and neuro-symbolic architecture are genuinely on-topic.
12. **The Gradient Podcast** — research credibility.
13. **Practical AI** — accessible technical.

**Tier 3 — parenting, for Pillar 5:**
14. Large parenting-and-tech shows and any high-reach local-market parenting podcast. **[ASSUMPTION]** verify which are currently active before pitching; churn is high.

**Realistic conversion:** ~3–4 bookings from 45 pitches by Nov 30. Book the small ones first; those recordings become the pitch material for the large ones.

### Speaking and community

- **Submit to SXSW EDU 2027 panel picker** — **[ASSUMPTION]** deadline typically mid-to-late August; **verify by Aug 7**, it is easy to miss and free to enter. Title: *"Assignments That Cannot Be Faked."*
- **ISTELive 2027 call for proposals** — [ASSUMPTION] opens fall 2026; verify and submit.
- **Local parent nights.** Offer a free 45-minute talk — *"AI and your kid's homework: what's actually happening"* — to 8 local schools/districts by Oct 15. Zero cost, direct parent contact, and every talk yields a video asset, a set of real questions for the `FAQPage` schema (T13), and high-intent beta signups. At a ~$30/day paid budget, a room with 40 parents in it is a better acquisition event than a week of ads.

---

## 6. Email

**Current state, verified: a person joins the waitlist and receives nothing. Ever.** `api/waitlist.js` posts the email to Resend Contacts and returns. No confirmation, no welcome, no sequence.

**The TestFlight timeline changes this job completely.** The waitlist is not a holding pen to keep warm for months — it is a short invite queue, and the critical failure mode is no longer "they forgot they signed up." It is **"they installed it and never submitted a page of work."** A tester who installs and never completes a Mission is worth exactly zero, and is the single most likely outcome without email doing its job.

So the program is two tracks:

- **Track A — Invite & Activation (emails 1–6).** The main event. Gets a signup to installed, to first submitted page, to first completed Recovery Mission, to feedback. Every email in this track is triggered by behavior, not by a day count.
- **Track B — Long-horizon nurture (emails 7–8).** For people who join but aren't ready — no iOS device, wrong time of year, parent researching for next semester, or simply didn't install. This track keeps the belief alive at a slow cadence without pretending they're active.
- **Email 9 — public launch.** Held until the App Store listing is live.

Sender: **Griffin Rutherford <griffin@lunesynth.com>**. Plain text, no template chrome, no images, no buttons — a link. Deliberate: the brand's whole argument is against slick frictionless surfaces, and a plain-text email from a person reads as one. It also protects deliverability on a brand-new sending domain, which matters enormously in the first 90 days.

**Footer on every email:**
> Lune Synth is built by Coherascent Labs. Beta testers get 2 months free and a lifetime 50% off Pro.
> Reply to this email if you want off the list and I'll remove you myself. [Unsubscribe]

---

### Segmentation fields — capture without killing conversion

The instinct is to add dropdowns to the form. Don't. The form converts because it is one field.

**Capture after the conversion, not before.** The success modal (`data-waitlist-popup`) already exists on every page and currently shows a thank-you and a "Got it" button. Replace the button with three one-tap questions. The contact is already saved; every answer is upside and abandonment costs nothing.

| Field | How captured | Values |
| --- | --- | --- |
| `role` | Modal Q1 | student · parent · teacher · tutor · other |
| `focus` | Modal Q2 (branches on role) | Student: math / science / writing / test prep · Parent: elementary / middle / high / college |
| `level` | Modal Q3 | middle school · high school · college · graduate · adult learner |
| `has_ios` | **Modal Q1b, new and now essential** | iPhone/iPad · Android · not sure |
| `source_page` | **Automatic** — `window.location.pathname` at submit | e.g. `/study/calculus/` |
| `utm_source` / `utm_medium` / `utm_campaign` | **Automatic** — parsed from query string, persisted to `sessionStorage` on landing so it survives navigation | — |
| `signup_date` | Automatic | ISO date |
| `invited_at` / `installed_at` / `first_submission_at` | **Set by the app / TestFlight reconciliation** | timestamps — these drive Track A triggers |

`source_page` alone is worth more than every dropdown combined: a signup from `/for-parents/ai-and-homework/` is a parent and a signup from `/test-prep/mcat/` is a pre-med, without asking anyone anything.

`has_ios` is now the most operationally important new field — it is the difference between sending someone a TestFlight link they can use and sending one that makes them feel excluded. Android and desktop signups go straight to Track B.

**Server-side:** `api/waitlist.js` currently sends only `{ email, unsubscribed }`. Extend the payload with these as Resend contact properties, and whitelist/validate values server-side rather than trusting the client.

**[ASSUMPTION]** the activation triggers (`installed_at`, `first_submission_at`) require the app to report events back to a small endpoint. If that isn't ready at TestFlight, run emails 3–5 on time delays instead (Invite+1d, Invite+4d, Invite+8d) and accept some mistargeting. Do not delay the sequence waiting for perfect triggers — a mistimed activation email beats no activation email by a wide margin.

---

### TRACK A — Invite & Activation

#### Email 1 — Welcome. Immediate on signup.
**Subject:** You're in the queue
**Preview:** Invites are going out in days, not months. Here's what you signed up for.

> Thanks for joining the Lune Synth beta.
>
> Most study apps are built to give students the answer. Lune Synth is built to grade theirs.
>
> You do the problem by hand — pencil, paper, actual reasoning, actual mistakes. You photograph the page. Lune Synth reads your handwritten steps, finds the exact line where the reasoning broke, and builds a short practice mission for that specific skill.
>
> It never gives you the finished answer. That isn't a limitation we plan to fix. It's the product.
>
> **What happens next:** we're sending TestFlight invites in small waves over the next couple of weeks. Yours will arrive from this address with a link and about a minute of setup. Your 2 months free and lifetime 50% off Pro are already attached to this email address.
>
> One thing that would help while you wait: hit reply and tell me the subject you're stuck in, or the one your kid is stuck in. I read all of these and they decide what we fix first.
>
> — Griffin
> Founder, Coherascent Labs

**CTA:** Reply with a subject. *(Deliberately not a link. A reply is the strongest deliverability signal available on a new sending domain, and the cheapest segmentation we'll ever get.)*

---

#### Email 2 — The invite. Sent in waves from ~Aug 13.
**Subject:** Your Lune Synth beta invite
**Preview:** TestFlight link inside. Setup takes about a minute.

> Your beta access is ready.
>
> **1. Install TestFlight** (Apple's beta app, free): https://apps.apple.com/app/testflight/id899247664
> **2. Open your invite:** [TestFlight link]
> **3. Tap Install.** It'll appear on your home screen like any other app.
>
> Sign in with this email address — **{{email}}** — so your 2 months free and lifetime 50% off Pro attach correctly.
>
> **Then do this tonight, in about ten minutes:**
>
> 1. Pick a World — the subject you're actually working in right now.
> 2. Take one problem you have in front of you. Work it on paper. Actually work it. Wrong is fine — wrong is the point.
> 3. Photograph the page.
> 4. Read what comes back. It will point at one step, not hand you the whole solution.
> 5. Run the Recovery Mission it generates. Five minutes.
>
> That's the entire loop. If it works for you, you'll know within one problem.
>
> One ask: it will get something wrong this week. When it does, tap the flag and tell us what it missed. You are among the first people using this, and the diagnosis gets better in direct proportion to how much real, messy handwriting it sees.
>
> — Griffin

**CTA:** Install via TestFlight. *(One primary action. The five-step first-session script matters as much as the link — an install that never completes a loop is worth nothing.)*

---

#### Email 3 — Invited, not installed. Trigger: Invite + 48h, no `installed_at`.
**Subject:** Your invite is still open
**Preview:** TestFlight trips people up. Here's the one-minute version.

> Your Lune Synth beta invite is still sitting there, so I want to remove the two things that usually stop people.
>
> **"What's TestFlight?"** Apple's official app for trying software before it's on the App Store. It's free, made by Apple, and it's how every iOS beta works. You install TestFlight once, then Lune Synth installs through it.
>
> **"Is this going to be a project?"** No. Install, sign in, photograph one problem. Under ten minutes and you'll know whether this is for you.
>
> [Your invite link]
>
> If you're on Android or you don't have an iPhone handy, just reply "android" and I'll move you to the list for that build instead — no need to do anything else.
>
> — Griffin

**CTA:** Install, or reply "android." *(The Android reply is a real segmentation branch into Track B, and it stops us from nagging people who structurally cannot install.)*

---

#### Email 4 — Installed, nothing submitted. Trigger: `installed_at` + 72h, no `first_submission_at`. **The most important email in the program.**
**Subject:** Did it read your handwriting?
**Preview:** One problem. That's the whole test.

> You installed Lune Synth but haven't sent it any work yet, so let me guess which one it is.
>
> **"My handwriting is too messy."** That's the one I hear most, and it's the one I'd most like you to test. Give it your worst page — crossed-out lines, arrows, half-steps you weren't sure about. That's the page we built this for. A clean page tells us almost nothing.
>
> **"I don't have a problem to use."** Any problem from any class you're taking right now. It doesn't have to be hard and it doesn't have to be finished. A half-worked problem is genuinely more useful to the grader than a finished one.
>
> **"I'm worried it'll tell me I'm wrong."** It probably will. That's what you're here for. It won't be snide about it, and it won't rewrite your work — it points at one line and hands you five minutes of practice on that specific thing.
>
> Ten minutes, one problem. If it doesn't earn a second session, tell me why and I'll take that more seriously than any five-star review.
>
> — Griffin

**CTA:** Open the app and submit one page.

---

#### Email 5 — Feedback request. Trigger: `first_submission_at` + 48h.
**Subject:** What did it get wrong?
**Preview:** Genuinely asking. That answer is worth more than a compliment.

> You submitted work to Lune Synth. Thank you — that's the whole thing working.
>
> Now the useful question: **what did it get wrong?**
>
> I'm not fishing for a compliment. The grader will misread a character, call a correct step an error, or point at the wrong line. When it does that to a student, it costs trust, and trust is the only reason anyone would use a tool that refuses to give them the answer. So I want every instance.
>
> Three specific things, if you have two minutes:
>
> 1. Did it find the actual place your reasoning broke, or somewhere near it?
> 2. Was the Recovery Mission the right skill, or was it too easy?
> 3. What did you expect it to do that it didn't?
>
> Just hit reply. Bullet points are perfect. If you'd rather show me, screenshot the page and the feedback and send both.
>
> — Griffin

**CTA:** Reply with what broke.

---

#### Email 6 — The belief email. Trigger: `first_submission_at` + 10 days, still active.
**Subject:** An answer is not feedback
**Preview:** Why the app is built to withhold the thing you want.

> You've used Lune Synth for a week or so now, which means you've hit the moment where you wanted the answer and it gave you a step instead. I want to explain why we did that on purpose.
>
> Two students work the same derivative.
>
> The first asks a chatbot to solve it, reads the explanation, and thinks: right, that makes sense.
>
> The second works it out on paper, makes a product-rule error, photographs the page, and gets one line back pointing at exactly where the second term disappeared.
>
> Both received correct information. Only one received feedback. The second student had a prediction, a decision, and a visible mistake for the new information to attach to. The first got the smooth sensation of recognizing reasoning somebody else had already done.
>
> Cognitive scientists call that sensation the illusion of fluency. When an explanation is clear and effortless to follow, your brain reads "this was easy to understand" as "I understand this." They are not the same thing. Watching a grandmaster explain a move is not the same as being able to find it.
>
> That's the whole reason the app makes you go first. Not to be difficult. Because feedback without an attempt is just content arriving early.
>
> Long version: https://lunesynth.com/blog/an-answer-is-not-feedback/
>
> I also write a short letter every Thursday about what we're learning and what we got wrong — one thing we learned, one thing we broke, one number, one thing worth reading. [Add me to Field Notes]
>
> — Griffin

**CTA:** Read the post / opt into Field Notes. *(This is the split between "uses the product" and "believes the thesis." The second group is where advocates, press introductions, and pilot schools come from.)*

---

### TRACK B — Long-horizon nurture

For contacts who can't or won't install now: Android, no iOS device, teachers researching for next term, parents planning for spring, or anyone who went cold in Track A. Slow cadence, no install pressure, belief-building only.

#### Email 7 — Nurture. Day 8 for uninvited/uninstallable contacts, then every 3 weeks from the blog.
**Subject:** Why we made you use a pencil
**Preview:** Speed is not a feature.

> The most common question I get about Lune Synth is why we don't just let students type.
>
> Typing would be faster, neater, and much easier to build. It would also remove the part that was doing the work.
>
> In learning, speed is not a feature. Typing notes slides toward transcription — fast enough to capture words nearly verbatim without processing them. Handwriting is too slow for that. Because you can't get every word down, you're forced to listen, compress, and rephrase. That compression *is* the learning. The bottleneck does the teaching.
>
> There's a second reason, and it's the one that actually shapes the product: **the page is evidence.**
>
> A typed final answer tells us something went wrong. A handwritten page tells us *what*. The crossed-out line, the half-step you weren't sure about, the place the reasoning changed direction — that's where the diagnosis lives. It's the only artifact that shows what a student actually thought, and the only thing worth grading.
>
> https://lunesynth.com/blog/why-handwriting-still-wins/
>
> You're on the list for the Android build / the public release, and you'll hear from me when it's ready. In the meantime I send one short letter a week about what we're learning. [Add me to Field Notes]
>
> — Griffin

**CTA:** Read the post / opt into Field Notes.
*(After this, Track B contacts receive the weekly Field Notes newsletter if opted in, and nothing else until Email 9. Do not run a drip at people who told you they can't install.)*

---

#### Email 8 — Re-engagement. Trigger: 30 days, no opens, no install.
**Subject:** Still want in?
**Preview:** No hard feelings either way. I'd rather have a real list.

> You joined the Lune Synth beta a while back and haven't opened anything since, which is a perfectly reasonable thing to have done.
>
> Where things actually stand: the beta is live in TestFlight. The handwriting pipeline reads real student work reliably. Grading is good on algebra and calculus and still rough on proof-heavy work. Recovery Missions were too generous in the first build — they kept offering easier problems instead of the specific one the student missed, which is exactly the failure mode we started the company to avoid, so we rebuilt that piece.
>
> If you still want in, do nothing. Your invite stays open and your 2 months free plus lifetime 50% off Pro are held.
>
> If you'd rather not hear from me again, unsubscribe below and I won't take it personally. I'd genuinely rather have five hundred people who want this than five thousand who forgot they signed up.
>
> — Griffin

**CTA:** Do nothing (stay) or unsubscribe. *(A re-engagement email that doesn't demand a click is more credible and cleans the list either way. **Suppress non-openers after this one** — public-launch deliverability depends on it.)*

---

### Email 9 — Public launch (App Store live)
**Subject:** Lune Synth is on the App Store
**Preview:** Your beta pricing carried over. Here's the link.

> It's public.
>
> Lune Synth is live on the App Store. If you were in the TestFlight beta, your account, your Constellations, and your 2 months free plus lifetime 50% off Pro all carried over — sign in with **{{email}}** and everything's there.
>
> [Download Lune Synth]
>
> If you never got around to installing it, this is the easy version: no TestFlight, no invite code. Install, pick the subject you're working in tonight, photograph one problem you've already attempted, and read what comes back.
>
> A short thank-you to the beta testers, and I mean this specifically. You sent us pages we could not have generated: genuinely messy handwriting, wrong-but-reasonable approaches, notation we hadn't accounted for, and a steady stream of honest replies about what the grader got wrong. The version that shipped today is a different product than the one that went out in August because of that.
>
> It still gets things wrong. Flag them.
>
> — Griffin
> Founder, Coherascent Labs

**CTA:** Download.

**Ship a follow-up at Launch +3 days** to anyone who downloaded and hasn't submitted work — reuse Email 4 ("Did it read your handwriting?") verbatim. Activation, not acquisition, is where this dies.

---

### Email build deadlines

| Task | Deadline |
| --- | --- |
| Capture `source_page` + UTM in `api/waitlist.js` and form JS | **Aug 7** — before TestFlight, or the first cohort has no attribution |
| `has_ios` question in the success modal | **Aug 8** — needed to route invites correctly |
| Email 1 (welcome) live and automated | **Aug 9** |
| Email 2 (invite) drafted, TestFlight link placeholder ready | **Aug 11** |
| Emails 3, 4 automated (the activation core) | **Aug 14** |
| Remaining modal segmentation (`role`, `focus`, `level`) | Aug 19 |
| Emails 5, 6 automated | Aug 21 |
| Email 7 (Track B nurture) live | Aug 24 |
| Field Notes newsletter #1 sent | Aug 20 |
| Email 8 (re-engagement) automation live | Sep 11 |
| Email 9 drafted and held | Sep 25 |

**Cost:** Resend is already integrated and free to 3,000 emails/month / 100 per day. **[ASSUMPTION]** that ceiling holds until roughly 700 contacts at this cadence; Resend Pro is **$20/mo** for 50,000 when it doesn't. No other email tooling required — do not add a separate ESP for the newsletter.

---

## 7. Content repurposing system

One argument, ten surfaces. **The unit of production is the blog post, and nothing else is written from scratch.**

```
BLOG POST  (Tue · Thu · Sat — three per week)
  ├─ IG carousel, 6–8 slides       ← the post's H2s become the slides
  ├─ Short video script, 30–45 sec ← the post's single sharpest claim
  │     └─ TikTok · Reel · YT Short    (one file, three uploads)
  ├─ LinkedIn post                 ← the post's argument, no link in body
  ├─ X thread, 5–7 posts           ← the post's structure, one claim per post
  ├─ Field Notes section           ← "one thing we learned" (weekly newsletter)
  ├─ Lifecycle email               ← the post's opening + link, when it fits a slot
  ├─ 3 Pinterest pins              ← carousel slides re-cropped 1000×1500
  ├─ Meta ad primary text          ← the post's lede (26 static creatives already exist
  │                                   and need copy, not new art — at $30/day this is
  │                                   the only ad production we can afford)
  └─ Reddit comment material       ← the post's practical section, no link, disclosed
```

**Direction is one-way and never reversed.** Never write a social post that isn't downstream of an argument that exists in long form. If an idea can't sustain 1,400 words it isn't a position, it's a caption — and captions don't compound.

**Three posts/week feeding this graph produces roughly 60 downstream assets per week** without a single additional act of original thinking. That ratio is the entire reason the cadence is three and not two.

### The weekly operating rhythm

| Day | Block | Work |
| --- | --- | --- |
| **Mon** | 3.5h | Write Thursday's post (the argument — hardest, gets the freshest hours). |
| **Mon** | 1.0h | Edit Sunday's footage into the week's shorts. One project file, captions burned in. |
| **Mon** | 0.5h | LinkedIn post + X replies. |
| **Tue** | 0.5h | **Publish Tuesday's post + the full ritual** (see below). |
| **Tue** | 0.5h | Schedule the entire week of social across all channels. |
| **Tue** | 3.0h | Write Saturday's post (parent). |
| **Tue** | 0.5h | LinkedIn + X thread from Tuesday's post. X replies. |
| **Wed** | 3.5h | Write next Tuesday's post (SEO). |
| **Wed** | 1.0h | Build IG carousels + Pinterest pins from the week's posts. |
| **Wed** | 0.5h | LinkedIn + X replies. |
| **Thu** | 0.5h | **Publish Thursday's post + ritual.** |
| **Thu** | 0.75h | Field Notes newsletter. |
| **Thu** | 0.75h | Podcast pitches (3) + speaking/community outreach. |
| **Thu** | 0.5h | LinkedIn + X thread from Thursday's post. |
| **Fri** | 0.5h | **Build-in-public beta log** — what shipped, what broke, one right call, one wrong call. X + LinkedIn. |
| **Fri** | 0.5h | Reddit (8 comments). |
| **Fri** | 1.5h | Technical SEO tasks from §3 (front-loaded: ~4h/wk in weeks 1–4, ~0.5h/wk after). |
| **Fri** | 0.5h | Email lifecycle: read replies, segment, fix broken triggers. |
| **Sat** | 0.5h | **Publish Saturday's post + ritual.** |
| **Sat** | 0.5h | Measurement review (§9) — 20 min, weekly, not monthly. |
| **Sun** | 1.5h | **The filming block.** Screen capture · desk B-roll · talking head · VO. (§4) |

**The publish ritual — every post, no exceptions:**
1. Post at `lune-synth/blog/<slug>/index.html` (with `Article` JSON-LD, canonical, og + twitter tags, `width`/`height` on images).
2. Preview card at the **top** of `data-post-list` in `lune-synth/blog/index.html`.
3. Preview card at the **start** of `.blog-preview` in `lune-synth/index.html` — **trim to the three newest.**
4. Related-landing-pages block populated from the calendar's `Links to` column.
5. `relatedPosts` updated in `pages.json` for any landing page this post should now link back from.
6. `npm run build:sitemap` and commit the regenerated `sitemap.xml`.

Steps 2 and 3 are mandated by `CLAUDE.md`. Steps 4–6 are what make the post do any work.

---

## 8. Hours budget — does this actually fit?

| Activity | Hrs/week | Notes |
| --- | --- | --- |
| Writing 3 blog posts | **10.0** | 3.5 + 3.5 + 3.0. The single largest line, and correctly so. |
| Publishing + ritual (×3) | 1.5 | Includes internal linking and sitemap regeneration. |
| Sunday filming block | 1.5 | Fixed. Feeds every other channel. |
| Video editing + captions | 1.0 | Batched Monday, one project file. |
| Carousels + Pinterest pins | 1.0 | Batched Wednesday. Pins re-crop from carousels. |
| Social scheduling | 0.5 | Batched Tuesday, whole week at once. |
| LinkedIn + X founder posting | 1.5 | 4 LinkedIn posts + 2 threads. |
| X replies (10/day) | 1.5 | The highest-ROI 20 min/day on the list. |
| Build-in-public beta log | 0.5 | Friday. |
| Reddit | 0.5 | 8 comments. |
| Field Notes newsletter | 0.75 | Fixed 4-section format. |
| Podcast pitching + speaking outreach | 0.75 | 3 pitches/week. |
| Email lifecycle maintenance | 0.5 | Reading replies is research, not overhead. |
| Technical SEO (§3) | 1.5 avg | **~4.0/wk in weeks 1–4, ~0.5/wk after.** |
| Measurement review | 0.5 | Weekly, 20 min. |
| **Total** | **~23.5 hrs/week** | |

**Weeks 1–4 run hotter (~26 hrs/week)** because the entire §3 technical backlog and all of §6's email build land there. **Weeks 5–16 settle around 21–22.**

That fits inside 20–40 hrs/week with real headroom — roughly 40–50% of a 40-hour week — which is correct, because product, TestFlight support, App Store submission, and reading tester feedback all need the rest. If the founder is at the low end (20 hrs), drop the Tuesday post (−3.5), Pinterest (−0.3), and the company LinkedIn page, landing at ~19.

**The two things that must never be cut, at any hours level:** the Sunday filming block (it feeds seven channels; skipping it empties the whole following week) and the Saturday parent post (only pillar with commercial intent and no coverage).

---

## 9. Tools, real costs, and free alternatives

At under $1,000/mo total paid budget, every dollar spent on tooling is a dollar not spent on reach. The recommendation is to run this entire program at **$0–24/month**.

| Need | Paid option | Real cost | Free alternative | **Recommendation** |
| --- | --- | --- | --- | --- |
| Keyword research | Ahrefs Lite / Semrush Pro | **$129 / $139.95 per mo** | **Google Search Console** (free, and the only source of *our actual* query data) + **Google Keyword Planner** (free with an Ads account — which we'll have) + **Ahrefs Webmaster Tools** (free for verified sites) | **Free stack.** Skip both. At 48 posts targeting queries we can reason about from first principles, paid keyword tools would change maybe three titles. Revisit at $5k/mo revenue. |
| Site crawl / tech audit | Screaming Frog | **£199/yr ≈ $21/mo** | **Screaming Frog free tier — 500 URL limit.** We have 64 HTML files, rising to ~112 with the blog. | **Free tier.** It covers us for the next two years. |
| Rank tracking | Ahrefs / Semrush | included above | **Search Console Performance report** | **Free.** |
| Video editing | Descript Hobbyist / Creator | **$12–24/mo** | **DaVinci Resolve** (free, full-featured) or **CapCut free tier** (auto-captions, vertical presets, faster for short-form) | **CapCut free** for shorts, **Resolve free** if a long-form edit needs it. $0. Descript's transcript-based editing is genuinely faster for talking-head long-form — if the monthly YouTube video becomes painful, **$12/mo Hobbyist is the one paid tool worth buying.** |
| Graphics / carousels | Canva Pro | **$15/mo** | **Canva Free** (sufficient for 6–8 slide carousels and 1000×1500 pins) or **Figma Free** | **Canva Free.** $0. |
| Stock media | Getty / Adobe Stock | $30–80/mo | **Pexels, Unsplash** (free, commercial use) — already what `lune-synth/blog/images/` uses | **Free.** $0. And most of our imagery should be our own desk B-roll anyway. |
| Email / newsletter | Resend Pro; or beehiiv, ConvertKit | Resend Pro **$20/mo** (50k emails); beehiiv free to 2,500 subs; ConvertKit ~$29/mo | **Resend free tier: 3,000 emails/mo, 100/day** — already integrated in `api/waitlist.js` | **Resend free** now; upgrade to **$20/mo Pro** when the list passes ~700 contacts. **Do not add a second ESP for the newsletter** — running Field Notes on Resend broadcasts avoids a $29/mo bill and a second list to reconcile. |
| Social scheduling | Buffer / Later | **$6/channel/mo ≈ $42/mo** for 7 channels | **Native schedulers** — TikTok, Instagram, YouTube, LinkedIn, and Pinterest all schedule natively for free. X is the only gap. | **Native, $0.** Costs ~10 extra minutes in the Tuesday scheduling block. Not worth $42/mo. |
| Analytics | — | — | **GA4 + Search Console + Bing Webmaster** | **Free.** (Install is document 01's task and blocks all measurement here.) |
| Page speed | — | — | **PageSpeed Insights / Lighthouse** | **Free.** |

**Recommended monthly content spend: $0 now, rising to $32/mo** ($20 Resend Pro + $12 Descript Hobbyist) once the list grows and monthly video becomes a bottleneck — roughly 3% of the paid budget. Everything else stays free permanently.

**One thing worth paying for that isn't a tool:** if any single task should be outsourced, it is **short-form video editing** at roughly **$15–25 per finished short** on Upwork/Fiverr. **[ASSUMPTION]** At 5 shorts/week that's ~$400/mo, which does not fit under a $1,000 total budget alongside ads. Recommendation: **don't.** Edit them yourself in CapCut; the 1.0 hr/week is affordable and the money is better spent on reach.

---

## 10. Measurement

Nothing here is measurable until GA4 and Search Console exist (document 01, deadline Aug 7). Once they do, review weekly — 20 minutes, Saturday.

| Metric | Source | Target by Nov 30 | First meaningful read |
| --- | --- | --- | --- |
| Pages indexed | Search Console | 43 landing + 54 blog + 7 features = **104** | Aug 21 |
| Impressions, `/for-parents/*` | Search Console | 4,000/mo **[ASSUMPTION]** | Sep 15 |
| Blog → landing-page CTR | GA4 | >12% of blog sessions | Sep 15 |
| Beta signups by `source_page` | Resend properties | — | Sep 1 |
| Organic-attributed signups | GA4 + UTM | 35% of total **[ASSUMPTION]** | Oct 1 |
| **Invite → install rate** | TestFlight | **>55%** | Aug 20 |
| **Install → first submission** | app events | **>60%** — *the number that matters most in this document* | Aug 24 |
| Email 1/2 open rate | Resend | >55% plain text | Aug 15 |
| Reply rate, emails 1, 5 | Resend | >8% | Aug 20 |
| Referring domains from P1/P3 posts | Search Console links | 15 **[ASSUMPTION]** | Nov 1 |
| Podcast bookings | manual | 3 | Nov 30 |

### The honest expectation

**Almost nothing in §2 ranks before October.** New-domain content in education queries takes three to five months to move, and no amount of cadence changes that. The August and September posts are not written to convert in August and September — they are written so that **next** back-to-school season opens with 48 indexed, internally linked, seasonally-correct posts and a fixed technical foundation already in place. The work that pays in August 2027 has to be done now, and at $30/day of paid there is no alternative that pays sooner.

**Three things can move immediately:**

1. **§6, the email program** — the waitlist has people on it, TestFlight ships in days, and right now they receive nothing. This is the only part of this document with same-week ROI, which is why its deadlines are the tightest.
2. **§3 P0** — the sitemap and Search Console submission are two days of work that determine whether the other fourteen weeks are visible at all.
3. **§5, the founder POV** — LinkedIn and X distribution does not wait on domain authority. A shipped, counter-positioned product plus a founder willing to publish the failures is a story that travels in weeks, not months, and it is the cheapest reach available to a company with $30/day.
