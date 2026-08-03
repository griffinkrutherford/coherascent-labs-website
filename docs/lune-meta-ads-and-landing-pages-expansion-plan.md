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

## Modular Quick Missions and Constellations on every landing page

The landing pages should not contain copied versions of the homepage sections. Quick Missions and Constellations should each have one canonical implementation that is used by the homepage and every generated campaign page. The visuals, phone or iPad chassis, animation, interaction, responsive behavior, and accessibility stay identical; only the copy and selected content change by campaign.

### Recommended component architecture

Create two reusable components:

```html
<lune-quick-missions data-campaign-variant="calculus"></lune-quick-missions>
<lune-constellations data-campaign-variant="calculus"></lune-constellations>
```

Recommended shared files:

```text
lune-synth/campaign/features/
  feature-sections.css
  feature-sections.js
  quick-missions.js
  constellations.js
  defaults.js
```

Responsibilities:

- `feature-sections.css` owns the canonical visuals, breakpoints, chassis, glows, tabs, slideshow states, and reduced-motion behavior.
- `quick-missions.js` owns Quick Mission markup, media handling, and interaction.
- `constellations.js` owns World selection, Constellation steps, slideshow state, and media handling.
- `defaults.js` provides fallback copy by campaign family.
- `feature-sections.js` registers the custom elements and connects analytics and progressive enhancement.

Do not maintain a second simplified design for campaign pages. Extract the proven homepage markup, styles, and behavior into these shared modules, then make the homepage consume the same components. That makes visual parity structural rather than dependent on manually keeping two implementations synchronized.

### Progressive enhancement and accessibility

The campaign-page generator should emit meaningful section markup or a `<template>` fallback so headings and core explanations remain available when JavaScript fails. JavaScript may enhance the section with tabs, autoplay, World switching, and slideshow motion.

Both components must include:

- Unique heading IDs generated from the page variant.
- Keyboard-operable tabs and controls.
- Correct `aria-selected`, `aria-controls`, and live-state announcements.
- Paused motion under `prefers-reduced-motion: reduce`.
- Posters or static images when video cannot load.
- Descriptive media alt text without repeating nearby copy.
- No autoplay audio.

### Campaign-manifest schema

Add a `featureSections` object to each record in `lune-synth/campaign/pages.json`. A page should only specify copy or content that differs from its family defaults.

Example:

```json
{
  "variant": "calculus",
  "featureSections": {
    "order": ["quickMissions", "constellations"],
    "quickMissions": {
      "enabled": true,
      "eyebrow": "Focused calculus practice",
      "headline": "Turn one weak rule into one clear mission.",
      "body": "Practice the exact derivative, limit, or integral step that broke down in your last attempt.",
      "contrastBefore": "Open another two-hour review video",
      "contrastAfter": "Complete one targeted calculus mission",
      "media": "/screenshots/applied/quick-mission-screen-poster.png",
      "mediaAlt": "A short calculus Quick Mission in Lune Synth"
    },
    "constellations": {
      "enabled": true,
      "eyebrow": "A visible path through calculus",
      "headline": "Turn the syllabus into a constellation of skills.",
      "body": "Move from functions and limits through derivatives and integrals without losing sight of what comes next.",
      "defaultWorld": "math",
      "goalLabel": "Calculus mastery",
      "mediaAlt": "A calculus learning constellation in the Math Space World"
    }
  }
}
```

The generator should merge values in this order:

1. Global component defaults
2. Campaign-family defaults (`subject`, `test-prep`, `student`, `parent`, or `family`)
3. Individual page overrides

This keeps most page records concise while allowing niche-specific copy. `enabled: false` should remain available for a controlled experiment, but the intended production default is for both sections to appear on every landing page.

### Family-level default copy strategy

Use defaults that remain useful when a page has not yet received bespoke copy:

| Family | Quick Missions default | Constellations default |
|---|---|---|
| Subject | Turn the last weak step into a short targeted practice set. | Turn a full course into a visible sequence of connected skills. |
| Test prep | Spend the next few minutes on the error pattern most likely to affect the next score. | Map the path from today's baseline to exam day. |
| Student | Start one useful mission when a full study session feels too large. | Break an overwhelming goal into visible, finishable steps. |
| Parent | Give the learner one focused task without taking over the work. | Make progress visible without reducing learning to grades alone. |
| Family | Fit focused practice into the rhythm of the curriculum. | Organize long-term learning into a path the family can understand. |

Individual page copy should mention the actual niche, but it should not describe capabilities that the product does not yet support.

### Placement within generated landing pages

Use this default order:

1. Hero and global CTA
2. Problem framing
3. Lune Synth attempt-and-feedback loop
4. Concrete feedback example
5. Quick Missions
6. Constellations
7. Final global CTA

Quick Missions follows the feedback example because it answers, “What should I practice next?” Constellations follows Quick Missions because it expands that immediate action into a longer path. The final CTA then arrives after both short-term and long-term value have been demonstrated.

Allow `featureSections.order` to reverse the two only when campaign intent supports it. For example, a study-consistency page should lead with Quick Missions, while a long-horizon exam campaign may test Constellations first.

### Visual parity with the homepage

- Reuse the same homepage section DOM structure and class names inside the shared components.
- Move the relevant homepage CSS into the shared stylesheet without restyling it.
- Reuse the exact phone and iPad chassis variables rather than recreating approximate devices.
- Reuse the current Quick Mission poster/video and Constellation World media.
- Expose only controlled CSS custom properties for campaign palette accents.
- Keep geometry, typography, spacing, shadows, animation timing, and control styling locked.
- Permit text length differences through balanced headings and documented character guidance, not one-off CSS.
- Any visual fix must be made in the shared component so the homepage and every landing page receive it simultaneously.

Suggested theme interface:

```css
lune-quick-missions,
lune-constellations {
  --feature-accent-a: var(--blue);
  --feature-accent-b: var(--purple);
  --feature-accent-c: var(--red);
}
```

The page may set these variables from its niche palette, but it must not override component layout rules.

### Media-selection rules

Quick Missions:

- Use the existing generic footage until a niche-specific mission has been recorded.
- Prefer a niche-specific poster and video when the visible prompt matches the landing page.
- Never show a medical prompt on an elementary-math page or an SAT prompt on an MCAT page.

Constellations:

- Use Math Space for mathematics, statistics, physics, engineering, and quantitative test prep.
- Use Earth for history, writing, economics, accounting, and general academic campaigns.
- Use Jupiter for science, medical, and high-intensity test-prep campaigns.
- Use Retro Arcade for younger learners, motivation, and study-consistency campaigns.
- Treat this as a default map; a per-page override may select a better World when real niche footage exists.

### Generator changes

Update `scripts/generate-lune-campaign-pages.js` to:

1. Normalize `featureSections` with family and global defaults.
2. Render both component hosts between the feedback section and final CTA.
3. Include the shared feature stylesheet and script once per page.
4. Escape all manifest-supplied text before rendering it.
5. Pass configuration through safe JSON or generated child markup rather than long HTML data attributes.
6. Generate stable analytics attributes such as `data-feature="quick-missions"` and `data-feature="constellations"`.
7. Keep all CTA rendering unchanged and centralized.

Do not hand-edit the generated landing-page HTML. All per-page copy belongs in `pages.json`; all shared structure belongs in the generator or component modules.

### Performance requirements

- Lazy-load feature video and noncritical images below the fold.
- Provide responsive poster images and avoid downloading desktop media on small screens.
- Load the shared feature JavaScript with `defer` or as a module.
- Use one copy of shared CSS and JavaScript regardless of how many components appear.
- Pause video when its section is outside the viewport.
- Respect data-saving preferences where available.
- Reserve media dimensions to avoid layout shift.
- Do not allow these sections to delay the hero image, headline, or CTA.

### Analytics

Track the same normalized events on every page:

- `feature_section_view` with `feature_name` and `campaign_variant`
- `quick_mission_play`
- `quick_mission_complete_preview`
- `constellation_step_change`
- `constellation_world_change`
- CTA clicks occurring after each feature section

Analytics should describe the interaction, not contain page-specific event names. Campaign variant and landing path provide the niche context.

### Testing and rollout

1. Extract Quick Missions into a shared component and replace the homepage implementation with it.
2. Confirm pixel-level parity at desktop and mobile widths.
3. Repeat for Constellations.
4. Add both components to one representative subject page, one test-prep page, and one parent page.
5. Validate accessibility, reduced motion, media fallback, analytics, and CTA behavior.
6. Add family defaults and generate every campaign page.
7. Review copy length, media relevance, and mobile layout across all variants.
8. Add bespoke copy to the highest-priority paid campaigns first.
9. Roll out to all landing pages and compare conversion performance against pages without the feature sections.

Acceptance criteria:

- Homepage and landing-page components are visually identical at the same viewport.
- A shared visual change requires editing one component stylesheet or script only.
- Per-page Quick Missions and Constellations copy requires editing only `pages.json`.
- Every page builds successfully through `npm run build:campaigns`.
- No horizontal overflow occurs at 320px width.
- Videos remain optional and have poster fallbacks.
- The global CTA remains the only source of offer and destination configuration.

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
