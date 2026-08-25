<!-- markdownlint-disable MD013 -->

# Play Store listing copy — closed testing (beta phase 1)

Draft for Griffin to edit. Nothing here is a claim I can verify about the
product's effectiveness, so it deliberately describes **what the app does**
rather than what it achieves. Marketing claims about learning outcomes invite
both a Play policy problem and a promise the beta can't keep yet.

## Update Log

### 2026-08-14

- User-facing claims audit against `docs/2026-08-14-small-cohort-beta-launch-plan.md`
  §3. Replaced the short description's "explain what you actually got wrong"
  (asserts the grade as ground truth) with "with reasoning you can check"
  (reviewable, not authoritative). Replaced the "real grading" alternate for
  the same reason. Full description already carried the "it can be wrong /
  check the reasoning" disclaimer and needed no change.

### 2026-08-10

- Drafted from the product surface (missions, grading, Luna, constellations,
  streaks) for the closed-testing listing.

---

## App name

```
Lune Synth
```

## Short description (80 char max)

Currently **62 characters**:

```
Study sets that grade your work, with reasoning you can check.
```

Revised 2026-08-14 for the small-cohort beta launch audit
(`docs/2026-08-14-small-cohort-beta-launch-plan.md` §3): the prior line —
"...and explain what you actually got wrong" — asserted the grade as ground
truth in the one line most reviewers and users actually read (only ~80 chars
show before the fold). Against a measured 43.6% exact grading agreement and
12.7% severe over-scoring, "actually got wrong" is not defensible. "with
reasoning you can check" keeps the same confident, active voice while making
clear the grade is reviewable, not authoritative.

Alternates, all within budget:

- `Practice problems, graded with reasoning, and a tutor that shows the steps.` (75)
- `Turn your own coursework into practice sets that grade themselves.` (66)
- `Homework practice with step-by-step feedback, not just right or wrong.` (69)

## Full description (4000 char max)

Currently ~1,450 characters, well inside the limit. Short is fine — most
readers only see the first two lines before "Read more".

```
Lune Synth turns studying into something you can actually check.

Build a practice set from your own material — a photo of a worksheet, lecture
slides, a PDF, or just a topic you name — and work through it. Every answer
gets graded with reasoning, not just a checkmark, so you can see where a
solution went sideways instead of guessing.

WHAT YOU CAN DO

• Generate practice sets from your own coursework, or from a topic
• Write, type, or say your answer — handwritten work gets read and graded
• See step-by-step feedback on what was right, what wasn't, and why
• Ask Luna, the built-in tutor, to explain any question another way
• Track streaks, levels, and progress across subjects
• Explore constellations that map what you've covered and what's next

WHO IT'S FOR

Students working through math, science, and other coursework who want more
than an answer key — especially anyone studying for an exam who needs to know
*why* an answer was wrong before the next attempt.

HOW GRADING WORKS

Your work is read by an AI grader that produces a score and written reasoning.
It is a study aid, not a teacher, and it can be wrong — every result shows its
reasoning so you can check it. Nothing here is a substitute for your course's
official grades.

CLOSED BETA

This is an early build shared with a small group of testers. Expect rough
edges, and please send feedback in the app — it goes straight to the person
building it.
```

## Notes for the form

- **"Read more" cutoff:** only the first ~80 characters show before the fold.
  The first line is doing the work; keep it first.
- **No outcome claims.** No "raise your score", "get an A", "learn 2x faster".
  Those are unverifiable, and Play's policy on misleading claims applies to
  education apps.
- **The grading disclaimer is deliberate.** It sets tester expectations, and it
  matches what the app itself says.
- **Do not mention Moon Rocks / IAP.** `EXPO_PUBLIC_GEM_IAP=false` in the
  production build; describing purchasable currency in a build that has no IAP
  is a listing mismatch.

## Remaining assets (cannot be generated from the repo)

| Asset | Spec | Status |
| --- | --- | --- |
| App icon | 512×512 PNG, no alpha | **Done** — `play-icon-512.png` |
| Feature graphic | 1024×500 PNG/JPEG | **Needed** — brief written: `play-graphics-brief.md` |
| Phone screenshots | 2+ min, 16:9 or 9:16, ≥320px | **Needed** — brief written: `play-graphics-brief.md`. Site captures are downscaled; the iPad voice/text ones show an outdated UI. |

Screenshot suggestions, in the order that tells the story: the mission grid,
a question mid-answer, the graded feedback with reasoning, and a Luna chat
explaining a step. Avoid capturing any real tester's data.
