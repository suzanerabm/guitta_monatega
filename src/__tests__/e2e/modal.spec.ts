// src/__tests__/e2e/modal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Modal Gallery', () => {
  test('art page renders thumbs that open modal on click', async ({ page }) => {
    await page.goto('/pt/art');
    // Wait for art grid to render
    const firstThumb = page.locator('[data-section-art] img').first();
    await expect(firstThumb).toBeVisible({ timeout: 10000 });
    await firstThumb.click();
    // Modal should open with close button
    await expect(page.getByLabel('Close')).toBeVisible();
  });

  test('modal closes on Escape key', async ({ page }) => {
    await page.goto('/pt/art');
    const firstThumb = page.locator('[data-section-art] img').first();
    await expect(firstThumb).toBeVisible({ timeout: 10000 });
    await firstThumb.click();
    await expect(page.getByLabel('Close')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByLabel('Close')).not.toBeVisible();
  });
});
