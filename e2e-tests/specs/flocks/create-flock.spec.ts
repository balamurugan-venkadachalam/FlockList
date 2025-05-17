import { test, expect } from '../../fixtures/auth-fixture';
import { cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { getFrontendUrl } from '../../helpers/env';
import { FlockData } from '../../types';

/**
 * Test suite for flock creation functionality
 */
// Rule: TypeScript Usage - Use explicit return types for all functions
// Rule: TypeScript Usage - Use explicit return types for all functions
test.describe('Flock Creation', () => {
  // Rule: Error Handling - Implement proper error handling
  // Rule: TypeScript Usage - Use explicit return types for all functions
  // Rule: Error Handling - Implement proper error handling
  // Rule: Error Handling - Implement proper error handling
  // Rule: Error Handling - Implement proper error handling
  test.beforeEach(async ({ adminLogin, page }) => {
    // Use the adminLogin fixture from auth-fixture.ts
    console.log('Logging in as admin user...');
    await adminLogin();
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    // Verify we're on the dashboard
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Verify token exists in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Auth token exists in beforeEach:', !!token);
    
    if (!token) {
      throw new Error('No auth token found after login');
    }
    
    // Take a screenshot after login verification
    await page.screenshot({ path: 'test-results/before-test.png' });
  });
  
  test.afterEach(async ({ page }) => {
    // Rule: Error Handling - Implement proper error handling
    try {
      // Pass the page object to clean up test data
      await cleanupTestData(page);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should display flock creation form', async ({ page }) => {
    // Rule: Error Handling - Implement proper error handling
    const frontendUrl = getFrontendUrl();
    
    // Verify token exists in localStorage before navigation
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Auth token exists before navigation:', !!token);
    
    if (!token) {
      throw new Error('No auth token found before navigation');
    }
    
    console.log('Navigating to flock creation page...');
    // Navigate to the create flock page
    await page.goto(`${frontendUrl}/flocks/create`);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to debug
    await page.screenshot({ path: 'test-results/flock-create-page.png' });
    
    // Debug: Output page URL and check for unauthorized access
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    // Check if we were redirected to unauthorized page
    if (currentUrl.includes('/unauthorized')) {
      console.error('Redirected to unauthorized page - user may not have admin role');
      throw new Error('User does not have permission to create flocks');
    }
    
    // Check if we were redirected to login page
    if (currentUrl.includes('/login')) {
      console.error('Redirected to login page - user may not be authenticated');
      throw new Error('User is not authenticated');
    }
    
    // Output page content for debugging
    const pageContent = await page.content();
    console.log('Page contains form element:', pageContent.includes('data-testid="create-flock-form"'));
    
    // Wait for the form to be visible with a longer timeout
    try {
      // Wait for the form to be visible
      await page.waitForSelector('[data-testid="create-flock-form"]', { timeout: 15000 });
      console.log('Found create-flock-form element');
    } catch (error) {
      console.error('Could not find create-flock-form, checking for other elements...');
      
      // Check for any Paper component
      const hasPaper = await page.locator('div.MuiPaper-root').count() > 0;
      console.log('Has Paper component:', hasPaper);
      
      // Check if the invitation exists
      const invitationExists = await page.locator('text=You have been invited to join this flock').isVisible();
      console.log('Is invitation page:', invitationExists);
      
      // Check for unauthorized page
      const isUnauthorized = await page.locator('text=Unauthorized').isVisible();
      console.log('Is unauthorized page:', isUnauthorized);
      
      // Check if we're on an invitation page
      const isInvitationPage = await page.locator('text=You have been invited to join').isVisible();
      console.log('Is invitation page:', isInvitationPage);
      
      // Output page title
      const pageTitle = await page.title();
      console.log('Page title:', pageTitle);
      
      throw error;
    }
    
    // Verify form elements are visible
    await expect(page.locator('[data-testid="flock-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="flock-description-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-flock-button"]')).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should validate required fields', async ({ page }) => {
    // Rule: Error Handling - Implement proper error handling
    const frontendUrl = getFrontendUrl();
    
    // Verify token exists in localStorage before navigation
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Auth token exists before validation test:', !!token);
    
    if (!token) {
      throw new Error('No auth token found before validation test');
    }
    
    // Navigate to the create flock page
    await page.goto(`${frontendUrl}/flocks/create`);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to debug
    await page.screenshot({ path: 'test-results/validate-fields-page.png' });
    
    // Wait for the form to be visible with longer timeout
    await page.waitForSelector('[data-testid="create-flock-form"]', { timeout: 15000 });
    
    // Submit without filling required fields
    await page.click('[data-testid="submit-flock-button"]');
    
    // Verify error messages are displayed
    await expect(page.locator('text=Flock name is required')).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should create a flock successfully', async ({ page }) => {
    // Rule: Error Handling - Implement proper error handling
    const frontendUrl = getFrontendUrl();
    
    // Verify token exists in localStorage before navigation
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Auth token exists before create test:', !!token);
    
    if (!token) {
      throw new Error('No auth token found before create test');
    }
    
    // Navigate to the create flock page
    await page.goto(`${frontendUrl}/flocks/create`);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to debug
    await page.screenshot({ path: 'test-results/create-flock-page.png' });
    
    // Wait for the form to be visible with longer timeout
    await page.waitForSelector('[data-testid="create-flock-form"]', { timeout: 15000 });
    
    const flockName = generateUniqueName('Test Flock');
    console.log('Creating flock with name:', flockName);
    
    // Fill in the form
    await page.fill('[data-testid="flock-name-input"]', flockName);
    await page.fill('[data-testid="flock-description-input"]', 'This is a test flock');
    
    // Submit the form
    await page.click('[data-testid="submit-flock-button"]');
    
    // Wait for success message or redirect with longer timeout
    await page.waitForSelector('text=Flock created successfully', { timeout: 10000 })
      .catch(async (error) => {
        console.error('Could not find success message, checking URL instead');
        // Take a screenshot after submission
        await page.screenshot({ path: 'test-results/after-flock-submit.png' });
        throw error;
      });
    
    // Verify we're redirected to the flocks page
    await expect(page).toHaveURL(/.*\/flocks/);
    
    // Verify the new flock is in the list
    await expect(page.locator(`text=${flockName}`)).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should handle duplicate flock names', async ({ page }) => {
    // Rule: Error Handling - Implement proper error handling
    const frontendUrl = getFrontendUrl();
    
    // Verify token exists in localStorage before navigation
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Auth token exists before duplicate test:', !!token);
    
    if (!token) {
      throw new Error('No auth token found before duplicate test');
    }
    
    // Generate a unique flock name for this test
    const flockName = generateUniqueName('Duplicate Flock');
    console.log('Testing duplicate flock name:', flockName);
    
    // Navigate to the create flock page
    await page.goto(`${frontendUrl}/flocks/create`);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot to debug
    await page.screenshot({ path: 'test-results/duplicate-flock-page.png' });
    
    // Wait for the form to be visible with longer timeout
    await page.waitForSelector('[data-testid="create-flock-form"]', { timeout: 15000 });
    
    // Create first flock
    await page.fill('[data-testid="flock-name-input"]', flockName);
    await page.fill('[data-testid="flock-description-input"]', 'This is the first flock');
    await page.click('[data-testid="submit-flock-button"]');
    
    // Wait for success message with longer timeout
    await page.waitForSelector('text=Flock created successfully', { timeout: 10000 })
      .catch(async (error) => {
        console.error('Could not find success message for first flock');
        // Take a screenshot after submission
        await page.screenshot({ path: 'test-results/after-first-flock-submit.png' });
        throw error;
      });
    
    // Navigate back to create flock page
    await page.goto(`${frontendUrl}/flocks/create`);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Wait for the form to be visible with longer timeout
    await page.waitForSelector('[data-testid="create-flock-form"]', { timeout: 15000 });
    
    // Try to create a flock with the same name
    await page.fill('[data-testid="flock-name-input"]', flockName);
    await page.fill('[data-testid="flock-description-input"]', 'This is a duplicate flock');
    await page.click('[data-testid="submit-flock-button"]');
    
    // Verify error message about duplicate name with longer timeout
    await page.waitForSelector('text=Flock with this name already exists', { timeout: 10000 })
      .catch(async (error) => {
        console.error('Could not find duplicate name error message');
        // Take a screenshot after submission
        await page.screenshot({ path: 'test-results/after-duplicate-submit.png' });
        throw error;
      });
  });
});
