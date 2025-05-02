import { Page } from '@playwright/test';
import { TaskData, FlockData } from '../types';
import { getApiBaseUrl } from './env';
import type { Page as PageType } from '@playwright/test';
import fetch from 'node-fetch';

/**
 * Creates a test flock and returns its ID
 */
export async function createTestFlock(page: Page, flockData: FlockData): Promise<string> {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-flock-button"]');
  await page.fill('[data-testid="flock-name-input"]', flockData.name);
  
  if (flockData.description) {
    await page.fill('[data-testid="flock-description-input"]', flockData.description);
  }
  
  await page.click('[data-testid="submit-flock-button"]');
  
  // Wait for success message
  await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
  
  // Get the flock ID from the URL or response
  const url = page.url();
  const flockId = url.split('/').pop() || '';
  
  return flockId;
}

/**
 * Creates a test task and returns its ID
 */
export async function createTestTask(page: Page, flockId: string, taskData: TaskData): Promise<string> {
  await page.goto(`/flocks/${flockId}/tasks/new`);
  await page.fill('[data-testid="task-title-input"]', taskData.title);
  
  if (taskData.description) {
    await page.fill('[data-testid="task-description-input"]', taskData.description);
  }
  
  if (taskData.priority) {
    await page.selectOption('[data-testid="task-priority-select"]', taskData.priority);
  }
  
  if (taskData.category) {
    await page.selectOption('[data-testid="task-category-select"]', taskData.category);
  }
  
  if (taskData.dueDate) {
    await page.fill('[data-testid="task-due-date"]', taskData.dueDate.toISOString().split('T')[0]);
  }
  
  await page.click('[data-testid="submit-task-button"]');
  
  // Wait for success message
  await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
  
  // Get the task ID from the URL or response
  const url = page.url();
  const taskId = url.split('/').pop() || '';
  
  return taskId;
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(pageOrFlockId?: PageType | string): Promise<void> {
  const apiBaseUrl = getApiBaseUrl();
  let flockId: string | undefined;
  let token: string | null = null;
  
  // Handle different parameter types
  if (!pageOrFlockId) {
    // No parameter provided
  } else if (typeof pageOrFlockId === 'string') {
    flockId = pageOrFlockId;
  } else {
    // Must be a Page instance
    token = await pageOrFlockId.evaluate(() => localStorage.getItem('authToken'));
  }
  
  // Call API endpoint to clean up test data
  try {
    // If we have a page object, use it to clean up via browser
    if (typeof pageOrFlockId !== 'string' && pageOrFlockId) {
      await pageOrFlockId.evaluate(async (flockIdParam) => {
        const token = localStorage.getItem('authToken');
        try {
          const response = await fetch(`/api/test/cleanup${flockIdParam ? `?flockId=${flockIdParam}` : ''}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!response.ok) {
            console.error(`Cleanup failed with status: ${response.status}`);
          }
        } catch (e) {
          console.error('Error in browser cleanup:', e);
        }
      }, flockId);
    } else {
      // Otherwise use node-fetch directly
      console.log(`Cleaning up test data via API: ${apiBaseUrl}/api/test/cleanup${flockId ? `?flockId=${flockId}` : ''}`);
      const response = await fetch(`${apiBaseUrl}/api/test/cleanup${flockId ? `?flockId=${flockId}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        console.error(`Cleanup failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Generates a unique test name with timestamp
 */
export function generateUniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
