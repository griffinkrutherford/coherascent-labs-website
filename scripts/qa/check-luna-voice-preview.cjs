/* Actual-server media/interaction QA; no sign-up, microphone, or provider calls. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VOICE_QA_BASE_URL;
const output = process.env.VOICE_QA_OUTPUT;
assert(base && output, 'VOICE_QA_BASE_URL and VOICE_QA_OUTPUT are required');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.VOICE_QA_BROWSER ? { executablePath: process.env.VOICE_QA_BROWSER } : {}) });
  const proof = { checkedAt: new Date().toISOString(), routes: [], status: 'RUNNING' };
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
      await context.route(/^https?:/, route => route.request().url().startsWith(new URL(base).origin + '/') ? route.continue() : route.abort());
      const page = await context.newPage(), response = await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      assert.equal(new URL(page.url()).origin, new URL(base).origin, 'QA must remain on the requested server');
      const video = page.locator('#lunaPanel-voice video');
      page.on('pageerror', error => console.error('Page error:', error.message));
      await page.waitForLoadState('load');
      await video.evaluate(v => v.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForFunction(() => { const v = document.querySelector('#lunaPanel-voice video'); return v.readyState >= 2 && !v.paused && v.currentTime > 0.2; }).catch(async error => { await page.screenshot({path: path.join(output, 'failure.png')}); console.error(await video.evaluate(v => ({src:v.currentSrc,ready:v.readyState,paused:v.paused,error:v.error?.message,rect:v.getBoundingClientRect().toJSON(),hidden:document.hidden,panel:v.closest('.luna-tab-panel').className}))); throw error; });
      await page.waitForFunction(() => document.querySelector('#lunaPanel-voice video').currentTime > 2);
      const state = await video.evaluate(v => ({ source: v.currentSrc, poster: v.poster, muted: v.muted, width: v.videoWidth, height: v.videoHeight, duration: v.duration }));
      assert(state.source.endsWith('luna-voice-call-20261101.mp4'));
      assert(state.poster.endsWith('luna-voice-call-20261101-poster.webp'));
      assert.equal(state.muted, true); assert.equal(state.width, 720); assert.equal(state.height, 1566);
      await page.screenshot({ path: path.join(output, `voice-${viewport.width}.png`) });
      await page.locator('#lunaTab-hints').click();
      await page.waitForFunction(() => document.querySelector('#lunaPanel-voice video').paused);
      await page.locator('#lunaTab-voice').click();
      await video.evaluate(v => v.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForFunction(() => !document.querySelector('#lunaPanel-voice video').paused);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelector('#lunaPanel-voice video').paused);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => !document.querySelector('#lunaPanel-voice video').paused);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('#lunaPanel-voice video').paused);
      proof.routes.push({ viewport, media: state, playsWhenVisible: true, inactiveTabPauses: true, reducedMotionPauses: true, motionRestoreResumes: true, offscreenPauses: true });
      await context.close();
    }
    proof.status = 'PASS';
  } catch (error) {
    proof.status = 'FAIL';
    proof.error = error.message;
    throw error;
  } finally {
    fs.writeFileSync(path.join(output, 'proof.json'), JSON.stringify(proof, null, 2) + '\n');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
