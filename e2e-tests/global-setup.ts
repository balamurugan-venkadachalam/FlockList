import { chromium, FullConfig } from '@playwright/test';
import { getApiBaseUrl } from './helpers/env';
import fetch from 'node-fetch';

/**
 * Global setup for e2e tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0].use;
  const apiBaseUrl = getApiBaseUrl();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔄 Starting global test setup...');
    
    // Reset any rate limiters for test environment
    try {
      console.log('🔄 Attempting to reset rate limiters...');
      // Add a delay to ensure any previous rate limits have time to reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to access the test setup endpoint which should create test users
      // Use fetch instead of page.goto to avoid browser authentication issues
      const response = await fetch(`${apiBaseUrl}/api/test/setup`);
      console.log(`Test setup endpoint status: ${response.status}`);
      
      if (!response.ok) {
        console.warn(`⚠️ Test setup endpoint returned status ${response.status}`);
      }
      
      // Check response to see if setup was successful
      try {
        const responseData = await response.json();
        if (responseData.message === 'Test data setup complete') {
          console.log('✅ Test data setup completed successfully');
        } else {
          console.warn('⚠️ Unexpected response from test setup endpoint:', responseData);
        }
      } catch (error) {
        console.warn('⚠️ Could not parse test setup response as JSON. Continuing anyway...');
      }
      
      // Reset rate limits to avoid 429 errors during testing
      console.log('🔄 Resetting rate limits for testing...');
      const rateLimitResponse = await fetch(`${apiBaseUrl}/api/test/reset-rate-limits`, { method: 'POST' });
      if (rateLimitResponse.ok) {
        console.log('✅ Rate limits reset successfully');
      } else {
        console.warn(`⚠️ Failed to reset rate limits: ${rateLimitResponse.status}`);
      }
      
      // Clean up any existing test data to start with a clean slate
      console.log('🔄 Cleaning up existing test data...');
      const cleanupResponse = await fetch(`${apiBaseUrl}/api/test/cleanup`, { method: 'POST' });
      if (cleanupResponse.ok) {
        console.log('✅ Test data cleaned up successfully');
      } else {
        console.warn(`⚠️ Failed to clean up test data: ${cleanupResponse.status}`);
      }
      
    } catch (error) {
      console.error('⚠️ Error resetting rate limiters:', error);
    }
    
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Error during global setup:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
