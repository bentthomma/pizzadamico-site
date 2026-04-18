// Record Akt 3 Zutaten MOBILE reveal animation to video.
// Usage: node scripts/record-akt3-mobile.js
import { chromium, devices } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_DIR = resolve('src/media');
// Max Quality: 1500×2663 (image ratio 9:16) · Mobile-Layout via JS injection forciert
const WIDTH = 1500;
const HEIGHT = 2663;
const URL = 'http://localhost:5173';
const ANIMATION_MS = 8000;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('Starte Browser (Mobile)…');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,  // viewport ist schon 2× (780×1688), keine zusätzliche Skalierung
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  recordVideo: {
    dir: OUTPUT_DIR,
    size: { width: WIDTH, height: HEIGHT },
  },
});
const page = await context.newPage();

console.log(`Navigiere zu ${URL}…`);
await page.goto(URL, { waitUntil: 'load' });
await page.waitForTimeout(1500);

console.log('Force Mobile-Layout + ZUTATEN Title hidden + scroll zu Akt 3…');
await page.evaluate(() => {
  // Mobile-Layout forcieren unabhängig von viewport-width
  const desktopSvg = document.getElementById('akt-3-map-desktop');
  const mobileSvg = document.getElementById('akt-3-map-mobile');
  if (desktopSvg) desktopSvg.style.display = 'none';
  if (mobileSvg) mobileSvg.style.display = 'block';

  // ZUTATEN Title für Recording ausblenden (wird als HTML Overlay nachträglich gezeigt)
  const title = document.querySelector('.akt-3-title-vert');
  if (title) title.style.display = 'none';

  document.documentElement.style.scrollSnapType = 'none';
  const akt3 = document.getElementById('akt-3');
  window.scrollTo({ top: akt3.offsetTop, behavior: 'instant' });
});
await page.waitForTimeout(500);

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
if (!latest) { console.error('Keine Aufnahme gefunden!'); process.exit(1); }

const rawWebm = resolve(OUTPUT_DIR, latest);
const webmFinal = resolve(OUTPUT_DIR, 'zutaten-mobile.webm');
const mp4Final = resolve(OUTPUT_DIR, 'zutaten-mobile.mp4');

const trimStart = 2.0;
const trimDuration = ANIMATION_MS / 1000;

console.log(`Trimme + konvertiere…`);

spawnSync('ffmpeg', [
  '-y',
  '-ss', String(trimStart),
  '-i', rawWebm,
  '-t', String(trimDuration),
  '-c', 'copy',
  webmFinal,
], { stdio: 'inherit' });

spawnSync('ffmpeg', [
  '-y',
  '-ss', String(trimStart),
  '-i', rawWebm,
  '-t', String(trimDuration),
  '-c:v', 'libx264',
  '-crf', '18',
  '-preset', 'veryslow',
  '-profile:v', 'high',
  '-level', '4.2',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  mp4Final,
], { stdio: 'inherit' });

try { unlinkSync(rawWebm); } catch {}

console.log(`✓ WebM: ${webmFinal}`);
console.log(`✓ MP4: ${mp4Final}`);
console.log('Fertig!');
