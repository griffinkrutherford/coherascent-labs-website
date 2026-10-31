# Luna handoff flicker correction

## Update Log

- 2026-10-31: Website release `6a673461` succeeded. Public desktop/phone playback and all tab/motion/viewport gates passed; served movie/poster hashes, MIME and 206 Range match the accepted export. Android rendering was also checked with the same source; its temporary normal-tier override was restored.

- 2026-10-31: Re-recorded the native call sample from app fix `2d25c7dfc`, measured its handoff brightness, and selected separate v2 movie/poster URLs. Local desktop/phone playback, source bytes, MIME and Range checks pass; publication verification follows.

The previous movie showed a real brightness dip: both transparent model images faded simultaneously. Ordinary source-over blending gives an opaque overlapping body only 75% coverage halfway through that handoff. The app now leaves the lower image opaque and reveals the decoded incoming layer over it, removing the lower layer only when the reveal completes. The existing pose bridges, 180ms reveal, decoder gates, provider state and call cleanup are retained.

The owner’s native iPhone 17 Pro recording uses the real app player and the same silent scripted conversation as the earlier preview. Reuse [the existing isolated capture fixture](../2026-10-31-luna-smooth-voice/) against app `2d25c7dfc`; no new native/EAS build or provider/microphone session was started. This is a labeled sample, not a live-call latency or acoustic test. `native-playback.json` records 32 visual revisions; the final state reports normal animation and no decoder failure.

`brightness.json` compares the old live export and the exact replacement. Across the first six seconds/180 frames, the fixed model-region diagnostic falls from minimum/median 180/222 (18.9% dip) to 221/222 (0.45% dip). Frames below 210 fall from 18 to zero. This catches the observed transparency dimming; it is not a universal motion-quality benchmark or a claim of arbitrary frame-perfect pose interpolation. The complete replacement contact sheet is `native-contact.jpg`.

`media.json` preserves the export probe, hashes, bytes and local MIME/full-byte/Range checks. The entire silent H.264 movie decodes. New `smooth-v2-20261031` filenames avoid stale media caches; older movie/poster URLs remain available. `local-browser-proof.json` and matching screenshots confirm actual desktop/phone playback, inactive-tab pausing, offscreen pausing and reduced-motion pause/restore against the real local server. All 12 inline scripts parse. The complete website suite remains 81 passed/5 failed of 86, matching the unchanged offer/retired-Pro baseline; no assertions were weakened.

App acceptance: 3,664 component tests passed across 447 suites, including the new controlled-loading/reveal opacity regression; mobile TypeScript and changed-component lint passed. API and mobile core source are unchanged from their recorded 10,000-pass/3-skip and 11,864-pass gates.

## Live acceptance

`live-deployment.json` records successful Railway release `e888d38a-a327-4e35-9c07-2ad558421ecc`, runtime source `6a673461`, and byte-exact served assets. `live-browser-proof.json` and the two `live-voice-*.png` screenshots repeat the playback matrix against `https://lunesynth.com/`. The corrected movie hash matches the export used in `brightness.json`. The original previews remain available for cached pages. Additional Android renderer evidence is recorded in the app repository under `docs/qa/2026-10-31-luna-voice/android-alpha-v2.*`; it is an offline native preview check, with no new live call or acoustic claim.
