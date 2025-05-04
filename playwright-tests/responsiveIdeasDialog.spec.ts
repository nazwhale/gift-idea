import { test, expect } from '@playwright/test';

test.describe('Responsive Ideas Dialog', () => {
    test('shows dialog on desktop', async ({ page }) => {
        // Set viewport to desktop size
        await page.setViewportSize({ width: 1024, height: 768 });

        await page.goto('/');

        // Click on the ideas button
        await page.getByTestId('ideas-button').first().click();

        // Check if dialog content is visible
        const dialogContent = page.getByTestId('ideas-dialog-content');
        await expect(dialogContent).toBeVisible();

        // Check ideas tab is active by default
        await expect(page.getByTestId('ideas-content')).toBeVisible();
    });

    test('shows drawer on mobile', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');

        // Click on the ideas button
        await page.getByTestId('ideas-button').first().click();

        // Check if drawer content is visible
        const drawerContent = page.getByTestId('ideas-drawer-content');
        await expect(drawerContent).toBeVisible();

        // Check ideas tab is active by default
        await expect(page.getByTestId('ideas-content')).toBeVisible();
    });
}); 