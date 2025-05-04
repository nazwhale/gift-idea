import { test, expect } from '@playwright/test';

test('follow-up prompts should appear after getting suggestions', async ({ page }) => {
    // Navigate to a giftee page 
    await page.goto('/giftees/1');

    // Go to Suggestions tab
    await page.locator('[data-testid="suggestions-tab"]').click();

    // Click get suggestions button
    await page.locator('[data-testid="get-suggestions-button"]').click();

    // Wait for suggestions to appear (this might take time as it calls an API)
    await page.waitForSelector('[data-testid="add-suggestion-0"]', { timeout: 30000 });

    // Verify follow-up prompts are displayed
    await expect(page.locator('[data-testid="follow-up-questions"]')).toBeVisible();

    // Verify we have 3 follow-up prompt buttons
    await expect(page.locator('[data-testid^="follow-up-question-"]')).toHaveCount(3);

    // Note: The follow-up prompts should include both generic refinements (e.g., "Cheaper gifts") 
    // and bio-specific prompts based on interests mentioned in the giftee's bio
    // This is challenging to test programmatically without knowing the specific bio content
});

test('clicking a follow-up prompt should fetch new suggestions and show active filter', async ({ page }) => {
    // Navigate to a giftee page 
    await page.goto('/giftees/1');

    // Go to Suggestions tab
    await page.locator('[data-testid="suggestions-tab"]').click();

    // Click get suggestions button
    await page.locator('[data-testid="get-suggestions-button"]').click();

    // Wait for suggestions to appear
    await page.waitForSelector('[data-testid="add-suggestion-0"]', { timeout: 30000 });

    // Capture the text of the first suggestion for comparison
    const initialSuggestionText = await page.locator('[data-testid="suggestion-description-0"]').textContent();

    // Get the text of the first follow-up prompt
    const promptText = await page.locator('[data-testid="follow-up-question-0"]').textContent() || '';

    // Click the first follow-up prompt
    await page.locator('[data-testid="follow-up-question-0"]').click();

    // Wait for new suggestions to load
    await page.waitForSelector('[data-testid="add-suggestion-0"]', { timeout: 30000 });

    // Get the text of the first suggestion after clicking follow-up
    const newSuggestionText = await page.locator('[data-testid="suggestion-description-0"]').textContent();

    // The suggestions should be different after using a follow-up prompt
    expect(initialSuggestionText).not.toEqual(newSuggestionText);

    // Verify the button text changed
    await expect(page.locator('[data-testid="get-suggestions-button"]')).toHaveText("Get New Suggestions");

    // Verify the active filter is shown with the prompt text
    await expect(page.locator('.bg-blue-50')).toContainText(promptText);
}); 