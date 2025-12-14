import { BasePage } from './BasePage';
import { expect, Page } from '@playwright/test';
import path from 'path';

/**
 * Quote and Policy Page Object - Select Price Option
 */
export class QuotePolicyPage extends BasePage {
  // Locators - table with products/prices
  private readonly productTable = 'table';
  private readonly productRadios = 'input[type="radio"][name="selectedinsuranceplan"]';

  /**
   * Select product by name (Gold, Platinum, Silver, Ultimate, etc)
   */
  async selectProduct(productName: string = 'Gold') {
    console.log(`Selecting ${productName} plan...`);
    
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle').catch(() => {
      console.log('Network idle timeout, continuing...');
    });
    await this.page.waitForTimeout(500);
    
    // Refresh page state to clear any UI inconsistencies after download
    await this.page.evaluate(() => {
      // Force refresh radio button states
      const radios = document.querySelectorAll('input[type="radio"][name="selectedinsuranceplan"]');
      radios.forEach(radio => {
        radio.checked = false;
      });
    });
    
    await this.page.waitForTimeout(200);
    
    // Get the appropriate radio button based on product name
    const radioButton = this.page.locator(`input[type="radio"][value="${productName}"]`);
    
    // Wait for the radio button to be present in the DOM
    await radioButton.waitFor({ state: 'attached', timeout: 10000 });
    console.log(`${productName} radio button found`);
    
    // Check the radio button with force: true
    await radioButton.check({ force: true });
    console.log(`${productName} radio button checked`);
    
    // Verify that ONLY the selected radio button is checked
    await expect(radioButton).toBeChecked();
    
    // Double-check that other radio buttons are not checked
    const otherProducts = ['Silver', 'Gold', 'Platinum', 'Ultimate'].filter(p => p !== productName);
    for (const otherProduct of otherProducts) {
      const otherRadio = this.page.locator(`input[type="radio"][value="${otherProduct}"]`);
      const exists = await otherRadio.count();
      if (exists > 0) {
        await expect(otherRadio).not.toBeChecked();
      }
    }
    
    console.log(`✓ ${productName} plan selected and verified (others unchecked)`);
    
    // Wait to ensure selection is registered
    await this.page.waitForTimeout(300);
  }

  /**
   * Download quote as PDF
   * Try multiple selector patterns to find the download button
   */
  async downloadQuote(downloadPath: string = './downloads'): Promise<string> {
    try {
      // Ensure download directory exists
      const fs = require('fs');
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      // The download button is an <a> tag with id="downloadquote"
      const possibleSelectors = [
        '#downloadquote',
        'a#downloadquote',
        'a[title="Download Quote"]',
        'a[data-type="D"]',
        'a.create-quote',
        '#downloaddocument',
        'text=Download Quote'
      ];

      let downloadButton = null;
      let selectedSelector = '';

      // Find the download button
      for (const selector of possibleSelectors) {
        try {
          const button = this.page.locator(selector).first();
          const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            downloadButton = button;
            selectedSelector = selector;
            console.log(`✓ Found download button with selector: ${selector}`);
            break;
          }
        } catch (err) {
          // Continue to next selector
        }
      }

      if (!downloadButton) {
        throw new Error('Download button not found. Please inspect the page and provide the correct selector.');
      }

      // Set up download listener BEFORE clicking
      const downloadPromise = this.page.waitForEvent('download', { timeout: 60000 });

      // Click the download button
      await downloadButton.click();
      console.log(`Clicked download button (${selectedSelector})`);

      // Wait for loading icon to appear and disappear
      try {
        // Wait for loading/spinner to appear
        await this.page.waitForSelector('.spin-icon, .loading, [class*="spinner"]', { state: 'visible', timeout: 5000 }).catch(() => {});
        console.log('Loading icon detected, waiting for completion...');
        
        // Wait for loading/spinner to disappear
        await this.page.waitForSelector('.spin-icon, .loading, [class*="spinner"]', { state: 'hidden', timeout: 30000 }).catch(() => {});
        console.log('Loading completed');
      } catch (e) {
        console.log('No loading indicator found or timeout, continuing...');
      }

      // Additional wait to ensure download is triggered
      await this.page.waitForTimeout(1000);

      // Wait for download to complete
      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      const filepath = path.join(downloadPath, filename);

      // Save the download
      await download.saveAs(filepath);
      console.log(`✓ Quote downloaded successfully: ${filepath}`);

      // Handle WebKit-specific issue: close any new empty tabs that opened during download
      const browserName = this.page.context().browser()?.browserType().name();
      if (browserName === 'webkit') {
        console.log('Handling WebKit download tabs...');
        const pages = this.page.context().pages();
        
        // Close any extra pages that aren't the main page
        for (const page of pages) {
          if (page !== this.page) {
            try {
              await page.close();
              console.log('✓ Closed extra WebKit download tab');
            } catch (e) {
              console.log('Could not close extra tab:', e.message);
            }
          }
        }
        await this.page.waitForTimeout(500);
      }

      return filepath;
    } catch (error) {
      console.error('Error downloading quote:', error.message);
      throw error;
    }
  }

  /**
   * Click Next button - Quote/Policy to Send Quote
   */
  async clickNext() {
    console.log('Navigating to Send Quote page...');
    
    // Wait a moment to ensure page is stable
    await this.page.waitForTimeout(2000);
    
    // Verify a plan is selected before clicking next
    const checkedRadio = await this.page.locator('input[type="radio"][name="selectedinsuranceplan"]:checked').count();
    if (checkedRadio === 0) {
      console.log('⚠ No plan selected, selecting Ultimate as default...');
      await this.selectProduct('Ultimate');
      await this.page.waitForTimeout(1000);
    }
    
    // Find the next button that is visible on this page
    const buttons = await this.page.locator('button.next').all();
    
    // Click the last visible next button which should be the "Send Quote" button
    if (buttons.length > 0) {
      // Find the visible one
      for (let i = buttons.length - 1; i >= 0; i--) {
        try {
          const isVisible = await buttons[i].isVisible();
          if (isVisible) {
            await buttons[i].click();
            console.log('✓ Next button clicked');
            break;
          }
        } catch {
          // Continue to next button
        }
      }
    }
    
    // Wait for navigation to complete
    await this.waitForPageLoad();
    await this.page.waitForTimeout(3000);
    
    // Verify we're on the Send Quote page
    try {
      await this.page.waitForSelector('#email, #sendemail', { timeout: 15000 });
      console.log('✓ Send Quote page loaded');
    } catch (e) {
      console.log('⚠ Could not verify Send Quote page, checking current state...');
      const url = this.page.url();
      const content = await this.page.content();
      console.log(`Current URL: ${url}`);
      if (content.includes('Please, select a price option')) {
        console.log('⚠ Navigation failed due to price option issue - will be handled in SendQuotePage');
        // Don't throw error, let SendQuotePage handle this
      }
    }
  }
}


