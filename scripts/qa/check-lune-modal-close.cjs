/* Existing Playwright only. Public Tock codes are mocked; no rewards are redeemed.
   TOCK_QA_BASE_URL must point to actual server.js with Host:lunesynth.com routing. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.TOCK_QA_BASE_URL||'http://127.0.0.1:8396';
const output=process.env.TOCK_QA_CAPTURE_DIR;
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const mode of ['mouse','touch','keyboard']){
   const page=await browser.newPage({viewport:{width:mode==='keyboard'?1280:390,height:932},hasTouch:mode==='touch',isMobile:mode==='touch',reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/v1/public/tock-wardrobe-code?set=*',route=>{
    const now=Date.now();return route.fulfill({json:{set:'standard',durationMinutes:75,riskLevel:0,sequenceVersion:1,
     sequence:[{control:'time',value:75},{control:'risk',value:5}],serverNow:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString()}});
   });
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   const clock=page.locator('[data-tock-clock]');await clock.scrollIntoViewIfNeeded();await clock.focus();
   for(let i=0;i<48;i++)await page.keyboard.press('ArrowRight');
   const card=page.locator('[data-tock-reward]'),dialog=page.locator('.lune-modal--tock-reward:not([hidden])');
   await card.locator('[data-tock-code]').waitFor({state:'visible'});
   const close=dialog.locator('.lune-modal__close');
   assert.equal(await close.evaluate(el=>el===document.activeElement),true,'reveal focuses close button');
   if(output){fs.mkdirSync(output,{recursive:true});await dialog.screenshot({path:path.join(output,'tock-open-'+mode+'.png')});}
   if(mode==='touch')await close.tap();else if(mode==='keyboard')await page.keyboard.press('Enter');else await close.click();
   await dialog.waitFor({state:'hidden',timeout:3000});
   assert.equal(await clock.evaluate(el=>el===document.activeElement),true,'close restores clock focus');
   assert.equal(await card.evaluate(el=>!!el.closest('[data-tock]')),true,'live reward card returns to original location');
   // The public store badge reuses this shell and can be reopened by an actual visitor.
   const badge=page.locator('.store-badge-btn').first();await badge.scrollIntoViewIfNeeded();
   if(mode==='touch')await badge.tap();else await badge.click();
   const again=page.locator('.lune-modal--coming-soon:not([hidden])');await again.waitFor({state:'visible'});
   await page.keyboard.press('Escape');await again.waitFor({state:'hidden'});
   assert.equal(await badge.evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('Enter');await again.waitFor({state:'visible'});
   if(mode==='touch')await again.locator('.lune-modal__close').tap();else await again.locator('.lune-modal__close').click();
   await again.waitFor({state:'hidden'});
   assert.equal(await badge.evaluate(el=>el===document.activeElement),true);
   assert.deepEqual(errors,[]);console.log(mode+': real Tock X, restore, public store reopen, Escape and second X PASS');await page.close();
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
