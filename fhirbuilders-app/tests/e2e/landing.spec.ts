import { test, expect } from '@playwright/test';

test.describe('FHIRBuilders Landing Page', () => {
  test('loads the landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Page should have visible content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('has a main heading or hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should have at least one heading
    const headings = await page.locator('h1, h2').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should have interactive elements (links/buttons)
    const links = await page.locator('a').count();
    expect(links).toBeGreaterThan(0);
  });

  test('has call-to-action buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });
});
