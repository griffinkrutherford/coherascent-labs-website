# Tock’s website Easter egg

## Update Log

- 2026-10-22: Added a hidden wardrobe reward for manually turning the short clock hand through a full revolution. The app combination is 1 hour 15 minutes and No risk; app support requires a new build.

The Focus with Tock carousel keeps its normal behavior. Twelve manual revolutions of the long hand complete one revolution of the short hand and reveal the secret combination. Either direction works. Reversing cancels travel. Keyboard arrow turns also count. Autoplay, carousel tabs, side-phone clicks, snapping, initial pointer grabs and center-pin jumps do not earn progress. The reveal appears once per page load, remains visible, and uses a polite live region without moving focus during dragging.

Set the app’s Focus timer to **1 hr 15 min + No risk** (risk slider all the way left) to unlock the permanent **Easter Egg** skin in Tock’s Wardrobe. Selecting the combination does not start a session or spend Moon Rocks. The app verifies and persists ownership through its authenticated wardrobe redemption endpoint. This is a freely shareable cosmetic secret, not proof of website interaction or eligibility for paid benefits.

The website note explicitly requires the app update containing this feature: a website push cannot update installed native apps.

Validation: five direct core tests, including 200 seeded turn sweeps; browser checks at 375 and 1280 pixels, drag and counterclockwise keyboard unlock, no early reveal, no carousel-click unlock, and no page errors. A 430-pixel touch check also covers counterclockwise turns and 200% text without horizontal overflow. Website suite: 64 pass / 5 fail; the same five offer/Pro-page failures reproduce on unchanged main.

Browser reveal captures: [mobile](visuals/tock-easter-egg-2026-10-22/reveal-375.png), [desktop](visuals/tock-easter-egg-2026-10-22/reveal-1280.png).
