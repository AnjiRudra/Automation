import { test } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { HomePage } from './pages/HomePage';
import { VehicleDataPage } from './pages/VehicleDataPage';
import { InsuredDataPage } from './pages/InsuredDataPage';
import { InsuranceDataPage } from './pages/InsuranceDataPage';
import { QuotePolicyPage } from './pages/QuotePolicyPage';
import { SendQuotePage } from './pages/SendQuotePage';

test('Insurance Quote Form - Complete Workflow', async ({ page }) => {
  // Set timeout for the entire test
  test.setTimeout(120000); // 2 minutes

  // Set fullscreen viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Load test data from CSV
  const csvPath = path.join(__dirname, 'testdata.csv');
  const testData = await readCSVRow(csvPath, 0);

  // Step 1: Navigate to Home and select Automobile
  const homePage = new HomePage(page);
  await homePage.startQuote();
  await page.screenshot({ path: './screenshots/01-home-page.png' });

  // Step 2: Fill Vehicle Data
  const vehiclePage = new VehicleDataPage(page);
  await vehiclePage.fillVehicleData(testData);
  await page.screenshot({ path: './screenshots/02-vehicle-data.png' });
  await vehiclePage.clickNext();

  // Step 3: Fill Insured Data
  const insuredPage = new InsuredDataPage(page);
  await insuredPage.fillInsuredData(testData);
  await page.screenshot({ path: './screenshots/03-insured-data.png' });
  await insuredPage.clickNext();

  // Step 4: Fill Insurance Data
  const insurancePage = new InsuranceDataPage(page);
  await insurancePage.fillInsuranceData(testData);
  await page.screenshot({ path: './screenshots/04-insurance-data.png' });
  await insurancePage.clickNext();

  // Step 5: Select Quote and Policy
  const quotePage = new QuotePolicyPage(page);
  await quotePage.selectProduct('Silver');
  await page.screenshot({ path: './screenshots/05-quote-policy.png' });
  await quotePage.clickNext();

  // Step 6: Send Quote
  const sendQuotePage = new SendQuotePage(page);
  await sendQuotePage.fillQuoteData(testData);
  await page.screenshot({ path: './screenshots/06-send-quote.png' });
  await sendQuotePage.completeSubmission();
  await page.screenshot({ path: './screenshots/07-submission-complete.png' });
});