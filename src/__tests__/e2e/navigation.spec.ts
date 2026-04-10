// src/__tests__/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/pt');
    await expect(page).toHaveTitle(/Guitta Monatega/i);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates to about page', async ({ page }) => {
    await page.goto('/pt/about');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to bichittos page', async ({ page }) => {
    await page.goto('/pt/bichittos');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to kammara page', async ({ page }) => {
    await page.goto('/pt/kammara');
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to art page', async ({ page }) => {
    await page.goto('/pt/art');
    await expect(page.locator('main')).toBeVisible();
  });

  test('root redirects to default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/pt/);
  });
});
