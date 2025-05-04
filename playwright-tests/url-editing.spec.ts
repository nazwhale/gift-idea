import { test, expect } from '@playwright/test';

test('User can add and edit URL for gift ideas', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Find and click on a person to view their ideas
    await page.waitForSelector('[data-testid^="person-card-"]');
    await page.click('[data-testid^="person-card-"]:first-child');

    // Wait for the ideas dialog to appear
    await page.waitForSelector('[data-testid="ideas-dialog-content"]', { timeout: 5000 });

    // Make sure we're on the ideas tab
    await page.click('[data-testid="ideas-tab"]');

    // Find an idea and open the action menu
    await page.waitForSelector('[data-testid^="action-menu-"]');
    await page.click('[data-testid^="action-menu-"]:first-child');

    // Click on Add URL option
    await page.waitForSelector('[data-testid^="edit-url-"]');
    await page.click('[data-testid^="edit-url-"]:first-child');

    // Check if URL dialog appears
    await page.waitForSelector('[data-testid="url-dialog"]');

    // Enter a URL
    const testUrl = 'https://example.com/gift';
    await page.fill('[data-testid="url-input-field"]', testUrl);

    // Save the URL
    await page.click('[data-testid="url-save-btn"]');

    // Wait for dialog to close
    await page.waitForSelector('[data-testid="url-dialog"]', { state: 'detached' });

    // Verify the URL appears in the idea list (the link icon)
    await page.waitForSelector('[data-testid^="idea-url-"]');

    // Open the action menu again to edit the URL
    await page.click('[data-testid^="action-menu-"]:first-child');

    // Click on Edit URL option
    await page.waitForSelector('[data-testid^="edit-url-"]');
    await page.click('[data-testid^="edit-url-"]:first-child');

    // Check if URL dialog appears with the previously entered URL
    await page.waitForSelector('[data-testid="url-dialog"]');
    const inputValue = await page.inputValue('[data-testid="url-input-field"]');
    expect(inputValue).toBe(testUrl);

    // Edit the URL
    const newUrl = 'https://example.com/better-gift';
    await page.fill('[data-testid="url-input-field"]', newUrl);

    // Save the updated URL
    await page.click('[data-testid="url-save-btn"]');

    // Wait for dialog to close
    await page.waitForSelector('[data-testid="url-dialog"]', { state: 'detached' });

    // Verify the updated URL link is present
    await page.waitForSelector('[data-testid^="idea-url-"]');
}); 