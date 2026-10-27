const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { LEARN_YOUR_WAY_LINK, withLearnYourWayNavigation } = require('../scripts/lib/lune-navigation');

test('shared navigation inserts the home-target link before Luna without changing existing items', () => {
  const original = '<nav id="primary-nav">\n  <a href="/#voice-title">Input</a>\n  <a href="/#luna-title">Luna</a>\n</nav>';
  const changed = withLearnYourWayNavigation(original);
  assert.equal(changed, original.replace('  <a href="/#luna-title">', '  '+LEARN_YOUR_WAY_LINK+'\n  <a href="/#luna-title">'));
});
test('homepage relative anchors retain their existing destinations', () => {
  const original = '<nav id="primary-nav">\n <a href="#luna-title">Luna</a>\n</nav>';
  assert.ok(withLearnYourWayNavigation(original).includes(LEARN_YOUR_WAY_LINK+'\n <a href="#luna-title">'));
});
test('short menus receive the item and repeat application is idempotent', () => {
  const once = withLearnYourWayNavigation('<nav id="primary-nav"><a href="/about/">Story</a></nav>');
  assert.equal((once.match(/Learn Your Way/g)||[]).length,1);
  assert.equal(withLearnYourWayNavigation(once),once);
});
test('missing primary navigation fails instead of silently changing another menu', () => {
  assert.throws(()=>withLearnYourWayNavigation('<nav aria-label="Footer"></nav>'),/Missing primary-nav/);
});
test('every canonical landing route has exactly one shared target and canonical chassis stylesheet', () => {
  const root = path.resolve(__dirname,'..');
  const pages = JSON.parse(execFileSync('python3',['-c',
    "import importlib.util,json; s=importlib.util.spec_from_file_location('guard','scripts/check-landing-screenshots.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); print(json.dumps(m.find_landing_pages()))"
  ],{cwd:root,encoding:'utf8'}));
  assert.ok(pages.length>=165);
  for(const file of pages){
    const html=fs.readFileSync(file,'utf8');
    const nav=html.match(/<nav\b[^>]*\bid=["']primary-nav["'][^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.equal(nav.split(LEARN_YOUR_WAY_LINK).length-1,1,path.relative(root,file));
    assert.ok(html.includes('href="/campaign/phone-chassis.css?v=1"'),file);
  }
});
