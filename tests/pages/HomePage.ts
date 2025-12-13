import { BasePage } from './BasePage';

/**
 * Home Page Object
 */
export class HomePage extends BasePage {
  // Locators
  private readonly automobileLink = 'a#nav_automobile';

  /**
   * Navigate to application
   */
  async navigate(url: string = 'https://sampleapp.tricentis.com/101/app.php') {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Click Automobile link to start quote process
   */
  async clickAutomobile() {
    // Select first occurrence of the automobile link
    await this.page.locator(this.automobileLink).first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(this.automobileLink).first().click();
    await this.waitForPageLoad();
    // Wait for Vehicle data page to load (wait for make dropdown)
    await this.page.locator('#make').waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Start automation quote
   */
  async startQuote(url?: string) {
    await this.navigate(url);
    await this.clickAutomobile();
  }
}
