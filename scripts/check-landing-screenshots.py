#!/usr/bin/env python3
"""Guard against mismatched/missing app screenshots on lune-synth landing pages.

Owner report (2026-10-25): the Dutch study page was showing German screenshots,
the Greek page was showing Latin, and the Hindi page was showing Japanese and
Korean. This script encodes the mechanical checks that catch that class of bug
so it cannot silently reappear:

  1. Missing file. Every image/source/video src, srcset candidate, video
     poster and CSS/data screenshot background must resolve to a real file. The dynamic
     Home/Shop gallery is checked for every locale declared in its script,
     along with literal media paths in the shared feature-panel module.
  2. Wrong language. A study/<language>/ page may only use screenshots from
     mobile-app-assets/screenshots/applied/languages/<code>-* for ITS OWN ISO
     639-1 code (LANGUAGE_ISO below). The study/languages/ overview page is a
     multi-language sampler and is exempt.
  3. Cross-topic sharing. A content screenshot under mobile-app-assets/screenshots
     embedded by two or more landing pages
     is only allowed when every page that uses it appears together in one
     entry of TOPIC_SHARE_ALLOWLIST below (e.g. study/math/ legitimately
     reuses study/algebra/'s screenshot; a German page and a Dutch page do
     not legitimately share anything). New shared images must be added to
     the allowlist deliberately, with a reason, or the guard fails.
  4. Same-page duplication (2026-10-26 owner report: a study page's hero shot
     and its in-body figure showed the same screenshot). Every <picture> block
     and every <video> block on a page counts as ONE image, and every
     standalone <img> (not inside a <picture>) counts as its own image too;
     <link rel=preload> and <meta> tags are not image tags and are never
     scanned. Within one page, no two of those image units may point at the
     same underlying screenshot once -mid/-low/width-in-pixels suffixes are
     normalised away (e.g. "foo-mid.webp" and "foo.webp" are the same shot).
     A page is free to show the same screenshot's two *different* figures
     (e.g. an org chart and a separate Gantt chart); it may never show the
     exact same shot twice.
  5. The accepted language captures must have independent semantic PASS
     records bound to their exact exported SHA-256, UI locale and fixture.
     This is a provenance check; the script cannot judge translation quality.

Stdlib only. Run from anywhere:
    python3 scripts/check-landing-screenshots.py
Exits 0 with a short summary when clean, exits 1 with every violation listed
when not.
"""
from __future__ import annotations

import os
import hashlib
import json
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
LUNE_ROOT = os.path.join(REPO_ROOT, "lune-synth")

# Directories under lune-synth/ that are not screenshot-bearing marketing
# landing pages (blog posts, legal pages, account flows, build tooling, the
# raw asset folders themselves). Audited pages are everything else that has
# an index.html: study/*, test-prep/*, for-students/*, for-parents/*,
# for-families/*, pro/, and the root index.html.
NON_LANDING_DIRS = {
    "blog", "about", "privacy", "terms", "support", "delete-account",
    "campaign", "fonts", "images", "lune-engine", "neuro-viz", "screenshots",
    "shared-hooks", "vendor", "lune-synth-landing-medals",
}

class MediaReferenceParser(HTMLParser):
    """Read browser media attributes, including lazy responsive candidates."""

    def __init__(self):
        super().__init__()
        self.urls: set[str] = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        background = attributes.get("data-screenshot-src")
        if background and is_screenshot_url(background):
            self.urls.add(background)
        if tag not in {"img", "source", "video"}:
            return
        for name in ("src", "poster"):
            value = attributes.get(name)
            if value:
                self.urls.add(value)
        for candidate in (attributes.get("srcset") or "").split(","):
            fields = candidate.strip().split()
            if fields:
                self.urls.add(fields[0])


def extract_media_urls(html: str) -> set[str]:
    parser = MediaReferenceParser()
    parser.feed(html)
    for match in re.finditer(r"url\(\s*(['\"]?)([^'\"\s)]+)\1\s*\)", html, re.IGNORECASE):
        if is_screenshot_url(match.group(2)):
            parser.urls.add(match.group(2))
    return parser.urls


def dynamic_gallery_urls(script: str) -> set[str]:
    """The gallery filename contract is explicit in campaign/lang-shots.js."""
    locale_block = re.search(r"var LOCALES = \[(.*?)\];", script, re.DOTALL)
    if not locale_block:
        raise ValueError("Cannot find dynamic language gallery locale registry")
    locales = re.findall(r'code:\s*"([^"/]+)"', locale_block.group(1))
    if not locales or len(locales) != len(set(locales)):
        raise ValueError("Language gallery locales must be nonempty and unique")
    return {
        f"screenshots/applied/lang/{screen}-{locale}.webp"
        for locale in locales for screen in ("home", "shop")
    }


def dynamic_feature_urls(script: str) -> set[str]:
    """Potential shared feature-panel media, including alternate world/steps."""
    urls = set(re.findall(
        r"/screenshots/[^\s\"'`<>]+?\.(?:webp|png|jpe?g|mp4|webm)(?:\?[^\s\"'`<>]+)?",
        script, re.IGNORECASE,
    ))
    if not urls:
        raise ValueError("Cannot find shared feature-panel screenshot/media registry")
    return urls

# --- Rule 4: same-page duplication ------------------------------------------
PICTURE_BLOCK_RE = re.compile(r"<picture\b[^>]*>.*?</picture\s*>", re.IGNORECASE | re.DOTALL)
VIDEO_BLOCK_RE = re.compile(r"<video\b[^>]*>.*?</video\s*>", re.IGNORECASE | re.DOTALL)
IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
ATTR_SRC_RE = re.compile(r'\bsrc="([^"]+)"', re.IGNORECASE)
ATTR_SRCSET_RE = re.compile(r'\bsrcset="([^"]+)"', re.IGNORECASE)
ATTR_POSTER_RE = re.compile(r'\bposter="([^"]+)"', re.IGNORECASE)
# .webp/.png/etc at the end of a filename, so it can be stripped before the
# -mid/-low/width suffix underneath it is stripped too.
MEDIA_EXT_RE = re.compile(r"\.(?:webp|png|jpe?g|gif|svg|mp4|webm|avif)$", re.IGNORECASE)
# "-mid"/"-low", or a pixel width (>= 3 digits, optionally followed by the
# srcset "w" unit, e.g. "-384", "-1206w"). Kept at 3+ digits on purpose: a
# sequence number like "step-1"/"step-3" (five distinct walkthrough clips)
# must NOT collapse onto the same id.
SIZE_SUFFIX_RE = re.compile(r"-(?:mid|low|\d{3,}w?)$", re.IGNORECASE)


def normalize_screenshot_id(url: str) -> str | None:
    """A screenshot URL's filename with its directory, query/fragment, file
    extension and any -mid/-low/width suffix stripped, so every size/format
    variant of the same shot normalises to one id."""
    url = url.split("#", 1)[0].split("?", 1)[0].strip()
    if not url:
        return None
    base = url.rsplit("/", 1)[-1]
    base = MEDIA_EXT_RE.sub("", base)
    while True:
        stripped = SIZE_SUFFIX_RE.sub("", base)
        if stripped == base:
            break
        base = stripped
    return base or None


def is_screenshot_url(url: str) -> bool:
    # Broader than SCREENSHOT_PATH_MARKER on purpose: video src/poster paths
    # on this site are often relative ("screenshots/applied/...") rather than
    # the absolute "/mobile-app-assets/screenshots/..." used by <img>/<source>.
    return "screenshot" in url.lower()


def extract_unit_screenshot_ids(block_html: str) -> set[str]:
    """Every screenshot id a <picture>/<video>/standalone-<img> block
    references (its src, every srcset candidate, and a <video>'s poster)."""
    ids: set[str] = set()
    for pattern in (ATTR_SRC_RE, ATTR_POSTER_RE):
        for match in pattern.finditer(block_html):
            url = match.group(1)
            if is_screenshot_url(url):
                normalized = normalize_screenshot_id(url)
                if normalized:
                    ids.add(normalized)
    for match in ATTR_SRCSET_RE.finditer(block_html):
        for candidate in match.group(1).split(","):
            url = candidate.strip().split(" ", 1)[0]
            if url and is_screenshot_url(url):
                normalized = normalize_screenshot_id(url)
                if normalized:
                    ids.add(normalized)
    return ids


def find_same_page_duplicate_screenshots(html: str) -> dict[str, int]:
    """{screenshot_id: unit_count} for every screenshot id referenced by 2+
    distinct image units (a <picture> block, a <video> block, or a
    standalone <img>) on one page."""
    remaining = html
    units: list[set[str]] = []

    def consume(pattern: re.Pattern[str], text: str) -> str:
        def replace(match: re.Match[str]) -> str:
            ids = extract_unit_screenshot_ids(match.group(0))
            if ids:
                units.append(ids)
            return ""  # drop the block so its inner tags are not rescanned

        return pattern.sub(replace, text)

    remaining = consume(PICTURE_BLOCK_RE, remaining)
    remaining = consume(VIDEO_BLOCK_RE, remaining)
    for match in IMG_TAG_RE.finditer(remaining):
        ids = extract_unit_screenshot_ids(match.group(0))
        if ids:
            units.append(ids)

    counts: dict[str, int] = defaultdict(int)
    for unit_ids in units:
        for screenshot_id in unit_ids:
            counts[screenshot_id] += 1
    return {sid: count for sid, count in counts.items() if count >= 2}

# Rule 3 (cross-topic sharing) only applies to actual in-app screenshots.
# Brand marks (the app icon, Luna emote stickers, etc.) legitimately repeat
# on every page and are not "screenshots" in the sense this guard cares
# about. The shared feature module's /screenshots/ videos/posters are generic
# product demonstrations intentionally reused across topics; their file
# presence is checked, not treated as subject-specific question sharing.
SCREENSHOT_PATH_MARKER = "/mobile-app-assets/screenshots/"

# --- Rule 2: study/<language>/ -> required ISO 639-1 code -----------------
# Small explicit table, by design (per the brief): new languages must be
# added here deliberately, they are never inferred.
LANGUAGE_ISO = {
    "arabic": "ar",
    "chinese": "zh",
    "dutch": "nl",
    "french": "fr",
    "german": "de",
    "greek": "el",
    "hindi": "hi",
    "italian": "it",
    "japanese": "ja",
    "korean": "ko",
    "latin": "la",
    "portuguese": "pt",
    "russian": "ru",
    "spanish": "es",
    "esl": "en",  # English as a second language
}
LANGUAGE_SCREENSHOT_PREFIX = "/mobile-app-assets/screenshots/applied/languages/"
# study/languages/ is the multi-language overview/sampler page, not a
# single-language page, so it is exempt from the per-code restriction.
LANGUAGE_HUB_PAGE = "study/languages/index.html"

# These are actual owner-requested recaptures, not a claim that every site
# screenshot has received a new semantic review. Learning-language stimulus
# text (Russian nouns, Hindi dialogue, Spanish poetry) remains intentional;
# its instruction/chrome locale is English. Gallery content follows the
# selected UI locale, including sample mission and notebook names.
REVIEW_MANIFEST = "mobile-app-assets/screenshots/2026-10-28-language-review.json"


def required_language_reviews() -> dict[str, str]:
    required = {
        f"lune-synth/screenshots/applied/lang/{screen}-{locale}.webp": locale
        for screen in ("home", "shop")
        for locale in ("en", "es", "fr", "de", "pt-BR", "zh-Hans", "ja", "ko", "hi")
    }
    for folder, stem in (("languages", "ru-muzei"), ("languages", "ru-kniga"),
                         ("languages", "hi-postposition"), ("hum", "apspanishlit-becquer"),
                         ("hum", "apfrench-subjonctif")):
        for suffix in ("", "-mid"):
            required[f"mobile-app-assets/screenshots/applied/{folder}/{stem}{suffix}.webp"] = "en"
    return required


def check_language_review_manifest(root: str, manifest: dict) -> list[str]:
    """Bind independent semantic acceptance to the exact exported bytes.

    Hash/locale checks cannot assess translation quality. A reviewer must open
    each actual full/mid export before recording PASS in the manifest.
    """
    if not isinstance(manifest, dict):
        return ["LANGUAGE REVIEW  manifest must be an object"]
    problems = []
    if manifest.get("schemaVersion") != 1:
        problems.append("LANGUAGE REVIEW  expected manifest schemaVersion 1")
    items = manifest.get("items", [])
    if not isinstance(items, list):
        return problems + ["LANGUAGE REVIEW  items must be an array"]
    indexed = {}
    for item in items:
        if not isinstance(item, dict) or not isinstance(item.get("asset"), str):
            problems.append("LANGUAGE REVIEW  every item needs an asset path")
            continue
        asset = item["asset"]
        if asset in indexed:
            problems.append(f"LANGUAGE REVIEW  duplicate record for {asset}")
        indexed[asset] = item
    for asset, locale in required_language_reviews().items():
        item = indexed.get(asset)
        if not item:
            problems.append(f"LANGUAGE REVIEW  missing reviewed recapture: {asset}")
            continue
        if item.get("uiLocale") != locale or item.get("semanticReview") != "PASS":
            problems.append(f"LANGUAGE REVIEW  {asset}: expected {locale} UI and semantic PASS")
        for key in ("fixture", "variant"):
            if not isinstance(item.get(key), str) or not item[key].strip():
                problems.append(f"LANGUAGE REVIEW  {asset}: missing {key}")
        notes = item.get("reviewNotes")
        if not ((isinstance(notes, str) and notes.strip()) or
                (isinstance(notes, list) and notes and
                 all(isinstance(note, str) and note.strip() for note in notes))):
            problems.append(f"LANGUAGE REVIEW  {asset}: missing reviewNotes")
        for key, length in (("fixtureCommit", 40), ("nativeCaptureSHA256", 64)):
            if not re.fullmatch(rf"[0-9a-f]{{{length}}}", str(item.get(key, ""))):
                problems.append(f"LANGUAGE REVIEW  {asset}: invalid {key}")
        full_path = os.path.join(root, asset)
        if not os.path.isfile(full_path):
            problems.append(f"LANGUAGE REVIEW  reviewed asset missing: {asset}")
        else:
            with open(full_path, "rb") as captured:
                digest = hashlib.sha256(captured.read()).hexdigest()
            if digest != item.get("sha256"):
                problems.append(f"LANGUAGE REVIEW  {asset}: exported bytes changed; review again")
    return problems

# --- Rule 3: deliberate cross-page screenshot sharing ----------------------
# Each entry is the maximal set of pages allowed to share a screenshot, with
# why. A shared image is OK only if every page actually using it is a subset
# of one entry here. Add a new entry (with a reason) when a new legitimate
# shared screenshot is introduced; do NOT loosen an existing entry just to
# silence a failure.
TOPIC_SHARE_ALLOWLIST = [
    (frozenset({"study/algebra/index.html", "study/math/index.html"}),
     "study/math is the math hub; algebra is a math subtopic"),
    (frozenset({"study/arithmetic/index.html", "study/math/index.html"}),
     "study/math is the math hub; arithmetic is a math subtopic"),
    (frozenset({"study/geometry/index.html", "study/math/index.html"}),
     "study/math is the math hub; geometry is a math subtopic"),
    (frozenset({"study/calculus/index.html", "study/math/index.html"}),
     "study/math is the math hub; calculus is a math subtopic"),
    (frozenset({"study/arithmetic/index.html", "test-prep/ssat/index.html"}),
     "the SSAT tests arithmetic"),
    (frozenset({"study/geometry/index.html", "test-prep/act/index.html"}),
     "the ACT tests geometry"),
    (frozenset({"study/biology/index.html", "for-students/note-taking/index.html"}),
     "the shared note-taking example is a biology cell-cycle note"),
    (frozenset({"study/biology/index.html", "test-prep/ap-exams/index.html"}),
     "test-prep/ap-exams is the AP hub; AP Biology is an AP subtopic"),
    (frozenset({"test-prep/ap-biology/index.html", "test-prep/ap-exams/index.html"}),
     "test-prep/ap-exams is the AP hub; AP Biology is an AP subtopic"),
    (frozenset({"study/biochemistry/index.html", "study/organic-chemistry/index.html"}),
     "both are chemistry subjects sharing a reaction-energy-profile question"),
    (frozenset({
        "test-prep/ap-calculus-ab/index.html",
        "test-prep/ap-calculus-bc/index.html",
        "test-prep/ap-exams/index.html",
    }), "AP Calculus AB/BC share curriculum; test-prep/ap-exams is the AP hub"),
    (frozenset({
        "test-prep/ap-physics-1/index.html",
        "test-prep/ap-physics-c-mechanics/index.html",
    }), "both are AP mechanics subtopics sharing an inclined-plane question"),
    (frozenset({"study/chinese/index.html", "study/languages/index.html"}),
     "study/languages is the multi-language sampler hub"),
    (frozenset({"study/french/index.html", "study/languages/index.html"}),
     "study/languages is the multi-language sampler hub"),
    (frozenset({"study/german/index.html", "study/languages/index.html"}),
     "study/languages is the multi-language sampler hub"),
    (frozenset({"study/korean/index.html", "study/languages/index.html"}),
     "study/languages is the multi-language sampler hub"),
]


def find_landing_pages():
    pages = []
    for dirpath, dirnames, filenames in os.walk(LUNE_ROOT):
        rel = os.path.relpath(dirpath, LUNE_ROOT)
        top = rel.split(os.sep)[0]
        if top in NON_LANDING_DIRS:
            dirnames[:] = []
            continue
        if "index.html" in filenames:
            pages.append(os.path.join(dirpath, "index.html"))
    return sorted(pages)


def resolve_src(src: str, html_path: str) -> str:
    """Resolve an <img src> the way a browser would: absolute paths are
    rooted at the site root (the directory containing lune-synth/); relative
    paths are rooted at the HTML file's own directory."""
    if src.startswith(("http://", "https://", "data:")):
        return ""  # not a local asset; nothing to check
    # Strip a cache-busting query string / fragment, e.g. "earth.svg?v=2".
    src = src.split("#", 1)[0].split("?", 1)[0]
    if src.startswith("/"):
        # The deployed site serves absolute paths from both the repo root
        # (e.g. /mobile-app-assets/...) and lune-synth/ (e.g. /blog/...,
        # /campaign/...), so accept whichever one actually has the file.
        rel = src.lstrip("/")
        for root in (REPO_ROOT, LUNE_ROOT):
            candidate = os.path.normpath(os.path.join(root, rel))
            if os.path.exists(candidate):
                return candidate
        return os.path.normpath(os.path.join(REPO_ROOT, rel))
    return os.path.normpath(os.path.join(os.path.dirname(html_path), src))


def main() -> int:
    pages = find_landing_pages()
    problems = []  # list of str
    src_to_pages = defaultdict(set)  # src -> set of relpath pages that use it
    try:
        with open(os.path.join(REPO_ROOT, REVIEW_MANIFEST), encoding="utf-8") as reviewed:
            problems.extend(check_language_review_manifest(REPO_ROOT, json.load(reviewed)))
    except (OSError, ValueError, TypeError) as error:
        problems.append(f"LANGUAGE REVIEW  cannot read {REVIEW_MANIFEST}: {error}")

    for page_path in pages:
        rel_page = os.path.relpath(page_path, LUNE_ROOT)
        with open(page_path, encoding="utf-8", errors="replace") as f:
            html = f.read()

        srcs = extract_media_urls(html)
        if rel_page == "index.html" and "data-lang-shot" in html:
            gallery_script = os.path.join(LUNE_ROOT, "campaign", "lang-shots.js")
            try:
                with open(gallery_script, encoding="utf-8") as gallery:
                    srcs.update(dynamic_gallery_urls(gallery.read()))
            except (OSError, ValueError) as error:
                problems.append(f"DYNAMIC GALLERY  {error}")
        if "<lune-quick-missions" in html or "<lune-constellations" in html:
            try:
                with open(os.path.join(LUNE_ROOT, "campaign", "features.js"), encoding="utf-8") as features:
                    srcs.update(dynamic_feature_urls(features.read()))
            except (OSError, ValueError) as error:
                problems.append(f"DYNAMIC FEATURES  {error}")
        for src in srcs:
            # Rule 1: missing file.
            full_path = resolve_src(src, page_path)
            if full_path and not os.path.isfile(full_path):
                problems.append(
                    f"MISSING FILE  {rel_page}: references {src!r} "
                    f"(resolved to {full_path}) which does not exist"
                )
                continue

            # Normalize away any cache-busting query string for dedup/lookup.
            norm_src = src.split("#", 1)[0].split("?", 1)[0]
            if SCREENSHOT_PATH_MARKER in norm_src:
                src_to_pages[norm_src].add(rel_page)

            # Rule 2: language-code mismatch on study/<language>/ pages.
            parts = rel_page.split(os.sep)
            if (
                len(parts) == 3
                and parts[0] == "study"
                and rel_page != LANGUAGE_HUB_PAGE
                and src.startswith(LANGUAGE_SCREENSHOT_PREFIX)
            ):
                lang_slug = parts[1]
                expected_code = LANGUAGE_ISO.get(lang_slug)
                filename = src[len(LANGUAGE_SCREENSHOT_PREFIX):]
                actual_code = filename.split("-", 1)[0]
                if expected_code is None:
                    problems.append(
                        f"UNMAPPED LANGUAGE  {rel_page}: uses a language "
                        f"screenshot ({src}) but {lang_slug!r} is not in "
                        f"LANGUAGE_ISO - add it deliberately"
                    )
                elif actual_code != expected_code:
                    problems.append(
                        f"WRONG LANGUAGE  {rel_page}: expected code "
                        f"{expected_code!r} (study/{lang_slug}/) but {src} "
                        f"is {actual_code!r}"
                    )

        # Rule 4: the same screenshot used more than once on this one page.
        for screenshot_id, unit_count in find_same_page_duplicate_screenshots(html).items():
            problems.append(
                f"SAME-PAGE DUPLICATE  {rel_page}: screenshot {screenshot_id!r} "
                f"appears in {unit_count} places on this page; every screenshot "
                f"on a page must be distinct"
            )

    # Rule 3: cross-topic sharing not covered by the allowlist.
    for src, using_pages in src_to_pages.items():
        if len(using_pages) < 2:
            continue
        if any(using_pages <= allowed for allowed, _reason in TOPIC_SHARE_ALLOWLIST):
            continue
        page_list = ", ".join(sorted(using_pages))
        problems.append(
            f"UNDOCUMENTED SHARE  {src} is used by multiple pages not "
            f"covered by one TOPIC_SHARE_ALLOWLIST entry: {page_list}"
        )

    print(f"Checked {len(pages)} landing pages under lune-synth/.")
    if problems:
        print(f"\n{len(problems)} problem(s) found:\n")
        for p in sorted(problems):
            print(f"  - {p}")
        return 1

    print(
        "No missing files, language mismatches, undocumented shared "
        "screenshots, or same-page duplicates."
    )
    print(f"All {len(required_language_reviews())} reviewed language exports match their accepted hashes and UI locales.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
