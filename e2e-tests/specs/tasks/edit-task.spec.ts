import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, createTestTask, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData, TaskData } from '../../types';

/**
 * Test suite for task editing functionality
 */
test.describe('Task Editing', () => {
  let flockId: string;
  let taskId: string;
  
  test.beforeEach(async ({ page, login }) => {
    await login();
    
    // Create a test flock
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for task editing tests'
    };
    flockId = await createTestFlock(page, flockData);
    
    // Create a test task
    const taskData: TaskData = {
      title: generateUniqueName('Test Task'),
      description: 'Test description for editing',
      priority: 'medium',
      category: 'chore'
    };
    taskId = await createTestTask(page, flockId, taskData);
  });
  
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should load task data in edit form', async ({ page }) => {
    await page.goto(`/tasks/${taskId}/edit`);
    
    // Check if form is pre-filled with task data
    await expect(page.locator('[data-testid="task-title-input"]')).toHaveValue(/Test Task/);
    await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('Test description for editing');
    
    // Check if priority and category are selected
    const priorityValue = await page.locator('[data-testid="task-priority-select"]').inputValue();
    expect(priorityValue).toBe('medium');
    
    const categoryValue = await page.locator('[data-testid="task-category-select"]').inputValue();
    expect(categoryValue).toBe('chore');
  });

  test('should update task successfully', async ({ page }) => {
    await page.goto(`/tasks/${taskId}/edit`);
    
    const updatedTitle = generateUniqueName('Updated Task');
    
    // Clear and update fields
    await page.fill('[data-testid="task-title-input"]', updatedTitle);
    await page.fill('[data-testid="task-description-input"]', 'Updated description for testing');
    await page.selectOption('[data-testid="task-priority-select"]', 'high');
    await page.selectOption('[data-testid="task-category-select"]', 'activity');
    
    await page.click('[data-testid="submit-task-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Navigate to task details and verify updates
    await page.goto(`/tasks/${taskId}`);
    await expect(page.locator('[data-testid="task-title"]')).toContainText(updatedTitle);
    await expect(page.locator('[data-testid="task-description"]')).toContainText('Updated description for testing');
    await expect(page.locator('[data-testid="task-priority"]')).toContainText('High');
    await expect(page.locator('[data-testid="task-category"]')).toContainText('Activity');
  });

  test('should handle validation errors when updating', async ({ page }) => {
    await page.goto(`/tasks/${taskId}/edit`);
    
    // Clear required field
    await page.fill('[data-testid="task-title-input"]', '');
    
    await page.click('[data-testid="submit-task-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    
    // Form should not be submitted
    await expect(page).toHaveURL(/.*\/edit/);
  });
});
