# Lune Synth Meta Ads and Landing Pages Expansion Plan

## Objective

Extend the current 13-ad subject campaign with 13 additional niche ads, then add a second creative lane focused on Lune Synth features such as Constellations, Quick Missions, feedback, input modes, Worlds, and medals.

Every ad should send the viewer to a landing page that repeats the same promise, phone screen, terminology, palette, and modular CTA. The creative may vary; the offer must remain controlled by the shared CTA configuration.

## Non-negotiable campaign system

- Use the official Lune Synth app icon above the wordmark.
- Use the established premium black iPhone chassis.
- Use one real app screenshot as the primary product proof.
- Derive the ad palette from that screenshot.
- Write to the learner as the buyer: use `you` and `your`, not `help them`.
- Keep the CTA and offer identical across ads and landing pages.
- Keep a recognizable layout family while giving each niche one meaningful visual motif.
- Preserve the app screen faithfully; do not invent product UI.
- Add or update landing pages through `lune-synth/campaign/pages.json`, then run `npm run build:campaigns`.

## Next 13 niche flyers and landing pages

Each new screenshot should be exported in full, mid, and low WebP variants using the existing phone-screen dimensions and naming conventions.

| # | Niche and route | Screenshot to capture | Flyer angle | Visual language |
|---|---|---|---|---|
| 14 | Physics — `/study/physics/` | A free-body diagram or energy-conservation problem with handwritten equations and units | `MAKE THE EQUATIONS EXPLAIN THE PHYSICS—NOT JUST PRODUCE A NUMBER.` | Force vectors, field lines, dimensional-analysis marks |
| 15 | General Chemistry — `/study/chemistry/` | Stoichiometry, equilibrium, or acid-base work showing setup and unit cancellation | `GET UNSTUCK IN CHEMISTRY—WITHOUT COPYING A FINISHED SETUP.` | Molecular geometry, reaction arrows, glassy periodic-grid fragments |
| 16 | Organic Chemistry — `/study/organic-chemistry/` | A mechanism requiring curved arrows and intermediate reasoning | `LEARN THE MECHANISM—WITHOUT MEMORIZING THE PRODUCT.` | Bond-line structures, orbital lobes, restrained reaction pathway |
| 17 | Anatomy and Physiology — `/study/anatomy-physiology/` | A systems question connecting structure, function, and a written explanation | `CONNECT STRUCTURE TO FUNCTION—WITHOUT MEMORIZING IN ISOLATION.` | Layered anatomical-system diagram, signal pathways, no gore |
| 18 | Nursing — `/study/nursing/` | A dosage calculation or prioritization prompt with explicit rationale | `PRACTICE THE RATIONALE—NOT JUST THE RIGHT CHOICE.` | Care-priority branches, dosage units, calm clinical palette |
| 19 | Engineering — `/study/engineering/` | A statics, circuits, or design-constraint problem with diagram and calculations | `BUILD THE MODEL BEFORE YOU TRUST THE ANSWER.` | Blueprint grid, load paths, circuit traces or constraint geometry |
| 20 | Statistics — `/study/statistics/` | A confidence-interval or hypothesis-test prompt requiring interpretation | `UNDERSTAND THE INFERENCE—NOT JUST THE P-VALUE.` | Distribution curve, interval bands, sample-to-population flow |
| 21 | Economics — `/study/economics/` | A supply-and-demand, elasticity, or marginal-analysis graph with explanation | `MAKE THE GRAPH EXPLAIN THE ECONOMICS.` | Intersecting curves, marginal arrows, restrained data grid |
| 22 | Accounting — `/study/accounting/` | A journal-entry or adjusting-entry problem showing debit/credit reasoning | `MAKE EVERY ENTRY TRACEABLE—NOT JUST BALANCED.` | Ledger lines, transaction flow, balanced luminous columns |
| 23 | Finance — `/study/finance/` | A time-value-of-money problem with timeline, rate conversion, and interpretation | `KEEP THE ASSUMPTIONS ATTACHED TO THE VALUATION.` | Cash-flow timeline, compounding arcs, model inputs |
| 24 | Writing — `/study/writing/` | An original paragraph and feedback focused on evidence-to-claim reasoning | `IMPROVE YOUR WRITING—WITHOUT GIVING UP YOUR VOICE.` | Editorial annotations, claim/evidence connectors, manuscript texture |
| 25 | GED — `/test-prep/ged/` | A practical percent-change or quantitative-reasoning problem | `BUILD TEST-DAY SKILLS—WITHOUT STARTING SCHOOL OVER.` | Practical document fragments, percentage transformations, confident warmth |
| 26 | GMAT — `/test-prep/gmat/` | A data-insights or quantitative problem where efficient setup matters | `FIND THE EFFICIENT METHOD—WITHOUT MEMORIZING TRICKS.` | Decision tree, table-to-equation flow, timing arc |

## Screenshot production brief

For every new niche screen:

1. Use a prompt that is unmistakably representative of the niche.
2. Keep the question short enough to remain readable inside an ad-sized phone.
3. Show a task that benefits from visible reasoning, not a trivia question.
4. Include subject, skill, and difficulty labels.
5. Choose a distinct but brand-compatible screen palette.
6. Verify the screenshot is real app UI and not a flyer-only mockup.
7. Export the full-resolution screen plus `-mid.webp` and `-low.webp` variants.
8. Write an accessible phone-image alt description in the campaign manifest.

## Feature-led flyer campaigns

Feature ads should still sell an outcome. The feature is evidence for the promise, not the entire message.

### Constellations

Primary promise: turn a large study goal into a visible path of smaller missions.

- Capture three screens: selecting a World, opening or creating a Constellation, and viewing the next mission node.
- Best static flyer: one iPad or phone showing the full Constellation, with a luminous path continuing into the background.
- Best carousel: `Choose a World` → `Build a Constellation` → `Complete the next mission`.
- Best short video: eight to twelve seconds showing a node completion and the next node illuminating.
- Headline options:
  - `TURN A BIG STUDY GOAL INTO THE NEXT CLEAR STEP.`
  - `STOP ORGANIZING THE PLAN. START MOVING THROUGH IT.`
  - `SEE THE PATH FROM TODAY'S WORK TO EXAM DAY.`
- Landing page route: `/features/constellations/`.
- Landing-page proof: interactive or recorded Constellation progression, a three-step explanation, and the shared CTA.

### Quick Missions

Primary promise: begin useful practice in minutes without planning a full study session.

- Reuse `lune-synth/screenshots/applied/quick-mission-screen-poster.png` and existing Quick Mission footage where appropriate.
- Static flyer: phone centered with one concise mission card and a five-minute visual cue.
- Video: open a Quick Mission, submit an attempt, receive feedback, and reveal the next mission.
- Headline options:
  - `FIVE MINUTES. ONE REAL ATTEMPT. A BETTER NEXT STEP.`
  - `STOP WAITING FOR THE PERFECT STUDY SESSION.`
  - `DO ONE QUICK MISSION BEFORE YOU SCROLL AGAIN.`
- Landing page route: `/features/quick-missions/`.
- Landing-page proof: mission length, input method, sample feedback, continuation into longer study.

### Handwriting and photo input

Primary promise: keep working naturally on paper while receiving digital feedback.

- Show handwritten page → camera capture → recognized work.
- Headline: `KEEP THE PAPER. ADD PRECISE FEEDBACK.`
- Landing page route: `/features/handwritten-feedback/`.

### Precise grading and targeted feedback

Primary promise: find the exact step that failed without replacing the learner's solution.

- Show the attempt and feedback screen side by side or as a carousel.
- Headline: `YOUR ANSWER ISN'T THE WHOLE STORY. YOUR WORK IS.`
- Landing page route: `/features/precise-feedback/`.

### Recovery missions

Primary promise: turn a mistake into focused practice instead of restarting the whole topic.

- Show a low result, diagnosed skill, short recovery set, and improved result.
- Headline: `ONE MISTAKE SHOULD CREATE A TARGET—NOT A SPIRAL.`
- Landing page route: `/features/recovery-missions/`.

### Voice and text input

Primary promise: use the input mode that fits the subject and moment.

- Make separate voice and text ads before testing a combined multi-input ad.
- Voice headline: `EXPLAIN IT OUT LOUD. FIND THE GAP IN YOUR REASONING.`
- Text headline: `TYPE YOUR THINKING—GET FEEDBACK ON THE DECISION.`
- Landing page routes: `/features/voice-input/` and `/features/text-input/`.

### Worlds and personalization

Primary promise: make serious practice feel like a place worth returning to.

- Use Earth, Jupiter, Math Space, and Retro Arcade footage as separate creative variants.
- Do not let the decorative World obscure the academic task.
- Headline: `BUILD A STUDY WORLD YOU ACTUALLY WANT TO RETURN TO.`
- Landing page route: `/features/worlds/`.

### Medals, streaks, and progress

Primary promise: reward productive learning behaviors rather than passive screen time.

- Feature one medal family per ad: Streak, Recovery, Polymath, Handwriting, or Assessments.
- Show progression from paper or ceramic through gold, platinum, and diamond.
- Headline: `EARN PROGRESS FOR DOING THE WORK.`
- Landing page route: `/features/achievements/`.

## Landing-page requirements

Every new niche or feature page should include:

- A headline that matches the ad's promise closely.
- The same phone screenshot, feature footage, and palette used in the ad.
- The global `<lune-synth-cta>` component in the hero and final section.
- A concise explanation of the learner's problem, the Lune Synth loop, and the resulting benefit.
- One concrete attempt-to-feedback example.
- Mobile layout that shows the entire phone without zooming or horizontal overflow.
- Campaign metadata through the existing `data-campaign-*` attributes.
- Appropriate trademark disclaimers for standardized-test pages.
- No duplicate CTA copy embedded directly in the page when it belongs in the global CTA configuration.

## Meta Ads integration

### Campaign structure

Use three campaign lanes:

1. **Subject intent:** direct niche ads such as SAT, calculus, MCAT, or physics.
2. **Problem awareness:** ads about answer-copying, shallow AI help, procrastination, or not knowing where the work broke.
3. **Feature proof:** Constellations, Quick Missions, handwriting, recovery, feedback, and achievements.

Start each lane with separate ad sets so budget and conversion quality remain interpretable. Avoid mixing every audience and concept into one ad set before there is enough conversion data.

### URL and UTM convention

Use stable lowercase parameters:

```text
https://lunesynth.com/test-prep/sat/?utm_source=meta&utm_medium=paid_social&utm_campaign=sat_beta&utm_content=sat_static_v1&utm_term=broad
```

Recommended fields:

- `utm_source=meta`
- `utm_medium=paid_social`
- `utm_campaign=<niche_or_feature>_<offer>`
- `utm_content=<concept>_<format>_v<number>`
- `utm_term=<audience_or_targeting_test>`

Preserve UTMs through the waitlist conversion so signups can be attributed by niche, creative, and landing page.

### Events

At minimum, track:

- `PageView`
- `ViewContent` with campaign family and variant
- `Lead` or `CompleteRegistration` after a successful waitlist submission
- CTA click as an intermediate diagnostic event
- Optional engaged-view event after meaningful scroll depth or time

Send the same lead event through browser Pixel and Conversions API where possible, using an event ID for deduplication. Confirm domain verification, event prioritization, consent handling, and privacy disclosures before scaling.

### Creative formats

Produce each winning concept in:

- 4:5 feed: `1080 × 1350`
- 9:16 Stories/Reels: `1080 × 1920`, with text inside safe zones
- 1:1 square: `1080 × 1080`
- Six-to-fifteen-second video when the feature involves motion or sequence
- Three-to-five-card carousel for workflows such as capture → feedback → targeted practice

The current generated masters vary in aspect ratio, so create standardized placement exports before uploading them to Meta. Do not stretch the masters; crop or recompose while protecting the icon, headline, phone, CTA, and offer.

### Testing sequence

1. Test the promise while holding visual structure and audience constant.
2. Test the visual motif while holding headline and audience constant.
3. Test the landing-page match for winning creatives.
4. Test static versus short video.
5. Test the offer only through the global CTA configuration.
6. Promote winners into a scaling campaign after enough lead volume exists to distinguish signal from noise.

Useful first comparisons:

- `Get unstuck` versus `Build mastery`
- Subject-specific screenshot versus feature workflow
- Product-only creative versus product plus handwritten page
- Direct CTA versus benefit-led CTA preface
- Broad learner targeting versus niche interest or lookalike audiences

### Evaluation metrics

Judge the funnel in layers:

- Thumb-stop or three-second view rate
- Outbound click-through rate
- Landing-page view rate
- CTA click rate
- Waitlist conversion rate
- Cost per qualified lead
- Lead quality by niche, based on onboarding answers or later activation

A high click-through rate with weak signup conversion usually indicates an ad-to-page mismatch, unclear offer, slow page, or weak trust. A low click-through rate with strong post-click conversion usually means the offer works but the creative hook needs improvement.

## Production order

1. Standardize the existing 13 masters into 4:5, 9:16, and 1:1 exports.
2. Record and export the 13 new niche screenshots.
3. Add the missing niche landing pages or update current pages through `pages.json`.
4. Generate three review flyers from the new batch before producing the remaining ten.
5. Build Constellations and Quick Missions feature pages first; they have the strongest motion and product-story potential.
6. Produce static, video, and carousel variants for those two feature campaigns.
7. Add Pixel, Conversions API, UTM persistence, and lead-event validation before paid launch.
8. Launch small controlled tests, document results weekly, and iterate one variable at a time.

## File organization

Recommended structure:

```text
lune-synth/campaign/ads/meta/
  current-13/
  next-13/
  features/
    constellations/
    quick-missions/
    handwriting/
    feedback/
    achievements/
```

For each concept, keep the master, standardized exports, copy sheet, source screenshot, landing-page URL, and UTM template together.
