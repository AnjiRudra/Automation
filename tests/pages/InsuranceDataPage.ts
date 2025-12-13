import { BasePage } from './BasePage';
import { TestData } from '../csvReader';

/**
 * Insurance Data Page Object
 */
export class InsuranceDataPage extends BasePage {
  // Locators
  private readonly startDateInput = '#startdate';
  private readonly insurancesumDropdown = '#insurancesum';
  private readonly meriteratingDropdown = '#meritrating';
  private readonly damageinsuranceDropdown = '#damageinsurance';
  private readonly euroProtectionCheckbox = "input[id='EuroProtection']";
  private readonly legalDefenseCheckbox = "input[id='LegalDefenseInsurance']";
  private readonly courtesycarDropdown = '#courtesycar';

  /**
   * Calculate date more than 2 months from today (using 3 months for safety)
   */
  private getDateOneMonthFromNow(): string {
    const today = new Date();
    // Add 3 months to ensure it's more than 2 months in the future
    const futureDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    // Format as MM/DD/YYYY
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    const year = futureDate.getFullYear();
    
    return `${month}/${day}/${year}`;
  }

  /**
   * Fill insurance data
   */
  async fillInsuranceData(testData: TestData) {
    // Wait for start date input
    await this.waitForElement(this.startDateInput);
    
    // Fill start date with one month from now
    const startDate = this.getDateOneMonthFromNow();
    await this.page.locator(this.startDateInput).fill(startDate);
    await this.page.waitForTimeout(500);
    
    // Scroll into view to ensure elements are visible
    await this.page.locator(this.insurancesumDropdown).scrollIntoViewIfNeeded();
    
    // Insurance options
    await this.selectOption(this.insurancesumDropdown, testData.insurancesum);
    await this.selectOption(this.meriteratingDropdown, testData.meritrating);
    await this.selectOption(this.damageinsuranceDropdown, testData.damageinsurance);
    
    // Optional products - select checkboxes for Euro Protection and Legal Defense Insurance
    try {
      // Click the ideal-check span instead of the input directly
      const euroCheckboxLabel = await this.page.locator('#EuroProtection').locator('..').locator('.ideal-check');
      await euroCheckboxLabel.click().catch(async () => {
        // Try clicking the span associated with the checkbox
        const span = await this.page.locator("input[id='EuroProtection']").evaluate((el) => {
          const parent = el.closest('label');
          return parent?.querySelector('.ideal-check');
        });
        if (span) {
          await this.page.locator("input[id='EuroProtection']").click({ force: true });
        }
      });
      console.log('Euro Protection checkbox selected');
    } catch (e) {
      console.log('Euro Protection checkbox click failed:', e.message);
    }
    
    try {
      // Click the ideal-check span instead of the input directly
      const legalCheckboxLabel = await this.page.locator('#LegalDefenseInsurance').locator('..').locator('.ideal-check');
      await legalCheckboxLabel.click().catch(async () => {
        // Try clicking the span associated with the checkbox
        const span = await this.page.locator("input[id='LegalDefenseInsurance']").evaluate((el) => {
          const parent = el.closest('label');
          return parent?.querySelector('.ideal-check');
        });
        if (span) {
          await this.page.locator("input[id='LegalDefenseInsurance']").click({ force: true });
        }
      });
      console.log('Legal Defense Insurance checkbox selected');
    } catch (e) {
      console.log('Legal Defense Insurance checkbox click failed:', e.message);
    }
    
    // Scroll to courtesy car and make sure it's visible
    await this.page.locator(this.courtesycarDropdown).scrollIntoViewIfNeeded();
    
    // Courtesy car option
    await this.selectOption(this.courtesycarDropdown, testData.courtesycar);
  }

  /**
   * Click Next button - Insurance Data to Quote/Policy
   */
  async clickNext() {
    // Find and click the next visible button on this page
    const buttons = await this.page.locator('button[class="next"]').all();
    
    // Click the first visible button
    if (buttons.length > 0) {
      for (let i = 0; i < buttons.length; i++) {
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


