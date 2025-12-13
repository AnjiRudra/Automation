import { World } from '@cucumber/cucumber';
import { Page, Browser, BrowserContext } from '@playwright/test';

export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
}
