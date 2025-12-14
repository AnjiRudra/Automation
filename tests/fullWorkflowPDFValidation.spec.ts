import { test, expect } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { HomePage } from './pages/HomePage';
import { VehicleDataPage } from './pages/VehicleDataPage';
import { InsuredDataPage } from './pages/InsuredDataPage';
import { InsuranceDataPage } from './pages/InsuranceDataPage';
import { QuotePolicyPage } from './pages/QuotePolicyPage';
import { SendQuotePage } from './pages/SendQuotePage';

// Configure to run only on webkit in headed mode
test.use({ 
  browserName: 'webkit',
  headless: false 
});

test.describe('Full Workflow PDF Validation - WebKit Only', () => {
  
  test('Complete Insurance Quote with Data Extraction and PDF Validation', async ({ page }) => {
    // Set timeout for the entire test
    test.setTimeout(300000); // 5 minutes for webkit stability

    // Set fullscreen viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('\n=== STARTING FULL WORKFLOW TEST IN WEBKIT (HEADED MODE) ===\n');

    // Load test data from CSV
    const csvPath = path.join(__dirname, 'testdata.csv');
    const testData = await readCSVRow(csvPath, 0);

    // ==========================================
    // STEP 1: NAVIGATE TO HOME AND START QUOTE
    // ==========================================
    console.log('\n--- STEP 1: Navigate to Home Page ---');
    const homePage = new HomePage(page);
    await homePage.startQuote();
    await page.screenshot({ path: './screenshots/workflow-01-home-page.png' });
    console.log('✓ Home page loaded and quote started');

    // ==========================================
    // STEP 2: FILL AND STORE VEHICLE DATA
    // ==========================================
    console.log('\n--- STEP 2: Fill Vehicle Data ---');
    const vehiclePage = new VehicleDataPage(page);
    await vehiclePage.fillVehicleData(testData);
    
    // Store vehicle data in variables
    const vehicleData = {
      make: testData.make,
      enginePerformance: testData.enginePerformance,
      numberOfSeats: testData.numberofseats,
      fuelType: testData.fuel,
      listPrice: testData.listprice,
      licensePlateNumber: testData.licenseplatenumber,
      annualMileage: testData.annualmileage
    };
    
    console.log('Vehicle Data Stored:', vehicleData);
    await page.screenshot({ path: './screenshots/workflow-02-vehicle-data.png' });
    await vehiclePage.clickNext();
    console.log('✓ Vehicle data filled and stored');

    // ==========================================
    // STEP 3: FILL AND STORE INSURED DATA
    // ==========================================
    console.log('\n--- STEP 3: Fill Insured Data ---');
    const insuredPage = new InsuredDataPage(page);
    await insuredPage.fillInsuredData(testData);
    
    // Store insured data in variables
    const insuredData = {
      firstName: testData.firstname,
      lastName: testData.lastname,
      dateOfBirth: testData.dateofbirth,
      streetAddress: testData.streetaddress,
      country: testData.country,
      zipCode: testData.zipcode,
      city: testData.city,
      occupation: testData.occupation
    };
    
    console.log('Insured Data Stored:', insuredData);
    await page.screenshot({ path: './screenshots/workflow-03-insured-data.png' });
    await insuredPage.clickNext();
    console.log('✓ Insured data filled and stored');

    // ==========================================
    // STEP 4: FILL AND STORE INSURANCE DATA
    // ==========================================
    console.log('\n--- STEP 4: Fill Insurance Data ---');
    const insurancePage = new InsuranceDataPage(page);
    await insurancePage.fillInsuranceData(testData);
    
    // Store insurance data in variables
    const insuranceData = {
      insuranceSum: testData.insurancesum,
      meritRating: testData.meritrating,
      damageInsurance: testData.damageinsurance,
      courtesyCar: testData.courtesycar
    };
    
    console.log('Insurance Data Stored:', insuranceData);
    await page.screenshot({ path: './screenshots/workflow-04-insurance-data.png' });
    await insurancePage.clickNext();
    console.log('✓ Insurance data filled and stored');

    // ==========================================
    // STEP 5: SELECT QUOTE AND DOWNLOAD PDF
    // ==========================================
    console.log('\n--- STEP 5: Select Quote and Download PDF ---');
    const quotePage = new QuotePolicyPage(page);
    
    // Select Ultimate product
    await quotePage.selectProduct('Ultimate');
    console.log('✓ Selected Ultimate product');
    
    // Download quote as PDF
    const downloadPath = await quotePage.downloadQuote('C:\\Temp\\PDFReports');
    console.log(`✓ Quote downloaded to: ${downloadPath}`);

    // Re-verify and re-select the product after download
    await quotePage.selectProduct('Ultimate');
    await page.screenshot({ path: './screenshots/workflow-05-quote-policy.png' });
    await quotePage.clickNext();
    console.log('✓ Navigating to Send Quote page');

    // Workaround: Go back and re-navigate to Step 6
    console.log('Applying navigation workaround...');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await quotePage.selectProduct('Ultimate');
    await page.waitForTimeout(1000);
    await quotePage.clickNext();
    console.log('✓ Workaround applied successfully');

    // ==========================================
    // STEP 6: FILL AND STORE SEND QUOTE DATA
    // ==========================================
    console.log('\n--- STEP 6: Fill Send Quote Data ---');
    const sendQuotePage = new SendQuotePage(page);
    await sendQuotePage.fillQuoteData(testData);
    
    // Store send quote data in variables
    const sendQuoteData = {
      email: testData.email,
      phone: testData.phone,
      username: testData.username,
      password: testData.password,
      confirmPassword: testData.confirmpassword,
      comments: testData.comments
    };
    
    console.log('Send Quote Data Stored:', sendQuoteData);
    await page.screenshot({ path: './screenshots/workflow-06-send-quote.png' });
    console.log('✓ Send quote data filled and stored');

    // ==========================================
    // STEP 7: SUBMIT AND VERIFY EMAIL SUCCESS
    // ==========================================
    console.log('\n--- STEP 7: Submit Form and Verify Email Success ---');
    await sendQuotePage.submit();
    console.log('✓ Form submitted');

    // Wait for and verify email success message
    await sendQuotePage.verifyEmailPopup();
    await page.screenshot({ path: './screenshots/workflow-07-email-success.png' });
    console.log('✓ Email success message verified');

    // ==========================================
    // STEP 8: VALIDATE PDF IN BROWSER (HEADED MODE)
    // ==========================================
    console.log('\n--- STEP 8: Validate PDF Content in Browser ---');
    
    // Combine all stored data for comprehensive validation
    const allEnteredData = {
      ...vehicleData,
      ...insuredData,
      ...insuranceData,
      ...sendQuoteData
    };
    
    console.log('\n=== ALL ENTERED DATA ===');
    console.log(JSON.stringify(allEnteredData, null, 2));
    console.log('========================\n');

    // Validate PDF content in browser (in headed mode)
    // Create a properly formatted test data object for PDF validation
    const pdfValidationData = {
      ...testData,
      firstName: testData.firstname,
      lastName: testData.lastname,
      dateOfBirth: testData.dateofbirth,
      gender: 'Male', // First radio button selected
      streetAddress: testData.streetaddress,
      zipCode: testData.zipcode
    };
    
    // Capture PDF screenshot before validation
    console.log('Opening PDF for screenshot capture...');
    try {
      // For webkit, we'll create a PDF preview page
      await page.goto('about:blank');
      await page.setContent(`
        <html>
          <head><title>PDF Validation Report</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>PDF Validation Report - WebKit Headed Mode</h1>
            <p><strong>PDF File:</strong> ${downloadPath}</p>
            <p><strong>Browser:</strong> WebKit (Safari Engine)</p>
            <p><strong>Mode:</strong> Headed (Visible)</p>
            <p><strong>Validation Status:</strong> In Progress...</p>
            <div style="border: 2px solid #007acc; padding: 15px; margin: 20px 0; background: #f0f8ff;">
              <h3>Expected Data from Application:</h3>
              <pre>${JSON.stringify(allEnteredData, null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
      await page.screenshot({ 
        path: './screenshots/webkit-pdf-validation-setup.png',
        fullPage: true 
      });
      console.log('✓ PDF validation setup screenshot captured');
    } catch (e) {
      console.log('Screenshot capture failed, continuing with validation');
    }
    
    const pdfValidationResult = await sendQuotePage.validatePDFInBrowser(downloadPath, pdfValidationData as any);
    
    // Assert validation passed
    expect(pdfValidationResult.isValid).toBe(true);
    
    console.log('\n=== PDF VALIDATION RESULTS ===');
    pdfValidationResult.validationResults.forEach(result => {
      console.log(result);
    });
    console.log('================================\n');
    
    // Create final validation results page with PDF content
    await page.setContent(`
      <html>
        <head>
          <title>PDF Validation Complete - WebKit</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .success { color: green; font-weight: bold; }
            .header { background: #007acc; color: white; padding: 15px; margin-bottom: 20px; }
            .validation-result { margin: 10px 0; padding: 10px; border-left: 4px solid #007acc; }
            .pdf-content { background: #f5f5f5; padding: 15px; margin: 20px 0; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✓ PDF Validation Complete - WebKit Headed Mode</h1>
            <p>Browser: WebKit (Safari) | Mode: Headed | Status: SUCCESS</p>
          </div>
          
          <h2>Validation Results:</h2>
          ${pdfValidationResult.validationResults.map(result => 
            `<div class="validation-result ${result.includes('✓') ? 'success' : ''}">${result}</div>`
          ).join('')}
          
          <h2>PDF Content Extract (First 500 chars):</h2>
          <div class="pdf-content">
            <pre>${pdfValidationResult.pdfContent.substring(0, 500)}...</pre>
          </div>
          
          <h2>Application Data vs PDF Comparison:</h2>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr><th>Field</th><th>Application Value</th><th>PDF Status</th></tr>
            <tr><td>First Name</td><td>${allEnteredData.firstName}</td><td>✓ Validated</td></tr>
            <tr><td>Last Name</td><td>${allEnteredData.lastName}</td><td>✓ Validated</td></tr>
            <tr><td>Date of Birth</td><td>${allEnteredData.dateOfBirth}</td><td>✓ Validated</td></tr>
            <tr><td>Country</td><td>${allEnteredData.country}</td><td>✓ Validated</td></tr>
            <tr><td>City</td><td>${allEnteredData.city}</td><td>✓ Validated</td></tr>
            <tr><td>ZIP Code</td><td>${allEnteredData.zipCode}</td><td>✓ Validated</td></tr>
            <tr><td>Street Address</td><td>${allEnteredData.streetAddress}</td><td>✓ Validated</td></tr>
            <tr><td>Occupation</td><td>${allEnteredData.occupation}</td><td>✓ Validated</td></tr>
          </table>
        </body>
      </html>
    `);
    
    await page.screenshot({ 
      path: './screenshots/webkit-pdf-validation-results.png',
      fullPage: true 
    });
    console.log('✓ Final PDF validation results screenshot captured');

    // ==========================================
    // STEP 9: DETAILED COMPARISON
    // ==========================================
    console.log('\n--- STEP 9: Detailed Data Comparison ---');
    
    // Compare entered data vs PDF data (focusing on Insurant Data)
    const comparisonResults = [];
    
    // Define fields to compare (from Insurant Data section)
    const fieldsToCompare = [
      { name: 'First Name', entered: insuredData.firstName, pdfKey: 'firstName' },
      { name: 'Last Name', entered: insuredData.lastName, pdfKey: 'lastName' },
      { name: 'Birthdate', entered: insuredData.dateOfBirth, pdfKey: 'birthDate' },
      { name: 'Gender', entered: 'Male', pdfKey: 'gender' }, // First radio button is Male
      { name: 'Country', entered: insuredData.country, pdfKey: 'country' },
      { name: 'ZIP Code', entered: insuredData.zipCode, pdfKey: 'zipCode' },
      { name: 'City', entered: insuredData.city, pdfKey: 'city' },
      { name: 'Street Address', entered: insuredData.streetAddress, pdfKey: 'streetAddress' },
      { name: 'Occupation', entered: insuredData.occupation, pdfKey: 'occupation' }
    ];
    
    console.log('\n=== INSURANT DATA COMPARISON: APPLICATION vs PDF ===');
    console.log('Field                | Entered Value          | Validation Status');
    console.log('---------------------|------------------------|-------------------');
    
    for (const field of fieldsToCompare) {
      const validationResult = pdfValidationResult.validationResults.find(
        result => result.includes(field.name)
      );
      
      const status = validationResult && validationResult.includes('VALIDATED') ? '✓ MATCH' : '✗ MISMATCH';
      const paddedName = field.name.padEnd(20);
      const paddedValue = String(field.entered).padEnd(22);
      
      console.log(`${paddedName} | ${paddedValue} | ${status}`);
      
      comparisonResults.push({
        field: field.name,
        enteredValue: field.entered,
        status: status
      });
    }
    console.log('======================================================\n');

    // ==========================================
    // FINAL ASSERTIONS
    // ==========================================
    console.log('\n--- Final Assertions ---');
    
    // Assert all critical fields match
    const allMatched = comparisonResults.every(result => result.status === '✓ MATCH');
    expect(allMatched).toBe(true);
    console.log('✓ All Insurant Data fields validated successfully');

    // Take final screenshot
    await page.screenshot({ path: './screenshots/workflow-08-final-validation-complete.png' });

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===\n');
    console.log('Summary:');
    console.log('- All data extracted and stored in variables');
    console.log('- PDF validated in browser (headed mode)');
    console.log('- All Insurant Data fields match between application and PDF');
    console.log('- Test executed in WebKit browser only');
    console.log('\n====================================\n');
  });
});
