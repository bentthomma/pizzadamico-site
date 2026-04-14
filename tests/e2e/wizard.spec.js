import { test, expect } from '@playwright/test';

test('wizard walkthrough reaches summary step', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto('/?catering=1');
  await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'false');

  // Step 1 · Event-Art
  await page.click('button:has-text("Privatfest")');
  await page.click('#wizard-next');

  // Step 2 · Datum + Zeit + Dauer
  const tomorrow = new Date(Date.now() + 86400_000).toISOString().split('T')[0];
  await page.fill('input[name="date"]', tomorrow);
  await page.fill('input[name="time"]', '18:00');
  await page.click('button:has-text("3 Stunden")');
  await page.click('#wizard-next');

  // Step 3 · Ort (API key is REPLACE_ME — autocomplete won't work, plain text is fine)
  await page.fill('#address-input', 'Bundesplatz 1, Bern');
  await page.click('#wizard-next');

  // Step 4 · Gäste — bump adults to 35 so unter-30 warn disappears
  const plus = page.locator('button:has-text("+")').first();
  for (let i = 0; i < 35; i++) await plus.click();
  await page.click('#wizard-next');

  // Step 5 · Zutaten — pick 3
  await page.click('button:has-text("Salami")');
  await page.click('button:has-text("Peperoni")');
  await page.click('button:has-text("Knoblauch")');
  await page.click('#wizard-next');

  // Step 6 · Setup — alle Ja
  for (let i = 0; i < 3; i++) await page.locator('button:has-text("Ja")').nth(i).click();
  await page.click('#wizard-next');

  // Step 7 · Kontakt
  await page.fill('#name',  'Ben Test');
  await page.fill('#email', 'ben@test.ch');
  await page.fill('#phone', '0791234567');
  await page.click('#wizard-next');

  // Step 8 · Übersicht
  await expect(page.locator('dt:has-text("Anlass") + dd')).toHaveText('Privatfest');
  await expect(page.locator('dt:has-text("Gäste") + dd')).toContainText('35 Erw');
});
