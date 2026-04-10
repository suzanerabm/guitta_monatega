// src/__tests__/e2e/responsive.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Responsive', () => {
  test('mobile viewport renders home page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pt');
    await expect(page.locator('main')).toBeVisible();
  });

  test('tablet viewport renders bichittos page', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/pt/bichittos');
    await expect(page.locator('main')).toBeVisible();
  });

  test('desktop viewport renders kammara page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pt/kammara');
    await expect(page.locator('main')).toBeVisible();
  });
});
