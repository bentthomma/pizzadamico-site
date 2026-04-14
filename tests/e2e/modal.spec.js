import { test, expect } from '@playwright/test';

test.describe('catering modal', () => {
  test('opens via deep-link', async ({ page }) => {
    await page.goto('/?catering=1');
    await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'false');
  });

  test('closes on ESC', async ({ page }) => {
    await page.goto('/?catering=1');
    await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'false');
    await page.keyboard.press('Escape');
    await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'true');
  });

  test('closes on backdrop click', async ({ page }) => {
    await page.goto('/?catering=1');
    await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'false');
    await page.locator('.modal-backdrop').click();
    await expect(page.locator('#catering-modal')).toHaveAttribute('aria-hidden', 'true');
  });
});
