import { test, expect } from '@playwright/test';

// Test 1: Logged in users visiting the login page directly should be redirected to dashboard
test('logged in users should be redirected from login page to dashboard', async ({ page }) => {
  // Set up interceptors to handle Supabase auth
  await page.route('**/auth/v1/token**', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'fake_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'fake_refresh_token',
        user: { id: 'fake_user_id' }
      })
    });
  });
  
  await page.route('**/auth/v1/user**', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'fake_user_id' }
      })
    });
  });
  
  await page.route('**/auth/v1/session**', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          session: {
            access_token: 'fake_token',
            user: { id: 'fake_user_id' }
          }
        }
      })
    });
  });
  
  // Navigate directly to login page
  await page.goto('/login');
  
  // Wait for any redirects to complete
  await page.waitForTimeout(2000);
  
  // We should be redirected to dashboard if the login component correctly
  // checks auth state and redirects
  await expect(page).toHaveURL('/dashboard');
});

// Test 2: Non-logged in users should see the login page
test('non-logged in users should see the login page', async ({ page }) => {
  // Set up interceptors to handle /auth/v1/session endpoint with no session
  await page.route('**/auth/v1/session', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        data: { session: null }
      })
    });
  });
  
  // Navigate directly to login page
  await page.goto('/login');
  
  // Since we're not logged in, we should stay on the login page
  await expect(page).toHaveURL('/login');
});

// Test 3: Users clicking login on the landing page should go to login page
// (where they will be redirected to dashboard if logged in)
test('users clicking login on homepage should go to login page', async ({ page }) => {
  // Go to the homepage
  await page.goto('/');
  
  // Find and click the login button
  const loginButton = await page.getByTestId('login-button');
  await loginButton.click();
  
  // We should go to the login page initially
  await expect(page).toHaveURL('/login');
}); 