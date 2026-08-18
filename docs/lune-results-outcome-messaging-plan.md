# Lune Synth — Results/Outcome Messaging Plan (Home + Landing)

## Purpose

Reframe the two top-of-funnel pages so they emphasize **what the student gets out of it**
(scores, grades, admissions, momentum) instead of only how novel or principled the product is.

Pages in scope:

- **Root home** — `index.html` (Coherascent Labs company page; hero "Truth-Aligned AI", Lune Synth is one of two "Dual Pillars").
- **Product landing** — `lune-synth/index.html` (hero "The anti-slop learning app").

Today both pages lead with *philosophy and mechanism* ("anti-slop", "handwritten reasoning",
"truth-aligned"). The mechanism is good and should stay — but it currently answers "why is this
principled?" before it answers "what will this do for my grades?" This plan flips that order.

---

## Non-negotiable guardrail (read first)

`docs/lune-synth-marketing-copy-and-accuracy-context.md` governs claims. Its Cohort-1 rule is
explicit:

> "Avoid publishing user-outcome claims until retention, correction behavior, or verified learning
> gains are measured." (line 68)

We have **no field outcome data yet** — only pre-beta internal evaluation (95.2% defect-free
feedback; 95.8% defect-free generated questions). So this plan does **not** claim measured results.

The distinction we build everything on:

| Not allowed (measured-result claim) | Allowed (goal-oriented framing + real mechanism) |
|---|---|
| "Raises SAT scores by 120 points." | "Built to move the score you're studying for." |
| "Students get higher grades." | "Turn tonight's homework into the reps that show up on the test." |
| "Proven to get you into grad school." | "The step-by-step feedback loop that keeps your GPA competitive for grad school." |
| "Guaranteed higher test scores." | "Practice that targets exactly what you got wrong — before the exam does." |

**Rule of thumb:** name the *goal the student already has* and the *mechanism that serves it*.
Never assert the *result*. Every accuracy number keeps its measurement caption (per the accuracy doc).
Standardized-exam items stay labeled "practice questions / demonstration scenarios."

This tension is the whole reason for the plan — do not resolve it by quietly adding hard claims.

### The middle ground, stated plainly

We are deliberately choosing a **third option** between the two failure modes:

- **Not** timid, feature-only copy that never mentions grades or scores (undersells; ignores what the
  student actually wants).
- **Not** exaggerated, specific result claims we can't back ("+120 points", "3.9 GPA", "got into med
  school") — those are lies until measured, and they violate the accuracy doc.
- **Yes:** the whole page is *oriented around* the outcomes (scores, grades, admissions) as the
  reason the product exists and the thing every feature serves — while the *proof* we offer today is
  the honest mechanism and the bounded evaluation numbers. We point at the destination without
  claiming we've already delivered someone there.

Think of it as: **outcomes are the theme; mechanism is the evidence.** The student should feel the
page understands what's at stake for them, without being handed a fabricated statistic.

### Reserve the slots for real proof (case studies + testimonials come later)

Specific, credible outcome claims are *earned* after Cohort 1, not invented now. So the design should
build the **containers** for them and fill them with honest placeholders today:

- A "Results / Student stories" band with card slots for testimonials and short case studies.
- Ship it now with a forward-looking framing (e.g. "Beta cohort in progress — student stories land
  here as they come in") rather than empty or faked.
- When real data arrives (score gains, correction-success rates, retention), those cards become the
  page's strongest proof and can graduate into specific claims *with their measurement context*.

This keeps the outcome orientation honest today and makes it more powerful — not restructured — later.

---

## The outcome ladder (organizing idea)

Instead of one generic "learn better" message, aim copy at the concrete stakes each learner is
already chasing. This becomes a reusable spine across the hero, an outcomes section, and subject pages.

1. **HS student** → higher grades + higher **SAT/ACT** scores → stronger **college applications**.
2. **Undergrad** → higher **course grades** + higher **GRE/MCAT/LSAT** → stronger **grad-school applications**.
3. **Grad/professional** → pass **USMLE / quals / boards**.
4. **Any level** → the daily loop: *upload homework or a study guide → get walked through the steps →
   turn it into a targeted question set → close the gap before it's graded.*

Item 4 is the engine that earns items 1–3. Lead visuals and demos should show that loop.

---

## The "results" hero flow to feature everywhere

This is the single most important behavior to elevate, because it's a real, shippable mechanism
(not an outcome claim):

> **Upload → Immediate feedback → Steps → Question set → Score gain.**
>
> Snap a photo of homework or a study guide. Get immediate feedback that walks you through how to
> solve the problem — step by step. Then turn it into a practice question set that drills the exact
> thing you missed, so it sticks for the test.

Everything on the pages should ladder back to this loop. It's concrete, honest, and it's what a
score-motivated student actually wants.

---

## Page-by-page changes

### A. Product landing — `lune-synth/index.html`

#### A1. Hero (currently ~lines 10909–10929)

Current:
- Tagline: "The **anti-slop** learning app"
- Sub: "Do the work. Scan it in. Get feedback that actually helps. From the Pre-K through the PhD level."

Change: keep "anti-slop" as a **secondary** identity chip, promote an outcome-first line.

- **New H1/tagline direction:** lead with the payoff, e.g.
  "Study for the score you're actually chasing." or
  "Turn homework into higher test scores." (goal framing, not a result claim)
- **New sub:** foreground the upload→feedback→question-set loop:
  "Upload homework or a study guide. Get immediate step-by-step feedback, then a practice set that
  drills exactly what you missed — from Pre-K through PhD."
- Keep "anti-slop" / "you have to actually use your brain" as a supporting differentiator lower in
  the hero, not the headline.

#### A2. Add a new "Outcomes" section (new, place right after the hero / before or fused with "Lost in the Cosmos")

A dedicated band built on the outcome ladder. Cards keyed to the goals in the prompt:

- "Higher **SAT / ACT** scores" → practice targeted to the questions you miss.
- "Higher **test scores in class**" → tonight's homework becomes tomorrow's reps.
- "Grades that carry a **college application**."
- "Undergrad grades strong enough for **grad school**."
- "**GRE / MCAT / LSAT / USMLE** practice, step-by-step."

Each card: *goal headline* + *one-line mechanism* + (where relevant) the measured-evidence caption.
No result numbers. Link cards to the matching subject/test-prep landing pages under
`lune-synth/test-prep/`, `lune-synth/study/`, `lune-synth/for-students/`.

#### A2b. Add a "Student stories" band (built now, populated after Cohort 1)

Sits below Outcomes. Reserve 2–3 testimonial/case-study card slots using existing card/glass styles.
Ship today with honest forward-looking copy ("Beta cohort in progress — real student stories land
here as they come in"), **not** placeholder-fake quotes. This is the container the future specific
claims graduate into, each with its measurement context. Same band can later carry a headline metric
(e.g. correction-success or score-gain) once measured — with its caption, per the accuracy doc.

#### A3. "Lost in the Cosmos" (lines 11012–11038)

Currently problem-framed ("Learning is broken… AI slop that cheats"). Keep the problem, but make the
**resolve** line outcome-oriented. Current resolve: "Lune Synth fixes all three. Handwritten
reasoning. Real feedback. Focused practice."

Change the resolve to connect mechanism → stakes, e.g.:
"Lune Synth fixes all three — and points them at the score you're studying for: real feedback on
your actual work, then focused practice on exactly what you got wrong."

#### A4. Platform / grading sections (headings around 11047, 11420, 11566)

- "How grading works" (11566): reframe the section intro from *how it works* to *why it moves your
  grade* — "See the exact step that cost you points, then fix it before it's graded." Steps stay.
- "Handwrite. Get clear feedback." (11420): add the downstream payoff — feedback isn't the end,
  the **question set** is. Make "turn work into steps" (11611) visibly flow into "practice the gap."

#### A5. Quick Missions / Constellations / Medals (11869, 11910, 12096)

These are engagement mechanics. Add one outcome sentence each so they read as *means to the score*,
not just gamification:
- Quick Missions → "A few focused minutes on the exact thing that'll be on the test."
- Constellations → "Turn a big goal (raise your calc grade, prep for the MCAT) into a path you finish."
- Medals → keep, but frame streaks as evidence of the practice volume that moves scores.

#### A6. Engine section (12987)

Keep the anti-slop / neuro-symbolic rigor — but position it as *the reason the feedback is
trustworthy enough to study from*, i.e. rigor in service of the score, not rigor for its own sake.
Keep all accuracy numbers with their measurement captions (95.2% / 95.8%, Wilson intervals).

### B. Company home — `index.html`

#### B1. Lune Synth pillar (h3 at line 1790)

The company hero ("Truth-Aligned AI", 1657–1679) can stay research-forward — that's the company's
identity. But the **Lune Synth pillar** is currently described in research language
("handwritten reasoning, rigorous grading, and adaptive learning", 1667–1668). Add an outcome line
so the one place the company page sells the product speaks to stakes:
"Lune Synth turns homework and study guides into step-by-step feedback and targeted practice — built
to move real grades and test scores." Keep it goal-framed, not a result claim.

#### B2. Hero mission paragraph (1663–1669)

Optional light edit: end the mission sentence on the learner payoff ("…verifiable reasoning that
helps students raise the grades and scores that matter") rather than on the architecture.

---

## Proof strategy (what we lead the evidence with)

We can't show outcome data, so credibility comes from **mechanism + bounded evidence + demonstration**:

1. **Live demo of the loop** — the highlight reel and response carousel already exist
   (11052–11375). Curate/annotate them to show upload → immediate step feedback → question set.
2. **Bounded evaluation numbers** with captions intact (95.2% defect-free feedback; 95.8% questions).
3. **Practice-question breadth** across SAT/ACT/LSAT/MCAT/GRE/USMLE (already in the carousel),
   labeled as practice/demonstration items.
4. **Student stories band (A2b)** — ship the container now with honest forward-looking copy; fill
   with real testimonials/case studies + measured metrics after Cohort 1. Never a fabricated result.

**Sequencing the proof, plainly:** today's proof = mechanism + bounded evaluation numbers + live demo.
Post-Cohort-1 proof = specific student stories and outcome metrics dropped into the reserved slots.
The outcome *orientation* is identical in both phases; only the strength of the evidence upgrades.

---

## Implementation sequence

1. Draft hero copy variants (A1) + the Lune pillar line (B1); get sign-off on tone before touching markup.
2. Build the Outcomes section (A2) — highest-leverage single change; reuses existing card/glass styles.
3. Reframe resolve + section intros (A3, A4, A5) as copy-only edits.
4. Wire Outcomes cards to existing subject/test-prep landing pages.
5. Re-run the accuracy-doc checklist: every number captioned, every exam item labeled "practice",
   no `always/perfect/guaranteed/proven/every`, no measured-outcome claim.
6. If a blog preview or homepage "From the blog" changes, honor `CLAUDE.md` (keep the three newest,
   sync `lune-synth/blog/index.html` and the homepage preview).

## Open questions for the user

1. **Headline stakes:** should the hero lead with the *general* payoff ("the score you're chasing")
   or name specific exams (SAT/ACT) up top? Naming exams is punchier but narrows the Pre-K–PhD framing.
2. **How aggressive on outcomes?** Confirm we stay in goal-oriented framing (per the accuracy doc)
   rather than hard result claims — this plan assumes yes.
3. **Scope of the company home page:** keep it research-forward and only adjust the Lune pillar (B1),
   or push outcome language higher into the company hero too?
