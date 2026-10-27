#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { withLearnYourWayNavigation } = require('./lib/lune-navigation');
const root = path.resolve(__dirname, '..');
// Reuse the screenshot guard's authoritative landing-page inventory.
const pages = JSON.parse(execFileSync('python3', ['-c',
  "import importlib.util,json; s=importlib.util.spec_from_file_location('guard','scripts/check-landing-screenshots.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); print(json.dumps(m.find_landing_pages()))"
], { cwd: root, encoding: 'utf8' }));
let changed = 0;
for (const file of pages) {
  const before = fs.readFileSync(file, 'utf8');
  let after = withLearnYourWayNavigation(before);
  after = after.replace(/\/campaign\/site-header.css\?v=\d+/g, '/campaign/site-header.css?v=9');
  after = after.replace(/\/campaign\/section-icons.css\?v=\d+/g, '/campaign/section-icons.css?v=7');
  if (/href="\/campaign\/landing.css\?v=\d+"/.test(after)) {
    after = after.replace(/(<link rel="stylesheet" href=")\/campaign\/landing.css\?v=\d+("\s*\/>)/,
      '$1/campaign/landing.css?v=11$2');
    if (!after.includes('href="/campaign/phone-chassis.css?v=1"')) {
      after = after.replace(/(<link rel="stylesheet" href="\/campaign\/landing.css\?v=11"\s*\/>)/,
        '$1\n  <link rel="stylesheet" href="/campaign/phone-chassis.css?v=1" />');
    }
  }
  if (after !== before) { fs.writeFileSync(file, after); changed += 1; }
}
console.log(`Updated ${changed}/${pages.length} canonical landing-page navigation/hardware references.`);
