#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {withLandingDeviceWiring} = require('./lib/landing-device-wiring');
const root = path.resolve(__dirname, '..');
const inventory = JSON.parse(execFileSync('python3', ['scripts/inventory-landing-devices.py'], {cwd:root,encoding:'utf8'}));
const updates = inventory.pages.filter(page=>page.active).map(page=>{
  const file=path.join(root,page.path),before=fs.readFileSync(file,'utf8');
  return {file,before,after:withLandingDeviceWiring(before)};
});
let changed=0;
for(const update of updates)if(update.before!==update.after){fs.writeFileSync(update.file,update.after);changed++;}
console.log(`Updated ${changed}/${updates.length} active phone pages; retired redirects excluded.`);
