import { test, expect } from '@playwright/test';

test('ideas form tabs should function correctly', async ({ page }) => {
    // Navigate to a giftee page (requires authentication)
    await page.goto('/giftees/1');

    // Verify default tab is "Ideas"
    await expect(page.locator('[data-testid="ideas-content"]')).toBeVisible();

    // Test Suggestions tab
    await page.locator('[data-testid="suggestions-tab"]').click();
    await expect(page.locator('[data-testid="ai-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="get-suggestions-button"]')).toBeVisible();

    // Test switching back to Ideas tab
    await page.locator('[data-testid="ideas-tab"]').click();
    await expect(page.locator('[data-testid="ideas-content"]')).toBeVisible();

    // Verify Add Idea form is present in the Ideas tab
    await expect(page.locator('[data-testid="add-idea-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-idea-button"]')).toBeVisible();
});

test('AI suggestions should be added to ideas list', async ({ page }) => {
    // Navigate to a giftee page 
    await page.goto('/giftees/1');

    // Go to Suggestions tab
    await page.locator('[data-testid="suggestions-tab"]').click();

    // Click get suggestions button
    await page.locator('[data-testid="get-suggestions-button"]').click();

    // Wait for suggestions to appear (this might take time as it calls an API)
    await page.waitForSelector('[data-testid="add-suggestion-0"]', { timeout: 30000 });

    // Add the first suggestion
    await page.locator('[data-testid="add-suggestion-0"]').click();

    // Should return to Ideas tab after adding
    await expect(page.locator('[data-testid="ideas-content"]')).toBeVisible();
});

test('tabs should prevent content overlap', async ({ page }) => {
    // Navigate to a giftee page
    await page.goto('/giftees/1');

    // Test that the Ideas tab has enough bottom margin
    const ideasContentEl = page.locator('[data-testid="ideas-content"]');
    const footerEl = page.locator('form', { has: page.locator('[data-testid="add-idea-input"]') });

    // Ensure the footer is visible
    await expect(footerEl).toBeVisible();

    // Ensure the ideas content has margin bottom
    const ideasContentBox = await ideasContentEl.boundingBox();
    const footerBox = await footerEl.boundingBox();

    // Verify the footer and content don't overlap
    if (ideasContentBox && footerBox) {
        expect(ideasContentBox.y + ideasContentBox.height + 16).toBeLessThanOrEqual(footerBox.y);
    } else {
        // If either box is null, fail the test
        expect(ideasContentBox).not.toBeNull();
        expect(footerBox).not.toBeNull();
    }
}); 