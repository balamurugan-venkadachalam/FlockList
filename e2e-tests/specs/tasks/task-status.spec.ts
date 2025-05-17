import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, createTestTask, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData, TaskData } from '../../types';

/**
 * Test suite for task status management functionality
 */
test.describe('Task Status Management', () => {
  let flockId: string;
  let taskId: string;
  
  test.beforeEach(async ({ page, login }) => {
    await login();
    
    // Create a test flock
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for task status tests'
    };
    flockId = await createTestFlock(page, flockData);
    
    // Create a test task
    const taskData: TaskData = {
      title: generateUniqueName('Test Task'),
      description: 'Test description for status changes',
      priority: 'medium',
      category: 'chore'
    };
    taskId = await createTestTask(page, flockId, taskData);
  });
  
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should change task status to in progress', async ({ page }) => {
    await page.goto(`/tasks/${taskId}`);
    
    // Find and click the "Start" or "In Progress" button
    await page.click('[data-testid="status-in-progress-button"]');
    
    // Should show updated status
    await expect(page.locator('[data-testid="task-status"]')).toContainText('In Progress');
  });

  test('should change task status to completed', async ({ page }) => {
    await page.goto(`/tasks/${taskId}`);
    
    // Find and click the "Complete" button
    await page.click('[data-testid="status-completed-button"]');
    
    // Should show updated status
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Completed');
    
    // Should show completed date and user
    await expect(page.locator('[data-testid="completed-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-by"]')).toBeVisible();
  });

  test('should change task status from completed back to pending', async ({ page }) => {
    // First complete the task
    await page.goto(`/tasks/${taskId}`);
    await page.click('[data-testid="status-completed-button"]');
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Completed');
    
    // Then change back to pending
    await page.click('[data-testid="status-pending-button"]');
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Pending');
    
    // Completed information should no longer be visible
    await expect(page.locator('[data-testid="completed-date"]')).not.toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    // Create a completed task
    const completedTaskData: TaskData = {
      title: generateUniqueName('Completed Task'),
      description: 'This task will be completed',
      priority: 'medium',
      category: 'chore'
    };
    const completedTaskId = await createTestTask(page, flockId, completedTaskData);
    
    // Complete the task
    await page.goto(`/tasks/${completedTaskId}`);
    await page.click('[data-testid="status-completed-button"]');
    
    // Go to task list and filter by completed
    await page.goto(`/flocks/${flockId}/tasks`);
    await page.selectOption('[data-testid="status-filter"]', 'completed');
    
    // Should show completed task but not pending task
    await expect(page.locator(`[data-testid="task-${completedTaskId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="task-${taskId}"]`)).not.toBeVisible();
    
    // Now filter by pending
    await page.selectOption('[data-testid="status-filter"]', 'pending');
    
    // Should show pending task but not completed task
    await expect(page.locator(`[data-testid="task-${taskId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="task-${completedTaskId}"]`)).not.toBeVisible();
  });
});
