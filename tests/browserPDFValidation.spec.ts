import { test, expect } from '@playwright/test';
import { SendQuotePage } from './pages/SendQuotePage';
import { readCSV } from './csvReader';

/**
 * Browser-based PDF Validation Test
 * Opens the PDF in browser and validates Insurant Data fields
 */
test.describe('PDF Validation in Browser', () => {
  
  test('Validate Insurant Data in PDF using browser', async ({ page }) => {
    console.log('Starting browser-based PDF validation test...');
    
    // PDF file path (update this to your actual PDF path)
    const pdfFilePath = 'c:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
    
    // Read test data from CSV
    const testDataArray = await readCSV('./tests/testdata.csv');
    const testData = testDataArray[0]; // Use first row of test data
    
    console.log('Test data loaded:', {
      firstName: testData.firstName,
      lastName: testData.lastName,
      dateOfBirth: testData.dateOfBirth,
      gender: testData.gender,
      country: testData.country,
      zipCode: testData.zipCode,
      city: testData.city,
      streetAddress: testData.streetAddress,
      occupation: testData.occupation
    });
    
    // Initialize page object
    const sendQuotePage = new SendQuotePage(page);
    
    try {
      // Validate PDF content in browser (Insurant Data only)
      const validationResult = await sendQuotePage.validatePDFInBrowser(pdfFilePath, testData);
      
      // Assert validation passed
      expect(validationResult.isValid).toBe(true);
      
      console.log('✓ PDF validation completed successfully');
      console.log('Validation Results:', validationResult.validationResults);
      
    } catch (error) {
      console.error('PDF validation failed:', error.message);
      
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: './screenshots/pdf-validation-error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });

  test('Validate PDF with custom Insurant Data', async ({ page }) => {
    console.log('Starting PDF validation with custom data...');
    
    // PDF file path
    const pdfFilePath = 'c:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
    
    // Custom test data based on the PDF attachment
    const customTestData = {
      firstName: 'symonds',
      lastName: 'peter',
      dateOfBirth: '12/03/1980',
      gender: 'Male',
      country: 'Brazil',
      zipCode: '4000',
      city: 'jay',
      streetAddress: 'lake 4 avenue',
      occupation: 'Employee',
      email: 'test@example.com',
      phone: '1234567890',
      username: 'testuser',
      password: 'Test123',
      confirmpassword: 'Test123',
      comments: 'Test comments'
    };
    
    console.log('Using custom test data for validation:', customTestData);
    
    // Initialize page object
    const sendQuotePage = new SendQuotePage(page);
    
    try {
      // Validate PDF content in browser
      const validationResult = await sendQuotePage.validatePDFInBrowser(pdfFilePath, customTestData);
      
      // Assert validation passed
      expect(validationResult.isValid).toBe(true);
      
      console.log('✓ Custom PDF validation completed successfully');
      
      // Verify specific fields
      expect(validationResult.validationResults).toEqual(
        expect.arrayContaining([
          expect.stringContaining('First Name: symonds - VALIDATED'),
          expect.stringContaining('Last Name: peter - VALIDATED'),
          expect.stringContaining('Birthdate: 12/03/1980 - VALIDATED'),
          expect.stringContaining('Gender: Male - VALIDATED'),
          expect.stringContaining('Country: Brazil - VALIDATED'),
          expect.stringContaining('ZIP Code: 4000 - VALIDATED'),
          expect.stringContaining('City: jay - VALIDATED'),
          expect.stringContaining('Street Address: lake 4 avenue - VALIDATED'),
          expect.stringContaining('Occupation: Employee - VALIDATED')
        ])
      );
      
    } catch (error) {
      console.error('Custom PDF validation failed:', error.message);
      throw error;
    }
  });
});