"""Regression checks for media references a static src-only scan misses."""
import importlib.util
import hashlib
import tempfile
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    "screenshot_guard", Path(__file__).with_name("check-landing-screenshots.py")
)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class ScreenshotReferencesTest(unittest.TestCase):
    def test_responsive_and_video_assets_are_all_checked(self):
        html = """
        <picture><source srcset='/screenshots/full.webp 1200w, /screenshots/mid.webp 480w'>
        <img src="/screenshots/mid.webp?rev=2" alt="Example"></picture>
        <video poster='/screenshots/poster.webp'><source src='/screenshots/clip.mp4'></video>
        <div data-screenshot-src='/screenshots/background.webp'></div>
        <style>.phone { background: url('/screenshots/css-only.webp'); }</style>
        <link rel='preload' href='/unrelated-preload.webp'>
        """
        self.assertEqual(guard.extract_media_urls(html), {
            "/screenshots/full.webp", "/screenshots/mid.webp",
            "/screenshots/mid.webp?rev=2", "/screenshots/poster.webp",
            "/screenshots/clip.mp4",
            "/screenshots/background.webp", "/screenshots/css-only.webp",
        })

    def test_gallery_checks_both_screens_for_every_declared_locale(self):
        script = 'var LOCALES = [{ code: "en" }, { code: "pt-BR" }];'
        self.assertEqual(guard.dynamic_gallery_urls(script), {
            f"screenshots/applied/lang/{screen}-{locale}.webp"
            for screen in ("home", "shop") for locale in ("en", "pt-BR")
        })

    def test_missing_or_duplicate_locale_registry_fails_closed(self):
        for script in ('var LOCALES = [];', '',
                       'var LOCALES = [{code: "es"}, {code: "es"}];'):
            with self.subTest(script=script), self.assertRaises(ValueError):
                guard.dynamic_gallery_urls(script)

    def test_shared_feature_panels_include_alternate_posters_and_videos(self):
        script = """const worlds={poster:'/screenshots/alternate-world.webp'};
        const markup=`<video><source src="/screenshots/mission.mp4"></video>`;"""
        self.assertEqual(guard.dynamic_feature_urls(script), {
            "/screenshots/alternate-world.webp", "/screenshots/mission.mp4",
        })
        with self.assertRaises(ValueError):
            guard.dynamic_feature_urls("const worlds = {};")

    def test_picture_variants_are_one_unit_but_a_second_figure_is_duplicate(self):
        picture = """<picture><source srcset="/screenshots/question.webp 1200w">
          <img src="/screenshots/question-mid.webp"></picture>"""
        self.assertEqual(guard.find_same_page_duplicate_screenshots(picture), {})
        self.assertEqual(guard.find_same_page_duplicate_screenshots(
            picture + '<img src="/screenshots/question-low.webp">'
        ), {"question": 2})

    def test_review_is_bound_to_exact_bytes_and_selected_ui_locale(self):
        with tempfile.TemporaryDirectory() as root:
            items = []
            for asset, locale in guard.required_language_reviews().items():
                image = Path(root, asset)
                image.parent.mkdir(parents=True, exist_ok=True)
                image.write_bytes(b"reviewed export")
                items.append({
                    "asset": asset, "uiLocale": locale, "semanticReview": "PASS",
                    "sha256": hashlib.sha256(image.read_bytes()).hexdigest(),
                    "fixture": "scoped-sample", "variant": "website-sample",
                    "fixtureCommit": "a" * 40, "nativeCaptureSHA256": "b" * 64,
                    "reviewNotes": ["Exact export opened; chrome and authored content reviewed."],
                })
            manifest = {"schemaVersion": 1, "items": items}
            self.assertEqual(guard.check_language_review_manifest(root, manifest), [])
            Path(root, items[0]["asset"]).write_bytes(b"changed after review")
            items[1]["uiLocale"] = "en"
            problems = guard.check_language_review_manifest(root, manifest)
            self.assertTrue(any("exported bytes changed" in p for p in problems))
            self.assertTrue(any("expected" in p and "UI" in p for p in problems))

    def test_missing_or_duplicate_review_records_cannot_certify_a_batch(self):
        problems = guard.check_language_review_manifest("/unused", {
            "schemaVersion": 1, "items": [
                {"asset": "example.webp"}, {"asset": "example.webp"}
            ]
        })
        self.assertTrue(any("duplicate" in p for p in problems))
        self.assertEqual(sum("missing reviewed recapture" in p for p in problems), 27)


if __name__ == "__main__":
    unittest.main()
