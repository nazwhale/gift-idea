import { Page } from '@playwright/test';

// Helper function to simulate a logged-in user
export async function simulateLoggedInUser(page: Page): Promise<void> {
  // Inject a script that will call our setTestMode function
  await page.addScriptTag({
    content: `
      console.log("Setting up mock auth for tests - logged in user");
      window.mockAuthForTests = true;
      window.mockSessionData = {
        user: { 
          id: 'test-user-id',
          email: 'test@example.com'
        },
        access_token: 'fake-token',
        refresh_token: 'fake-refresh-token'
      };
      
      // If the app has already loaded, try to update the auth state
      if (window.hasOwnProperty('setTestModeDirectly')) {
        console.log("Calling setTestModeDirectly");
        window.setTestModeDirectly(true, window.mockSessionData);
      }
    `
  });

  // Wait a moment to ensure the script has executed
  await page.waitForTimeout(500);
}

// Helper function to simulate a logged-out user
export async function simulateLoggedOutUser(page: Page): Promise<void> {
  // Inject a script that will call our setTestMode function with no session
  await page.addScriptTag({
    content: `
      console.log("Setting up mock auth for tests - logged out user");
      window.mockAuthForTests = true;
      window.mockSessionData = null;
      
      // If the app has already loaded, try to update the auth state
      if (window.hasOwnProperty('setTestModeDirectly')) {
        console.log("Calling setTestModeDirectly");
        window.setTestModeDirectly(true, null);
      }
    `
  });

  // Wait a moment to ensure the script has executed
  await page.waitForTimeout(500);
} 