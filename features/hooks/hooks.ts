import { Before, After, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../support/world';
import { Page, Browser, BrowserContext } from '@playwright/test';
import { chromium } from '@playwright/test';

Before(async function (this: any) {
  this.browser = await chromium.launch({ headless: false });
  this.context = await this.browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  this.page = await this.context.newPage();
});

After(async function (this: any, { result }) {
  if (result?.status === Status.FAILED) {
    await this.page?.screenshot({ path: `screenshots/failure-${Date.now()}.png` });
  }
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});

