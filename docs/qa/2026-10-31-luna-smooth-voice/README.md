# Smooth Luna voice-call preview

## Update Log

- 2026-10-31: Retry release `ebe19e7a` succeeded. Verified public homepage references, exact served movie/poster hashes and MIME, 206 Range and older footage availability; public desktop/phone playback and reduced-motion/tab/viewport checks pass. No runtime configuration changed.

- 2026-10-31: Published tested media source `96c34459`; the first Railway release failed at BUILD_IMAGE with no available build logs, leaving the previous healthy site serving. Retained the failure receipt and normalized patch context whitespace; `git apply --check` passes. A source release retry follows without changing runtime configuration.

- 2026-10-31: Captured the native pre-rendered emote bridges, retained reproducible fixture and playback observations, and versioned the homepage movie and poster. Desktop/phone actual-server playback checks and all 17 focused tests passed; the full suite retains exactly the same five clean-baseline failures.

The homepage's labeled **Sample conversation** now shows the app's smooth pose transitions. This is a silent, scripted demonstration using the real `TutorVoiceControls`, `LunaVoiceCallAvatar`, image player and delivered WebPs. It does not open a microphone or provider connection, measure live latency, or certify physical audio hardware.

The capture used a dedicated iPhone 17 Pro simulator (iOS 26.5), an existing installed debug binary and an isolated app checkout. No native or EAS build was started. The current mobile implementation requires a future app binary to reach installed users; the website movie can be deployed independently.

## Capture and reproduction

Copy `VoiceCallRecording.tsx` to `apps/mobile/`, then apply `capture-fixture.patch` to app source commit `3f8bcc5c1` in an isolated checkout. The patch supplies scripted status/transcript changes, a replay entry point, and a local Metro worktree URL rewrite. Never ship these fixture changes in the app. Supply isolated, non-production public configuration for module initialization; no secret or environment file is part of this record.

Start Metro on an unused port, then launch only the dedicated installed simulator app with `xcrun simctl launch <udid> com.coherascentlabs.lunesynth -RCT_jsLocation localhost:<port>`. Replay the sample after startup and record with `simctl io <udid> recordVideo`. The sample has a five-second lead and progresses through greeting, thinking, explanation, curiosity, empathy, insight, laughter, unclear speech and goodbye.

The accepted take uses native `autoplay` with display-driven readiness. An earlier imperative image-start approach was rejected by the installed iOS client and was discarded. `native-playback-trace.json` records elapsed render observations from a passive hook observer: 32 revisions, including ready bridges and normal animated clips. The final native state reports `still: false` and `failed: false`. `native-final-contact.jpg` samples the accepted original take, including its untrimmed lead.

## Media and checks

The export is 46.47 seconds, 720×1566, 30fps, H.264/yuv420p, silent, with fast-start metadata. It decodes completely. The poster comes from the same accepted movie. Exact bytes, SHA-256 and probe output are in `media.json`; host-routed local MIME, full-byte and 206 Range checks are in `local-http.json`.

The new `luna-voice-call-smooth-20261031.mp4` and matching poster have distinct cache-versioned filenames. Older previews remain available for cached pages. The existing active-tab, viewport, document-visibility and reduced-motion controller is retained, with a media-query listener so changing the OS motion preference immediately pauses/resumes it.

The clean website baseline had 81 passing and five failing tests out of 86, all in existing offer/retired-Pro expectations. Those unrelated assertions are retained.

## Final local browser acceptance

`proof.json` confirms actual media playback at desktop 1440×1000 and phone 390×844, the new exact movie/poster paths, decoded dimensions, muted audio, active-tab pause/resume, offscreen pausing and immediate reduced-motion pause/restore. The matching screenshots were taken after the movie advanced beyond two seconds. No sign-up, microphone or provider endpoint was used.

Reproduce by running the actual server with `LUNE_SYNTH_DOMAIN=127.0.0.1 PORT=8132 node server.js`, then `VOICE_QA_BASE_URL=http://127.0.0.1:8132/ VOICE_QA_OUTPUT=<directory> node scripts/qa/check-luna-voice-preview.cjs`. Set `PLAYWRIGHT_MODULE` and optionally `VOICE_QA_BROWSER` for externally installed Playwright/Chrome. The script asserts it remains on the requested origin: the default `/lune-synth/` localhost route redirects to the public site and must not be mistaken for a local preview.

All 17 navigation/device/route tests passed. The final full suite is 81 passed/5 failed of 86, matching the clean baseline exactly (`test-results.txt`). All 12 inline JavaScript blocks parse; full movie decoding, host-routed MIME/full-byte/Range checks and `git diff --check` pass.

## Live deployment acceptance

The normal source retry succeeded as Railway deployment `60f9ff68-178f-4d32-a40d-af141b1cda6e`, serving runtime source `ebe19e7a`. `live-deployment.json` confirms exact reviewed bytes, media types, range support, new homepage paths and retained older footage. `live-browser-proof.json` and both `live-voice-*.png` screenshots repeat the desktop/phone playback matrix against `https://lunesynth.com/` after activation. The first attempt failed before usable build logs; its preserved event receipt does not imply a code defect or a runtime configuration change.
