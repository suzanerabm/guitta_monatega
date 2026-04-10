// src/__tests__/e2e/filters.spec.ts
import { test, expect } from '@playwright/test';

test.describe('FilterBar', () => {
  test('bichittos page shows filter buttons', async ({ page }) => {
    await page.goto('/pt/bichittos');
    // The "Todos" (All) button should be present
    await expect(page.getByRole('button', { name: /todos|all/i })).toBeVisible({ timeout: 10000 });
  });

  test('art page shows filter buttons', async ({ page }) => {
    await page.goto('/pt/art');
    await expect(page.getByRole('button', { name: /todos|all/i })).toBeVisible({ timeout: 10000 });
  });
});
