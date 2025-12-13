import { BasePage } from './BasePage';
import { TestData } from '../csvReader';

/**
 * Insured Data Page Object
 */
export class InsuredDataPage extends BasePage {
  // Locators
  private readonly firstnameInput = '#firstname';
  private readonly lastnameInput = '#lastname';
  private readonly dobInput = "#birthdate"; // Specific ID for date of birth
  private readonly genderRadio = '.ideal-radio';
  private readonly streetaddressInput = '#streetaddress';
  private readonly countryDropdown = '#country';
  private readonly zipcodeInput = '#zipcode';
  private readonly cityInput = '#city';
  private readonly occupationDropdown = '#occupation';
  private readonly checkboxes = '.ideal-check';
  private readonly websiteInput = '#website';

  /**
   * Fill insured data
   */
  async fillInsuredData(testData: TestData) {
    await this.waitForElement(this.firstnameInput);
    
    // Personal information
    await this.fill(this.firstnameInput, testData.firstname);
    await this.pressKey(this.firstnameInput, 'Tab');
    await this.page.locator(this.lastnameInput).fill(testData.lastname);
    
    // Date of birth - using specific ID
    await this.page.locator(this.dobInput).fill(testData.dateofbirth);
    
    // Gender selection - click first radio button
    await this.page.locator(this.genderRadio).first().click();
    
    // Address information
    await this.fill(this.streetaddressInput, testData.streetaddress);
    await this.selectOption(this.countryDropdown, testData.country);
    await this.click(this.zipcodeInput);
    await this.page.locator(this.zipcodeInput).fill(testData.zipcode);
    await this.pressKey(this.zipcodeInput, 'Tab');
    await this.page.locator(this.cityInput).fill(testData.city);
    
    // Occupation and interests
    await this.selectOption(this.occupationDropdown, testData.occupation);
    
    // Check interests (first 3 checkboxes)
    const checkboxes = await this.page.locator("label > .ideal-check").all();
    if (checkboxes.length >= 3) {
      await checkboxes[0].click();
      await checkboxes[1].click();
      await checkboxes[2].click();
    }
    
    // Website
    await this.fill(this.websiteInput, testData.website);
  }

  /**
   * Click Next button - Insured Data to Insurance Data
   */
  async clickNext() {
    // Use the ID or name attribute which changes for each page
    // For Insured Data page, it should be: nextenterproductdata
    await this.page.locator('button[name*="Product"]').first().click();
    await this.waitForPageLoad();
  }
}


