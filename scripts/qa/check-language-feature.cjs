/* Existing Playwright only. Serve actual server.js through Host:lunesynth.com.
   Only local assets are requested; no account/model/reward operations occur. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.LANG_QA_BASE_URL||'http://127.0.0.1:8396';
const out=process.env.LANG_QA_OUTPUT;
const locales=['en','es','fr','de','pt-BR','zh-Hans','ja','ko','hi'];
(async()=>{
 const browser=await chromium.launch({headless:true});const proof={viewports:[],galleryStates:0};
 try {
  for(const width of[320,390,768,1440]){
   const page=await browser.newPage({viewport:{width,height:2000},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route(/^https?:/,route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
   await page.goto(base+'/',{waitUntil:'domcontentloaded'});
   const card=page.locator('[data-lang-background]'),medals=page.locator('#medalViewerCard');
   await medals.scrollIntoViewIfNeeded();const medalBox=await medals.boundingBox();
   await card.scrollIntoViewIfNeeded();const cardBox=await card.boundingBox();
   assert.ok(Math.abs(medalBox.width-cardBox.width)<1);assert.ok(Math.abs(medalBox.x-cardBox.x)<1);
   assert.equal(await card.locator('video').count(),2);
   assert.equal(await card.locator('video[src]').count(),0,'initial reduced motion unloads both');
   const preview=await page.locator('.lang-a11y__preview').boundingBox(),copy=await page.locator('.lang-a11y__copy').boundingBox();
   if(width>720)assert.ok(preview.x+preview.width<=copy.x+1,'phone beside copy');
   else assert.ok(preview.y+preview.height<=copy.y+1,'phone and copy stack');
   if(out){fs.mkdirSync(out,{recursive:true});await card.screenshot({path:path.join(out,'card-dark-'+width+'.png')});}
   for(const locale of locales)for(const screen of['home','shop']){
    await page.locator('[data-lang-shot-select]').selectOption(locale);
    await page.locator('[data-lang-shot-screen="'+screen+'"]').click();
    await page.waitForFunction(({locale,screen})=>{
     const host=document.querySelector('[data-lang-shot]');const images=host.querySelectorAll('img[aria-hidden="false"]');
     return host.getAttribute('aria-busy')==='false'&&images.length===1&&images[0].complete&&images[0].naturalWidth>0&&
      images[0].classList.contains('is-active')&&getComputedStyle(images[0]).opacity==='1'&&
      new URL(images[0].currentSrc).pathname.endsWith('/'+screen+'-'+locale+'.webp');
    },{locale,screen});
    proof.galleryStates++;
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
   await card.scrollIntoViewIfNeeded();if(out)await card.screenshot({path:path.join(out,'card-light-'+width+'.png')});
   assert.deepEqual(errors,[]);proof.viewports.push({width,card:cardBox,medals:medalBox,preview,copy,pageErrors:errors});
   await page.close();console.log(width+': unified bounds, phone/copy, reduced poster,18 selected-only gallery states PASS');
  }
  const page=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:'no-preference'});
  await page.route(/^https?:/,route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.locator('[data-lang-background]').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-lang-background]').dataset.langVideoState==='playing');
  // Observe two real loops; do not seek or fabricate media events to make them pass.
  const loops=await page.evaluate(async()=>{
   const root=document.querySelector('[data-lang-background]'),videos=[...root.querySelectorAll('video')],samples=[];
   const start=performance.now();let crossfades=0,wasFading=false;
   while(performance.now()-start<22000){
    const sample={elapsed:performance.now()-start,state:root.dataset.langVideoState,cycles:Number(root.dataset.langVideoCycles||0),
     layers:videos.map(v=>({time:v.currentTime,opacity:Number(getComputedStyle(v).opacity),ready:v.readyState,paused:v.paused,width:v.videoWidth,frames:v.getVideoPlaybackQuality().totalVideoFrames}))};
    samples.push(sample);
    const fading=sample.layers.every(v=>v.opacity>0.02&&v.opacity<0.7);
    if(fading&&!wasFading)crossfades++;wasFading=fading;
    if(sample.cycles>=2)return{samples,crossfades};
    await new Promise(resolve=>setTimeout(resolve,80));
   }
   return{samples,crossfades};
  });
  assert.ok(loops.samples.at(-1).cycles>=2,'two real media cycles complete');
  assert.ok(loops.crossfades>=2,'both real fades overlap');
  for(const s of loops.samples){assert.ok(s.layers.reduce((sum,v)=>sum+v.opacity,0)>0.65,'no opacity gap');for(const v of s.layers)if(v.opacity>0.03)assert.ok(v.ready>=2&&v.width===1280,'visible frame is decoded');}
  assert.ok(loops.samples.at(-1).layers.reduce((sum,v)=>sum+v.frames,0)>100,'actual decoded frames advance');
  proof.loops=loops;if(out)await page.locator('[data-lang-background]').screenshot({path:path.join(out,'card-playing-1440.png')});
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-lang-background-video]')].every(v=>v.paused&&!v.hasAttribute('src')));
  await page.locator('[data-lang-background]').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('[data-lang-background]').dataset.langVideoState==='playing');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-lang-background-video]')].every(v=>v.paused&&!v.hasAttribute('src')));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-lang-background] video[src]').count(),0,'late play completions cannot reattach sources');
  proof.lifecycle={offscreenUnload:true,reducedMotionUnload:true,rapidMotionChange:true,maxLayers:2};
  await page.close();if(out)fs.writeFileSync(path.join(out,'proof.json'),JSON.stringify(proof,null,2));
  console.log('two real crossfade loops, decoded coverage, offscreen unload, reduced/rapid-motion lifecycle PASS');
 } finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
