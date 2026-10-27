const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.LANG_QA_BASE_URL||'http://127.0.0.1:8396';
const output=process.env.LANG_QA_OUTPUT;
const routes=['/','/study/spanish/','/study/calculus/','/test-prep/sat/','/for-students/test-anxiety/'];
(async()=>{
 const browser=await chromium.launch({headless:true});const proof=[];
 try {
  for(const width of[390,1440])for(const route of routes){
   const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390,reducedMotion:'reduce'});
   await page.route(/^https?:/,r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
   await page.goto(base+route,{waitUntil:'domcontentloaded'});
   const toggle=page.locator('[data-nav-toggle]'),link=page.locator('#primary-nav a[href="/#language-accessibility"]');
   assert.equal(await link.count(),1);
   if(width===390)await toggle.tap();else await toggle.click();
   await link.waitFor({state:'visible'});
   await link.scrollIntoViewIfNeeded();await page.keyboard.press('Tab');await link.focus();
   const focus=await link.evaluate(el=>({focused:el===document.activeElement,outline:getComputedStyle(el).outlineStyle,
    active:document.activeElement.outerHTML.slice(0,200),navClass:document.querySelector('.site-header').className,
    visibility:getComputedStyle(el).visibility}));
   assert.equal(focus.focused,true,JSON.stringify({width,route,focus}));assert.notEqual(focus.outline,'none');
   await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   if(width===390)await toggle.tap();else await toggle.click();
   await link.waitFor({state:'visible'});
   if(width===390)await link.tap();else{await link.focus();await page.keyboard.press('Enter');}
   await page.waitForURL('**/#language-accessibility');
   await page.waitForFunction(()=>{
    const target=document.getElementById('language-accessibility'),box=target&&target.getBoundingClientRect();
    return box&&box.top>=-2&&box.top<innerHeight&&!document.querySelector('.site-header').classList.contains('nav-open')&&document.body.style.overflow!=='hidden';
   });
   if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'nav-'+width+'-'+(route.split('/').filter(Boolean).join('-')||'home')+'.png')});}
   proof.push({width,route,destination:new URL(page.url()).pathname+new URL(page.url()).hash,focus,menuClosed:true,bodyUnlocked:true});
   await page.close();
  }
  if(output)fs.writeFileSync(path.join(output,'navigation-proof.json'),JSON.stringify(proof,null,2));
  console.log('10 actual-Host route/viewport menu keyboard/touch/Escape/focus/destination checks PASS');
 } finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
