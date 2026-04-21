/**
 * Record 15s Instagram-Reel vom Akt-1 Hero auf pizzadamico.ch/video
 * Output: 1080×1920 MP4 (9:16), H.264, stumm.
 * Run: pnpm exec node scripts/record-akt1.mjs
 */
import { chromium, devices } from '@playwright/test';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const PAGE_URL = 'https://pizzadamico.ch/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'exports');
const TMP_DIR = path.join(OUT_DIR, '.tmp');
const FINAL = path.join(OUT_DIR, 'akt1-hero-15s.mp4');

const DURATION_MS = 15_000;
const IDLE_START_MS = 2_000;
const PAN_MS = 10_000;
const HOLD_END_MS = 3_000;

await mkdir(TMP_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  viewport: { width: 405, height: 720 }, // exakt 9:16
  deviceScaleFactor: 3,
  recordVideo: { dir: TMP_DIR, size: { width: 1080, height: 1920 } },
});

const page = await context.newPage();
console.log('navigating…');
await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60_000 });

console.log('waiting for hero video ready…');
await page.waitForSelector('video', { state: 'attached', timeout: 20_000 });
await page.waitForFunction(() => {
  const v = document.querySelector('video');
  return v && v.readyState >= 3;
}, null, { timeout: 20_000 });

console.log('disabling scroll-snap + prepping…');
await page.addStyleTag({ content: `
  html { scroll-snap-type: none !important; scroll-behavior: auto !important; }
  .akt, .site-footer { scroll-snap-align: none !important; }
  /* Header-overlay beim Recording nicht pingpongen lassen */
  .site-header { transition: none !important; }
`});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

console.log('idle 2s…');
await page.waitForTimeout(IDLE_START_MS);

console.log('slow-pan 10s…');
await page.evaluate((duration) => {
  return new Promise((resolve) => {
    const akt2 = document.querySelector('#akt-2') || document.querySelector('.akt-2');
    const targetY = akt2
      ? akt2.getBoundingClientRect().top + window.scrollY - 60
      : window.innerHeight * 0.9;
    const startY = window.scrollY;
    const start = performance.now();
    // easeInOutCubic
    const ease = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2);
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const y = startY + (targetY - startY) * ease(t);
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        window.scrollTo(0, y);
      }
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}, PAN_MS);

console.log('hold 3s…');
await page.waitForTimeout(HOLD_END_MS);

console.log('closing context (flushes video)…');
await context.close();
await browser.close();

// Find the produced webm
const files = await readdir(TMP_DIR);
const webm = files.find(f => f.endsWith('.webm'));
if (!webm) throw new Error('No webm produced');
const webmPath = path.join(TMP_DIR, webm);
console.log('webm:', webmPath);

// Convert to MP4 H.264, trim to exact 15s, 30fps, silent
console.log('transcoding → MP4 1080×1920 H.264 30fps…');
const ff = spawnSync('ffmpeg', [
  '-y',
  '-i', webmPath,
  '-t', '15',
  '-vf', 'scale=1080:1920:flags=lanczos,fps=30',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-an',
  FINAL
], { stdio: 'inherit' });

if (ff.status !== 0) {
  console.error('ffmpeg failed');
  process.exit(1);
}

// Clean tmp
await rm(TMP_DIR, { recursive: true, force: true });
console.log('\n✓ fertig:', FINAL);
