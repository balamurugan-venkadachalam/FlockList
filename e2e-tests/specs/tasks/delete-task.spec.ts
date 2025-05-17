import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, createTestTask, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData, TaskData } from '../../types';

/**
 * Test suite for task deletion functionality
 */
test.describe('Task Deletion', () => {
  let flockId: string;
  let taskId: string;
  
  test.beforeEach(async ({ page, login }) => {
    await login();
    
    // Create a test flock
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for task deletion tests'
    };
    flockId = await createTestFlock(page, flockData);
    
    // Create a test task
    const taskData: TaskData = {
      title: generateUniqueName('Test Task'),
      description: 'Test description for deletion',
      priority: 'medium',
      category: 'chore'
    };
    taskId = await createTestTask(page, flockId, taskData);
  });
  
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should delete a task from task details page', async ({ page }) => {
    await page.goto(`/tasks/${taskId}`);
    
    // Click delete button
    await page.click('[data-testid="delete-task-button"]');
    
    // Confirm deletion in the dialog
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Should redirect to tasks list
    await expect(page).toHaveURL(/.*\/tasks$/);
    
    // Task should no longer be visible in the list
    await expect(page.locator(`[data-testid="task-${taskId}"]`)).not.toBeVisible();
  });

  test('should delete a task from task list page', async ({ page }) => {
    await page.goto(`/flocks/${flockId}/tasks`);
    
    // Find the task and click its menu button
    await page.click(`[data-testid="task-${taskId}-menu-button"]`);
    
    // Click delete option in the menu
    await page.click('[data-testid="delete-task-option"]');
    
    // Confirm deletion in the dialog
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Task should no longer be visible in the list
    await expect(page.locator(`[data-testid="task-${taskId}"]`)).not.toBeVisible();
  });

  test('should cancel task deletion when prompted', async ({ page }) => {
    await page.goto(`/tasks/${taskId}`);
    
    // Click delete button
    await page.click('[data-testid="delete-task-button"]');
    
    // Cancel deletion in the dialog
    await page.click('[data-testid="cancel-delete-button"]');
    
    // Should still be on the task details page
    await expect(page).toHaveURL(`/tasks/${taskId}`);
    
    // Navigate to tasks list to verify task still exists
    await page.goto(`/flocks/${flockId}/tasks`);
    await expect(page.locator(`[data-testid="task-${taskId}"]`)).toBeVisible();
  });
});
