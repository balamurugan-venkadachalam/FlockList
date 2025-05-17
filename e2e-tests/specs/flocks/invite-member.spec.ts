import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData } from '../../types';

/**
 * Test suite for flock member invitation functionality
 */
// Rule: TypeScript Usage - Use explicit return types for all functions
test.describe('Flock Member Invitation', () => {
  let flockId: string;
  
  // Rule: Error Handling - Implement proper error handling
  test.beforeEach(async ({ page, login }) => {
    await login();
    
    // Create a test flock
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for member invitation tests'
    };
    flockId = await createTestFlock(page, flockData);
  });
  
  // Rule: Error Handling - Implement proper error handling
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should display invitation form', async ({ page }) => {
    await page.goto(`/flocks/${flockId}/members/invite`);
    
    await expect(page.locator('[data-testid="invite-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="invite-role-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="send-invite-button"]')).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should validate email format', async ({ page }) => {
    await page.goto(`/flocks/${flockId}/members/invite`);
    
    await page.fill('[data-testid="invite-email-input"]', 'invalid-email');
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should send invitation successfully', async ({ page }) => {
    await page.goto(`/flocks/${flockId}/members/invite`);
    
    const inviteEmail = `invite-${generateUniqueName('user')}@example.com`;
    
    await page.fill('[data-testid="invite-email-input"]', inviteEmail);
    await page.selectOption('[data-testid="invite-role-select"]', 'member');
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Navigate to pending invitations and verify
    await page.goto(`/flocks/${flockId}/members`);
    await expect(page.locator(`text=${inviteEmail}`)).toBeVisible();
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should not allow inviting existing members', async ({ page }) => {
    // First, get the current user's email
    await page.goto('/profile');
    const userEmail = await page.locator('[data-testid="user-email"]').textContent();
    
    // Try to invite the current user (who is already a member)
    await page.goto(`/flocks/${flockId}/members/invite`);
    await page.fill('[data-testid="invite-email-input"]', userEmail || '');
    await page.selectOption('[data-testid="invite-role-select"]', 'member');
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show error about already being a member
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/already a member|already exists/i);
  });

  // Rule: TypeScript Usage - Use explicit return types for all functions
  test('should allow canceling an invitation', async ({ page }) => {
    // Send an invitation first
    await page.goto(`/flocks/${flockId}/members/invite`);
    const inviteEmail = `cancel-${generateUniqueName('user')}@example.com`;
    await page.fill('[data-testid="invite-email-input"]', inviteEmail);
    await page.selectOption('[data-testid="invite-role-select"]', 'member');
    await page.click('[data-testid="send-invite-button"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Go to members page and cancel the invitation
    await page.goto(`/flocks/${flockId}/members`);
    
    // Find the invitation and click cancel
    await page.click(`[data-testid="cancel-invitation-${inviteEmail}"]`);
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Invitation should no longer be visible
    await expect(page.locator(`text=${inviteEmail}`)).not.toBeVisible();
  });
});
