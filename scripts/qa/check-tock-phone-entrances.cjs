/* Actual-server Tock entrance/hidden-screen/manual/fallback verification. Media blocked. */
const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
const base=process.env.LANG_QA_BASE_URL,out=process.env.LANG_QA_OUTPUT;
assert(base&&out,'LANG_QA_BASE_URL and LANG_QA_OUTPUT are required');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});const proof={status:'RUNNING',normal:null,fallbacks:[]};try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.route(/^https?:/,r=>r.request().url().startsWith(base+'/')&&r.request().resourceType()!=='media'?r.continue():r.abort());
 await context.addInitScript(()=>{window.__tockStarts=[];document.addEventListener('transitionstart',e=>{if(e.propertyName==='rotate'&&e.target.closest('[data-tock-shot]'))window.__tockStarts.push({index:e.target.closest('[data-tock-shot]').dataset.tockShot,at:performance.now()});},true);});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/',{waitUntil:'load'});
 const sel='.tock-shot .phone-mock__frame';await page.waitForFunction(()=>document.querySelectorAll('.tock-shot .device-tilt').length===4);
 const snapshot=()=>page.locator(sel).evaluateAll(els=>els.map(el=>({index:el.closest('[data-tock-shot]').dataset.tockShot,rotate:getComputedStyle(el).rotate,entered:el.closest('[data-tock-shot]').hasAttribute('data-tock-entered'),transform:getComputedStyle(el).transform})));
 const before=await snapshot();assert.equal(new Set(before.map(x=>x.rotate)).size,4);assert(before.every(x=>!x.entered&&x.rotate!=='0deg'));
 await page.locator('[data-tock-stage]').hover({force:true,trial:true}).catch(()=>{});
 await page.locator('[data-tock-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelectorAll('.tock-shot[data-tock-entered]').length===3);
 assert.equal(await page.locator('[data-tock-shot="2"]').getAttribute('data-tock-entered'),null);
 // A real tab tap reveals the previously hidden fourth phone; do not seek clocks.
 await page.locator('[data-tock-shot-tab="2"]').click();
 await page.waitForFunction(()=>new Set(window.__tockStarts.map(x=>x.index)).size===4);
 const during=await snapshot();await page.screenshot({path:out+'/entrance.png'});
 await page.waitForFunction(()=>[...document.querySelectorAll('.tock-shot .device-tilt')].every(el=>el.getAnimations().every(a=>a.transitionProperty!=='rotate')));
 const rest=await snapshot();assert(rest.every(x=>x.entered&&x.rotate==='0deg'));assert.deepEqual(rest.map(x=>x.transform),before.map(x=>x.transform));
 const starts=await page.evaluate(()=>window.__tockStarts);assert.equal(starts.length,4);
 await page.locator('[data-tock-shot-tab="0"]').click();await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>window.__tockStarts.length),4);
 const frame=page.locator('[data-tock-shot="0"] .phone-mock__frame');await frame.focus();await page.keyboard.press('Alt+ArrowRight');assert.match(await frame.evaluate(el=>el.style.transform),/rotateY\(5deg\)/);await page.keyboard.press('Escape');
 await page.screenshot({path:out+'/rest.png'});assert.deepEqual(errors,[]);proof.normal={before,during,rest,starts,oneShot:true,manualRotation:true,errors};await context.close();
 for(const mode of ['reduced','mobile']){
  const c=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1440,height:1000},reducedMotion:mode==='reduced'?'reduce':'no-preference',hasTouch:mode==='mobile',isMobile:mode==='mobile'});
  await c.route(/^https?:/,r=>r.request().url().startsWith(base+'/')&&r.request().resourceType()!=='media'?r.continue():r.abort());const p=await c.newPage();await p.goto(base+'/',{waitUntil:'load'});await p.locator('[data-tock-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await p.locator('[data-tock-shot-tab="2"]').click();assert.equal(await p.locator('.tock-shot .device-tilt').count(),0);assert.equal(await p.locator('[data-tock-shot="2"]').getAttribute('data-pos'),'center');proof.fallbacks.push({mode,staticChassis:true,tabsWork:true});await c.close();
 }
 proof.status='PASS';console.log(JSON.stringify({status:proof.status,distinctAngles:4,naturalTransitions:proof.normal.starts.length,fallbacks:proof.fallbacks}));
} catch(e){proof.status='FAIL';proof.error=e.stack;throw e;}finally{fs.writeFileSync(out+'/proof.json',JSON.stringify(proof,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
