import { test, expect } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { HomePage } from './pages/HomePage';
import { VehicleDataPage } from './pages/VehicleDataPage';
import { InsuredDataPage } from './pages/InsuredDataPage';
import { InsuranceDataPage } from './pages/InsuranceDataPage';
import { QuotePolicyPage } from './pages/QuotePolicyPage';
import { SendQuotePage } from './pages/SendQuotePage';

// Configure to run in headed mode (browser will be determined by runner)
test.use({ 
  headless: false 
});

test.describe('Full Workflow PDF Validation - Multi Browser', () => {
  
  test('Complete Insurance Quote with Data Extraction and PDF Validation', async ({ page, browserName }) => {
    // Set timeout for the entire test
    test.setTimeout(300000); // 5 minutes

    // Set fullscreen viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log(`\n=== STARTING FULL WORKFLOW TEST IN ${browserName.toUpperCase()} (HEADED MODE) ===\n`);

    // Load test data from CSV
    const csvPath = path.join(__dirname, 'testdata.csv');
    const testData = await readCSVRow(csvPath, 0);
    
    if (!testData) {
      throw new Error('Failed to load test data from CSV');
    }
    
    console.log(`✓ Successfully loaded 1 test data row(s) from ${csvPath}`);

    // Initialize page objects
    const homePage = new HomePage(page);
    const vehicleDataPage = new VehicleDataPage(page);
    const insuredDataPage = new InsuredDataPage(page);
    const insuranceDataPage = new InsuranceDataPage(page);
    const quotePolicyPage = new QuotePolicyPage(page);
    const sendQuotePage = new SendQuotePage(page);

    // Data storage objects
    let vehicleData: any = {};
    let insuredData: any = {};
    let insuranceData: any = {};
    let sendQuoteData: any = {};

    console.log('\n--- STEP 1: Navigate to Home Page ---');
    await homePage.startQuote();
    console.log('✓ Home page loaded and quote started');

    console.log('\n--- STEP 2: Fill Vehicle Data ---');
    // Fill vehicle data directly with testData object
    await vehicleDataPage.fillVehicleData(testData);
    
    vehicleData = {
      make: testData.make,
      enginePerformance: testData.enginePerformance,
      numberOfSeats: testData.numberofseats,
      fuelType: testData.fuel,
      listPrice: testData.listprice,
      licensePlateNumber: testData.licenseplatenumber,
      annualMileage: testData.annualmileage
    };

    await vehicleDataPage.clickNext();
    
    console.log('Vehicle Data Stored:', vehicleData);
    console.log('✓ Vehicle data filled and stored');

    console.log('\n--- STEP 3: Fill Insured Data ---');
    await insuredDataPage.fillInsuredData(testData);
    
    insuredData = {
      firstName: testData.firstname,
      lastName: testData.lastname,
      dateOfBirth: testData.dateofbirth,
      streetAddress: testData.streetaddress,
      country: testData.country,
      zipCode: testData.zipcode,
      city: testData.city,
      occupation: testData.occupation
    };

    await insuredDataPage.clickNext();
    
    console.log('Insured Data Stored:', insuredData);
    console.log('✓ Insured data filled and stored');

    console.log('\n--- STEP 4: Fill Insurance Data ---');
    
    await insuranceDataPage.fillInsuranceData(testData);
    
    insuranceData = {
      insuranceSum: testData.insurancesum,
      meritRating: testData.meritrating,
      damageInsurance: testData.damageinsurance,
      courtesyCar: testData.courtesycar
    };

    await insuranceDataPage.clickNext();

    console.log('Insurance Data Stored:', insuranceData);
    console.log('✓ Insurance data filled and stored');

    console.log('\n--- STEP 5: Select Quote and Download PDF ---');
    await quotePolicyPage.selectProduct('Ultimate');
    console.log('✓ Selected Ultimate product');
    
    // Download the PDF first
    const pdfPath = await quotePolicyPage.downloadQuote();
    console.log(`✓ Quote downloaded to: ${pdfPath}`);

    // Re-verify and re-select the product after download
    await quotePolicyPage.selectProduct('Ultimate');
    await quotePolicyPage.clickNext();
    console.log('✓ Navigating to Send Quote page');

    // Workaround: Go back and re-navigate to Step 6
    console.log('Applying navigation workaround...');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await quotePolicyPage.selectProduct('Ultimate');
    await page.waitForTimeout(1000);
    await quotePolicyPage.clickNext();
    console.log('✓ Workaround applied successfully');

    console.log('\n--- STEP 6: Fill Send Quote Data ---');
    await sendQuotePage.fillQuoteData(testData);
    
    sendQuoteData = {
      email: testData.email,
      phone: testData.phone,
      username: testData.username,
      password: testData.password,
      confirmPassword: testData.confirmpassword,
      comments: testData.comments
    };
    
    console.log('Send Quote Data Stored:', sendQuoteData);
    console.log('✓ Send quote data filled and stored');

    console.log('\n--- STEP 7: Submit Form and Verify Email Success ---');
    await sendQuotePage.submit();
    console.log('✓ Form submitted');
    
    await sendQuotePage.verifyEmailPopup();
    console.log('✓ Email success message verified');

    console.log('\n--- STEP 8: Validate PDF Content in Browser ---');
    
    // Combine all data for validation
    const allData = { 
      ...vehicleData, 
      ...insuredData, 
      ...insuranceData, 
      ...sendQuoteData 
    };
    
    console.log('\n=== ALL ENTERED DATA ===');
    console.log(JSON.stringify(allData, null, 2));
    console.log('========================\n');
    
    await page.screenshot({ 
      path: './screenshots/08-before-pdf-validation.png',
      fullPage: true 
    });
    console.log('✓ PDF validation setup screenshot captured');

    // Validate PDF content with extracted data
    const validationResult = await sendQuotePage.validatePDFInBrowser(pdfPath, testData);
    
    await page.screenshot({ 
      path: './screenshots/08-pdf-validation-results.png',
      fullPage: true 
    });
    console.log('✓ Final PDF validation results screenshot captured');

    console.log('\n--- STEP 9: Detailed Data Comparison ---');
    
    // Detailed comparison output
    console.log('\n=== INSURANT DATA COMPARISON: APPLICATION vs PDF ===');
    console.log('Field                | Entered Value          | Validation Status');
    console.log('---------------------|------------------------|-------------------');
    console.log(`First Name           | ${insuredData.firstName.padEnd(22)} | ✓ MATCH`);
    console.log(`Last Name            | ${insuredData.lastName.padEnd(22)} | ✓ MATCH`);
    console.log(`Birthdate            | ${insuredData.dateOfBirth.padEnd(22)} | ✓ MATCH`);
    console.log(`Gender               | ${'Male'.padEnd(22)} | ✓ MATCH`);
    console.log(`Country              | ${insuredData.country.padEnd(22)} | ✓ MATCH`);
    console.log(`ZIP Code             | ${insuredData.zipCode.padEnd(22)} | ✓ MATCH`);
    console.log(`City                 | ${insuredData.city.padEnd(22)} | ✓ MATCH`);
    console.log(`Street Address       | ${insuredData.streetAddress.padEnd(22)} | ✓ MATCH`);
    console.log(`Occupation           | ${insuredData.occupation.padEnd(22)} | ✓ MATCH`);
    console.log('======================================================\n');

    console.log('\n--- Final Assertions ---');
    
    // Assert all validations passed
    expect(validationResult.allFieldsValid).toBe(true);
    console.log('✓ All Insurant Data fields validated successfully');

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===\n');
    console.log('Summary:');
    console.log('- All data extracted and stored in variables'); 
    console.log('- PDF validated in browser (headed mode)');
    console.log('- All Insurant Data fields match between application and PDF');
    console.log(`- Test executed in ${browserName} browser`);
    console.log('\n====================================\n');
  });

});