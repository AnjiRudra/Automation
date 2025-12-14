import { test, expect } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { HomePage } from './pages/HomePage';
import { VehicleDataPage } from './pages/VehicleDataPage';
import { InsuredDataPage } from './pages/InsuredDataPage';
import { InsuranceDataPage } from './pages/InsuranceDataPage';
import { QuotePolicyPage } from './pages/QuotePolicyPage';
import { SendQuotePage } from './pages/SendQuotePage';

test.describe('PDF Validation with Actual PDF Screenshot - Chrome', () => {
  
  test('Complete workflow and capture actual PDF screenshot', async ({ page, browser }) => {
    // Set timeout for the entire test
    test.setTimeout(300000); // 5 minutes

    console.log('\n=== STARTING FULL WORKFLOW WITH ACTUAL PDF SCREENSHOT - CHROME ===\n');

    // Load test data from CSV
    const csvPath = path.join(__dirname, 'testdata.csv');
    const testData = await readCSVRow(csvPath, 0);

    // Run the complete workflow (abbreviated for PDF focus)
    const homePage = new HomePage(page);
    await homePage.startQuote();
    
    const vehiclePage = new VehicleDataPage(page);
    await vehiclePage.fillVehicleData(testData);
    await vehiclePage.clickNext();

    const insuredPage = new InsuredDataPage(page);
    await insuredPage.fillInsuredData(testData);
    await insuredPage.clickNext();

    const insurancePage = new InsuranceDataPage(page);
    await insurancePage.fillInsuranceData(testData);
    await insurancePage.clickNext();

    const quotePage = new QuotePolicyPage(page);
    await quotePage.selectProduct('Ultimate');
    const downloadPath = await quotePage.downloadQuote('C:\\Temp\\PDFReports');
    console.log(`✓ Quote downloaded to: ${downloadPath}`);

    await quotePage.selectProduct('Ultimate');
    await quotePage.clickNext();

    // Workaround
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await quotePage.selectProduct('Ultimate');
    await quotePage.clickNext();

    const sendQuotePage = new SendQuotePage(page);
    await sendQuotePage.fillQuoteData(testData);
    await sendQuotePage.submit();
    await sendQuotePage.verifyEmailPopup();

    // Now focus on PDF validation and screenshot capture
    console.log('\n=== OPENING ACTUAL PDF FILE FOR SCREENSHOT ===');

    try {
      // Create a new browser context specifically for PDF viewing
      const pdfContext = await browser.newContext({
        viewport: { width: 1200, height: 1600 }
      });
      
      const pdfPage = await pdfContext.newPage();
      
      // Try to open the actual PDF file
      const pdfUrl = `file:///${downloadPath.replace(/\\/g, '/')}`;
      console.log(`Opening PDF: ${pdfUrl}`);
      
      await pdfPage.goto(pdfUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await pdfPage.waitForTimeout(8000); // Wait for PDF to fully render
      
      // Take screenshot of the actual PDF as displayed in Chrome
      await pdfPage.screenshot({
        path: './screenshots/chrome-actual-pdf-screenshot.png',
        fullPage: true
      });
      
      console.log('✓ Actual PDF screenshot captured in Chrome');
      
      // Try to extract any available text
      try {
        const pdfText = await pdfPage.textContent('body', { timeout: 5000 });
        if (pdfText && pdfText.length > 50) {
          console.log('PDF text extracted from Chrome viewer');
          console.log('Text length:', pdfText.length);
          console.log('First 200 chars:', pdfText.substring(0, 200));
          
          // Save the extracted text
          const fs = require('fs');
          fs.writeFileSync('./screenshots/chrome-pdf-extracted-text.txt', pdfText);
        } else {
          console.log('PDF displayed in Chrome viewer but text extraction not available');
        }
      } catch (e) {
        console.log('PDF displayed in Chrome as embedded viewer');
      }
      
      // Check for Chrome PDF viewer elements
      const pdfViewer = await pdfPage.locator('embed[type="application/pdf"]').count();
      const pdfObject = await pdfPage.locator('object[data*=".pdf"]').count();
      
      if (pdfViewer > 0 || pdfObject > 0) {
        console.log('✓ Chrome PDF viewer detected - PDF is displayed');
        
        // Take a more focused screenshot of the PDF content
        try {
          const embed = pdfPage.locator('embed[type="application/pdf"]').first();
          if (await embed.isVisible()) {
            const box = await embed.boundingBox();
            if (box) {
              await pdfPage.screenshot({
                path: './screenshots/chrome-pdf-viewer-content.png',
                clip: box
              });
              console.log('✓ PDF viewer content screenshot captured');
            }
          }
        } catch (e) {
          console.log('Could not capture PDF viewer content specifically');
        }
      }
      
      await pdfContext.close();
      
    } catch (error) {
      console.error('Error opening PDF in Chrome:', error.message);
    }

    // Now validate PDF content using text extraction
    console.log('\n=== VALIDATING PDF CONTENT ===');
    
    const pdfValidationData = {
      ...testData,
      firstName: testData.firstname,
      lastName: testData.lastname,
      dateOfBirth: testData.dateofbirth,
      gender: 'Male',
      streetAddress: testData.streetaddress,
      zipCode: testData.zipcode
    };
    
    const validationResult = await sendQuotePage.validatePDFInBrowser(downloadPath, pdfValidationData as any);
    
    console.log('\n=== PDF VALIDATION RESULTS ===');
    validationResult.validationResults.forEach(result => {
      console.log(result);
    });
    console.log('================================\n');
    
    // Assert validation passed
    expect(validationResult.isValid).toBe(true);
    
    console.log('✓ Full workflow with actual PDF screenshot completed successfully');
  });
});