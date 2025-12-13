# BrowserStack Cloud Testing Guide

## Overview

This guide explains how to run your Playwright insurance quote tests on real devices in the cloud using BrowserStack. This allows you to test on:

✅ **Real Safari on macOS** (multiple versions)
✅ **iOS Safari on real iPhones/iPads**
✅ **Chrome on macOS**
✅ **Firefox on macOS**
✅ **Other browsers and devices**

---

## Why Use BrowserStack?

1. **Real Devices** - Test on actual macOS machines and iOS devices
2. **Multiple OS Versions** - Test across different macOS and iOS versions
3. **No Local Setup** - No need to have a Mac machine
4. **Debugging** - Built-in logs, screenshots, and video recordings
5. **CI/CD Integration** - Easily integrate with your pipeline

---

## Prerequisites

### 1. Create BrowserStack Account

1. Visit [BrowserStack.com](https://www.browserstack.com)
2. Sign up for a free account
3. Get your username and access key from the dashboard

### 2. Set Environment Variables

#### On Windows (PowerShell):
```powershell
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"
```

#### On Windows (CMD):
```cmd
set BROWSERSTACK_USERNAME=your_username
set BROWSERSTACK_ACCESS_KEY=your_access_key
```

#### On macOS/Linux (Bash):
```bash
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
```

#### Permanent Setup (Optional)
Add to your `.env` file or shell profile (`.bashrc`, `.zshrc`):
```bash
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
```

---

## Available Test Commands

### Run on Local WebKit (Default)
```bash
npm run test:webkit
```

### Run on Real Safari on macOS
```bash
npm run test:safari-macos
```

### Run on Chrome on macOS
```bash
npm run test:chrome-macos
```

### Run on iPhone Safari (Real Device)
```bash
npm run test:iphone-safari
```

### Run Cucumber BDD Tests
```bash
npm test
```

---

## Configuration Details

### Safari on macOS Configuration

```typescript
{
  browserName: 'safari',
  'bstack:options': {
    os: 'OS X',
    osVersion: '15',           // macOS Sequoia
    browserVersion: 'latest',
    deviceType: 'desktop',
    realMobile: false,
    projectName: 'Playwright Insurance Quote Test',
    buildName: 'Insurance Quote BDD',
    sessionName: 'Safari on macOS',
    debug: 'true',
    networkLogs: 'true',
    consoleLogs: 'true'
  }
}
```

### iPhone Safari Configuration

```typescript
{
  browserName: 'safari',
  'bstack:options': {
    osVersion: '18',
    deviceName: 'iPhone 16 Pro',
    realMobile: true,
    projectName: 'Playwright Insurance Quote Test'
  }
}
```

### iPad Configuration

```typescript
{
  browserName: 'safari',
  'bstack:options': {
    osVersion: '18',
    deviceName: 'iPad Pro (12.9) 7th Gen',
    realMobile: true,
    projectName: 'Playwright Insurance Quote Test'
  }
}
```

---

## Step-by-Step: Running Tests on BrowserStack

### Step 1: Set Environment Variables

**Windows (PowerShell):**
```powershell
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"
```

### Step 2: Run Test on Safari macOS

```bash
npm run test:safari-macos
```

### Step 3: Monitor Execution

You'll see output like:
```
Running 1 test using 1 worker
[Safari-macOS-BrowserStack] › tests\Tricentisdemowebsite.spec.ts
✓ Successfully loaded 1 test data row(s)
✓ Silver plan selected and verified
✓ Quote saved to database with ID: 1
  1 passed (45.2s)
```

### Step 4: View Results

1. Check the HTML report:
```bash
npx playwright show-report
```

2. Visit BrowserStack Dashboard to see:
   - Session videos
   - Screenshots
   - Network logs
   - Console logs

---

## Example: Complete Flow

```bash
# 1. Set credentials
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"

# 2. Run test on Safari macOS
npm run test:safari-macos

# 3. Generate PDF report
npm run generate-pdf

# 4. View HTML report
npx playwright show-report
```

---

## BrowserStack Capabilities Matrix

### macOS Versions
- macOS Sequoia (15)
- macOS Sonoma (14)
- macOS Ventura (13)
- macOS Monterey (12)

### iOS Versions
- iOS 18 (latest)
- iOS 17
- iOS 16

### Devices
- MacBook Pro
- MacBook Air
- iMac
- iPad Pro
- iPad Air
- iPhone 16 Pro
- iPhone 16
- iPhone 15
- And many more...

To view all available devices, visit: https://www.browserstack.com/list-of-browsers

---

## Troubleshooting

### Error: "BrowserStack credentials not set"

**Solution:** Set environment variables:
```powershell
$env:BROWSERSTACK_USERNAME = "your_username"
$env:BROWSERSTACK_ACCESS_KEY = "your_access_key"
```

### Connection Timeout

**Solution:** 
- Check internet connection
- Verify credentials are correct
- Try again in a few moments

### Test Fails on Cloud but Works Locally

**Possible causes:**
- Different OS/browser behavior
- Network/website differences
- Viewport differences

**Solution:**
- Check BrowserStack screenshots
- Review console logs
- Update selectors if needed

### Session Limit Exceeded

**Solution:** 
- Upgrade your BrowserStack plan
- Wait for sessions to expire
- Close unused sessions in dashboard

---

## Advanced: Custom Configurations

### Add More Devices

Edit `browserstack.config.ts`:

```typescript
'android-chrome': {
  browserName: 'chromium',
  'bstack:options': {
    osVersion: '14',
    deviceName: 'Samsung Galaxy S24',
    realMobile: true
  }
}
```

### Enable Debugging

```typescript
'bstack:options': {
  debug: 'true',
  networkLogs: 'true',
  consoleLogs: 'errors'
}
```

### Set Timeouts

```typescript
use: {
  navigationTimeout: 30000,
  actionTimeout: 10000
}
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Run Tests on BrowserStack

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run test:safari-macos
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## Performance Tips

1. **Run single browser at a time** - Avoid parallel execution for better stability
2. **Set appropriate timeouts** - Default 120 seconds should be fine
3. **Use screenshots strategically** - Only on failure to save time
4. **Batch similar tests** - Group tests by browser type
5. **Monitor session usage** - Check BrowserStack dashboard

---

## Cost Optimization

- **Free Plan:** Limited manual sessions
- **Monthly Plan:** Unlimited automated tests
- **Pay-as-you-go:** Good for occasional testing

Recommended for continuous integration: Monthly plan

---

## File Structure

```
d:\Playwright\
├── browserstack.config.ts           # BrowserStack capabilities
├── playwright-browserstack.config.ts # Playwright config with BS
├── playwright.config.ts              # Local config
├── package.json                      # Scripts for BS tests
└── tests/
    └── Tricentisdemowebsite.spec.ts # Main test
```

---

## Useful Links

- **BrowserStack Documentation:** https://www.browserstack.com/docs
- **Playwright + BrowserStack:** https://www.browserstack.com/docs/automate/selenium/playwright
- **Available Devices:** https://www.browserstack.com/list-of-browsers
- **Local Testing:** https://www.browserstack.com/local-testing

---

## Next Steps

1. ✅ Create BrowserStack account
2. ✅ Set environment variables
3. ✅ Run: `npm run test:safari-macos`
4. ✅ Monitor in BrowserStack dashboard
5. ✅ View reports and videos
6. ✅ Integrate with CI/CD

---

## Support

For issues:
1. Check BrowserStack status page
2. Review session logs in dashboard
3. Check network logs
4. Contact BrowserStack support with session ID

---

## Quick Reference

```bash
# Setup
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"

# Run tests
npm run test:safari-macos      # Safari on macOS
npm run test:chrome-macos      # Chrome on macOS
npm run test:iphone-safari     # iPhone Safari
npm run test:webkit            # Local WebKit

# View results
npx playwright show-report
```
