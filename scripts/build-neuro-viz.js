#!/usr/bin/env node
//
// Bundles the "Build the circuit" neuron visualisation into a single
// tree-shaken ESM file that the landing page lazy-loads.
//
// Why bundle at all: the full vendored three.js build is 1.26 MB raw /
// 255 KB gzipped, and the scene uses a small fraction of it. Tree-shaking
// takes it to roughly 500 KB raw / 128 KB gzipped, which is what keeps the
// section inside its transfer budget. The output is committed so deploys
// need no build step.
//
// Usage: npm run build:neuro-viz
//
// Requires network access the first time (esbuild is fetched via npx and is
// deliberately not a repo dependency — this project has no node_modules).

const { execFileSync } = require("node:child_process");
const { statSync, readFileSync } = require("node:fs");
const { gzipSync, brotliCompressSync } = require("node:zlib");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const ENTRY = path.join(ROOT, "lune-synth/neuro-viz/index.js");
const OUT = path.join(ROOT, "lune-synth/neuro-viz/neuro-viz.bundle.js");
const ESBUILD = "esbuild@0.23.1";

// Budget from docs/lune-synth-neuroplasticity-animation-plan.md §5.
const GZIP_BUDGET = 180 * 1024;

console.log("building", path.relative(ROOT, OUT));
execFileSync(
  "npx",
  [
    "--yes",
    ESBUILD,
    ENTRY,
    "--bundle",
    "--format=esm",
    "--minify",
    "--legal-comments=none",
    `--outfile=${OUT}`,
  ],
  { stdio: "inherit", cwd: ROOT },
);

const raw = readFileSync(OUT);
const gz = gzipSync(raw).length;
const br = brotliCompressSync(raw).length;
const kb = (n) => (n / 1024).toFixed(1) + " KB";

console.log(`  raw    ${kb(statSync(OUT).size)}`);
console.log(`  gzip   ${kb(gz)}`);
console.log(`  brotli ${kb(br)}`);

if (gz > GZIP_BUDGET) {
  console.error(
    `\nFAIL: gzip ${kb(gz)} exceeds the ${kb(GZIP_BUDGET)} budget in the plan.`,
  );
  process.exit(1);
}
console.log(`  within the ${kb(GZIP_BUDGET)} gzip budget`);
