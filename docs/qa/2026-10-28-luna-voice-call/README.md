# Luna voice-call homepage preview

## Update Log

- 2026-10-28: Recorded the app’s 3D Luna voice-call interface for the homepage’s first tutor tab, before Hints. The sample conversation is scripted and silent; it does not open a microphone or provider session.

The recording uses `TutorVoiceControls.tsx` and `LunaVoiceCallAvatar.tsx` from app commit `c26ddf8d0129b65a2b504e3f63b59ef2f65fe194`. The 3D character, listening/thinking/speaking clips, hand-offs, ring colors, call labels, transcript layout and Mute/End controls are the app’s own implementation.

A local-only fixture supplies sample status and transcript updates instead of a live session. The published tab explicitly says “Sample conversation”. This asset demonstrates the interface and animation; it is not a recorded provider call, a latency benchmark or device audio acceptance.

`capture-fixture.patch` and `VoiceCallRecording.tsx` preserve the capture setup. Apply them only in an isolated app checkout, reuse an installed simulator binary, and point Metro at that checkout. No fixture or app changes are included in the website’s runtime.

Recorded on a dedicated iPhone 17 Pro simulator with iOS 26.5. The runtime video is `lune-synth/screenshots/applied/luna-voice-call.mp4`, with `luna-voice-call-poster.webp` as its reduced-motion and loading frame. The website shares the existing active-tab, viewport, page-visibility and reduced-motion playback gates.

## Verification

- Native recording reviewed across listening, thinking, speaking and hand-off frames; see `native-contact.jpg` (three-second samples of the uncut capture).
- Safari desktop and iPhone Safari show Voice Call before Hints, selected on initial load. The iPhone menu displays three tabs on its first row and two on its second row.
- Safari tab switching verified Voice Call → Hints → Infographics → Voice Call, with the matching selected tab and panel each time.
- All 12 inline JavaScript blocks parse with `node --check`; `git diff --check` passes.
- The entire H.264 file decodes without errors. Its format, measured duration, dimensions and hash are in `media.json`.
- The actual website server serves the video and poster with the Lune host header, correct MIME types and exact file bytes. A video range request returns 206 with the requested 1,024 bytes.
