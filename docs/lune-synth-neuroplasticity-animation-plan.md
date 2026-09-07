<!-- markdownlint-disable MD013 -->

# Lune Synth — "Build the Circuit" 3D neuron section

_Drafted 2026-09-07. Scope is one new section in `lune-synth/index.html`, one
new module directory `lune-synth/neuro-viz/`, and a vendored copy of three.js.
Line numbers are against the working tree at `ef860d0`; anchor on quoted
strings, not numbers._

## Purpose

A rotatable 3D animation contrasting two learning paths on the same axon:

- **Outsourced** — the answer is generated, the learner copies it. The circuit
  is barely activated, so it stays thin and slow. Nothing is built.
- **Earned** — the learner works the problem by hand, hits the friction, and
  repeats it. The circuit fires repeatedly, myelinates, and conduction gets
  dramatically faster.

The section's job is to make the mechanism *felt*: skill is a physical thing you
build, and the friction is the part that builds it.

## Baseline (measured, not estimated)

| Metric | Value |
| --- | --- |
| `lune-synth/index.html` | 15,913 lines / 619 KB |
| `<canvas>` elements on the page today | 0 |
| WebGL contexts on the page today | 0 |
| `IntersectionObserver` call sites | 23 |
| `prefers-reduced-motion` blocks | 19 |
| `aria-*` attributes | 199 |

This section introduces **the page's first WebGL context**. That is the single
biggest risk in this plan and drives most of the decisions below.

---

## Guardrail: what the science actually supports (read first)

The mechanism is real. The precise chain has one inferential link, and knowing
exactly where it is means the section can be confident everywhere else.

### Solid — state plainly

1. **Activity-dependent myelination.** Neural activity drives oligodendrocyte
   generation and myelination. Gibson et al. (2014, *Science*); McKenzie et al.
   (2014, *Science*) showed new oligodendrocyte generation is *required* for
   motor skill learning.
2. **Practice changes human white matter.** Scholz et al. (2009, *Nat
   Neurosci*, juggling); Bengtsson et al. (2005, *Nat Neurosci*, piano
   practice).
3. **Desirable difficulty / the testing effect.** Effortful retrieval beats
   fluent restudy for durable retention. Bjork's desirable-difficulties
   program; Roediger & Karpicke (2006, *Psych Science*). This is the most
   replicated leg and the closest to the product's actual claim.
4. **Handwriting engages more widespread brain connectivity than typing.**
   Van der Meer & van der Weel (2017); Van der Weel & Van der Meer (2024),
   both *Frontiers in Psychology*, EEG connectivity during handwriting vs
   typing.

### The inferential link — do not state as measured

No study has directly measured **handwriting → thicker myelin**. Legs 1–2
establish that effortful, repeated practice myelinates circuits. Leg 4
establishes that handwriting engages more of the brain than typing. Joining
them is a reasonable mechanistic inference, **not a measured finding**.

Consequence: the section is a **conceptual illustration of how learning
works**, not a visualization of measured results. Labeled that way, it is
honest and still compelling. This also satisfies the accuracy doc's
implementation item 8 — animations must not imply guarantees.

### Citations to treat carefully

- **Mueller & Oppenheimer (2014), "The pen is mightier than the keyboard."**
  Tempting and famous, but a large replication (Morehead, Dunlosky & Rawson,
  2019) failed to reproduce the headline result. **Do not build the section on
  this study.** If cited at all, cite the replication alongside it.
- **Kosmyna et al. (2025), "Your Brain on ChatGPT" (MIT Media Lab).** Directly
  on-theme for the outsourced path, but it is a **preprint**, n≈54, and was
  very widely over-reported. Usable only if labeled as a small preliminary
  study, and never as proof of long-term harm.

### Depiction accuracy — the outsourced neuron must not be "damaged"

The honest contrast is **absence of growth, not injury**. Showing degradation,
dying cells, or shrinking neurons would be false and would read as scare
tactics. The outsourced axon should look *unchanged* — thin sheath, sparse
nodes, slow dim pulse — beside an earned axon that has visibly built something.
"You didn't lose anything; you just didn't build anything" is both true and the
more persuasive framing.

### Timescale honesty

Myelination happens over days-to-weeks of repeated practice, not in one
sitting. The earned path must be labeled as **repeated practice over time**
(the rep counter in §4 does this work). One handwritten problem must not appear
to myelinate an axon.

### Don't shame the typed-input path

The page already has a "Don't want to handwrite?" section (h2 at ~11665)
offering typed and voice input. A section implying handwriting is the only
legitimate path contradicts it and insults users who type for accessibility
reasons. **The axis is effort vs outsourcing, not pen vs keyboard.** Typing
your own reasoning is on the earned side. Handwriting is presented as the
strongest version of the earned path, not as the only valid one.

---

## 1. Placement

**Recommended:** immediately before `How grading works` (h2 at ~11484), after
the Luna section. The narrative becomes *why the friction matters* → *how we
grade the work you did* → *and if you can't handwrite, here's typing/voice*.

**Alternative:** after the Engine section (~13474) as an evidence-flavored
closer. Rejected as primary because the Engine section is already dense and the
"why" lands better before the "how."

Follow existing section conventions:

```html
<section class="section section--neuro" aria-labelledby="neuro-title">
  <h2 class="section-title" id="neuro-title">Build the circuit</h2>
```

Add `<a class="nav-link" href="#neuro-title">` to `#primary-nav`, matching the
13 existing nav anchors.

## 2. Technical architecture

### 2.1 Reuse the `lune-engine` pattern, don't reinvent it

`lune-synth/lune-engine/` already contains a working, well-factored Three.js
harness that was built and then deliberately disabled (see
`disable-and-push-engine.sh`). Its architecture is exactly right here:

- `index.js` — mount, RAF loop, `IntersectionObserver` pause, `ResizeObserver`,
  reduced-motion/WebGL2 bailout, `destroy()`.
- `scene.js` — renderer + camera + composed "beat" modules.
- `timeline.js` — normalized `t` → named slices.
- `fallback.js` — static SVG for reduced-motion / no-WebGL.
- `hooks/reduced-motion.js` — `prefersReducedMotion()`, `hasWebGL2()`.

**Plan:** create `lune-synth/neuro-viz/` as a sibling module with the same
five-file shape. Promote `hooks/` to `lune-synth/shared-hooks/` and have both
modules import it, so the reduced-motion and WebGL2 checks have one definition.

Do **not** re-enable `lune-engine` as part of this work. It is a separate,
unfinished animation with stub beats; entangling them doubles the risk.

### 2.2 three.js delivery — vendored and lazy, not CDN

Commit `9596402` removed the `unpkg` importmap because its only consumer was
disabled. Do not restore a CDN importmap: it adds a third-party runtime
dependency and a privacy surface to a page that currently has neither.

**Decision: vendor `three.module.js` at a pinned version into
`lune-synth/vendor/three/`, and load it with a dynamic `import()` fired by an
`IntersectionObserver` at `rootMargin: "200px"`.**

- Pin **0.166.0** to match what the engine importmap already targeted.
- Nothing about 3D touches the critical path. A user who never scrolls to the
  section downloads zero bytes of it.
- Tree-shaking matters: a full three build is ~600 KB raw. Either build a slim
  bundle containing only the used classes, or accept the full module and verify
  the transferred (gzipped/brotli) cost against the budget in §5.
- Skip `OrbitControls` — it is an extra addon for behavior we want to
  constrain anyway. Write the ~40-line drag handler in §3.

### 2.3 One canvas, two neurons — never two contexts

Two `<canvas>` elements means two WebGL contexts, doubled GPU memory, and on
some mobile browsers a hard context limit. **Render both neurons in a single
scene, in one canvas**, side by side on desktop.

## 3. Interaction: rotation

### 3.1 The mobile scroll trap

A drag-to-rotate canvas that swallows touch events makes the page impossible to
scroll past on a phone. This is the most common way this kind of section ships
broken.

**Rule: horizontal drag rotates, vertical drag scrolls the page.** Implement
with `touch-action: pan-y` on the canvas and a pointer handler that only claims
the gesture once horizontal movement exceeds vertical by a threshold (~8px).
Never call `preventDefault()` on a gesture that is predominantly vertical.

### 3.2 Keyboard access — required, not optional

We just fixed a keyboard-inaccessible carousel in `ef860d0`. Do not add a
second inaccessible control.

- Canvas gets `tabindex="0"`, `role="img"`, and a descriptive `aria-label`.
- Left/Right arrows rotate in ~15° steps; `Home` resets to the default angle.
- `:focus-visible` outline matching the page convention
  (`outline: 2px solid var(--blue); outline-offset: 4px`).
- Arrow keys must `preventDefault()` **only** while the canvas has focus, so
  they don't break page scrolling elsewhere.

### 3.3 Affordance and damping

Rotation is not discoverable on its own. Add a small persistent "drag to
rotate" hint with a rotate glyph, and a slow idle auto-rotation (~2°/s) that
stops permanently on first user interaction — the idle motion advertises the
affordance. Clamp vertical orbit to ±25° and apply inertial damping
(`velocity *= 0.92` per frame) so it feels weighted rather than twitchy.

## 4. Scene design

### 4.1 Shared anatomy

Both neurons use identical geometry so the *only* visible difference is what
practice built:

- Soma (cell body), 3–4 dendrites, one long axon along X.
- Myelin segments as instanced capsules along the axon, with visible gaps for
  nodes of Ranvier.
- A travelling action-potential pulse.

### 4.2 The two states

| | Outsourced | Earned |
| --- | --- | --- |
| Sheath thickness | thin, near-bare | thick, layered |
| Node spacing | sparse / irregular | regular, well-formed |
| Pulse behavior | slow, continuous crawl, dim | fast **saltatory jumps** node to node, bright |
| Synaptic terminals | few, faint | dense, bright |
| Rep counter | stays ~1 | climbs with each rep |

Saltatory conduction — the pulse visibly *leaping* between nodes rather than
crawling — is the scientifically correct depiction and the most legible visual
difference. Make it the centerpiece.

### 4.3 Timeline

Reuse `timeline.js`'s normalized-`t` approach with three acts:

```text
setup    [0.00, 0.20]  both axons bare, identical
practice [0.20, 0.75]  earned side accumulates reps; sheath thickens per rep;
                       outsourced side receives a "copied answer" packet that
                       lands on the page but never travels the axon
result   [0.75, 1.00]  both fire; speed difference is unmistakable
```

The "copied answer" beat is the honest visual for outsourcing: the answer
arrives at the destination without ever traversing the circuit. Nothing is
damaged; nothing is built.

## 5. Performance budget

Non-negotiable targets, measured not assumed:

| Budget | Target |
| --- | --- |
| Added bytes on initial page load | **0** (fully lazy) |
| Transferred JS when section is reached | ≤ 180 KB compressed |
| Desktop frame rate | 60 fps sustained |
| Mid-tier mobile frame rate | ≥ 30 fps sustained |
| Main-thread block on mount | < 50 ms |
| GPU memory | < 40 MB |
| Draw calls | < 30 |

Techniques:

- `InstancedMesh` for all myelin segments (one draw call per neuron).
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — the existing
  `scene.js` already does this; keep it.
- Pause RAF via `IntersectionObserver` when offscreen (existing pattern).
- Also pause on `document.visibilitychange` when the tab is hidden — the
  current engine loop does **not** do this and should.
- No post-processing, no shadow maps, no environment maps.
- Low-poly: capsules at 8 radial segments; the section renders small.
- Full `dispose()` of geometries, materials, and the renderer on destroy.
- **Mobile escape hatch:** below 480px, or on `hardwareConcurrency <= 4`,
  consider serving the static fallback rather than a degraded 3D scene.

## 6. Accessibility and fallback

Three routes, following `index.js`'s existing bailout logic:

1. **`prefers-reduced-motion: reduce`** → static SVG showing both end states
   side by side, captioned. The comparison survives without motion; only the
   animation is lost.
2. **No WebGL2 / context creation throws** → same static SVG.
3. **Full 3D** → animated and rotatable.

Beyond the canvas:

- A real text description adjacent to the canvas, not just an `aria-label`, so
  the argument is readable by screen readers and by anyone who doesn't parse
  the visual.
- Colors must not be the sole differentiator (thickness, pulse speed, and
  labels carry it). Verify contrast in **both** themes — the page has a
  light-theme override for essentially every component.

## 7. Copy deck (draft — needs review before publishing)

Heading options:

- "Build the circuit."
- "The friction is the point."
- "Skill is physical. Build it."

Body draft:

> Every time you work a problem by hand and push through the part where it
> gets hard, the circuit that solves it fires — and circuits that fire
> repeatedly get insulated, so the signal moves faster. That's myelin, and
> building it is what turns effort into fluency.
>
> Copy a generated answer and the work still gets done. The circuit just never
> fires, so nothing gets built. Lune Synth is designed around the harder path:
> do the work, scan it in, and get told exactly which step broke.

Required caption under the animation:

> Conceptual illustration of activity-dependent myelination. Not a
> visualization of measured user outcomes.

Notes:

- Avoid `always`, `proven`, `guaranteed`, `every` per the accuracy doc.
- Don't quantify ("3x faster recall") without a citation that says exactly that
  for exactly this comparison.
- Link citations under the caption.

## 8. Phases

Each phase should be independently commitable and verifiable.

**Phase 0 — Perf spike + capture harness (do this before anything else).**
Vendored three + one instanced axon + rotation, on a scratch page. Measure
transferred bytes and mobile frame rate against §5. **If the budget fails here,
stop and reconsider** — possibly a pre-rendered sprite-sheet or a 2D canvas
version instead. Everything downstream depends on this gate.

Also build the §10.1 debug hooks and prove the capture harness is
deterministic (same build → byte-identical PNGs) in this phase. The visual
grading loop is worthless until that holds, and it's far cheaper to build the
hooks into the scene now than to retrofit them around finished code.

**Phase 1 — Static scene.** Both neurons, correct anatomy, both themes, no
animation. Verify visual integration and light-theme contrast.

**Phase 2 — Timeline.** Three acts, saltatory pulse, rep counter. No
interaction yet.

**Phase 3 — Interaction.** Drag rotation with the horizontal/vertical gesture
rule, keyboard controls, focus ring, idle auto-rotate, damping.

**Phase 4 — Fallback + a11y.** Static SVG for both bailout routes, text
description, screen-reader pass, `visibilitychange` pause.

**Phase 5 — Copy + citations.** Final wording, caption, citation links.
**Verify every citation against the actual paper** — author, year, journal, and
that it says what we claim. The references in this document were written from
memory and must be checked before they go on a public page.

**Phase 6 — Integration.** Nav link, section placement, cross-browser check.

Phases 1, 2, and 3 each end with a **full 60-image sweep and grading round**
(§10). Phase 1 gates on craft, brand fit, and angle robustness; Phase 2 adds
motion quality; Phase 3 re-runs everything after interaction lands, since
user-controlled camera angles are exactly where geometry defects surface.

## 9. Verification

A CDP harness for exactly this already exists from the `ef860d0` work
(headless Chrome over the DevTools protocol, driving the local `server.js` with
`LUNE_SYNTH_DOMAIN=localhost`). Reuse it to check, per phase:

- Zero console errors or exceptions.
- Element-geometry dump before/after the new section, confirming no existing
  element shifts (the same 1167-element comparison used for the CSS cleanup).
- Frame rate sampled over ≥5s via `Performance.getMetrics`.
- Keyboard: focus the canvas, dispatch `ArrowRight`, assert rotation changed.
- Reduced motion: emulate via `Emulation.setEmulatedMedia` and assert the SVG
  fallback renders instead of a canvas.
- Mobile: emulate a mid-tier device and confirm vertical swipe still scrolls
  the page.

## 10. Visual QA loop (AI-graded, multi-angle)

Development runs a scored iteration loop: capture the animation from many
angles, grade each capture against a fixed rubric, fix the lowest-scoring
dimension, repeat until every angle clears the bar.

### 10.1 Deterministic capture hooks — build these first

A grading loop is worthless if two captures of the same build differ. Earlier
in this repo's history a screenshot comparison showed a 502px "regression" that
was purely a side effect of scene state changing between runs. Do not let the
grader chase that kind of ghost.

Expose a debug API, active only when mounted with `?neuroDebug=1`:

```js
window.__neuroViz = {
  setTime(t),        // pin timeline to exact t, freeze RAF
  setCamera(az, el), // exact azimuth/elevation in degrees
  setTheme(name),    // 'dark' | 'light'
  ready(),           // resolves when geometry + materials are uploaded
};
```

Every capture must `await ready()`, pin `t`, pin the camera, and only then
screenshot. No `setTimeout`-and-hope. Same build must produce byte-identical
PNGs across runs — **assert this once as a harness self-test** before grading
anything.

### 10.2 Capture matrix

| Axis | Values |
| --- | --- |
| Azimuth | 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° at 10° elevation |
| Elevation | +25° and −25°, at 45° azimuth |
| Timeline | t = 0.15 (setup), 0.55 (practice), 0.90 (result) |
| Theme | dark, light |

Full sweep = 10 camera positions × 3 timeline points × 2 themes = 60 images.
That's a phase-gate artifact, not a per-iteration one.

- **Per iteration:** 6-image spot check (front/back/side × t=0.55, dark).
- **At each phase gate:** full 60-image sweep.

Motion quality can't be graded from stills — also capture a 3s screen recording
or a 12-frame strip at t = 0.45→0.75 for the motion dimension.

### 10.3 Rubric (100 points)

| Dimension | Pts | What earns a high score |
| --- | --- | --- |
| Conveys the contrast | 25 | A first-time viewer can tell which side built something within ~5 seconds, without reading the caption |
| Scientific plausibility | 20 | Correct anatomy; saltatory conduction reads as jumping between nodes; outsourced neuron looks *unbuilt*, never damaged |
| Visual craft | 20 | Clean silhouettes, no z-fighting, no clipping, no aliasing crawl, materials read as intentional |
| Brand fit | 15 | Sits naturally in the page's palette in **both** themes; doesn't look like a stock three.js demo |
| Angle robustness | 10 | No camera position where geometry breaks or the story collapses |
| Motion quality | 10 | Pulse timing legible, easing smooth, no jitter or popping |

**Pass condition: overall ≥ 85 AND no single dimension < 70 on _every_ captured
angle.** The per-dimension floor is what stops a beautiful front view from
carrying a broken rear view — averaging alone would hide exactly the defect
this loop exists to find.

### 10.4 Grading with subagents

- Spawn a **fresh** grading subagent each round. Do not continue one grader
  across rounds — a grader that watched the previous attempt anchors on it and
  inflates scores for improvement rather than judging the artifact.
- Give the grader **only** the rubric and the images. Not the plan, not the
  diff, not the previous score. It should not know which round it is.
- Run **3 independent graders per round; take the median** per dimension. If
  any dimension spreads > 20 points across graders, the rubric wording is
  ambiguous — fix the rubric before trusting the number.
- Require a one-line justification per dimension citing a specific image
  ("axon clips through soma at az=225"). Scores without a concrete referent are
  noise and should be re-run.
- Log every round to `tmp/neuro-viz-grades/round-NN.json` (score per dimension,
  per angle, plus justifications) so regressions are visible across rounds.

### 10.5 Loop control

1. Capture → grade → identify the lowest-scoring dimension.
2. Fix **that dimension only**, so the next score is attributable.
3. Re-capture, re-grade.
4. Stop at pass condition, or at **8 rounds**, whichever comes first.

If 8 rounds pass without clearing the bar, stop and escalate to a human
decision — that pattern means the concept or the rubric is wrong, and more
rounds will just burn tokens polishing something that can't get there.

### 10.6 Honest limits of this loop

Model visual grading is genuinely useful for craft defects — clipping,
z-fighting, contrast failures, broken angles — and will catch things quickly.
It is **much weaker on "conveys the point,"** which is a claim about a human
viewer's first impression that a model can only simulate. Treat the 25-point
dimension as directional, and get at least one human look before shipping.

A high score here means "no obvious defects from any angle." It does not mean
"this persuades people." Only the second one actually matters, and this loop
can't measure it.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| 3D lib blows the byte budget | Phase 0 gate; slim bundle; fall back to 2D |
| Canvas eats mobile scroll | Gesture rule in §3.1; explicit mobile test |
| Section reads as anti-AI scolding | Effort-vs-outsourcing axis, not pen-vs-keyboard; no damaged neuron |
| Overstated science | §Guardrail; caption; citation verification in Phase 5 |
| First WebGL context destabilizes the page | Lazy mount, full dispose, fallback routes, offscreen + hidden-tab pause |
| Scope creep into `lune-engine` | Explicitly out of scope; separate module |
| Grading loop chases nondeterministic captures | Deterministic hooks (§10.1) + byte-identical self-test before grading |
| Self-graded scores drift upward | Fresh blind graders, median of 3, fixed rubric (§10.4) |

## 12. Open decisions

1. **Placement** — before `How grading works` (recommended) or after `Engine`?
2. **Mobile 3D** — full 3D on phones, or static fallback below 480px?
3. **Layout** — side-by-side both states, or one neuron with an A/B toggle the
   user drives? Side-by-side is recommended: the comparison is the point, and
   a toggle hides half the argument behind an interaction.
4. **Kosmyna preprint** — cite it for the outsourced side with preprint
   caveats, or leave it out until peer review?
5. **Heading** — from §7, or something else.

## Related

- `docs/lune-synth-marketing-copy-and-accuracy-context.md` — claim boundaries.
- `docs/lune-synth-landing-page-improvements.md` — page perf baseline.
- `lune-synth/lune-engine/` — the architecture this borrows from.
