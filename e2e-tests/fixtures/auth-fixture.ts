import { test as base } from '@playwright/test';
import { LoginCredentials } from '../types';
import { getTestUserCredentials, getAdminUserCredentials, getMemberUserCredentials, getFrontendUrl } from '../helpers/env';
import { ensureTestUserExists, directAuthenticate } from '../helpers/test-utils';

/**
 * Auth fixture for handling authentication in tests
 */
export type AuthFixture = {
  login: (credentials?: LoginCredentials) => Promise<void>;
  adminLogin: () => Promise<void>;
  memberLogin: () => Promise<void>;
};

// Get credentials from environment variables
const defaultUser: LoginCredentials = getTestUserCredentials();
const adminUser: LoginCredentials = getAdminUserCredentials();
const memberUser: LoginCredentials = getMemberUserCredentials();

// Rule: TypeScript Usage - Use explicit return types for all functions
export const test = base.extend<AuthFixture>({
  // Rule: Error Handling - Implement proper error handling
  login: async ({ page }, use) => {
    // Rule: TypeScript Usage - Use explicit return types for all functions
    const loginFn = async (credentials: LoginCredentials = defaultUser): Promise<void> => {
      // Rule: Error Handling - Implement proper error handling
      
      try {
        // First ensure the test user exists and is validated
        await ensureTestUserExists(credentials);
      } catch (error) {
        console.warn('Could not ensure test user exists, will try to login anyway:', error);
      }
      
      // Use the full frontend URL
      const frontendUrl = getFrontendUrl();
      await page.goto(`${frontendUrl}/login`);
      
      // Check if we're already logged in by looking for login form
      const isLoginFormVisible = await page.isVisible('[data-testid="login-form"]');
      
      if (isLoginFormVisible) {
        console.log(`Logging in as ${credentials.email}...`);
        
        // Fill in login credentials and submit
        await page.fill('[data-testid="email-input"]', credentials.email);
        await page.fill('[data-testid="password-input"]', credentials.password);
        await page.click('[data-testid="login-button"]');
        
        // Wait for login to complete
        await page.waitForTimeout(2000); // Give time for the login process to complete
        
        // Rule: Error Handling - Implement proper error handling
        // Check if login was successful by looking for token in localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));
        if (!token) {
          console.error('Login failed: No token found in localStorage');
          // Take a screenshot to help debug the issue
          await page.screenshot({ path: 'test-results/login-failure.png' });
          throw new Error('Login failed: No token found in localStorage');
        }
        
        console.log('Login successful: Token found in localStorage');
        
        // Wait for navigation to complete
        try {
          // First try waiting for dashboard container
          await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 5000 });
          console.log('Login successful: Dashboard container found');
        } catch (e) {
          console.log('Dashboard container not found, checking URL and navigating if needed');
          
          // If dashboard container isn't found, check if we're on a dashboard-related URL
          const currentUrl = page.url();
          if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/flocks') && !currentUrl.includes('/tasks')) {
            // If not on a dashboard page, check if there's an error message
            const hasError = await page.isVisible('.MuiAlert-standardError, .MuiAlert-error');
            if (hasError) {
              const errorText = await page.textContent('.MuiAlert-standardError, .MuiAlert-error');
              console.error(`Login error detected: ${errorText}`);
              // Continue anyway - we'll try to navigate to dashboard
            }
            
            // Navigate to dashboard directly
            console.log('Redirecting to dashboard page after login');
            await page.goto(`${frontendUrl}/dashboard`);
            await page.waitForTimeout(1000); // Give the page time to load
          }
        }
        
        // Navigate to dashboard to ensure we're on the right page
        await page.goto(`${frontendUrl}/dashboard`);
        await page.waitForTimeout(1000); // Give the page time to load
        
        console.log('Login process completed');
      } else {
        // Already logged in, navigate to dashboard
        console.log('Already logged in, navigating to dashboard');
        await page.goto(`${frontendUrl}/dashboard`);
        await page.waitForTimeout(1000); // Give the page time to load
      }
    };
    await use(loginFn);
  },
  
  // Rule: Error Handling - Implement proper error handling
  adminLogin: async ({ page }, use) => {
    // Rule: Error Handling - Implement proper error handling
    const adminLoginFn = async () => {
      try {
        // Enable console logging for debugging
        page.on('console', msg => {
          console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
        });
        
        // First ensure the admin user exists and is set up properly with hashed password
        const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        console.log('Setting up test users via API...');
        const setupResponse = await fetch(`${apiUrl}/api/test/setup`, {
          method: 'POST'
        });
        
        if (!setupResponse.ok) {
          console.error(`Test user setup failed with status: ${setupResponse.status}`);
          throw new Error('Failed to set up test users');
        }
        
        console.log('Test users setup successful');
        
        // Navigate to the login page
        const frontendUrl = getFrontendUrl();
        console.log(`Navigating to login page at ${frontendUrl}/login`);
        await page.goto(`${frontendUrl}/login`);
        
        // Wait for the login page to load by looking for the email input field
        await page.waitForSelector('input[data-testid="email-input"]', { timeout: 10000 });
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/before-admin-login.png' });
        
        // Log the admin credentials being used
        console.log('Using admin credentials:', { email: adminUser.email, password: adminUser.password });
        
        // Fill in admin credentials
        await page.fill('input[data-testid="email-input"]', adminUser.email);
        await page.fill('input[data-testid="password-input"]', adminUser.password);
        
        // Setup listeners for network requests
        const loginResponsePromise = page.waitForResponse(
          response => response.url().includes('/api/auth/login'),
          { timeout: 10000 }
        );
        
        // Click login button
        console.log('Clicking login button');
        await page.click('button[data-testid="login-button"]');
        
        // Wait for login response
        const loginResponse = await loginResponsePromise;
        console.log(`Login response status: ${loginResponse.status()}`);
        
        // Get the response body for debugging
        const responseBody = await loginResponse.json().catch(() => ({}));
        console.log('Login response body:', responseBody);
        
        if (loginResponse.status() === 200) {
          console.log('Login successful, waiting for redirect...');
          
          // Wait for navigation after successful login
          await page.waitForNavigation({ timeout: 10000 }).catch(() => {
            console.log('Navigation timeout, but continuing test...');
          });
          
          // Force navigation to dashboard if not redirected automatically
          const currentUrl = page.url();
          if (!currentUrl.includes('dashboard')) {
            console.log('Manual navigation to dashboard...');
            await page.goto(`${frontendUrl}/dashboard`);
          }
          
          // Take a screenshot after login
          await page.screenshot({ path: 'test-results/after-admin-login.png' });
          
          // Verify token was set in localStorage
          const token = await page.evaluate(() => localStorage.getItem('token'));
          console.log('Auth token exists:', !!token);
          
          if (!token) {
            console.error('No auth token found after login');
            throw new Error('Login failed: No auth token found');
          }
          
          console.log('Successfully logged in as admin user');
        } else {
          console.error(`Login failed with status: ${loginResponse.status()}`);
          // Take a screenshot of the failed login
          await page.screenshot({ path: 'test-results/admin-login-failed.png' });
          throw new Error(`Login failed with status: ${loginResponse.status()}`);
        }
      } catch (error) {
        console.error('Error during admin login:', error);
        throw error;
      }
    };
    await use(adminLoginFn);
  },
  
  // Rule: Error Handling - Implement proper error handling
  memberLogin: async ({ login }, use) => {
    // Rule: TypeScript Usage - Use explicit return types for all functions
    const memberLoginFn = async (): Promise<void> => {
      await login(memberUser);
    };
    await use(memberLoginFn);
  },
});

export { expect } from '@playwright/test';
