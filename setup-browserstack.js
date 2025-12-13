#!/usr/bin/env node

/**
 * BrowserStack Setup Script
 * Helps configure credentials and validate connection
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setupBrowserStack() {
  console.log('\n🚀 BrowserStack Setup for Playwright Tests\n');
  console.log('This script will help you configure BrowserStack credentials.\n');

  // Check if credentials already exist
  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

  if (username && accessKey) {
    console.log('✅ BrowserStack credentials already configured!');
    console.log(`   Username: ${username}\n`);
    const override = await prompt('Override existing credentials? (y/n): ');
    if (override.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  }

  console.log('Please get your credentials from: https://www.browserstack.com/accounts/settings\n');

  const newUsername = await prompt('BrowserStack Username: ');
  const newAccessKey = await prompt('BrowserStack Access Key: ');

  if (!newUsername || !newAccessKey) {
    console.log('❌ Credentials cannot be empty!');
    rl.close();
    return;
  }

  // Create .env file
  const envPath = path.join(__dirname, '.env');
  const envContent = `BROWSERSTACK_USERNAME=${newUsername}\nBROWSERSTACK_ACCESS_KEY=${newAccessKey}\n`;

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ Credentials saved to .env file`);

  // Update environment
  process.env.BROWSERSTACK_USERNAME = newUsername;
  process.env.BROWSERSTACK_ACCESS_KEY = newAccessKey;

  // Validate connection
  console.log('\nTesting connection...');
  try {
    const https = require('https');
    const auth = Buffer.from(`${newUsername}:${newAccessKey}`).toString('base64');

    const options = {
      hostname: 'api.browserstack.com',
      path: '/automate/sessions.json?status=running&limit=1',
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`
      }
    };

    https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Connection successful!\n');
        displayAvailableTests();
      } else {
        console.log(`❌ Connection failed (${res.statusCode})`);
        console.log('   Check your credentials and try again.\n');
      }
      rl.close();
    }).on('error', (err) => {
      console.log(`❌ Error: ${err.message}\n`);
      rl.close();
    }).end();
  } catch (err) {
    console.log(`❌ Error: ${err.message}\n`);
    rl.close();
  }
}

function displayAvailableTests() {
  console.log('Available test commands:\n');
  console.log('  npm run test:safari-macos     - Run on Safari on macOS');
  console.log('  npm run test:chrome-macos     - Run on Chrome on macOS');
  console.log('  npm run test:iphone-safari    - Run on iPhone Safari\n');
  console.log('Example:');
  console.log('  npm run test:safari-macos\n');
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled.');
  rl.close();
  process.exit(0);
});

setupBrowserStack();
