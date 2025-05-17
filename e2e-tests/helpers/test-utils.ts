import { Page } from '@playwright/test';
import { TaskData, FlockData, LoginCredentials } from '../types';
import { getFrontendUrl, getTestUserCredentials } from './env';
import type { Page as PageType } from '@playwright/test';
import fetch from 'node-fetch';

/**
 * Get the API URL from environment variables
 */
export function getApiUrl(): string {
  // Rule: Use environment variables for all connection URLs to prevent hardcoding
  return process.env.API_BASE_URL || 'http://localhost:3001';
}

/**
 * Creates a test flock and returns its ID
 */
export async function createTestFlock(page: Page, flockData: FlockData): Promise<string> {
  const frontendUrl = getFrontendUrl();
  await page.goto(`${frontendUrl}/dashboard`);
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
  const frontendUrl = getFrontendUrl();
  await page.goto(`${frontendUrl}/flocks/${flockId}/tasks/new`);
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
  const apiBaseUrl = getApiUrl();
  let flockId: string | undefined;
  let token: string | null = null;
  
  // Handle different parameter types
  if (!pageOrFlockId) {
    // No parameter provided
  } else if (typeof pageOrFlockId === 'string') {
    flockId = pageOrFlockId;
  } else {
    // Must be a Page instance
    try {
      // Check if we're on a page where localStorage is accessible
      const frontendUrl = getFrontendUrl();
      const currentUrl = pageOrFlockId.url();
      
      // Only try to access localStorage if we're on the frontend domain
      if (currentUrl.startsWith(frontendUrl)) {
        // Rule: TypeScript Usage - Use explicit return types for all functions
        const authToken = await pageOrFlockId.evaluate(() => localStorage.getItem('authToken')).catch(() => null);
        if (authToken) {
          token = authToken;
        }
      }
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      // Continue without token
    }
  }
  
  // Call API endpoint to clean up test data
  try {
    // If we have a page object, use it to clean up via browser
    if (typeof pageOrFlockId !== 'string' && pageOrFlockId) {
      try {
        const frontendUrl = getFrontendUrl();
        const apiBaseUrl = getApiUrl();
        
        // First navigate to the frontend to ensure we can access localStorage
        await pageOrFlockId.goto(frontendUrl).catch(() => {
          console.warn('Could not navigate to frontend URL');
        });
        
        // Get token from localStorage if available
        token = await pageOrFlockId.evaluate(() => localStorage.getItem('token')).catch(() => null);
        
        if (!token) {
          console.warn('No authentication token found in localStorage');
        }
        
        // Call cleanup API with retry logic for rate limiting
        console.log('Cleaning up test data via API:', `${apiBaseUrl}/api/test/cleanup`);
        
        let cleanupSuccess = false;
        let cleanupAttempts = 3;
        
        while (!cleanupSuccess && cleanupAttempts > 0) {
          try {
            const response = await fetch(`${apiBaseUrl}/api/test/cleanup`, {
              method: 'POST',
              headers: token ? {
                'Authorization': `Bearer ${token}`
              } : {}
            });
            
            if (response.ok) {
              console.log('Test data cleanup successful');
              cleanupSuccess = true;
            } else if (response.status === 429) {
              // Rate limiting encountered
              cleanupAttempts--;
              console.log(`Rate limit hit during cleanup. Retrying... (${cleanupAttempts} attempts left)`);
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
              console.error(`Cleanup failed with status: ${response.status}`);
              break; // Exit the loop for non-rate-limiting errors
            }
          } catch (error) {
            cleanupAttempts--;
            if (cleanupAttempts > 0) {
              console.log(`Cleanup request failed. Retrying... (${cleanupAttempts} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
              console.error('All cleanup attempts failed:', error);
            }
          }
        }
      } catch (e) {
        console.error('Error in browser cleanup:', e);
      }
    }
    
    // As a fallback, always use node-fetch directly
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

/**
 * Ensures that the test user exists and is validated in the system
 * This is mandatory for login to work properly
 */
export async function ensureTestUserExists(credentials: LoginCredentials = getTestUserCredentials()): Promise<void> {
  const apiBaseUrl = getApiUrl();
  
  try {
    // First try to use the createTestUsers endpoint which is more reliable
    try {
      console.log('Setting up test users via dedicated endpoint...');
      const setupResponse = await fetch(`${apiBaseUrl}/api/test/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (setupResponse.ok) {
        console.log('Test users set up successfully');
        return;
      }
    } catch (setupError) {
      console.warn('Could not use test setup endpoint, falling back to manual creation:', setupError);
    }
    
    // Fallback: check if user exists and create manually if needed
    console.log('Checking if test user exists...');
    const checkResponse = await fetch(`${apiBaseUrl}/api/auth/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: credentials.email })
    }).catch(e => {
      console.warn('Check user endpoint failed, will attempt to create user anyway:', e);
      return { ok: false, json: async () => ({ exists: false }) };
    });
    
    const checkData = checkResponse.ok ? await checkResponse.json() : { exists: false };
    
    // If user doesn't exist, create one
    if (!checkData.exists) {
      console.log(`Test user ${credentials.email} doesn't exist. Creating...`);
      
      // Rule: Backend Controller Rules - Always ensure the response format matches the OpenAPI specification
      const registerResponse = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          firstName: 'Test',
          lastName: 'User',
          role: 'member' // Use 'member' instead of 'user' to match backend validation
        })
      });
      
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error('Registration error response:', errorData);
        
        // If registration failed but it might be because the user already exists, continue anyway
        if (errorData.message?.includes('already exists')) {
          console.log('User might already exist, continuing with validation...');
        } else {
          throw new Error(`Failed to create test user: ${errorData.message || registerResponse.statusText}`);
        }
      } else {
        console.log(`Test user ${credentials.email} created successfully`);
      }
    } else {
      console.log(`Test user ${credentials.email} already exists`);
    }
    
    try {
      // First, check if the API is available
      const apiUrl = getApiUrl();
      const healthResponse = await fetch(`${apiUrl}/api/health`);
      if (!healthResponse.ok) {
        console.warn('API health check failed, API may be unavailable');
        return;
      }
    } catch (error) {
      console.error('Error checking API health:', error);
    }
    
    // Ensure user email is validated
    console.log('Validating test user email...');
    const validateResponse = await fetch(`${apiBaseUrl}/api/test/validate-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: credentials.email })
    });
    
    if (!validateResponse.ok) {
      throw new Error(`Failed to validate test user email: ${validateResponse.statusText}`);
    }
    
    console.log(`Test user ${credentials.email} email validation confirmed`);
  } catch (error) {
    console.error('Error ensuring test user exists:', error);
    throw error;
  }
}

/**
 * Directly authenticate a user via API and return the auth token
 * This bypasses the UI login flow for more reliable testing
 */
export async function directAuthenticate(credentials: LoginCredentials): Promise<string> {
  try {
    const apiUrl = getApiUrl();
    
    // First ensure the user exists
    await ensureTestUserExists(credentials);
    
    // Now authenticate directly via API
    console.log(`Directly authenticating ${credentials.email} via API...`);
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Authentication failed:', errorData);
      throw new Error(`Failed to authenticate: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.token) {
      throw new Error('No token returned from authentication API');
    }
    
    console.log('Direct authentication successful');
    return data.token;
  } catch (error) {
    console.error('Error in direct authentication:', error);
    throw error;
  }
}
