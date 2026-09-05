# Lune Synth campaign landing pages plan

## Objective

Create a scalable family of concise Lune Synth landing pages for Meta ad campaigns. The initial launch will include ten subject pages, standardized-test pages, and audience/problem pages. Every page will use the same reusable layout, visual system, interaction behavior, and beta waitlist CTA. Only the audience-specific copy, examples, and small decorative labels will vary.

The goal is to give each ad audience a page that immediately reflects what they study, the test they are preparing for, or the problem they are trying to solve while keeping campaign destinations controlled enough for meaningful comparisons.

## Core principle

Build one landing-page template with multiple content configurations, not a collection of independently designed pages.

The pages should feel unmistakably related to the main Lune Synth homepage, but they should be substantially shorter and faster to understand. Reuse the main site's colors, typography, starfield, glass panels, gradients, product imagery, navigation identity, responsive behavior, and motion language. Do not invent a different visual theme for each subject.

Variant differentiation should come from:

- Page title and metadata
- Hero headline and supporting copy
- Subject, test, or audience label
- Example handwritten problem or mission
- Three audience-specific benefit statements
- One audience-specific Luna interaction example
- Closing sentence before the shared CTA

Variant differentiation should not come from:

- Different page structures
- Different CTA offers or button text
- Different pricing language
- Different color palettes
- Different navigation patterns
- Different amounts of content
- Audience-specific features that Lune Synth does not actually provide

## Shared conversion goal

All campaign pages will use the exact existing CTA:

> Join the beta waitlist
>
> Limited-time offer for the first 40 users: 2 months free & a lifetime 50% off Lune Synth™ Pro.

The form fields, submit button, success message, validation, and `/api/waitlist` submission behavior must remain identical across every variant.

The CTA should appear twice using the same form component:

1. In or immediately beneath the hero, above the fold on common mobile sizes.
2. At the end of the page after the product explanation.

Both placements should submit to the same endpoint and share the same underlying form behavior. The variant and campaign attribution may be sent as hidden analytics fields, but the visible offer and user experience must not change. Parent-facing pages must still use this exact CTA; surrounding copy can explain that the parent is joining to get access for their child.

## Campaign families and proposed routes

The initial campaign library should contain three clearly separated families. This makes the system extensible without forcing subjects, tests, and parent concerns into the same copy formula.

### Family A: fields of study

| Variant | Route | Subject label | Copy angle |
| --- | --- | --- | --- |
| Mathematics | `/study/math/` | Mathematics | Show every step, catch the exact line where the solution changed direction, and practice the weak skill again. |
| Physics | `/study/physics/` | Physics | Grade equations, diagrams, units, and reasoning—not only the final numerical answer. |
| Chemistry | `/study/chemistry/` | Chemistry | Work through reactions, structures, calculations, and lab concepts on paper with targeted guidance. |
| Biology | `/study/biology/` | Biology | Turn diagrams, systems, vocabulary, and written explanations into active recall and checkable work. |
| Computer Science | `/study/computer-science/` | Computer Science | Plan algorithms, trace logic, explain code, and strengthen the reasoning that comes before an editor or AI assistant. |
| Engineering | `/study/engineering/` | Engineering | Keep assumptions, sketches, calculations, and design decisions visible so feedback can address the whole solution. |
| Statistics | `/study/statistics/` | Statistics | Check setup, notation, interpretation, and conclusions instead of rewarding a correct number with weak reasoning. |
| Economics | `/study/economics/` | Economics | Connect graphs, models, calculations, and written arguments in one visible chain of thought. |
| Psychology | `/study/psychology/` | Psychology | Practice concepts, study designs, evidence evaluation, and written application without passive rereading. |
| History | `/study/history/` | History | Strengthen recall, chronology, source analysis, and argument construction through written retrieval and feedback. |

These subjects provide a useful spread across quantitative, laboratory, technical, social-science, and humanities audiences while remaining compatible with Lune Synth's core promise: students produce real work before receiving help.

### Family B: standardized tests

| Variant | Route | Audience label | Copy angle |
| --- | --- | --- | --- |
| SAT | `/test-prep/sat/` | SAT Prep | Replace passive question review with worked attempts, precise error diagnosis, and practice aimed at the next weak skill. |
| ACT | `/test-prep/act/` | ACT Prep | Build accurate reasoning under time pressure across math, science, English, and reading practice. |
| PSAT/NMSQT | `/test-prep/psat/` | PSAT/NMSQT Prep | Establish strong SAT-style habits early while targeting gaps before they become expensive test-day mistakes. |
| AP Exams | `/test-prep/ap-exams/` | AP Exam Prep | Practice free-response reasoning, diagrams, calculations, evidence, and explanations instead of relying only on multiple-choice review. |
| GED | `/test-prep/ged/` | GED Prep | Rebuild confidence through manageable written attempts and focused practice across the skills needed for test readiness. |
| GRE | `/test-prep/gre/` | GRE Prep | Diagnose quantitative reasoning and written-analysis gaps through visible work rather than answer memorization. |

The SAT and ACT should receive dedicated pages and campaigns rather than being combined into a generic test-prep page. Their audiences, timing, section structures, parent involvement, and ad language are different enough to justify distinct copy.

Additional exams should be added only when the product can truthfully support representative practice for them. Potential later variants include GMAT, MCAT, LSAT, state assessments, and specific AP subjects. These should not launch on the strength of generic study language alone; their examples and claims need exam-specific review.

Standardized-test copy must avoid:

- Guaranteed score increases
- Unsupported average score claims
- Claims of official affiliation or endorsement
- Official logos, questions, or copyrighted test material without permission
- Implying complete exam coverage before it exists
- Artificial urgency based on invented deadlines

### Family C: audience and problem niches

| Variant | Route | Primary visitor | Copy angle |
| --- | --- | --- | --- |
| Parents of children struggling with math | `/for-parents/math-help/` | Parent/guardian | Help your child show their work, locate the step that is breaking down, and rebuild confidence without handing them answers. |
| Parents worried about AI dependence | `/for-parents/ai-and-homework/` | Parent/guardian | Give students useful AI support while preserving effort, handwriting, and independent thought. |
| Parents seeking homework support | `/for-parents/homework-help/` | Parent/guardian | Provide guidance between teacher check-ins without turning nightly homework into answer copying or family conflict. |
| Students who feel behind in math | `/for-students/behind-in-math/` | Student | Start from the exact step that stopped making sense and rebuild the missing skills through small wins. |
| Students who procrastinate | `/for-students/study-consistency/` | Student | Turn vague study goals into short missions, visible progress, and a repeatable practice routine. |
| Homeschool families | `/for-families/homeschool/` | Parent and student | Add structured practice and precise feedback while keeping the family in control of curriculum and pacing. |

These are problem-aware pages, not academic-subject pages. Their hero copy should begin with the visitor's concern and desired outcome before explaining the product mechanism.

For parent-facing pages:

- Address the parent directly with `your child` language.
- Avoid blaming the student, parent, or teacher.
- Emphasize visibility into attempts, precise support, confidence, and independence.
- Explain the anti-answer-copying position in practical rather than ideological terms.
- Keep the waitlist CTA unchanged, with one nearby sentence clarifying that the parent is joining for early family access.
- Do not imply clinical diagnosis, guaranteed remediation, or replacement of a teacher or tutor.

### Recommended initial scope

The reusable system should support all variants above, but rollout can be staged:

1. Build one canonical Mathematics page.
2. Build SAT and ACT pages to validate the test-prep copy pattern.
3. Build the parents-of-children-struggling-with-math page to validate parent-directed messaging.
4. Once all three campaign families render cleanly in the same template, populate the remaining variants.

This produces an initial library of 22 destinations: 10 fields of study, 6 standardized tests, and 6 audience/problem niches. The architecture should allow more variants to be added as content configurations rather than new designs.

## Concise page structure

Target a page length of roughly 700–1,000 words and five primary sections. A visitor should understand the subject fit, product mechanism, and offer in under one minute of scanning.

### 1. Minimal header

- Coherascent Labs/Lune Synth identity consistent with the main site
- Lune Synth logo linked to the primary homepage
- One `Join the beta` anchor link
- No long section navigation

### 2. Audience-specific hero

- Eyebrow pattern based on campaign family:
  - Fields: `Lune Synth for [Subject]`
  - Tests: `[Test] prep with Lune Synth`
  - Parent niches: `Lune Synth for families`
  - Student niches: a short problem-aware label such as `A better way back into math`
- Headline: one clear outcome, ideally 7–12 words
- Supporting paragraph: 35–55 words
- Shared beta waitlist CTA
- One reused product visual or a lightweight audience-specific problem-card treatment

Suggested field headline framework:

> Learn [subject] by doing the work—not watching AI do it.

The framework may be adjusted for natural language, but every headline should preserve the same product position and approximate length.

Suggested test headline framework:

> Prepare for the [test] by doing the thinking yourself.

Suggested parent headline framework:

> Help your child get unstuck without giving them the answer.

These frameworks are starting points, not mandatory word substitutions. The final copy should sound natural and accurately reflect each visitor's motivation.

### 3. The audience-specific learning problem

- Short headline
- One paragraph describing the failure mode common to that field
- One compact visual or callout showing what shallow study looks like versus what real practice looks like

Examples include copying a math solution, memorizing biology terms without retrieval, generating a history essay before forming an argument, or accepting statistical output without interpreting it.

### 4. How Lune Synth helps

Use the same three-card layout on every page:

1. **Do the work** — write, draw, calculate, recall, or explain.
2. **Get precise feedback** — identify the specific error or missing connection.
3. **Practice what is weak** — generate a targeted next mission based on the attempt.

Only the supporting sentence and example inside each card should change by variant.

### 5. Luna and grading example

Show one brief audience-specific interaction using the same visual component on every page:

- A student attempt
- One precise observation from grading
- One hint from Luna
- A repaired response or next-practice recommendation

The example must reinforce that Luna responds to student work rather than replacing it.

### 6. Final CTA

- One audience-specific closing line
- The exact shared beta waitlist offer and form
- Compact links to the main site, blog, privacy, terms, and contact

## Copy matrix

Before implementation, write a single content data file or documented content object with these fields for every variant:

```text
slug
subjectName
campaignFamily
audienceName
testName
metaTitle
metaDescription
eyebrow
heroHeadline
heroBody
problemHeadline
problemBody
problemExample
benefitOneBody
benefitTwoBody
benefitThreeBody
studentAttempt
gradingObservation
lunaHint
nextPractice
closingLine
```

Only fields relevant to a variant need visible output, but every configuration should declare its campaign family and primary audience for analytics and validation.

Copy rules:

- Keep sentence counts and approximate character lengths similar between variants so layouts do not drift.
- Use concrete subject or test vocabulary, but avoid jargon that unnecessarily narrows the audience.
- Do not claim features, grading capabilities, or subject coverage that have not been implemented.
- Avoid generic changes that merely replace one noun with another; each learning problem and example should feel authentic to the discipline, exam, or audience concern.
- Maintain Lune Synth's direct, anti-slop voice without insulting students or teachers.
- Emphasize attempts, visible reasoning, targeted feedback, retrieval, and deliberate practice.
- Use the same CTA wording everywhere.

## Design system and reusable implementation

Create a dedicated landing-page system shared across the campaign route families:

```text
lune-synth/study/
  landing.css
  landing.js
  assets/
  math/index.html
  physics/index.html
  chemistry/index.html
  biology/index.html
  computer-science/index.html
  engineering/index.html
  statistics/index.html
  economics/index.html
  psychology/index.html
  history/index.html
lune-synth/test-prep/
  sat/index.html
  act/index.html
  psat/index.html
  ap-exams/index.html
  ged/index.html
  gre/index.html
lune-synth/for-parents/
  math-help/index.html
  ai-and-homework/index.html
  homework-help/index.html
lune-synth/for-students/
  behind-in-math/index.html
  study-consistency/index.html
lune-synth/for-families/
  homeschool/index.html
```

Preferred implementation approach:

- Build and approve the Mathematics page as the canonical visual template.
- Validate that exact template with one test-prep configuration and one parent configuration before scaling.
- Extract all shared CSS and JavaScript before producing the remaining pages.
- Keep HTML structure and class names identical across variants.
- Change only metadata, copy, accessible labels, examples, and campaign attribution values.
- Reuse optimized assets from the main Lune Synth page where they communicate the product clearly.
- Avoid copying the main homepage's large inline CSS and JavaScript bundle into every file.
- Keep the template compatible with the repository's existing static Node server and `/api/waitlist` endpoint.

## Visual direction

Retain from the main homepage:

- Black cosmic background and subtle starfield
- Blue, purple, and red gradient accents
- Plus Jakarta Sans and Roboto Mono typography
- Glass-panel borders and soft glows
- Lune Synth product identity and Luna voice
- Restrained scroll-reveal motion with reduced-motion support
- Existing waitlist form and confirmation dialog styling

Simplify from the main homepage:

- One hero visual instead of multiple cinematic sequences
- Three compact benefit cards instead of many feature sections
- One interactive or staged product example
- No medal catalog, constellation slideshow, engine deep dive, blog feed, or long crisis narrative
- Minimal animation and no heavy video requirement
- A single-column reading flow on mobile

Each page should share the same layout and accent distribution. Subjects, tests, and audience niches may appear in small labels or example content, but variants should not receive their own brand colors.

## Responsive and accessibility requirements

- Design mobile-first for widths down to 320px.
- No horizontal overflow and no need to zoom out.
- Place the first CTA fully within the early mobile viewport whenever practical.
- Stack the email input and CTA button on narrow screens and center the complete form horizontally.
- Keep tap targets at least 44px high.
- Use semantic headings in a consistent hierarchy.
- Provide useful alt text for subject examples and empty alt text for purely decorative imagery.
- Preserve visible keyboard focus, logical tab order, and form status announcements.
- Respect `prefers-reduced-motion`.
- Maintain adequate contrast in both supported themes if light mode is retained.

## Campaign attribution and measurement

Use the same conversion event and form behavior across all pages so results remain comparable.

Capture without changing the visible CTA:

- Campaign family and variant
- Landing-page path
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- Meta click identifier when present and permitted
- CTA position (`hero` or `footer`)

Recommended events:

1. `landing_page_view`
2. `waitlist_form_start`
3. `waitlist_submit`
4. `waitlist_success`
5. `waitlist_error`

Use one event schema for every variant. Do not create differently named conversion events for each campaign destination. Preserve attribution through the form submission and success state, and document consent/privacy implications before adding Meta Pixel or another third-party tracker.

Primary comparison metric:

> Successful waitlist signups divided by unique landing-page visitors.

Secondary diagnostics:

- Form-start rate
- Form completion rate
- Hero CTA versus footer CTA conversion
- Mobile versus desktop conversion
- Page performance by campaign family, variant, and ad creative

## SEO and metadata

Although these pages are campaign destinations, each should have complete metadata:

- Unique `<title>` and meta description
- Canonical URL
- Open Graph title, description, URL, and image
- Audience-appropriate accessible page heading
- Consistent Lune Synth branding

Decide before launch whether paid-campaign variants should be indexed. If they are intentionally thin or likely to compete with future organic subject pages, add `noindex,follow`. Do not rely on ad parameters to create separate indexable URLs.

## Quality controls

Automated checks should confirm:

- All 22 expected initial routes exist.
- Each route has unique metadata and one `<h1>`.
- Every page uses the same shared CSS and JavaScript files.
- Every visible CTA uses the approved wording.
- Every form posts to `/api/waitlist`.
- Required analytics fields are present and correctly identify the variant and CTA position.
- Internal links and asset paths resolve.
- No page exceeds agreed copy-length bounds by a large margin.
- No horizontal overflow occurs at 320px, 375px, 390px, 768px, and desktop widths.

Manual review should cover:

- Subject, exam, and audience authenticity of all examples
- Claims against current product capabilities
- iOS Safari and Android Chrome behavior
- Keyboard navigation and screen-reader labels
- Reduced-motion behavior
- Waitlist success and error states
- Page load on a throttled mobile connection
- Visual parity across all variants

## Implementation phases

### Phase 1: Content and template definition

1. Confirm the fields, tests, audience niches, and routes in the initial campaign library.
2. Confirm the exact shared CTA language and conversion event.
3. Write the full Mathematics copy as the reference variant.
4. Establish character-count guidance for every variable copy field.
5. Create low-fidelity desktop and mobile layouts for the shared template.

### Phase 2: Canonical page build

1. Implement the shared CSS and JavaScript.
2. Build `/study/math/` using existing Lune Synth design tokens and assets.
3. Connect both CTA instances to `/api/waitlist`.
4. Add campaign attribution capture.
5. Validate mobile layout, accessibility, performance, and form behavior.

### Phase 3: Campaign-family validation

1. Build the SAT and ACT configurations in the canonical template.
2. Build the parents-of-children-struggling-with-math configuration in the same template.
3. Confirm that student, test-prep, and parent messaging all work without structural design changes.
4. Review claims, examples, mobile wrapping, and CTA consistency.

### Phase 4: Remaining copy variants

1. Draft the remaining subject, test, and niche copy sets in the content matrix.
2. Review examples for disciplinary and exam accuracy, audience empathy, and product truthfulness.
3. Duplicate only the approved template markup.
4. Insert each copy set and its metadata.
5. Confirm visual height and wrapping remain reasonably consistent.

### Phase 5: Campaign readiness

1. Run route, link, metadata, CTA consistency, and responsive tests.
2. Verify analytics in a non-production or test mode.
3. Test Meta ad URLs with realistic UTM parameters.
4. Confirm attribution survives through successful waitlist submission.
5. Publish all variants together to prevent campaign routing gaps.

### Phase 6: Experiment and iterate

1. Start with comparable budgets and audience intent where possible.
2. Avoid changing template design during the initial comparison window.
3. Evaluate audience/message fit using successful signup rate.
4. Improve weak variant copy while keeping layout and offer fixed.
5. Only test structural design changes as a separate experiment shared across all variants.

## Definition of done

- Twenty-two production-ready routes use one shared, concise visual template.
- Every page communicates a credible subject-, test-, or audience-specific learning problem and example.
- Design differences are limited to copy and content-level details.
- Both CTA placements use the exact existing beta waitlist offer and behavior.
- Attribution identifies campaign family, variant, campaign, creative, and CTA position.
- Pages work without horizontal zoom on mobile and load quickly.
- Accessibility, analytics, form submission, metadata, and internal links are verified.
- All pages are ready to be used as direct destinations in separate Meta ad campaigns.

## Decisions to confirm before implementation

1. Whether the proposed fields, tests, and audience niches are the final initial campaign set.
2. Whether the proposed `/study/`, `/test-prep/`, and audience route families should be retained.
3. Whether paid landing pages should be indexable.
4. Whether Meta Pixel is already approved and configured, or whether first-party attribution should launch first.
5. Whether the existing waitlist API can store subject and campaign attribution fields without a backend update.
