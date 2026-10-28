# Luna voice-call homepage preview

## Update Log

- 2026-10-28: Re-recorded the native sample with greeting, thinking, explanation, curiosity, empathy, insight, laughter, unclear-speech and goodbye emotes. Moved the homepage section between Constellations and Quick Missions.

- 2026-10-28: Recorded the app’s 3D Luna voice-call interface for the homepage’s first tutor tab, before Hints. The sample conversation is scripted and silent; it does not open a microphone or provider session.

The recording uses `TutorVoiceControls.tsx` and `LunaVoiceCallAvatar.tsx` from app commit `2afde0070`. The 3D character, listening/thinking/speaking clips, hand-offs, ring colors, call labels, transcript layout and Mute/End controls are the app’s own implementation.

A local-only fixture supplies sample status and transcript updates instead of a live session. The published tab explicitly says “Sample conversation”. This asset demonstrates the interface and animation; it is not a recorded provider call, a latency benchmark or device audio acceptance.

`capture-fixture.patch` and `VoiceCallRecording.tsx` preserve the capture setup. Apply them only in an isolated app checkout, reuse an installed simulator binary, and point Metro at that checkout. No fixture or app changes are included in the website’s runtime.

Recorded on a dedicated iPhone 17 Pro simulator with iOS 26.5. The runtime video is `lune-synth/screenshots/applied/luna-voice-call-emotes.mp4`, with `luna-voice-call-emotes-poster.webp` as its reduced-motion and loading frame. The website shares the existing active-tab, viewport, page-visibility and reduced-motion playback gates.

## Verification

- Native recording reviewed across listening, thinking, speaking and hand-off frames; see `native-contact.jpg` for the original take and `expanded-native-contact.jpg` for two-second samples of the expanded published take.
- Safari desktop and iPhone Safari show Voice Call before Hints, selected on initial load. The iPhone menu displays three tabs on its first row and two on its second row.
- Safari tab switching verified Voice Call → Hints → Infographics → Voice Call, with the matching selected tab and panel each time.
- All 12 inline JavaScript blocks parse with `node --check`; `git diff --check` passes.
- The entire H.264 file decodes without errors. Its format, measured duration, dimensions and hash are in `media.json`.
- The actual website server serves the video and poster with the Lune host header, correct MIME types and exact file bytes. A video range request returns 206 with the requested 1,024 bytes.

## Expanded sample verification

The fixture selects the app's `voice_greet`, `voice_think`, `voice_explain`, `voice_curious`, `voice_empathy_b`, `voice_aha`, `voice_laugh`, `voice_didnt_catch` and `voice_goodbye` clips. The app's pure selector and personality selector confirmed these choices. No grading-result facts are fabricated. Native capture uses the real animation, transcript and status components; each phase keeps only the latest sample exchange visible.

The isolated capture checkout uses an existing simulator binary. With Metro listening on localhost:8101, launch that dedicated device with `xcrun simctl launch <udid> com.coherascentlabs.lunesynth -RCT_jsLocation localhost:8101`. No Android or iOS native build was started.

The 17 focused navigation/device/route tests pass. The full website suite is 81/86, retaining the five documented offer/retired-Pro failures. All inline JavaScript parses, section and menu order are checked, and `git diff --check` passes. Native browser automation was unavailable (`cgWindowNotFound` for both Safari and Chrome); this change retains the existing video controller and playback gates.

The expanded export is 46.5 seconds, 720×1566 at 30 fps, H.264/yuv420p, silent, 611,083 bytes with fast-start metadata. Full-file decoding succeeds; video/poster MIME and byte-for-byte server checks pass, and the video range endpoint returns 206 with the expected 1,024 bytes. The poster is a reviewed frame from the same recording. Older video/poster assets remain available for cached pages.
