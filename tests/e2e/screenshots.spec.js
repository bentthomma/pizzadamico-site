import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'tests/e2e/screenshots';

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

test.describe('visual screenshots', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('desktop — full page and each akt', async ({ page }) => {
    // Disable all animations + reduced-motion via CSS
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Full page screenshot (all 7 akte stitched)
    await page.screenshot({ path: path.join(OUT, '00-full-page.png'), fullPage: true });

    // Per-akt viewport screenshots
    const akte = [
      { sel: '.akt-1', name: '01-akt1-entry' },
      { sel: '.akt-2', name: '02-akt2-material' },
      { sel: '.akt-3', name: '03-akt3-biga' },
      { sel: '.akt-4', name: '04-akt4-doppelback' },
      { sel: '.akt-5', name: '05-akt5-pietro' },
      { sel: '.akt-6', name: '06-akt6-climax' },
      { sel: '.akt-7', name: '07-akt7-muensingen' },
    ];

    for (const a of akte) {
      const loc = page.locator(a.sel).first();
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      // Screenshot covering just the viewport at the akt position
      await page.screenshot({ path: path.join(OUT, `${a.name}.png`), fullPage: false });
    }
  });

  test('desktop — modal open, step 1 (event type)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, '10-modal-step1-eventtype.png'), fullPage: false });
  });

  test('desktop — modal step 2 (datum)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]');
    await page.click('button:has-text("Privatfest")');
    await page.click('#wizard-next');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '11-modal-step2-datum.png'), fullPage: false });
  });

  test('desktop — modal step 4 (gaeste with warning)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]');
    // fast-forward: step 1, 2, 3
    await page.click('button:has-text("Privatfest")');
    await page.click('#wizard-next');
    const tomorrow = new Date(Date.now() + 86400_000).toISOString().split('T')[0];
    await page.fill('input[name="date"]', tomorrow);
    await page.fill('input[name="time"]', '18:00');
    await page.click('button:has-text("3 Stunden")');
    await page.click('#wizard-next');
    await page.fill('#address-input', 'Bundesplatz 1, Bern');
    await page.click('#wizard-next');
    // step 4 — add 10 adults to see the unter-30 warning
    const plus = page.locator('button:has-text("+")').first();
    for (let i = 0; i < 10; i++) await plus.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '12-modal-step4-under30-warning.png'), fullPage: false });
  });

  test('desktop — modal step 5 (zutaten)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]');
    await page.click('button:has-text("Privatfest")');
    await page.click('#wizard-next');
    const tomorrow = new Date(Date.now() + 86400_000).toISOString().split('T')[0];
    await page.fill('input[name="date"]', tomorrow);
    await page.fill('input[name="time"]', '18:00');
    await page.click('button:has-text("3 Stunden")');
    await page.click('#wizard-next');
    await page.fill('#address-input', 'Bundesplatz 1, Bern');
    await page.click('#wizard-next');
    const plus = page.locator('button:has-text("+")').first();
    for (let i = 0; i < 35; i++) await plus.click();
    await page.click('#wizard-next');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '13-modal-step5-zutaten.png'), fullPage: false });
  });

  test('desktop — modal step 8 (uebersicht)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]');
    await page.click('button:has-text("Privatfest")');
    await page.click('#wizard-next');
    const tomorrow = new Date(Date.now() + 86400_000).toISOString().split('T')[0];
    await page.fill('input[name="date"]', tomorrow);
    await page.fill('input[name="time"]', '18:00');
    await page.click('button:has-text("3 Stunden")');
    await page.click('#wizard-next');
    await page.fill('#address-input', 'Bundesplatz 1, Bern');
    await page.click('#wizard-next');
    const plus = page.locator('button:has-text("+")').first();
    for (let i = 0; i < 35; i++) await plus.click();
    await page.click('#wizard-next');
    await page.click('button:has-text("Salami")');
    await page.click('button:has-text("Peperoni")');
    await page.click('button:has-text("Knoblauch")');
    await page.click('#wizard-next');
    for (let i = 0; i < 3; i++) await page.locator('button:has-text("Ja")').nth(i).click();
    await page.click('#wizard-next');
    await page.fill('#name',  'Ben Test');
    await page.fill('#email', 'ben@test.ch');
    await page.fill('#phone', '0791234567');
    await page.click('#wizard-next');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, '14-modal-step8-uebersicht.png'), fullPage: false });
  });
});

test.describe('mobile screenshots', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile — full page', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, '20-mobile-full.png'), fullPage: true });
  });

  test('mobile — modal step 1', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?catering=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('#catering-modal[aria-hidden="false"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, '21-mobile-modal.png'), fullPage: false });
  });
});
