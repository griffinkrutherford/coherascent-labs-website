# Lune Synth Marketing Copy and Accuracy Context

## Update Log

- 2026-08-17: Added competitive copy guidance for multimodal grading and question-set generation, with evidence boundaries and recommended website language.

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

- **125 live grading responses** across 35 distinct higher-education prompts.
- Typed, voice-transcript, and handwritten/scanned input were tested.
- 119 of 125 feedback responses avoided materially incorrect guidance: **95.2% observed**, with a 95% Wilson confidence interval of **89.9%–97.8%**.
- At the more conservative distinct-prompt level, 32 of 35 prompts avoided a material failure across tested variants: **91.4% observed**, with a 95% Wilson interval of **77.6%–97.0%**.
- **120 graduate-level questions** were generated across 24 new sets and 12 subject contexts.
- 115 of 120 generated questions avoided a material defect: **95.8% observed**, with a 95% Wilson interval of **90.6%–98.2%**.
- 19 of 24 complete five-question sets contained no material defect: **79.2% observed**.
- All 125 grading requests and all 24 question-set generation requests completed without a runtime or transport failure in the observed evaluation runs.

These are internal pre-beta evaluation results measured on targeted test suites, not field outcome guarantees.

## Copy Boundaries & Claim Guidelines

1. **Subject Breadth Claims:**
   - *Avoid:* "Master any subject."
   - *Use:* "Take on any subject," "Across a growing range of subjects," or "Reason step-by-step through tough coursework."

2. **Grading & Feedback Claims:**
   - *Avoid:* "Never misses a step," "100% accurate grading," or "Flawless step-by-step evaluation."
   - *Use:* "Engineered to catch subtle reasoning breaks," "Rubric-grounded step-by-step feedback," accompanied by pre-beta evaluation benchmarks (95.2% observed defect-free guidance).

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
