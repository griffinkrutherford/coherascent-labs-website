#!/usr/bin/env python3
"""Guard against mismatched/missing app screenshots on lune-synth landing pages.

Owner report (2026-10-25): the Dutch study page was showing German screenshots,
the Greek page was showing Latin, and the Hindi page was showing Japanese and
Korean. This script encodes the mechanical checks that catch that class of bug
so it cannot silently reappear:

  1. Missing file. Every <img>/<source> src referenced from a landing page
     under lune-synth/ must resolve to a real file on disk.
  2. Wrong language. A study/<language>/ page may only use screenshots from
     mobile-app-assets/screenshots/applied/languages/<code>-* for ITS OWN ISO
     639-1 code (LANGUAGE_ISO below). The study/languages/ overview page is a
     multi-language sampler and is exempt.
  3. Cross-topic sharing. Any screenshot embedded by two or more landing pages
     is only allowed when every page that uses it appears together in one
     entry of TOPIC_SHARE_ALLOWLIST below (e.g. study/math/ legitimately
     reuses study/algebra/'s screenshot; a German page and a Dutch page do
     not legitimately share anything). New shared images must be added to
     the allowlist deliberately, with a reason, or the guard fails.

Stdlib only. Run from anywhere:
    python3 scripts/check-landing-screenshots.py
Exits 0 with a short summary when clean, exits 1 with every violation listed
when not.
"""
from __future__ import annotations

import os
import re
import sys
from collections import defaultdict

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

IMG_SRC_RE = re.compile(r'<(?:img|source)\b[^>]*\bsrc="([^"]+)"', re.IGNORECASE)

# Rule 3 (cross-topic sharing) only applies to actual in-app screenshots.
# Brand marks (the app icon, Luna emote stickers, etc.) legitimately repeat
# on every page and are not "screenshots" in the sense this guard cares
# about.
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

    for page_path in pages:
        rel_page = os.path.relpath(page_path, LUNE_ROOT)
        with open(page_path, encoding="utf-8", errors="replace") as f:
            html = f.read()

        srcs = set(IMG_SRC_RE.findall(html))
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

    print("No missing files, language mismatches, or undocumented shared screenshots.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
