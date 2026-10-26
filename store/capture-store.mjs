import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const candidates = [
  process.env.PLAYWRIGHT_CORE,
  "/home/runner/.local/share/omgithub-playwright/node_modules/playwright-core",
  "playwright-core",
  "playwright",
].filter(Boolean);
let chromium = null;
for (const candidate of candidates) {
  try { ({ chromium } = require(candidate)); break; } catch { /* next */ }
}
if (!chromium) {
  console.error("playwright-core not found. Set PLAYWRIGHT_CORE to its install path.");
  process.exit(1);
}

const BASE = process.env.BASE_URL || "http://localhost:3002";
const out = new URL("./screenshots/", import.meta.url);
await mkdir(out, { recursive: true });

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const today = dayKey(0);
const now = Date.now();
const modes = ["grid", "flick", "grid", "precision", "grid", "flick", "grid", "precision", "grid", "flick"];
const scores = [1610, 1420, 1740, 980, 1850, 1560, 1920, 1120, 2010, 1680, 2240, 1790];
const demo = {
  version: 1,
  xp: 1860,
  streak: { count: 12, last: today },
  aim: {
    best: { flick: 1840, grid: 2450, precision: 1260 },
    history: scores.map((score, i) => ({
      ts: now - (scores.length - 1 - i) * 86400000 - 3600000,
      mode: modes[i % modes.length],
      score,
      accuracy: 68 + (i % 5) * 4.2,
      reactions: 420 - i * 9,
      shots: 96 + i * 4,
      hits: 70 + i * 3,
      streak: 8 + i,
    })),
    runs: 64, shots: 9120, hits: 7320, bestCombo: 32,
  },
  sens: { game: "valorant", dpi: 1600, sens: 0.24, pad: 490 },
  build: {
    current: { weapon: "ar", attachments: { muzzle: "comp", barrel: "long", optic: "reflex", under: "vert", mag: "ext", stock: "tac" } },
    saved: [
      { id: "lo_demo1", name: "Ranked AR", weapon: "ar", attachments: { muzzle: "comp", barrel: "long", optic: "reflex", under: "vert", mag: "ext", stock: "tac" }, summary: "Compensator, Long Barrel", ts: now - 86400000 },
      { id: "lo_demo2", name: "Entry SMG", weapon: "smg", attachments: { muzzle: "supp", barrel: "short", optic: "reflex", under: "laser", mag: "fast", stock: "light" }, summary: "Suppressor, Short Barrel", ts: now - 172800000 },
    ],
  },
  codex: { cleared: ["margit", "godrick", "enderdragon", "eyeofcthulhu", "meg", "hornet"] },
  settings: { sound: true, motion: true },
  daily: { date: today, claimed: [] },
  events: [
    ...scores.slice(-3).map((score, i) => ({ type: "run", day: today, ts: now - i * 60000, mode: "grid", score, accuracy: 82 - i * 3, shots: 120 })),
    { type: "save", day: today, ts: now, weapon: "ar" },
    { type: "sens", day: today, ts: now, cm: 34 },
    { type: "sens", day: dayKey(1), ts: now - 86400000, cm: 30 },
    { type: "sens", day: dayKey(2), ts: now - 172800000, cm: 35 },
    { type: "clear", day: today, ts: now, boss: "hornet" },
  ],
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 432, height: 768 },
  deviceScaleFactor: 2.5,
  isMobile: true,
  hasTouch: true,
  colorScheme: "dark",
  serviceWorkers: "block",
});
const page = await context.newPage();

async function shot(name) {
  await page.screenshot({ path: new URL(name, out).pathname, animations: "disabled" });
  console.log("captured", name);
}

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
await page.evaluate((state) => localStorage.setItem("nexus.progress.v1", JSON.stringify(state)), demo);
await page.goto(`${BASE}/#/home`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(650);
await shot("01-home.png");

await page.goto(`${BASE}/#/aim`, { waitUntil: "networkidle" });
await page.waitForTimeout(450);
await page.locator('[data-mode-tab="grid"]').click();
await page.waitForTimeout(260);
await page.locator("[data-start]").click();
await page.waitForTimeout(520);

const canvasBox = await page.locator("#aimCanvas").boundingBox();
let aimHits = 0;
for (let attempt = 0; attempt < 16 && aimHits < 9; attempt++) {
  const targets = await page.evaluate(() => {
    const canvas = document.querySelector("#aimCanvas");
    const ctx = canvas.getContext("2d");
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const points = [];
    for (let y = 0; y < height; y += 3) {
      const row = y * width;
      for (let x = 0; x < width; x += 3) {
        const i = (row + x) * 4;
        if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 240) points.push({ x, y });
      }
    }
    const clusters = [];
    for (const p of points) {
      let best = null;
      let bestDist = 26;
      for (const c of clusters) {
        const d = Math.hypot(c.cx / c.n - p.x, c.cy / c.n - p.y);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      if (best) { best.cx += p.x; best.cy += p.y; best.n += 1; }
      else clusters.push({ cx: p.x, cy: p.y, n: 1 });
    }
    return clusters
      .filter((c) => c.n >= 3)
      .map((c) => ({ x: c.cx / c.n / scale, y: c.cy / c.n / scale }));
  });
  if (!targets.length) {
    await page.waitForTimeout(100);
    continue;
  }
  await page.mouse.click(canvasBox.x + targets[0].x, canvasBox.y + targets[0].y);
  aimHits += 1;
  await page.waitForTimeout(105);
}
console.log("aim targets hit", aimHits);
await page.waitForTimeout(220);
await shot("02-aim.png");
await page.waitForTimeout(200);

await page.goto(`${BASE}/#/sens`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const card = document.querySelector(".sens-hero").closest(".card");
  window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 65, behavior: "instant" });
});
await page.waitForTimeout(400);
await shot("03-sens.png");

await page.goto(`${BASE}/#/codex`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await shot("04-codex.png");

await page.goto(`${BASE}/#/build`, { waitUntil: "networkidle" });
await page.waitForTimeout(450);
await page.evaluate(() => {
  const card = document.querySelector("#statsWrap").closest(".card");
  window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 65, behavior: "instant" });
});
await page.waitForTimeout(350);
await shot("05-build.png");

await page.locator(".avatar").click();
await page.waitForTimeout(600);
await shot("06-profile.png");
await page.keyboard.press("Escape");
await page.waitForTimeout(250);

await page.goto(`${BASE}/#/codex`, { waitUntil: "networkidle" });
await page.waitForTimeout(350);
await page.evaluate(() => document.querySelector('[data-boss="radahn"]')?.click());
await page.waitForTimeout(500);
await page.evaluate(() => document.activeElement?.blur());
await page.waitForTimeout(150);
await shot("07-boss-plan.png");
await page.keyboard.press("Escape");

const featureContext = await browser.newContext({
  viewport: { width: 1024, height: 500 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  serviceWorkers: "block",
});
const feature = await featureContext.newPage();
await feature.goto(`${BASE}/store/feature.html`, { waitUntil: "networkidle" });
await feature.evaluate(() => document.fonts.ready);
await feature.waitForTimeout(400);
await feature.screenshot({ path: new URL("../feature-graphic.png", out).pathname, animations: "disabled" });
console.log("captured feature-graphic.png");
await featureContext.close();

await browser.close();
console.log("done");
