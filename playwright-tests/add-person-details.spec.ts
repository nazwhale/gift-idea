import { test, expect } from '@playwright/test';
import { simulateLoggedInUser } from './test-helpers';

test.describe('Add Person Details', () => {
    test('should open details dialog automatically when adding a new person', async ({ page }) => {
        // Login and navigate to the dashboard
        await simulateLoggedInUser(page);
        await page.goto('/');

        // Add a new person
        const personName = 'Test Person';
        await page.fill('input[placeholder="Their name"]', personName);
        await page.getByTestId('add-person-button').click();

        // Verify that details dialog opens automatically
        const dialogTitle = page.locator('h2').filter({ hasText: `${personName}'s Details` });
        await expect(dialogTitle).toBeVisible();

        // Verify form fields are present
        await expect(page.getByTestId('birthday-input')).toBeVisible();
        await expect(page.getByTestId('age-input')).toBeVisible();
        await expect(page.getByTestId('bio-input')).toBeVisible();

        // Test adding birthday and bio
        await page.getByTestId('birthday-input').fill('25-12');
        await page.getByTestId('age-input').fill('30');
        await page.getByTestId('bio-input').fill('Test bio information');

        // Save the details
        await page.getByTestId('save-details-button').click();

        // Verify dialog closes after save
        await expect(dialogTitle).not.toBeVisible();

        // Verify person is in the list with birthday countdown (if within 31 days)
        await expect(page.getByText(personName)).toBeVisible();
    });
}); 