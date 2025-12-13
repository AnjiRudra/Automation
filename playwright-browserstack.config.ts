import { defineConfig, devices } from '@playwright/test';
import { getBrowserStackUrl, getBrowserStackCapability } from './browserstack.config';

/**
 * Playwright configuration for local and cloud testing
 * Supports local WebKit and cloud BrowserStack (Safari on macOS, iOS, etc.)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    headless: false,
  },

  projects: [
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // BrowserStack - Safari on macOS (Real Machine)
    ...(process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY
      ? [
          {
            name: 'Safari-macOS-BrowserStack',
            use: {
              connectOptions: {
                wsEndpoint: getBrowserStackUrl() + '/connect',
              },
            },
          },
          {
            name: 'Chrome-macOS-BrowserStack',
            use: {
              connectOptions: {
                wsEndpoint: getBrowserStackUrl() + '/connect',
              },
            },
          },
          {
            name: 'iPhone-Safari-BrowserStack',
            use: {
              connectOptions: {
                wsEndpoint: getBrowserStackUrl() + '/connect',
              },
            },
          },
        ]
      : []),
  ],
});
