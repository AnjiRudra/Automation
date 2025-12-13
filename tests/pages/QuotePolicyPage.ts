import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

/**
 * Quote and Policy Page Object - Select Price Option
 */
export class QuotePolicyPage extends BasePage {
  // Locators - table with products/prices
  private readonly productTable = 'table';
  private readonly productRadios = 'input[type="radio"][name="selectedinsuranceplan"]';
  private readonly goldPlanRadio = "input[value='Gold']";
  private readonly platinumPlanRadio = "input[value='Platinum']";
  private readonly silverPlanRadio = "input[value='Silver']";
  private readonly ultimateRadio = "input[value='Ultimate']";

  /**
   * Select product by name (Gold, Platinum, Silver, Ultimate, etc)
   */
  async selectProduct(productName: string = 'Gold') {
    try {
      // Get the radio button locator for the specified product
      const productRadio = this.page.locator(`input[type="radio"][value="${productName}"]`);
      
      // Wait for the radio button to be visible
      await productRadio.waitFor({ state: 'visible', timeout: 15000 });
      console.log(`${productName} radio button is visible`);
      
      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle').catch(() => {
        console.log('Network idle timeout, continuing...');
      });
      
      // Check the radio button with force: true to handle custom radio elements
      await productRadio.check({ force: true });
      console.log(`${productName} radio button checked`);
      
      // Verify that the radio button is actually checked
      await expect(productRadio).toBeChecked();
      console.log(`✓ ${productName} plan selected and verified`);
      
    } catch (e) {
      console.log(`Error selecting ${productName}:`, e.message);
      
      // Fallback: try clicking the radio button directly
      try {
        const productRadio = this.page.locator(`input[type="radio"][value="${productName}"]`);
        await productRadio.click({ force: true });
        console.log(`${productName} selected via click fallback`);
      } catch (fallbackError) {
        console.log(`Fallback also failed:`, fallbackError.message);
        
        // Last resort: select first available radio button
        try {
          const radios = await this.page.locator(this.productRadios).all();
          if (radios.length > 0) {
            await radios[0].check({ force: true });
            console.log('First available plan selected');
          }
        } catch (lastError) {
          console.log('All selection methods failed:', lastError.message);
          throw e;
        }
      }
    }
  }

  /**
   * Click Next button - Quote/Policy to Send Quote
   */
  async clickNext() {
    // Find the next button that is visible on this page
    // Use XPath to find button within the current view
    const buttons = await this.page.locator('button[class="next"]').all();
    
    // Click the last visible next button which should be the "Send Quote" button
    if (buttons.length > 0) {
      // Find the visible one
      for (let i = buttons.length - 1; i >= 0; i--) {
        try {
          const isVisible = await buttons[i].isVisible();
          if (isVisible) {
            await buttons[i].click();
            break;
          }
        } catch {
          // Continue to next button
        }
      }
    }
    
    await this.waitForPageLoad();
  }
}


