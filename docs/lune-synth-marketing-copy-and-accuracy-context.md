# Lune Synth Marketing Copy and Accuracy Context

## Update Log

- 2026-08-17: Added competitive copy guidance for multimodal grading and question-set generation, with evidence boundaries and recommended website language.
- 2026-08-19: Broadened the grading benchmark from graduate-only (125 responses) to Pre-K–through-graduate (242 responses across 74 prompts); overall soundness 95.2% → **96.3%**. Corrected the accuracy section's §06 failure taxonomy (the astrophysics Coulomb-barrier misconception recurring across input modes; the French imperfective *retrouvais* case; removed the fabricated "Slavic verbal prefixes" and "3 handwritten OCR misalignment" items). Scoped the 12 graduate disciplines to question generation only. Added a single-reviewer, non-blind adjudication caveat. Score-calibration figures are kept off the public accuracy section by design.

## Purpose

This document provides the context needed to update `lunesynth.com` before Beta Cohort 1. The objective is not timid or legalistic copy. Lune Synth should sound ambitious, differentiated, and competitive. The constraint is that marketing language must not turn product direction, internal evaluation results, or architectural safeguards into a false guarantee.

The preferred standard is **strong positioning with bounded factual claims**:

- Headlines may express the product's ambition and intended experience.
- Feature descriptions should describe what the product actually does.
- Accuracy statements must name what was measured, the sample, and the limitation.
- Words such as `always`, `perfect`, `guaranteed`, `proven`, and `every` require substantially stronger evidence than the current internal evaluation.
- Broad subject positioning may describe reach and product intent, but it must not imply equal validated accuracy in every subject.

This is the subtle middle ground between sterile disclaimer-first copy and dishonest certainty.

## Current evidence in plain language

The expanded internal evaluation provides real evidence for competitive claims:

- **242 live grading responses** across 74 distinct prompts, spanning Pre-K through graduate work (125 graduate responses from the 2026-08-16 analysis plus 117 Pre-K–high-school responses from the 2026-08-19 run).
- Typed, voice-transcript, and handwritten/scanned input were tested.
- 233 of 242 feedback responses avoided materially incorrect guidance: **96.3% observed**, with a 95% Wilson confidence interval of **93.1%–98.0%** (the remaining 3.7% were minor omissions or flagged conceptual errors, with zero catastrophic hallucinations).
- At the more conservative distinct-prompt level, 68 of 74 prompts avoided a material failure across tested variants: **91.9% observed**, with a 95% Wilson interval of **83.4%–96.2%**.
- **120 graduate-level questions** were generated across 24 sets and 12 generation contexts. Question generation was **not** re-run on 2026-08-19, so these figures remain graduate-only.
- 115 of 120 generated questions avoided a material defect: **95.8% observed**, with a 95% Wilson interval of **90.6%–98.2%** (remaining questions had minor clarity omissions rather than ungrounded content).
- 19 of 24 complete five-question sets contained no material defect: **79.2% observed** (graduate-only).
- All 266 grading and question-set requests (125 + 117 grading + 24 generation) completed without a runtime or transport failure in the observed evaluation runs.
- Adjudication was **single-reviewer and non-blind**, with the two grading halves judged by different reviewers. Every figure measures the soundness of the guidance, not the displayed numeric score (numeric-score calibration was weaker and is deliberately kept off the public accuracy section).

These are internal pre-beta evaluation results measured on targeted test suites, not field outcome guarantees. Non-pass classifications were applied strictly even for slight omissions.

## Copy Boundaries & Claim Guidelines

1. **Subject Breadth Claims:**
   - *Avoid:* "Master any subject."
   - *Use:* "Take on any subject," "Across a growing range of subjects," or "Reason step-by-step through tough coursework."

2. **Grading & Feedback Claims:**
   - *Avoid:* "Never misses a step," "100% accurate grading," or "Flawless step-by-step evaluation."
   - *Use:* "Engineered to catch subtle reasoning breaks," "Rubric-grounded step-by-step feedback," accompanied by pre-beta evaluation benchmarks (96.3% observed defect-free guidance).

3. **High-Stakes Test Prep Demonstrations:**
   - Standardized exam items (SAT, ACT, LSAT, MCAT, GRE, USMLE) must be identified as *practice questions and demonstration scenarios*, not official or certified curriculum replacements.

4. **Promotional Offers:**
   - Waitlist promotions offering founding benefits or lifetime tier discounts must remain consistent with published terms regarding account standing and active subscription continuity.

## Implementation Sequence

### Before Beta Cohort 1

1. Replace `master any subject` with `take on any subject` or `across a growing range of subjects`.
2. Replace categorical exactness claims in explanatory copy while preserving strong headlines.
3. Add an evidence block with grading and generation evaluation results.
4. Add a public methodology note clearly labeling results as internal pre-beta evaluation.
5. Add a site-wide AI fallibility statement near the Engine/Grading evidence and footer.
6. Ensure promotional-offer terms remain clear and aligned with terms of service.
7. Explicitly label high-stakes test examples as practice demonstrations.
8. Ensure UI previews and animations do not imply that every feedback response is guaranteed error-free.

### During Cohort 1

1. Track materially incorrect feedback through direct user-correction signals, not just general satisfaction.
2. Avoid publishing user-outcome claims until retention, correction behavior, or verified learning gains are measured.
3. Preserve failed examples and edge-case corrections in the permanent evaluation corpus.
4. Recalculate accuracy across independent prompt clusters.
5. Involve domain experts to review benchmarks intended for broad public, institutional, or academic audiences.

### After Cohort 1

The next evidence upgrade should support stronger comparative claims:
- Learner correction success rates after initial feedback;
- Practice completion and concept retention metrics;
- Expert adjudicator consensus rates on feedback validity;
- Baseline comparisons showing rubric-guided grading vs. standard unprompted LLMs;
- Guardrail filter effectiveness at catching ungrounded steps.

## Final Copy Principle

> **Sell the ambition in the headline. Describe the real mechanism in the body. Put the measurement beside any accuracy number. Acknowledge AI limits clearly once, and show how the product is engineered to manage them.**
