import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for PDF validation tests in headed mode
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120000, // 2 minutes per test
  fullyParallel: false, // Run tests sequentially for better observation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: './test-results/results.xml' }]
  ],
  use: {
    baseURL: 'https://sampleapp.tricentis.com/101/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // Run in headed mode to see the PDF validation
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium-headed',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
        headless: false, // Force headed mode
        slowMo: 1000, // Slow down actions for better visibility
      },
    },
  ],
  
  // Output directory for test artifacts
  outputDir: './test-results/',
});