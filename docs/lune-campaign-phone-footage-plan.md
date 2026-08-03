# Lune Synth campaign phone footage plan

## Objective

Replace or supplement static phone screens across the 42 campaign landing pages with concise, audience-appropriate product footage. Every clip shown inside a phone mock must use the exact shared Lune Synth chassis already used by the main homepage and campaign template.

The purpose of the footage is to prove that the product supports the promise made in the copy. It should demonstrate a real attempt, a precise response, or a focused next mission—not provide generic visual movement.

## Important distinction

Two different asset types may be used on a landing page:

1. **In-phone product footage** — a clean portrait screen recording placed inside the shared phone chassis.
2. **External B-roll** — a student writing, drawing, calculating, reading, or photographing work. This belongs beside or behind the phone, never inside the phone screen.

Do not place camera footage of a physical phone inside the CSS phone chassis. That creates a phone-inside-a-phone effect. Do not bake a hardware frame into a screen recording; the shared campaign component supplies the chassis.

## Existing footage inventory

| Asset | Best use | Notes |
| --- | --- | --- |
| `lune-synth/screenshots/applied/math-animation-luna-tutor-section.mp4` | Math, Algebra, Calculus | Existing math-specific product motion; cut subject-appropriate excerpts. |
| `lune-synth/screenshots/applied/quick-mission-screen.mp4` | Study consistency, college study, test prep | Strong demonstration of a short focused mission. |
| `lune-synth/screenshots/applied/quick-mission-video.mp4` | General study and parent pages | Broader Quick Mission presentation; use when the full workflow matters. |
| `lune-synth/screenshots/applied/luna-hints.mp4` | Parent help, students behind, homework | Demonstrates support without revealing a full answer. |
| `lune-synth/screenshots/applied/luna-chat.mp4` | Writing, college study, adult learners | Suitable when the copy emphasizes explanation or clarification. |
| `lune-synth/screenshots/applied/luna-key-terms.mp4` | Biology, Anatomy, Psychology, History | Reusable only when the shown vocabulary matches or can be rerecorded cleanly. |
| `lune-synth/screenshots/applied/luna-infographics.mp4` | Biology, Anatomy, Economics | Use for concept visualization, not as a substitute for handwritten feedback. |
| `lune-synth/screenshots/applied/step-1.mp4` through `step-5.mp4` | Generic capture-to-feedback workflow | Strong reusable sequence for AI/homework, homeschool, engineering, and adult learners. |
| `lune-synth/screenshots/applied/step-1-math-space-world.mp4` and `step-2-math-sky.mp4` | Math-world selection | Decorative product context; secondary to a real problem attempt. |
| `lune-synth/screenshots/applied/step-1-earth-world.mp4` | General academic campaigns | Use only if the visible world and content are audience-neutral. |
| `lune-synth/screenshots/applied/step-1-jupiter-world.mp4` | General test-prep campaigns | Use as brief establishing footage, not primary proof. |
| `lune-synth/screenshots/applied/step-1-retro-arcade-world.mp4` and `step-2-retro-sky.mp4` | Younger/student motivation pages | Best for study consistency or middle-school audiences. |
| `lune-synth/screenshots/applied/lost-in-the-cosmos.mp4` | Broad problem-awareness creative | Better as external section footage than inside the campaign hero phone. |

The current `mobile-app-assets/screenshots/applied/question-prompts/` and `results/` files are still images, not footage. They are useful posters and visual references for new recordings.

## Standard in-phone sequence

Unless a page calls for a different flow, record a 7–10 second portrait sequence:

1. Hold on the relevant mission prompt for 1.5 seconds.
2. Tap the handwriting or upload action.
3. Show a brief capture or processing state.
4. Reveal the specific grading observation or Luna hint.
5. End on the targeted next mission for at least 1.5 seconds.

The sequence should loop cleanly or end on a stable poster frame.

## Recording specification

- Native portrait app recording with no device chassis baked in
- Preferred master size: 1206 × 2622 or the current iPhone simulator's native portrait resolution
- Aspect ratio: 9:19.5
- Frame rate: 30 fps unless app motion requires 60 fps
- Duration: 7–10 seconds for the hero phone; maximum 14 seconds
- Codec delivery: H.264 MP4 for compatibility, optional WebM derivative
- No cursor, simulator chrome, taps indicator, notifications, personal data, or debug overlays
- Use deterministic demo accounts and prepared attempts
- Begin and end on visually compatible frames for looping
- Keep all essential text inside mobile-safe margins
- Record light taps and transitions at a pace that remains legible on mobile
- Export a poster image from the strongest stable frame
- Preserve original lossless or high-bitrate masters outside the web delivery directory

## External B-roll specification

When a page benefits from physical footage, capture 4K or 1080p vertical and horizontal masters:

- Hand enters frame and works through a real problem on paper
- No visible school, student, or family names
- Avoid identifiable minors unless releases are secured
- Match the page's subject through real notation, diagrams, graphs, or prose
- Keep screens free of third-party trademarks and copyrighted test questions
- Favor natural desk movement over staged pointing at empty pages
- Capture 6–12 second takes with handles before and after the action
- Record clean plates of the desk and page for flexible editing

## Per-page footage matrix

### Fields of study

| Page | Phone footage decision | In-phone sequence | Optional external B-roll |
| --- | --- | --- | --- |
| Mathematics | Recut existing math footage | Use `math-animation-luna-tutor-section.mp4`; end on a targeted math hint. | Handwritten multistep equation with one crossed-out repair. |
| Physics | Record new | Free-body diagram → equation setup → feedback on a force component → next diagram mission. | Hand sketching a force diagram beside a calculator. |
| Chemistry | Record new | Equilibrium or pH prompt → written causal explanation → feedback on the reversed relationship. | Balanced reaction and molecular sketch on paper. |
| Biology | Record new; reuse Luna visual footage only as secondary | AP Biology transport prompt → written explanation → mechanism feedback → next comparison mission. | Student labeling a cell and drawing water movement arrows. |
| Computer Science | Record new | Algorithm prompt → photographed recurrence/pseudocode → reconstruction feedback → next trace mission. | Hand tracing a table or state transitions on graph paper. |
| Engineering | Edit existing workflow | Use `step-1.mp4` through feedback, replacing demo work with an engineering sketch when rerecorded. | Dimensioned sketch, assumptions, and units on engineering paper. |
| Statistics | Record new | Probability prompt → handwritten criterion → feedback on independence test → next classification mission. | Probability tree or distribution sketch. |
| Economics | Record new | Supply/demand diagram → written assumption → feedback on missing condition → next graph mission. | Hand shifting a curve and annotating the mechanism. |
| Psychology | Record new | Application prompt → spoken or written classification → feedback on reinforcement direction. | Student mapping study variables and outcomes. |
| History | Record new | Industrialization prompt → paragraph upload → causal-order feedback → next evidence mission. | Hand arranging dates and evidence cards beside a draft paragraph. |
| Algebra | Recut existing math footage or record a shorter variant | Linear equation → visible isolation steps → equality feedback → next equation mission. | Close-up of both sides of an equation being transformed. |
| Calculus | Recut existing math footage | Calculus prompt → product-rule attempt → component derivative hint → next derivative mission. | Handwriting a derivative with rule annotations. |
| Geometry | Record new | Labeled rectangle/diagram → equation attempt → formula feedback → next diagram-to-equation mission. | Compass, ruler, and labeled geometric sketch. |
| Arithmetic | Record new | Grade-level multiplication prompt → handwritten standard method → regrouping hint → next short problem. | Child-safe hands-only shot of place-value work; release not needed if no person is identifiable. |
| Organic Chemistry | Record new | Structure/mechanism prompt → drawn arrows → electron-source feedback → next reaction mission. | Hand drawing skeletal structures and curved arrows. |
| Anatomy & Physiology | Record new | Oxygen-affinity prompt → pathway explanation → feedback on affinity direction → next system mission. | Hand labeling a body-system diagram. |
| Nursing | Record new | Clinical vignette → written priority/rationale → safety feedback → next prioritization mission. | Adult student organizing findings on a blank study sheet; no real patient information. |
| Accounting | Record new | Transaction prompt → journal entry upload → timing/classification feedback → next adjustment mission. | Handwritten T-accounts and adjusting entry. |
| Finance | Record new | Cash-flow timeline → rate setup → period-mismatch feedback → next timeline mission. | Hand drawing a discounted cash-flow timeline. |
| Writing | Edit existing Luna chat footage, then record writing-specific version | Original paragraph → focused analysis feedback → one-sentence revision → next revision mission. | Hand revising a paragraph with margin notes. |

### Standardized tests

| Page | Phone footage decision | In-phone sequence | Optional external B-roll |
| --- | --- | --- | --- |
| SAT | Record from existing SAT demo state | SAT algebra prompt → handwritten solution → isolation feedback → timed next mission. | Generic algebra work; never show official test material. |
| ACT | Record from existing ACT demo state | ACT rectangle prompt → algebraic setup → method/pacing feedback → next timed problem. | Timer beside handwritten geometry/algebra work. |
| PSAT/NMSQT | Adapt SAT recording with PSAT-safe original prompt | Foundational algebra prompt → efficient symbolic setup → feedback → next habit mission. | High-school study desk with generic practice sheet. |
| AP Exams | Record new AP Biology flow | AP-style free response → written mechanism → causal-link feedback → next timed response. | Student drawing and explaining a biological process. |
| GED | Edit generic workflow, then record GED-specific prompt | Percent-change prompt → written setup → denominator feedback → short recovery set. | Adult hand working a practical percentage problem. |
| GRE | Record from existing GRE demo state | Divisibility prompt → proof attempt → general-case feedback → next proof mission. | Advanced quantitative notes with no branded test booklet. |
| MCAT | Record from existing MCAT demo state | Biochemistry prompt → written mechanism → affinity feedback → next passage-style mission. | Biochemistry pathway notes; no medical imagery needed. |
| LSAT | Record from existing LSAT demo state | Conditional rule → diagrammed logic → exception feedback → next rule mission. | Hand diagramming conditional logic on a legal pad. |
| GMAT | Record new using original quantitative prompt | Number-properties/data prompt → method → generality or efficiency feedback → next timed mission. | Quantitative scratch work beside a timer. |
| USMLE | Record from existing USMLE demo state | Clinical vignette → priority and rationale → safety feedback → next case. | Adult medical student study setup with fictional case notes only. |
| IB Exams | Record from existing IB Math demo state | Probability prompt → full working → criterion feedback → next written response. | Complete working shown neatly on graph paper. |
| State Assessments | Record new grade-level sequence | Original standards-aligned prompt → handwritten method → one-step correction → next skill mission. | Neutral schoolwork with no state logos or released items. |

### Parent, student, and family niches

| Page | Phone footage decision | In-phone sequence | Optional external B-roll |
| --- | --- | --- | --- |
| Parents—Math Help | Edit existing `luna-hints.mp4` | Child's attempt → preserved correct work → one small hint → confidence-building next problem. | Parent nearby while child writes, with faces out of frame. |
| Parents—AI and Homework | Edit existing five-step workflow | Handwritten attempt → capture → AI feedback after effort → repaired step. | Contrast an empty chatbot prompt with a completed paper attempt, without showing third-party UI. |
| Parents—Homework Help | Record elementary homework flow | Multiplication attempt → regrouping hint → corrected line → next two-question set. | Calm kitchen-table homework scene, hands only. |
| Students Behind in Math | Edit low-score result plus new recovery flow | Low result → narrow diagnosed skill → tiny recovery mission → improved result. | Erasing and repairing one signed-number line. |
| Study Consistency | Use existing `quick-mission-screen.mp4` | Open one Quick Mission → complete attempt → feedback → next mission queued. | Student beginning a five-minute session rather than organizing supplies endlessly. |
| Homeschool Families | Edit existing capture workflow | Existing paper curriculum page → photo capture → feedback → aligned next mission. | Parent and student hands reviewing work; no identifiable minor. |
| Parents—Middle School Math | Record new | Proportion attempt → operation feedback → short visual practice set. | Middle-school-level fraction/proportion work, hands only. |
| Parents—High School Math | Adapt SAT/algebra recording | High-school equation → one invalid transformation → focused correction → next mission. | Teen study desk without face, name, or school branding. |
| College Study | Use Quick Mission footage, then record advanced variant | Advanced prompt → retrieval attempt → assumption feedback → next spaced mission. | College notes closed while student retrieves onto blank paper. |
| Adult Learners | Edit generic workflow with adult-oriented demo content | Rusty attempt → narrow diagnosis → ten-minute refresher → stable success result. | Adult hand returning to a practical math or writing task. |

## Asset naming convention

Store new web-ready recordings under:

```text
lune-synth/campaign/media/<variant>/
  hero-phone.mp4
  hero-phone.webm
  hero-phone-poster.webp
  b-roll-primary.mp4
  b-roll-primary.webm
  b-roll-primary-poster.webp
```

Use the campaign `variant` from `lune-synth/campaign/pages.json` as the directory name. Source masters should live outside the delivery directory or in the team's designated media archive.

## Template integration plan

Add optional media fields to each page configuration:

```json
{
  "phoneVideoMp4": "/campaign/media/calculus/hero-phone.mp4",
  "phoneVideoWebm": "/campaign/media/calculus/hero-phone.webm",
  "phonePoster": "/campaign/media/calculus/hero-phone-poster.webp",
  "phoneAutoplay": true,
  "bRollVideoMp4": "/campaign/media/calculus/b-roll-primary.mp4"
}
```

The generator should render a `<video>` only when a valid video field exists. Otherwise it must retain the current still-image `<picture>` fallback. The shared chassis markup must remain unchanged.

Required video behavior:

- `muted`, `playsinline`, and `loop`
- Autoplay only when motion preferences and data-saving signals allow it
- Poster image visible immediately
- Pause when the phone leaves the viewport
- Pause while the tab is hidden
- Never autoplay audio
- Retain meaningful accessible labeling outside the video element
- Use the static screenshot when `prefers-reduced-motion: reduce` is active

## Production batches

### Batch 1: High-value existing edits

1. Mathematics, Algebra, and Calculus from the math footage
2. Study Consistency and College Study from Quick Missions
3. Parent Math Help from Luna hints
4. AI and Homework plus Homeschool from the five-step workflow
5. Writing and Adult Learners from Luna chat/workflow footage

### Batch 2: Existing demo states that need fresh capture

1. SAT, ACT, GRE, MCAT, LSAT, USMLE, and IB Exams
2. Biology/AP Exams, Computer Science, History, Statistics, and Arithmetic
3. Middle-school and high-school math variants

### Batch 3: New subject-specific demo content

1. Physics, Geometry, Chemistry, Organic Chemistry
2. Anatomy & Physiology, Nursing
3. Engineering, Economics, Accounting, Finance, Psychology
4. GED, GMAT, and state assessments

## Quality-control checklist

- The phone chassis is supplied by the shared landing-page CSS, not baked into footage.
- The visible app prompt matches the page's subject and copy.
- Test-prep footage uses original questions and contains no official test pages or logos.
- Medical and nursing demos contain fictional information and include no patient data.
- All text remains readable at a 320px CSS viewport.
- The clip has a stable poster and does not flash during load.
- MP4 and WebM sources resolve and use correct MIME types.
- Reduced-motion mode receives the still fallback.
- The video pauses offscreen and when the page is hidden.
- Mobile Safari plays inline rather than taking over the screen.
- The loop does not repeat a loading spinner or abrupt transition.
- Page weight and Largest Contentful Paint are measured before rollout.

## Definition of done

- Every one of the 42 landing pages has an approved footage decision.
- Existing footage is reused only when the visible content supports the page's promise.
- Every new recording has a precise prompt, interaction, feedback, and next-mission brief.
- In-phone footage uses the exact shared main-site chassis.
- Static posters remain available as resilient and reduced-motion fallbacks.
- All new footage is compressed, tested on iOS Safari and Android Chrome, and linked through configuration rather than hardcoded page edits.
