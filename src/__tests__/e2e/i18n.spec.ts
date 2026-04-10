// src/__tests__/e2e/i18n.spec.ts
import { test, expect } from '@playwright/test';

test.describe('i18n', () => {
  test('pt locale loads', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.locator('main')).toBeVisible();
  });

  test('en locale loads', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('main')).toBeVisible();
  });

  test('language toggle navigates between locales', async ({ page }) => {
    await page.goto('/pt');
    // The button shows "EN" when current is pt
    await page.click('text=EN');
    await expect(page).toHaveURL(/\/en/);
  });

  test('all 5 pages exist in en locale', async ({ page }) => {
    const pages = ['/en', '/en/about', '/en/bichittos', '/en/kammara', '/en/art'];
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });
});
