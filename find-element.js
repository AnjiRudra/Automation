#!/usr/bin/env node

/**
 * Element Inspector Script
 * Helps you find the correct selector for the download button
 * 
 * Usage: npx playwright codegen https://www.tricentis.com/demo-application/
 */

const { chromium } = require('playwright');

async function inspectPage() {
  console.log('\n📱 Playwright Inspector Guide\n');
  console.log('This script helps you find the download button selector.\n');
  
  console.log('Steps to record element:');
  console.log('1. Run: npx playwright codegen https://www.tricentis.com/demo-application/\n');
  
  console.log('2. In the browser window:');
  console.log('   - Fill vehicle form → Next');
  console.log('   - Fill insured form → Next');
  console.log('   - Fill insurance form → Next');
  console.log('   - Select Silver plan');
  console.log('   - Look for download button\n');
  
  console.log('3. In the Inspector (right side):');
  console.log('   - Hover over the download button');
  console.log('   - Inspector highlights the HTML element');
  console.log('   - Look for: id, class, name, or text attributes\n');
  
  console.log('4. When you find it, look for patterns like:');
  console.log('   ✓ id="downloadQuote"           → id*="download"');
  console.log('   ✓ class="btn-download"         → class*="download"');
  console.log('   ✓ Download Quote (text)        → :has-text("Download")');
  console.log('   ✓ href="quote.pdf"             → href*="pdf"\n');
  
  console.log('5. Tell me the selector and I\'ll update the code!\n');
  
  console.log('📌 Pro Tips:');
  console.log('   • Use browser DevTools (F12) to inspect');
  console.log('   • Right-click → "Inspect Element"');
  console.log('   • Look in the Elements tab for exact selectors');
  console.log('   • Take a screenshot if needed\n');
}

inspectPage();
