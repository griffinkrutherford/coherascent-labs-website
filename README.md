# Coherascent Labs

<img src="coherascent-labs-logo-march-16-2026.png" alt="Coherascent Labs logo" width="180" />

An experimental multi-page marketing site for Coherascent Labs, built as a static website with custom HTML, CSS, and JavaScript.

The site presents Coherascent as a dual-pillar organization:
- `Research`: neuro-symbolic, deterministic, and truth-aligned AI work
- `Lune Synth`: educational product concepts for handwritten reasoning, grading, and adaptive learning

## Live Structure

The production site is served from one Railway deployment with host-based routing:

| Domain / Route | Purpose |
| --- | --- |
| `https://coherascentlabs.com/` | Main landing page |
| `https://coherascentlabs.com/research/` | Research overview and technical program |
| `https://lunesynth.com/` | Lune Synth product experience |

Legacy compatibility stubs still exist:
- `research.html` redirects to `/research/`
- `applied.html` redirects to `https://lunesynth.com/`
- `/lune-synth/` redirects to `https://lunesynth.com/` on the primary domain

## What’s In The Site

### Home
- dual-pillar hero and brand framing
- interactive `Tower of Hanoi` demo
- interactive orbital canvas scene
- theme toggle with persisted preference via `localStorage`

### Research
- long-form research overview
- initiative cards and technical visuals
- shared brand/theme system with a purple-biased research starfield

### Lune Synth
- notepad-style `Platform Components` showcase
- animated handwritten-response slideshow
- synchronized question-phone UI
- `Screenshot Workflow` phone sequence for capture, grading, and feedback
- `Voice Upload` concept section
- shared phone rendering system with consistent proportions, hardware buttons, and theme-aware UI

## Stack

This repo intentionally stays simple:

- plain `HTML`
- custom `CSS` embedded per page
- plain `JavaScript`
- no framework
- no bundler
- no build step

Fonts are loaded from Google Fonts and the site uses local images, SVGs, and handwritten animation scripts.

## Local Development

Because the production deployment routes by domain, run the Node server instead of a generic static server when testing locally.

```bash
cd /Users/griffinrutherford/Documents/coherascent-labs
npm start
```

Then test the host-specific routes with `curl`:

- `curl -H "Host: coherascentlabs.com" http://localhost:3000/`
- `curl -H "Host: coherascentlabs.com" http://localhost:3000/research/`
- `curl -H "Host: lunesynth.com" http://localhost:3000/`

## Project Map

```text
.
├── index.html
├── research/
│   └── index.html
├── lune-synth/
│   └── index.html
├── applied/
│   └── index.html              # legacy redirect stub
├── research.html                  # redirect stub
├── applied.html                   # legacy redirect stub
├── applied-response-slideshow.js # response carousel logic
├── applied-handwriting-demo.js   # animated handwriting SVG logic
├── images/                       # research visuals
├── mobile-app-plan.md           # app implementation plan
└── mobile-app-assets/           # tokens, icons, UML diagrams
```

## Key Interaction Notes

### Theme system
- all three pages share the same `coherascent-theme` localStorage key
- each page has its own starfield treatment tuned to the page’s visual role
- the Lune Synth page also has theme-aware phone UI states

### Handwriting system
- the Lune Synth slideshow reveals handwriting line-by-line and character-by-character
- word wrapping is precomputed so words do not jump awkwardly to a new line mid-write
- reduced-motion users get a stable static rendering instead of the full animation sequence

### Phone mockups
- workflow phones use shared sizing variables
- phone proportions are normalized across breakpoints
- the Lune Synth page includes consistent shell geometry, camera island treatment, and side hardware buttons

## Notes

- `index-vibe.html` is a sidecar concept file and not part of the main directory-routed site
- some favicon source assets are kept separately from the currently used favicon files
- the site is optimized as a polished static experience, not as a CMS-backed marketing stack

## Next Good Improvements

- extract the shared theme script into a single reusable file
- extract the shared starfield/phone CSS into reusable assets instead of duplicating per page
- add a tiny local dev script or simple static-server config
- add visual regression screenshots for the main breakpoints
