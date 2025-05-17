import { test as base } from '@playwright/test';
import { LoginCredentials } from '../types';
import { getTestUserCredentials, getAdminUserCredentials, getMemberUserCredentials } from '../helpers/env';

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

export const test = base.extend<AuthFixture>({
  login: async ({ page }, use) => {
    const loginFn = async (credentials: LoginCredentials = defaultUser) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', credentials.email);
      await page.fill('[data-testid="password-input"]', credentials.password);
      await page.click('[data-testid="login-button"]');
      // Wait for navigation or dashboard element to be visible
      await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
    };
    await use(loginFn);
  },
  
  adminLogin: async ({ login }, use) => {
    const adminLoginFn = async () => {
      await login(adminUser);
    };
    await use(adminLoginFn);
  },
  
  memberLogin: async ({ login }, use) => {
    const memberLoginFn = async () => {
      await login(memberUser);
    };
    await use(memberLoginFn);
  },
});

export { expect } from '@playwright/test';
