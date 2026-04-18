// Record Akt 3 Zutaten reveal animation to video (WebM + MP4).
// Usage: node scripts/record-akt3.js
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_DIR = resolve('src/media');
const WIDTH = 1920;
const HEIGHT = 1080;
const URL = 'http://localhost:5173';
const ANIMATION_MS = 8000;  // how long to record the reveal

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Starte Browser…');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: OUTPUT_DIR,
    size: { width: WIDTH, height: HEIGHT },
  },
});
const page = await context.newPage();

console.log(`Navigiere zu ${URL}…`);
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1500); // fonts + images

console.log('Springe zu Akt 3 (bypass scroll-snap)…');
await page.evaluate(() => {
  // Disable CSS scroll-snap so direct scroll works
  document.documentElement.style.scrollSnapType = 'none';
  const akt3 = document.getElementById('akt-3');
  window.scrollTo({ top: akt3.offsetTop, behavior: 'instant' });
});
await page.waitForTimeout(500); // layout settle

// Mark the "start" timestamp — we'll trim the video to begin here
const triggerStartMs = await page.evaluate(() => performance.now());

console.log('Triggere Reveal…');
await page.evaluate(() => {
  const akt3 = document.getElementById('akt-3');
  window.dispatchEvent(new CustomEvent('section-settled', {
    detail: { idx: 2, section: akt3 },
  }));
});

console.log(`Nehme ${ANIMATION_MS/1000}s auf…`);
await page.waitForTimeout(ANIMATION_MS);

console.log('Schliesse Kontext…');
await context.close();
await browser.close();

// Find the generated webm
const rawFiles = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm') && !f.startsWith('zutaten-'));
const latest = rawFiles.sort().pop();
if (!latest) {
  console.error('Keine Aufnahme gefunden!');
  process.exit(1);
}

const rawWebm = resolve(OUTPUT_DIR, latest);
const webmFinal = resolve(OUTPUT_DIR, 'zutaten-desktop.webm');
const mp4Final = resolve(OUTPUT_DIR, 'zutaten-desktop.mp4');

// Trim: start from the reveal trigger moment
// Navigate (0-1.5s) + jump (1.5-2s) + settle (2-2s) ≈ 2s before trigger
const trimStart = 2.0;
const trimDuration = ANIMATION_MS / 1000;

console.log(`Trimme + konvertiere (start: ${trimStart}s, length: ${trimDuration}s)…`);

// Trim WebM
const webmTrim = spawnSync('ffmpeg', [
  '-y',
  '-ss', String(trimStart),
  '-i', rawWebm,
  '-t', String(trimDuration),
  '-c', 'copy',
  webmFinal,
], { stdio: 'inherit' });

// Trim + transcode to MP4
const mp4Trim = spawnSync('ffmpeg', [
  '-y',
  '-ss', String(trimStart),
  '-i', rawWebm,
  '-t', String(trimDuration),
  '-c:v', 'libx264',
  '-crf', '23',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  mp4Final,
], { stdio: 'inherit' });

// Cleanup raw file
try { unlinkSync(rawWebm); } catch {}

if (webmTrim.status === 0) console.log(`✓ WebM: ${webmFinal}`);
if (mp4Trim.status === 0) console.log(`✓ MP4: ${mp4Final}`);

console.log('Fertig!');
