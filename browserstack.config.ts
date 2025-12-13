/**
 * BrowserStack Configuration for Running Tests on Real Devices
 * Supports real Safari on macOS and other browsers
 */

export const browserStackConfig = {
  // BrowserStack credentials (set via environment variables)
  userName: process.env.BROWSERSTACK_USERNAME || '',
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY || '',
  
  // Server settings
  server: 'https://cdp.browserstack.com',
  
  // Capabilities for different browsers/devices
  capabilities: {
    // Real Safari on macOS
    'safari-macos': {
      browserName: 'safari',
      'bstack:options': {
        os: 'OS X',
        osVersion: '15',  // macOS Sequoia
        browserVersion: 'latest',
        deviceType: 'desktop',
        realMobile: false,
        projectName: 'Playwright Insurance Quote Test',
        buildName: 'Insurance Quote BDD - Safari macOS',
        sessionName: 'Safari on macOS - Insurance Quote Workflow',
        debug: 'true',
        networkLogs: 'true',
        consoleLogs: 'true'
      }
    },
    
    // Chrome on macOS
    'chrome-macos': {
      browserName: 'chrome',
      'bstack:options': {
        os: 'OS X',
        osVersion: '15',
        browserVersion: 'latest',
        realMobile: false
      }
    },
    
    // Firefox on macOS
    'firefox-macos': {
      browserName: 'firefox',
      'bstack:options': {
        os: 'OS X',
        osVersion: '15',
        browserVersion: 'latest',
        realMobile: false
      }
    },
    
    // iPhone Safari (real device)
    'iphone-safari': {
      browserName: 'safari',
      'bstack:options': {
        osVersion: '18',
        deviceName: 'iPhone 16 Pro',
        realMobile: true,
        projectName: 'Playwright Insurance Quote Test'
      }
    },
    
    // iPad Safari (real device)
    'ipad-safari': {
      browserName: 'safari',
      'bstack:options': {
        osVersion: '18',
        deviceName: 'iPad Pro (12.9) 7th Gen',
        realMobile: true,
        projectName: 'Playwright Insurance Quote Test'
      }
    }
  },
  
  // Test configurations
  testConfig: {
    timeout: 120000,  // 2 minutes
    retries: 1,
    workers: 1,
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};

export const getBrowserStackCapability = (browserType: string) => {
  return browserStackConfig.capabilities[browserType];
};

export const getBrowserStackUrl = () => {
  if (!browserStackConfig.userName || !browserStackConfig.accessKey) {
    throw new Error('BrowserStack credentials not set. Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables.');
  }
  
  return `https://${browserStackConfig.userName}:${browserStackConfig.accessKey}@${browserStackConfig.server}`;
};
