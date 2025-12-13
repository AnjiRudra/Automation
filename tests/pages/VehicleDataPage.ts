import { BasePage } from './BasePage';
import { TestData } from '../csvReader';

/**
 * Vehicle Data Page Object
 */
export class VehicleDataPage extends BasePage {
  // Locators
  private readonly makeDropdown = '#make';
  private readonly enginePerformanceInput = '#engineperformance';
  private readonly dateOfManufactureInput = '#dateofmanufacture';
  private readonly seatsDropdown = '#numberofseats';
  private readonly fuelDropdown = '#fuel';
  private readonly listpriceInput = '#listprice';
  private readonly licenseplateInput = '#licenseplatenumber';
  private readonly annualmileageInput = '#annualmileage';

  /**
   * Fill vehicle data
   */
  async fillVehicleData(testData: TestData) {
    await this.waitForElement(this.makeDropdown);
    
    // Fill basic vehicle info
    await this.selectOption(this.makeDropdown, testData.make);
    await this.click(this.enginePerformanceInput);
    await this.page.locator(this.enginePerformanceInput).fill(testData.enginePerformance);
    
    // Date of Manufacture - fill with proper format
    await this.page.locator(this.dateOfManufactureInput).fill('01/01/2000');
    await this.page.waitForTimeout(500);
    
    // Vehicle specifications
    await this.selectOption(this.seatsDropdown, testData.numberofseats);
    await this.selectOption(this.fuelDropdown, testData.fuel);
    
    // Price information
    await this.click(this.listpriceInput);
    await this.page.locator(this.listpriceInput).fill(testData.listprice);
    
    // License plate and mileage
    await this.click(this.licenseplateInput);
    await this.page.locator(this.licenseplateInput).fill(testData.licenseplatenumber);
    await this.pressKey(this.licenseplateInput, 'Tab');
    
    await this.page.locator(this.annualmileageInput).fill(testData.annualmileage);
  }

  /**
   * Click Next button - Vehicle Data to Insured Data
   */
  async clickNext() {
    // Click the first 'Next' button which leads to Insured Data
    await this.page.locator('button[class="next button"]').first().click();
    await this.waitForPageLoad();
  }
}


