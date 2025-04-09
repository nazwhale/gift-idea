import { test, expect } from '@playwright/test';

test('homepage should display correct heading', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Locate the H1 element with specific text and verify it
  const heading = page.locator('h1.text-4xl.font-bold');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Never miss a gift again');
}); 