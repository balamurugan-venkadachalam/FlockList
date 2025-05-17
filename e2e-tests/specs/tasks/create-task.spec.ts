import { test, expect } from '../../fixtures/auth-fixture';
import { createTestFlock, cleanupTestData, generateUniqueName } from '../../helpers/test-utils';
import { FlockData } from '../../types';
import { getFrontendUrl } from '../../helpers/env';

/**
 * Test suite for task creation functionality
 */
test.describe('Task Creation', () => {
  let flockId: string;
  
  test.beforeEach(async ({ page, login }) => {
    await login();
    const flockData: FlockData = {
      name: generateUniqueName('Test Flock'),
      description: 'Test flock for task creation tests'
    };
    flockId = await createTestFlock(page, flockData);
  });
  
  test.afterAll(async () => {
    // Clean up the test flock and all its tasks
    await cleanupTestData(flockId);
  });

  test('should display task creation form', async ({ page }) => {
    const frontendUrl = getFrontendUrl();
    await page.goto(`/flocks/${flockId}/tasks/new`);
    
    await expect(page.locator('[data-testid="task-title-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-description-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-priority-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-category-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-task-button"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const frontendUrl = getFrontendUrl();
    await page.goto(`/flocks/${flockId}/tasks/new`);
    
    // Submit without filling required fields
    await page.click('[data-testid="submit-task-button"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
  });

  test('should create a task successfully', async ({ page }) => {
    const frontendUrl = getFrontendUrl();
    await page.goto(`/flocks/${flockId}/tasks/new`);
    
    const taskTitle = generateUniqueName('Test Task');
    
    await page.fill('[data-testid="task-title-input"]', taskTitle);
    await page.fill('[data-testid="task-description-input"]', 'This is a test task description');
    await page.selectOption('[data-testid="task-priority-select"]', 'medium');
    await page.selectOption('[data-testid="task-category-select"]', 'chore');
    
    // Set due date if there's a date picker
    if (await page.locator('[data-testid="task-due-date"]').isVisible()) {
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="task-due-date"]', tomorrow.toISOString().split('T')[0]);
    }
    
    await page.click('[data-testid="submit-task-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Navigate to task list and verify task is there
    await page.goto(`/flocks/${flockId}/tasks`);
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
  });
});
