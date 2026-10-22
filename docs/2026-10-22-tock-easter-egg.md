# Tock’s website wardrobe secrets

## Update Log

- 2026-10-22: Clarified that an already-selected app combination needs an explicit minute change away and back; discovery never submits automatically on mount.

- 2026-10-22: Expanded the first secret to a complete Easter Egg wardrobe set and added a Golden Egg set after seven days of forward manual clock travel. Both reveals request the server’s current combination, hide it at expiry, and refresh automatically every ten-minute code window.
- 2026-10-22: Added a hidden wardrobe reward for manually turning the short clock hand through a full revolution. App support requires a new build.

The Focus with Tock carousel keeps its normal behavior. Twelve manual revolutions of the long hand complete one revolution of the short hand and reveal the **Easter Egg set**. Either direction works for this first secret. Advancing the clock seven days, or fourteen clockwise revolutions of the short hand (168 long-hand revolutions), reveals the **Golden Egg set**. The first revolution counts toward the fourteen; unlocking the first reward does not stop tracking. Reversing cancels net travel, so seven days backward do not earn the Golden Egg. Both reveals persist until the page is reloaded.

Each set contains an item for every app wardrobe category. The reveal fetches its current timer combination from `GET /v1/public/tock-wardrobe-code?set=standard|golden` on the production API. Duration is a valid five-minute wheel value; risk is always **No risk**, with the risk slider all the way left. Setting the combination does not start a session or spend Moon Rocks. If it is already selected when opening the app, change the minutes away and back to explicitly enter it. The app verifies the current code and persists ownership through its authenticated wardrobe redemption endpoint. These are freely shareable cosmetic secrets, not proof of website interaction or eligibility for paid benefits.

Codes change at ten-minute UTC boundaries. The card shows the server’s remaining lifetime using monotonic elapsed time, conservatively subtracting request latency. It hides the old combination before refreshing, including after connection errors, and offers a retry button. Request and refresh timers stop while the page is hidden; returning to the page fetches fresh codes for any revealed sets. No fixed pair is embedded in the markup as a fallback. API responses must match the requested set, wheel range, free risk, and a positive server lifetime of at most ten minutes. Server enforcement is authoritative, including at expiry.

Only explicit clock-pointer movement and arrow-key turns earn progress. Autoplay, carousel tabs, side-phone clicks, Home/End keys, snapping, initial pointer grabs, center-pin jumps and other pointers do not. A cancelled or lost pointer cannot keep contributing travel. The reveal uses a polite live region without moving focus during dragging; its changing countdown has live announcements disabled. Mobile touch input, reduced-motion preferences and keyboard access retain the existing carousel behavior.

The website note explicitly requires the app update containing the wardrobe sets: a website push cannot update installed native apps. The website and API changes should deploy together so the code endpoint is available before public discovery.

## Validation

Observed core gate: **10 pass / 0 fail**. The full website gate reports **69 pass / 5 fail / 74 total**; all five failures have the same names as the unchanged offer/Pro-page baseline, outside this feature. The core tests cover both exact thresholds, one-shot standard discovery, persistent reveals, invalid jumps, reverse travel, 200 seeded ordinary turn sweeps and 200 seeded seven-day sweeps with oscillations and positive/negative angle wraps. Code validation tests cover server expiry, requested-set mismatches and invalid wheel/risk values.

Optional browser regression checks live in `scripts/qa/check-tock-wardrobe-codes.cjs`. Start `PORT=8396 node server.js`, supply an existing Playwright installation with `PLAYWRIGHT_MODULE=/path/to/playwright`, then run the script. It mocks the public code endpoint and never redeems rewards. It covers full seven-day mouse, touch and keyboard discovery at 375, 430 and 1280 pixels, 200% text, 200 secondary-pointer and initial-grab attempts, cancellation, backward travel, autoplay, a visitor clock ten years ahead, expiry, network failure and retry. Set `TOCK_QA_CAPTURE_DIR` to capture the revealed cards.

Observed browser gate: all three widths pass, including the full fourteen short-hand turns by mouse, touch and keyboard, 200% text without horizontal overflow, 200 secondary-pointer and grab attempts, cancellation, backward seven-day travel, eight autoplay days, server/visitor clock skew, expiry, an offline refresh and successful retry. No page errors were recorded. Both reward cards were visually reviewed in all three captures: [375 pixels](visuals/tock-wardrobe-sets-2026-10-22/sets-375.png), [430 pixels with 200% text](visuals/tock-wardrobe-sets-2026-10-22/sets-430-large-text.png), [1280 pixels](visuals/tock-wardrobe-sets-2026-10-22/sets-1280.png). These use mocked public API codes; live endpoint/CORS verification and native app redemption remain integration checks after the API/app changes land.

Original single-skin captures remain available for historical comparison: [mobile](visuals/tock-easter-egg-2026-10-22/reveal-375.png), [desktop](visuals/tock-easter-egg-2026-10-22/reveal-1280.png).
