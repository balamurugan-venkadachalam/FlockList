import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData } from '../../types';

/**
 * Test suite for flock management functionality
 */

test.describe('Flock Management', () => {
  let flockId: string;
  
  
  test.beforeEach(async ({ page, login }) => {
    await login();
    
    // Create a test flock
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for management tests'
    };
    flockId = await createTestFlock(page, flockData);
  });
  
  
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  
  test('should display flock details', async ({ page }) => {
    await page.goto(`/flocks/${flockId}`);
    
    await expect(page.locator('[data-testid="flock-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="flock-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="flock-members"]')).toBeVisible();
  });

  
  test('should edit flock details', async ({ page }) => {
    await page.goto(`/flocks/${flockId}`);
    
    // Click edit button
    await page.click('[data-testid="edit-flock-button"]');
    
    const updatedName = generateUniqueName('Updated Flock');
    
    // Update flock details
    await page.fill('[data-testid="flock-name-input"]', updatedName);
    await page.fill('[data-testid="flock-description-input"]', 'Updated description for testing');
    await page.click('[data-testid="submit-flock-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify updates
    await expect(page.locator('[data-testid="flock-name"]')).toContainText(updatedName);
    await expect(page.locator('[data-testid="flock-description"]')).toContainText('Updated description for testing');
  });

  
  test('should delete a flock', async ({ page }) => {
    await page.goto(`/flocks/${flockId}`);
    
    // Click settings or menu button
    await page.click('[data-testid="flock-settings-button"]');
    
    // Click delete option
    await page.click('[data-testid="delete-flock-button"]');
    
    // Confirm deletion
    await page.fill('[data-testid="confirm-delete-input"]', 'delete');
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Should redirect to flocks list
    await expect(page).toHaveURL(/.*\/flocks$/);
    
    // Flock should no longer be visible in the list
    await expect(page.locator(`[data-testid="flock-${flockId}"]`)).not.toBeVisible();
  });

  
  test('should leave a flock', async ({ page }) => {
    await page.goto(`/flocks/${flockId}`);
    
    // Click settings or menu button
    await page.click('[data-testid="flock-settings-button"]');
    
    // Click leave option
    await page.click('[data-testid="leave-flock-button"]');
    
    // Confirm leaving
    await page.click('[data-testid="confirm-leave-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Should redirect to flocks list
    await expect(page).toHaveURL(/.*\/flocks$/);
    
    // Flock should no longer be visible in the list
    await expect(page.locator(`[data-testid="flock-${flockId}"]`)).not.toBeVisible();
  });

  
  test('should change member role', async ({ page, adminLogin }) => {
    // First, invite a member
    await page.goto(`/flocks/${flockId}/members/invite`);
    const inviteEmail = `role-${generateUniqueName('user')}@example.com`;
    await page.fill('[data-testid="invite-email-input"]', inviteEmail);
    await page.selectOption('[data-testid="invite-role-select"]', 'member');
    await page.click('[data-testid="send-invite-button"]');
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Go to members page
    await page.goto(`/flocks/${flockId}/members`);
    
    // Find the invitation and click change role
    await page.click(`[data-testid="member-options-${inviteEmail}"]`);
    await page.click('[data-testid="change-role-option"]');
    
    // Change role to admin
    await page.selectOption('[data-testid="role-select"]', 'admin');
    await page.click('[data-testid="confirm-role-change-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Role should be updated
    await expect(page.locator(`[data-testid="member-role-${inviteEmail}"]`)).toContainText('Admin');
  });
});
