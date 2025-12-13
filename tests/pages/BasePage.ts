import { Page } from '@playwright/test';

/**
 * Base Page class with common functionality
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(timeout: number = 5000) {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Click element
   */
  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  /**
   * Fill text input
   */
  async fill(selector: string, value: string) {
    await this.page.locator(selector).click();
    await this.page.locator(selector).fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }

  /**
   * Press key
   */
  async pressKey(selector: string, key: string, delay: number = 0) {
    if (delay > 0) {
      await this.page.locator(selector).press(key, { delay });
    } else {
      await this.page.locator(selector).press(key);
    }
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }
}
