import { chromium } from "/Users/griffinrutherford/Documents/github-repos/coherascent-labs-app/node_modules/playwright/index.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = "/Users/griffinrutherford/Documents/lune-synth-landing-medals";
const tiers = [
  "paper",
  "plastic",
  "ceramic",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "sapphire",
  "emerald",
  "diamond",
];
const categories = [
  "polymath",
  "marksman",
  "streak",
  "veteran",
  "recovery",
  "assessments",
  "handwriting",
  "voice",
  "text",
  "multichoice",
];

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1400, height: 1000 },
});
await page.goto("http://127.0.0.1:8090", { waitUntil: "networkidle" });

const manifest = [];
for (const [tierIndex, tier] of tiers.entries()) {
  const tierDirectory = `${String(tierIndex + 1).padStart(2, "0")}-${tier}`;
  const absoluteTierDirectory = path.join(outputRoot, tierDirectory);
  await mkdir(absoluteTierDirectory, { recursive: true });

  for (const category of categories) {
    const selector = `#medal-${tier}-${category}`;
    const outputFile = path.join(absoluteTierDirectory, `${category}.png`);
    const medal = page.locator(selector);
    await medal.waitFor({ state: "visible" });
    await medal.screenshot({
      animations: "disabled",
      omitBackground: true,
      path: outputFile,
    });
    manifest.push({
      category,
      file: `${tierDirectory}/${category}.png`,
      height: 512,
      rank: tierIndex + 1,
      tier,
      width: 512,
    });
  }
}

await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify({ categories, count: manifest.length, medals: manifest, tiers }, null, 2)}\n`,
);
await browser.close();
console.log(`Exported ${manifest.length} medals to ${outputRoot}`);
