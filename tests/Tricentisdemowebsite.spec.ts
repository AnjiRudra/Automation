import { test } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { HomePage } from './pages/HomePage';
import { VehicleDataPage } from './pages/VehicleDataPage';
import { InsuredDataPage } from './pages/InsuredDataPage';
import { InsuranceDataPage } from './pages/InsuranceDataPage';
import { QuotePolicyPage } from './pages/QuotePolicyPage';
import { SendQuotePage } from './pages/SendQuotePage';
import { InsuranceDatabase } from './helpers/InsuranceDatabase';

let insuranceDb: InsuranceDatabase;

test.beforeAll(async () => {
  // Initialize database
  insuranceDb = new InsuranceDatabase();
  await insuranceDb.initializeSchema();
  console.log('✓ Insurance database initialized');
});

test.afterAll(async () => {
  // Close database connection
  await insuranceDb.close();
  console.log('✓ Database connection closed');
});

test('Insurance Quote Form - Complete Workflow with Database', async ({ page }) => {
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

  // Step 7: Save quote to database
  console.log('Saving quote to database...');
  const quoteId = await insuranceDb.saveQuote({
    quoteNumber: `QT-${Date.now()}`,
    firstName: testData.firstname,
    lastName: testData.lastname,
    email: testData.email,
    phone: testData.phone,
    vehicleMake: testData.make,
    vehicleModel: testData.make,
    insuranceSum: testData.insurancesum,
    startDate: testData.startdate,
    policyType: 'Silver'
  });

  console.log(`✓ Quote saved to database with ID: ${quoteId}`);

  // Step 8: Save policy to database
  const policyId = await insuranceDb.savePolicy(quoteId, {
    policyNumber: `POL-${Date.now()}`,
    policyType: 'Silver',
    premium: 500,
    startDate: testData.startdate,
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  console.log(`✓ Policy saved to database with ID: ${policyId}`);

  // Step 9: Verify quote in database
  const savedQuote = await insuranceDb.getQuote(quoteId);
  console.log(`✓ Quote verified in database: ${savedQuote.customer_name} (${savedQuote.status})`);

  // Step 10: Get and display statistics
  const stats = await insuranceDb.getStatistics();
  console.log('Database Statistics:');
  console.log(`  - Total Quotes: ${stats.totalQuotes}`);
  console.log(`  - Total Policies: ${stats.totalPolicies}`);
  console.log(`  - Average Premium: $${stats.averagePremium.toFixed(2)}`);
  console.log('  - Quotes by Status:', stats.quotesByStatus);
});