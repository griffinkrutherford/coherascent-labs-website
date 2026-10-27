const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {DEVICE_ASSETS,withLandingDeviceWiring}=require('../scripts/lib/landing-device-wiring');
const root=path.resolve(__dirname,'..');

function assertWired(html){for(const asset of DEVICE_ASSETS){assert.equal(html.split(asset.path+'?v='+asset.version).length-1,1,asset.path);if(asset.kind==='script')assert.match(html,new RegExp('<script[^>]*src="'+asset.path.replaceAll('.','\\.')+'\\?v='+asset.version+'"[^>]*defer'));}}
test('missing assets get canonical ordered, deferred wiring and unrelated content stays intact',()=>{
 const html=withLandingDeviceWiring('<html><head><title>Demo</title></head><body>Keep me</body></html>');assertWired(html);assert.ok(html.endsWith('<body>Keep me</body></html>'));assert.ok(html.indexOf('device-tilt.js')<html.indexOf('device-rotation.js'));
});
test('About gains tilt before existing manual rotation without duplicating it',()=>{
 const original='<head>\n  <link rel="stylesheet" href="/campaign/device-rotation.css?v=3" />\n  <script src="/campaign/device-rotation.js?v=4" defer></script>\n</head>';
 const html=withLandingDeviceWiring(original);assertWired(html);assert.ok(html.indexOf('device-tilt.js')<html.indexOf('device-rotation.css'));
});
test('old cache versions and early async execution normalize idempotently',()=>{
 const original='<head><script src="/campaign/device-tilt.js?v=1" async></script><link href="/campaign/site-header.css?v=10" rel="stylesheet" /></head>';
 const html=withLandingDeviceWiring(original);assertWired(html);assert.ok(!html.includes(' async'));assert.ok(html.includes('site-header.css?v=10'));assert.equal(withLandingDeviceWiring(html),html);
});
test('invalid head and duplicate controller scripts fail before an updater writes pages',()=>{
 assert.throws(()=>withLandingDeviceWiring('<body>Keep me</body>'),/Missing closing head/);
 assert.throws(()=>withLandingDeviceWiring('<head><script src="/campaign/device-tilt.js?v=8"></script><script src="/campaign/device-tilt.js?v=9"></script></head>'),/Duplicate/);
});
test('all discovered active device pages are wired; the retired Pro source is explicitly excluded',()=>{
 const inventory=JSON.parse(execFileSync('python3',['scripts/inventory-landing-devices.py'],{cwd:root,encoding:'utf8'}));
 assert.ok(inventory.htmlFiles>=187);assert.ok(inventory.activePhonePages>=165);
 for(const page of inventory.pages)if(page.active)assertWired(fs.readFileSync(path.join(root,page.path),'utf8'));
 assert.equal(inventory.pages.find(p=>p.path==='lune-synth/pro/index.html').active,false);
 assert.equal(inventory.pages.find(p=>p.path==='lune-synth/about/index.html').devices.length,2);
});
test('the real campaign generator produces guarded wiring without writing a checkout',()=>{
 const outputs=[];const generator=path.join(root,'scripts/generate-lune-campaign-pages.js');
 const fakeFs={...fs,mkdirSync(){},writeFileSync(file,html){outputs.push({file,html});}};
 const localRequire=name=>name==='fs'?fakeFs:name==='path'?path:require(path.resolve(path.dirname(generator),name));
 vm.runInNewContext(fs.readFileSync(generator,'utf8'),{require:localRequire,__dirname:path.dirname(generator),process:{argv:['node',generator,'math']},console:{log(){}}},{filename:generator});
 assert.equal(outputs.length,1);assertWired(outputs[0].html);assert.ok(outputs[0].html.includes('data-phone-mock'));
});
