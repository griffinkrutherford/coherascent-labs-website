/* Optional browser QA: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/qa/check-tock-wardrobe-codes.cjs
   Start server.js on PORT=8396 first. Public API responses are mocked; no rewards are redeemed. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.TOCK_QA_BASE_URL || 'http://127.0.0.1:8396';
const captureDir = process.env.TOCK_QA_CAPTURE_DIR;
if (captureDir) fs.mkdirSync(captureDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const errors = [];
  try {
    async function open(width, options = {}) {
      const page = await browser.newPage({ viewport: { width, height: 932 }, reducedMotion: 'reduce', ...options });
      page.on('pageerror', error => errors.push(error.message));
      const calls = { standard: 0, golden: 0 };
      await page.route('**/v1/public/tock-wardrobe-code?set=*', async route => {
        const params = new URL(route.request().url()).searchParams;
        assert.equal(params.get('sequenceVersion'), '2');
        const set = params.get('set');
        calls[set]++;
        const now = Date.now();
        await route.fulfill({ json: { set, durationMinutes: set === 'standard' ? 75 : 105, riskLevel: 0, sequenceVersion: 2, riskRule: 'any-adjustment',
          sequence: [{control:'time',value:set === 'standard' ? 75 : 105},{control:'risk',value:0},{control:'time',value:30}],
          serverNow: new Date(now).toISOString(), expiresAt: new Date(now + 600000).toISOString() } });
      });
      await page.goto(base + '/lune-synth/index.html', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-tock-clock]').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => !!window.TockSecret);
      return { page, calls };
    }
    async function keys(page, count, key = 'ArrowRight') {
      await page.locator('[data-tock-clock]').evaluate((clock, args) => {
        for (let i = 0; i < args.count; i++) clock.dispatchEvent(new KeyboardEvent('keydown', { key: args.key, bubbles: true, cancelable: true }));
      }, { count, key });
    }
    for (const width of [375, 430, 1280]) {
      const { page, calls } = await open(width, width === 430 ? { hasTouch: true, isMobile: true } : {});
      const clock = page.locator('[data-tock-clock]');
      const standard = page.locator('[data-tock-reward]'), golden = page.locator('[data-tock-golden-reward]');
      assert.equal(await standard.isVisible(), false);
      assert.equal(await golden.isVisible(), false);
      // Carousel clicks and Home/End only navigate, even after 200 cycles.
      await page.locator('[data-tock]').evaluate(root => {
        for (let i = 0; i < 200; i++) {
          root.querySelector('[data-tock-shot-tab="' + i % 4 + '"]').click();
          root.querySelector('[data-tock-clock]').dispatchEvent(new KeyboardEvent('keydown', { key: i % 2 ? 'Home' : 'End' }));
        }
      });
      assert.deepEqual(calls, { standard: 0, golden: 0 });
      if (width === 1280) {
        await clock.focus();
        for (let i = 0; i < 47; i++) await page.keyboard.press('ArrowRight');
        assert.equal(await standard.isVisible(), false);
        await page.keyboard.press('ArrowRight');
        await standard.locator('[data-tock-code]').waitFor({ state: 'visible' });
        // The reveal dialog takes focus; dismiss it before continuing real keyboard turns.
        await page.keyboard.press('Escape');
        assert.equal(await clock.evaluate(el => el === document.activeElement), true);
        await keys(page, 623);
        assert.equal(await golden.isVisible(), false);
        await page.keyboard.press('ArrowRight');
      } else {
        const b = await clock.boundingBox();
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = b.width * .34;
        const point = a => ({ x: cx + Math.sin(a * Math.PI / 180) * r, y: cy - Math.cos(a * Math.PI / 180) * r });
        if (width === 430) {
          const cdp = await page.context().newCDPSession(page);
          const touch = (type, angle) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ ...point(angle), id: 1 }] });
          await touch('touchStart', 0);
          for (let i = 30; i <= 60450; i += 30) await touch('touchMove', i);
          assert.equal(await golden.isVisible(), false);
          await touch('touchMove', 60480);
          await touch('touchEnd', 0);
        } else {
          const p = point(0); await page.mouse.move(p.x, p.y); await page.mouse.down();
          // A second pointer cannot contribute progress while the primary pointer is captured.
          await clock.evaluate(el => {
            for (let i = 0; i < 200; i++) {
              el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 999, button: 0, clientX: 0, clientY: 0 }));
              el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 999, clientX: i % 2 ? 0 : 100, clientY: i % 2 ? 100 : 0 }));
              el.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 999 }));
            }
          });
          assert.deepEqual(calls, { standard: 0, golden: 0 });
          for (let i = 30; i <= 60450; i += 30) { const p = point(i); await page.mouse.move(p.x, p.y); }
          assert.equal(await golden.isVisible(), false);
          const end = point(60480); await page.mouse.move(end.x, end.y); await page.mouse.up();
        }
      }
      await standard.locator('[data-tock-code]').waitFor({ state: 'visible' });
      await golden.locator('[data-tock-code]').waitFor({ state: 'visible' });
      assert.equal(calls.standard, 1); assert.equal(calls.golden, 1);
      assert.deepEqual(await standard.locator('[data-tock-code] li').allTextContents(), ['Set time to 1 hr 15 min','Move the risk slider to any different position','Set time to 30 min']);
      assert.deepEqual(await golden.locator('[data-tock-code] li').allTextContents(), ['Set time to 1 hr 45 min','Move the risk slider to any different position','Set time to 30 min']);
      for (const card of [standard, golden]) {
        assert.match(await card.innerText(), /no exact percentage is required/);
        assert.doesNotMatch(await card.locator('[data-tock-code]').innerText(), /%/);
      }
      assert.match(await standard.innerText(), /every wardrobe category/);
      assert.match(await golden.innerText(), /1 hr 45 min/);
      assert.match(await golden.innerText(), /every wardrobe category/);
      if (width === 430) await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (captureDir) await page.locator('.tock-copy').screenshot({ path: path.join(captureDir, 'sets-' + width + (width === 430 ? '-large-text' : '') + '.png') });
      console.log(width + ': both thresholds, ' + (width === 430 ? 'touch + 200% text' : width === 375 ? 'mouse + 200 secondary-pointer attempts' : 'keyboard') + ', no overflow');
      await page.close();
    }
    // Cancellation, center pin, grab jumps and negative travel cannot shortcut seven forward days.
    {
      const { page, calls } = await open(375);
      const clock = page.locator('[data-tock-clock]');
      const b = await clock.boundingBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      for (let i = 0; i < 200; i++) {
        await page.mouse.move(cx + (i % 2 ? .34 : -.34) * b.width, cy);
        await page.mouse.down(); await page.mouse.up();
      }
      await page.mouse.move(cx, cy); await page.mouse.down();
      await page.mouse.move(cx + b.width * .34, cy);
      await clock.dispatchEvent('pointercancel', { pointerId: 1 });
      await clock.evaluate(el => {
        for (let i = 0; i < 200; i++) el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: i % 2 ? 0 : 100, clientY: i % 2 ? 100 : 0 }));
      });
      await page.mouse.up();
      assert.deepEqual(calls, { standard: 0, golden: 0 });
      await keys(page, 672, 'ArrowLeft');
      await page.locator('[data-tock-reward] [data-tock-code]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('[data-tock-golden-reward]').isVisible(), false);
      assert.deepEqual(calls, { standard: 1, golden: 0 });
      console.log('200 grabs + center pin + pointer cancellation + backward seven days: no golden shortcut');
      await page.close();
    }
    // Expiry uses server time rather than the visitor clock; refresh never displays a stale code.
    {
      const { page } = await open(430);
      await page.clock.install({ time: new Date('2036-01-01T00:00:00Z') });
      let count = 0;
      await page.unroute('**/v1/public/tock-wardrobe-code?set=*');
      await page.route('**/v1/public/tock-wardrobe-code?set=*', async route => {
        count++;
        if (count === 2) return route.abort('failed');
        await route.fulfill({ json: { set: 'standard', durationMinutes: count === 1 ? 75 : 95, riskLevel: 0, sequenceVersion: 2, riskRule: 'any-adjustment',
          sequence: [{control:'time',value:count === 1 ? 75 : 95},{control:'risk',value:0},{control:'time',value:30}],
          serverNow: '2026-10-22T20:00:00Z', expiresAt: count === 1 ? '2026-10-22T20:00:05Z' : '2026-10-22T20:10:00Z' } });
      });
      await keys(page, 48);
      const card = page.locator('[data-tock-reward]'), code = card.locator('[data-tock-code]');
      await code.waitFor({ state: 'visible' });
      assert.match(await code.innerText(), /1 hr 15 min/);
      await page.clock.runFor(5100);
      await card.locator('[data-tock-code-retry]').waitFor({ state: 'visible' });
      assert.equal(await code.isVisible(), false);
      await card.locator('[data-tock-code-retry]').click();
      await code.waitFor({ state: 'visible' });
      assert.match(await code.innerText(), /1 hr 35 min/);
      assert.equal(count, 3);
      console.log('server clock offset, exact expiry, offline retry and replacement combination: pass');
      await page.close();
    }
    // A legacy or malformed issuer response cannot become a misleading v2 combination.
    for (const mode of ['legacy-v1', 'missing-rule', 'numeric-target']) {
      const { page } = await open(375);
      await page.unroute('**/v1/public/tock-wardrobe-code?set=*');
      await page.route('**/v1/public/tock-wardrobe-code?set=*', async route => {
        const now = Date.now();
        const value = { set:'standard', durationMinutes:75, riskLevel:0, sequenceVersion:2,
          riskRule:'any-adjustment', sequence:[{control:'time',value:75},{control:'risk',value:0},{control:'time',value:30}],
          serverNow:new Date(now).toISOString(), expiresAt:new Date(now+600000).toISOString() };
        if (mode === 'legacy-v1') { value.sequenceVersion = 1; value.sequence = value.sequence.slice(0,2); value.sequence[1].value = 5; }
        if (mode === 'missing-rule') delete value.riskRule;
        if (mode === 'numeric-target') value.sequence[1].value = 2;
        await route.fulfill({ json:value });
      });
      await keys(page,48);
      const card = page.locator('[data-tock-reward]');
      await card.locator('[data-tock-code-retry]').waitFor({state:'visible'});
      assert.equal(await card.locator('[data-tock-code]').isVisible(),false);
      assert.match(await card.locator('[data-tock-code-status]').innerText(),/unavailable/);
      console.log(mode + ': fails closed without displaying a stale or percentage-target code');
      await page.close();
    }
    // Autoplay may move the hands for days but does not count toward either reward.
    {
      const { page, calls } = await open(1280, { reducedMotion: 'no-preference' });
      await page.clock.install();
      await page.clock.fastForward(8 * 86400000);
      assert.deepEqual(calls, { standard: 0, golden: 0 });
      console.log('eight days autoplay: no reward');
      await page.close();
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
