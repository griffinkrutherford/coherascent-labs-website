# Luna helmet and head stability

## Update Log

- 2026-10-31: App correction `8f3fb3c77` is published on main `954f807cc`, with native transcript following evidence and the separate calmer-hula commit `337a29b7c`. Full core 11,907 and component 3,670 assertions passed before later main integration; fresh scoped integration checks, mobile TypeScript and changed-source lint passed. Installed apps still require a future binary.

- 2026-10-31: Railway `c601b8f6-690b-4b0f-a2b2-f0cf93ebb058` succeeded from website `eedb9eb9`. Public desktop/phone checks pass and exact served movie/poster bytes, MIME and 206 Range match the reviewed files; older movies remain available. App correction is committed as `8f3fb3c77`.

- 2026-10-31: Re-recorded native iPhone footage after opaque frame matting, stable decoder props and fixed transcript height. Reviewed the first six seconds at 10fps and the full conversation contact sheet. Actual-server desktop/phone playback and exact-byte/MIME/206 Range checks pass; live publication verification follows.

The previous body-opacity correction still exposed the outgoing translucent helmet through its replacement. Each frame now composites on an opaque matte matching the call surface and animated speaker glow. Stable native image props keep the retained decoder playing without reloading/restarting its head pose. Reserving transcript space removes the separate vertical jump when speech text arrives. The existing pose bridges, 180ms reveal, decode readiness and bounded two-layer lifetime are retained.

This silent sample uses the actual app components and delivered animation files in an existing installed iPhone 17 Pro simulator client. Its 32 visual revisions reached decoded transitions and normal animated loops without a still fallback. `helmet-handoffs.jpg` samples the first six seconds at 10fps; `native-contact.jpg` covers the conversation. These reviewed frames show no white helmet flash or speech-driven panel jump. The native ScrollView separately stayed at Y=477 points through short and long transcripts, with zero bottom error after both speakers’ growing text (`native-scroll-position.json`). This is a scripted visual/layout test; it does not certify spoken recognition, acoustic hardware or live provider latency. No native or EAS build was started.

`source.json` records exact app source hashes and the capture base. Once that matching app fix is present, copy `VoiceCallRecording.tsx` to `apps/mobile/` and apply `capture-fixture.patch` in an isolated checkout. Reuse the [original Metro/native capture instructions](../2026-10-31-luna-smooth-voice/). Never ship fixture changes or its synthetic transcripts. The capture adds no provider or microphone traffic.

The new `luna-voice-call-stable-20261031.mp4` and matching poster use distinct cache URLs. Older movies remain available. The silent H.264/yuv420p movie is 720×1566 at 30fps with fast-start metadata; it decodes completely. `export-probe.json` records the exact duration and format. `local-http.json` records reviewed SHA-256, bytes, media types and range support.

`local-browser-proof.json` and the two matching screenshots verify actual playback on desktop 1440×1000 and phone 390×844, new exact source/poster paths, muted playback, tab pause/resume, reduced-motion pause/restore and offscreen pausing. All 17 focused tests and all 12 inline script parse checks pass. The full website suite remains 81 passed/5 failed of 86, the same existing offer/retired-Pro baseline; no unrelated assertions were changed. Live verification passed after activation of this source release: `live-http.json`, `live-browser-proof.json` and matching screenshots retain the evidence. `live-deployment.json` identifies the successful Railway release.
