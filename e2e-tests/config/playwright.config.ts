import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import { getFrontendUrl, getApiBaseUrl } from '../helpers/env';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get URLs from environment variables
const frontendUrl = getFrontendUrl();
const apiBaseUrl = getApiBaseUrl();

export default defineConfig({
  globalSetup: '../global-setup.ts',
  testDir: '../specs',
  outputDir: '../test-results',
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',
  use: {
    baseURL: frontendUrl,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    headless: false,
    launchOptions: {
      slowMo: 100, // Slow down execution by 100ms
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  // Don't start web servers automatically, assume they're already running
  // webServer: [
  //   {
  //     command: 'cd ../frontend && npm run dev',
  //     port: parseInt(frontendUrl.split(':')[2] || '5173'),
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'cd ../backend && npm run dev',
  //     port: parseInt(apiBaseUrl.split(':')[2] || '3001'),
  //     reuseExistingServer: !process.env.CI,
  //   }
  // ],
});
