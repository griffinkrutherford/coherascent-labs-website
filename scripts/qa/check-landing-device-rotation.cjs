/* Actual-server browser matrix. Supply an owned proxy forwarding Host: lunesynth.com. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.LANG_QA_BASE_URL;
const output = process.env.LANG_QA_OUTPUT;
assert(base && output, 'LANG_QA_BASE_URL and LANG_QA_OUTPUT are required');
const root = path.resolve(__dirname, '../..');
const inventory = JSON.parse(execFileSync('python3', ['scripts/inventory-landing-devices.py'], { cwd: root }));
const shared = '.phone-mock__frame,.feature-phone,.feature-ipad,.response-carousel__question-phone,.about-luna-phone';
const manual = '[data-phone-mock],.phone-mock__frame,.feature-phone,.feature-ipad,.ipad-mockup,.voice-scene__ipad,.about-luna-phone,.hero-highlight-reel__phone,.capture-scene__phone,.processing-scene__phone,.feedback-scene__phone,.voice-scene__phone,.luna-phone--tab,.quick-missions__phone,.response-carousel__question-phone';
const proof = { status: 'RUNNING', inventory, routes: [], initialFallbacks: [], limitations: ['Media requests are blocked: this gate certifies device motion, not video playback or unchanged screenshot pixels.', 'Hidden homepage gallery states are inventoried and initialized, not selected or recaptured.'] };
if (process.env.DEVICE_QA_RESUME_FILE) {
  const previous = JSON.parse(fs.readFileSync(process.env.DEVICE_QA_RESUME_FILE));
  assert.deepEqual(previous.inventory, inventory, 'Resume requires the identical HTML inventory');
  proof.routes = previous.routes;
  proof.resumedFrom = process.env.DEVICE_QA_RESUME_FILE;
}
fs.mkdirSync(output, { recursive: true });
function save() { fs.writeFileSync(path.join(output, 'proof.json'), JSON.stringify(proof, null, 2)); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await context.route(/^https?:/, route => route.request().url().startsWith(base + '/') && route.request().resourceType() !== 'media' ? route.continue() : route.abort());
    await context.addInitScript(() => {
      window.__deviceTransitions = [];
      document.addEventListener('transitionstart', event => {
        if (event.propertyName === 'rotate') window.__deviceTransitions.push({ element: event.target, at: performance.now(), rotate: getComputedStyle(event.target).rotate });
      }, true);
    });
    const page = await context.newPage();
    for (const entry of inventory.pages.filter(item => item.active)) {
      if (proof.routes.some(row => row.route === entry.route)) continue;
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      const response = await page.goto(base + entry.route, { waitUntil: 'load' });
      assert.equal(response.status(), 200, entry.route);
      const campaign = entry.path !== 'lune-synth/index.html' && entry.path !== 'lune-synth/about/index.html';
      const expectedShared = entry.devices.filter(device => device.automaticController === 'shared').length + (campaign ? 2 : 0);
      // Home's response slideshow replaces its static examples with additional
      // runtime phones. Count and require initialization of those too.
      await page.waitForFunction(({ shared, expectedShared }) => document.querySelectorAll(shared).length >= expectedShared && document.querySelectorAll(shared).length === document.querySelectorAll('.device-tilt').length, { shared, expectedShared });
      const initialized = await page.evaluate(({ shared, manual }) => ({ shared: document.querySelectorAll(shared).length, manual: document.querySelectorAll(manual).length, attached: document.querySelectorAll('.rotatable-device').length, slices: [...document.querySelectorAll(shared)].every(element => element.querySelectorAll(':scope > .device-tilt__slice').length === 24) }), { shared, manual });
      assert(initialized.slices, entry.route + ' depth initialization');
      assert.equal(initialized.attached, initialized.manual, entry.route + ' manual initialization');
      const targets = await page.locator(shared).count();
      const visibleIndices = [];
      for (let index = 0; index < targets; index++) {
        const visible = await page.locator(shared).nth(index).evaluate(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden' && !element.closest('[hidden],[aria-hidden="true"]');
        });
        if (!visible) continue;
        visibleIndices.push(index);
        await page.locator(shared).nth(index).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
        // Keep the device visible through its real delayed entrance. A rapid
        // scroll past content-visibility sections can defer their rendering.
        await page.waitForFunction(({ shared, index }) => window.__deviceTransitions.some(event => event.element === document.querySelectorAll(shared)[index]), { shared, index });
        if (entry.route === '/about/') await page.screenshot({ path: path.join(output, 'about-normal-' + index + '.png') });
      }
      // Let actual 500ms transition delays elapse; no synthetic events or time seeking.
      await page.waitForTimeout(650);
      const motion = await page.evaluate(({ shared, visibleIndices }) => visibleIndices.map(index => {
        const element = document.querySelectorAll(shared)[index];
        return { index, classes: element.className, revealed: element.classList.contains('is-device-revealed'), rotate: getComputedStyle(element).rotate, started: window.__deviceTransitions.some(event => event.element === element), activeRotateTransitions: element.getAnimations().filter(animation => animation.transitionProperty === 'rotate').map(animation => ({ currentTime: animation.currentTime, state: animation.playState })) };
      }), { shared, visibleIndices });
      for (const device of motion) {
        assert(device.revealed, entry.route + ' reveal ' + device.index);
        assert(device.started, entry.route + ' actual rotation start ' + device.index);
      }
      const first = page.locator(shared).nth(visibleIndices[0]);
      await first.evaluate(element => element.focus({ preventScroll: true }));
      await page.keyboard.press('Alt+ArrowRight');
      assert.match(await first.evaluate(element => element.style.transform), /rotateY\(5deg\)/, entry.route + ' keyboard rotation');
      await page.keyboard.press('Escape');
      assert.equal(await first.evaluate(element => element.style.transform.includes('rotateY(5deg)')), false, entry.route + ' Escape reset');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelectorAll('.device-tilt,.device-tilt__slice,.device-key').length === 0);
      await page.keyboard.press('Alt+ArrowRight');
      assert.match(await first.evaluate(element => element.style.transform), /rotateY\(5deg\)/, entry.route + ' intentional reduced manual rotation');
      await page.keyboard.press('Escape');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.keyboard.press('Alt+ArrowRight');
      assert.equal(await first.evaluate(element => element.style.transform.includes('rotateY(5deg)')), false, entry.route + ' mobile manual fallback');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(({ shared }) => document.querySelectorAll('.device-tilt').length === document.querySelectorAll(shared).length, { shared });
      assert.deepEqual(errors, [], entry.route + ' browser errors');
      const row = { route: entry.route, campaign, expectedShared, initialized, motion, liveReduced: 'PASS', manualAndEscape: 'PASS', mobile: 'PASS', reenabled: 'PASS', errors };
      proof.routes.push(row); save();
      page.off('pageerror', onError);
      if (proof.routes.length % 20 === 0) console.log('PASS routes=' + proof.routes.length);
    }
    await page.close(); await context.close();
    // Fresh initial preference/viewport, including dynamic insertion; live changes above cover every route.
    for (const mode of ['reduced', 'mobile']) {
      const fallback = await browser.newContext({ viewport: mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', hasTouch: mode === 'mobile', isMobile: mode === 'mobile' });
      await fallback.route(/^https?:/, route => route.request().url().startsWith(base + '/') && route.request().resourceType() !== 'media' ? route.continue() : route.abort());
      for (const route of ['/', '/about/', '/study/calculus/', '/test-prep/ap-physics-1/', '/for-students/test-anxiety/']) {
        const tab = await fallback.newPage(); await tab.goto(base + route, { waitUntil: 'load' });
        await tab.waitForTimeout(150);
        assert.equal(await tab.locator('.device-tilt,.device-tilt__slice,.device-key').count(), 0, mode + route);
        if (mode === 'mobile') assert.equal(await tab.locator('.rotatable-device').count(), 0, 'fresh mobile no manual layers');
        if (route === '/about/') {
          const about = await tab.locator('.about-luna-phone').first().evaluate(element => ({ transform: getComputedStyle(element).transform, power: { width: getComputedStyle(element, '::after').width, height: getComputedStyle(element, '::after').height } }));
          assert.equal(about.power.width, '3px'); assert.equal(about.power.height, '58px');
        }
        await tab.screenshot({ path: path.join(output, mode + '-' + (route.replace(/\//g, '-') || 'home') + '.png'), fullPage: false });
        proof.initialFallbacks.push({ mode, route, status: 'PASS' }); await tab.close();
      }
      await fallback.close();
    }
    proof.status = 'PASS';
    proof.totals = { routes: proof.routes.length, campaignRoutes: proof.routes.filter(row => row.campaign).length, runtimeManualDevices: proof.routes.reduce((sum, row) => sum + row.initialized.manual, 0), sharedAutomaticDevices: proof.routes.reduce((sum, row) => sum + row.initialized.shared, 0), visibleSharedActualRotationStarts: proof.routes.reduce((sum, row) => sum + row.motion.length, 0), initialFallbacks: proof.initialFallbacks.length };
    console.log(JSON.stringify(proof.totals));
  } catch (error) { proof.status = 'FAIL'; proof.error = error.stack; throw error; }
  finally { save(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
