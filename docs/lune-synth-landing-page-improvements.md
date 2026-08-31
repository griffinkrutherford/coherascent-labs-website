<!-- markdownlint-disable MD013 -->

# Lune Synth landing page — improvement plan

_Drafted 2026-08-31. Scope is `lune-synth/index.html` only, plus two new files
at the repo root. Line numbers are against the working tree as of drafting,
which includes the uncommitted Listen / Problem Solver sections — they will
shift if that work lands or is dropped first. Anchor on the quoted strings,
not the numbers._

## Baseline (measured, not estimated)

| Metric | Value |
| --- | --- |
| `lune-synth/index.html` | 16,156 lines / 606 KB |
| Inline CSS | 333 KB |
| Inline JS | 78 KB |
| Media referenced by the homepage | 71 MB across 58 files |
| `<video>` elements | 18 (8 `preload="none"`, 8 `preload="metadata"`, 1 `preload="auto"`) |
| `<img>` elements | 33 (10 with `loading="lazy"`) |
| Meta tags in `<head>` | 3 (charset, viewport, description) |
| `og:*` / `twitter:card` / JSON-LD | 0 |
| Analytics | none |
| `aria-*` attributes | 179 |
| `prefers-reduced-motion` blocks | 19 |

The accessibility and design-system numbers are the page's strength and
nothing here should regress them. Every item below is additive or a single
attribute change.

---

## Correction: there is no asset-path bug

An earlier review flagged `/blog/images/*.jpg` on the homepage as broken,
on the theory that it contradicts the `/lune-synth/images/*` convention used
elsewhere in the same file. **That was wrong.** `server.js` resolves both:

- Line 364 rewrites `/blog` and `/blog/*` to `/lune-synth/blog/*` on the Lune host.
- Line 388 does the same for `/screenshots/*`.
- Everything else falls through to `serveStatic(req, res, pathname)` rooted at
  the repo root, so `/lune-synth/images/...` and `/circle_favicon.png` resolve too.

Verified against a running server — all six sampled paths return 200:

```bash
node server.js &
for p in /blog/images/ai-robot.jpg /lune-synth/images/world-icons/earth.png \
         /circle_favicon.png /screenshots/applied/lune-synth-highlight-reel.mp4; do
  curl -s -o /dev/null -w "%{http_code}  $p\n" -H "Host: lunesynth.com" "http://localhost:3000$p"
done
```

The mixed convention is a readability wart, not a defect. **Do not "fix" it** —
rewriting `/blog/images/*` to `/lune-synth/blog/images/*` would still work, but
rewriting in the other direction would break the pages that rely on the root
fallthrough. Leave it alone.

---

## 1. Social and search metadata — highest leverage, lowest risk

**Problem.** The page has three meta tags. Every share to iMessage, Slack,
LinkedIn, Discord, or X renders as a bare URL with no title, description, or
image. This is the single most visible gap versus any funded startup site.

**Where.** `lune-synth/index.html`, in `<head>` immediately after the existing
`<meta name="description">` (line 6) and before `<link rel="canonical">` (line 11).

**Add:**

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Lune Synth" />
<meta property="og:url" content="https://lunesynth.com/" />
<meta property="og:title" content="Lune Synth — The Anti-Slop Learning App" />
<meta property="og:description" content="Handwrite your reasoning. Get real feedback on every step. Practice built from your own mistakes." />
<meta property="og:image" content="https://lunesynth.com/lune-synth/og-card.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Lune Synth on a phone, showing a graded handwritten calculus solution" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Lune Synth — The Anti-Slop Learning App" />
<meta name="twitter:description" content="Handwrite your reasoning. Get real feedback on every step. Practice built from your own mistakes." />
<meta name="twitter:image" content="https://lunesynth.com/lune-synth/og-card.png" />
```

**The image is the blocking dependency.** OG cards want 1200×630; nothing in the
repo is that ratio. Two options:

- **Fastest:** letterbox `docs/store-assets/play-graphics/feature-graphic-1024x500.png`
  (already 1024×500, close ratio) onto a 1200×630 canvas in the brand background.
- **Better:** compose a new card from
  `lune-synth/screenshots/applied/lune-synth-highlight-reel-poster.jpg` with the
  wordmark. This is the first impression for every shared link — worth the hour.

Save to `lune-synth/og-card.png`. Note the URL above includes the `/lune-synth/`
prefix because that path resolves through the root fallthrough, not a rewrite.

**Also add JSON-LD** before `</head>` — this is what makes Google render a rich
result rather than a plain blue link:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lune Synth",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "iOS, Android",
  "url": "https://lunesynth.com/",
  "publisher": { "@type": "Organization", "name": "Coherascent Labs", "url": "https://coherascentlabs.com/" },
  "description": "Lune Synth turns handwritten reasoning into checkable work, rigorous grading, and targeted practice."
}
</script>
```

Do not add `aggregateRating` or `offers` until there are real ratings and real
prices. Google penalizes fabricated review markup, and a closed beta has neither.

**Verify:** paste the URL into <https://cards-dev.twitter.com/validator> and
<https://developers.facebook.com/tools/debug/>, or just send yourself the link
in iMessage. Both scrapers cache aggressively — re-scrape after any change.

---

## 2. Hero video preload — the biggest single performance win

**Problem.** `lune-synth/index.html:11148-11159` autoplays a **28 MB** MP4 with
`preload="auto"`, so every visitor downloads it before the page settles,
including on cellular. The other 16 videos are already disciplined
(`preload="none"` / `"metadata"`); this one is the outlier.

**The poster already exists** — `lune-synth-highlight-reel-poster.jpg`, 59 KB —
so the hero looks identical until someone chooses to watch.

**Change:**

```diff
   <video
-    autoplay
     controls
     loop
     muted
     playsinline
-    preload="auto"
+    preload="none"
     poster="screenshots/applied/lune-synth-highlight-reel-poster.jpg"
     aria-label="Lune Synth product highlight reel"
   >
```

**This is a product decision, not just a perf one.** Dropping `autoplay` means
the reel no longer plays itself. If autoplay is load-bearing for the pitch,
keep it and take the middle path instead — `preload="metadata"` with `autoplay`
retained, which defers the bulk transfer while still starting on scroll:

```diff
-    preload="auto"
+    preload="metadata"
```

Recommendation: keep `autoplay`, drop to `preload="metadata"`, and separately
compress the source.

**DONE 2026-08-31 — 28 MB → 5.4 MB (81% reduction), no visible quality loss.**

A correction to this doc's original advice: it proposed `-vf "scale=-2:1080"`,
which was **wrong**. The source is 332×720 — a narrow phone-shaped capture, not
1080p — so that filter would have *upscaled* it, producing a larger and softer
file. Encode at native resolution. The command actually used:

```bash
ffmpeg -i lune-synth-highlight-reel.mp4 -c:v libx264 -crf 23 -preset slow \
       -profile:v high -pix_fmt yuv420p -movflags +faststart -an \
       reel-crf23.mp4
```

`-movflags +faststart` moves the moov atom to the front so playback can begin
before the whole file arrives — important for a video served over HTTP.
`-an` is a no-op here (the source has no audio track) but is harmless and
correct, since the element is `muted`.

**On choosing CRF.** CRF 23/26/28 were all encoded and compared against the
original on the most detail-dense frame in the reel (found by edge energy —
t=80s, the handwritten calculus screen), measured over the handwriting panel
only:

| CRF | Size | RMSE | PSNR | Verdict |
| --- | --- | --- | --- | --- |
| 23 | 6.0 MB | 1.71 | 43.5 dB | chosen |
| 26 | 5.0 MB | — | — | fine |
| 28 | 4.0 MB | 2.90 | 38.9 dB | also visually lossless |

CRF 23 was chosen over the smaller 28 because legible handwriting is the
product's central claim, and once `preload="metadata"` takes the file off the
critical path, the 2 MB saved buys little. Anything above ~38 dB PSNR is
conventionally treated as visually lossless.

The untouched original is preserved at
`tmp/video-candidates/reel-ORIGINAL-backup.mp4` (and in git history) until
someone confirms the replacement on a real phone.

---

## 3. Lazy-load the remaining images

**Problem.** 10 of 33 `<img>` elements have `loading="lazy"`. The rest load
eagerly regardless of whether they are near the viewport.

**Rule:** every `<img>` below the fold gets `loading="lazy" decoding="async"`.
Images *above* the fold must NOT be lazy — it delays the LCP element and makes
the score worse.

Find the candidates:

```bash
grep -n '<img' lune-synth/index.html | grep -v 'loading="lazy"'
```

Treat anything above roughly line 11200 (hero region) as above-the-fold and
leave it eager. The blog thumbnails near line 14028+ already have it.

---

## 4. Analytics

**Problem.** No GA, Plausible, PostHog, Segment, or Fathom. The page contains
72 references to the waitlist across many sections, and there is currently no
way to know which section converts.

**Recommendation: Plausible.** One script tag, no cookie banner needed under
GDPR/CCPA, and the privacy story is consistent with an education product aimed
at students — several of whom are minors, which makes GA's data collection a
genuine complication rather than a stylistic preference.

```html
<script defer data-domain="lunesynth.com" src="https://plausible.io/js/script.js"></script>
```

**Then instrument the waitlist form specifically** — the aggregate pageview
number is not the question you actually have. Tag each CTA with the section it
sits in so the funnel report tells you whether the hero, the Constellations
section, or the blog drives signups.

If a cookie-based analytics tool is chosen instead, a consent banner and a
privacy-policy update become prerequisites, not follow-ups — `lune-synth/privacy/`
currently makes no disclosure that would cover it.

---

## 5. Deferred / explicitly not doing

**Splitting the 16k-line file.** Real maintainability cost, but it is a
refactor with no user-visible benefit and a large regression surface across 19
pages that share the nav. Not worth it while the page is still changing weekly
and one person edits it. Revisit when a second person starts editing.

**Extracting the 333 KB of inline CSS.** Counterintuitively this could make
things *slower* — inline CSS costs one round trip, an external sheet costs two
(HTML, then CSS) unless it is cached. Only worth doing alongside a real caching
strategy.

**`robots.txt` and `sitemap.xml`.** Neither exists at the repo root.
`tmp/gtm/03-content.md` already tracks this as task T1 with a matching file for
`coherascentlabs.com` — it belongs to that plan, not this one. Flagging only so
it is not lost.

---

## Suggested order

1. **Metadata** (item 1) — biggest visible gain, zero regression risk. Blocked
   only on producing the OG image.
2. **Hero video** (item 2) — one attribute; decide the autoplay tradeoff first.
3. **Analytics** (item 4) — cheap, and it starts collecting the data that tells
   you whether any of the rest worked.
4. **Lazy loading** (item 3) — mechanical cleanup, do it in one pass.

Items 1–4 are independent and can ship as separate commits.

## Verification before pushing

The Listen and Problem Solver sections are still unfinished in the working
tree. Keep them out of any commit from this plan:

```bash
git add -p lune-synth/index.html    # stage only the hunks from this doc
git diff --cached                   # confirm no Listen / Problem Solver markup
```

Then serve locally and confirm the page still renders:

```bash
node server.js &
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: lunesynth.com" http://localhost:3000/
```
