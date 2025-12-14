import { test, expect } from '@playwright/test';

// Configure to run only on webkit in headed mode
test.use({ 
  browserName: 'webkit',
  headless: false 
});

// Test PDF validation only (using existing PDF)
test.describe('PDF Validation Test - WebKit', () => {

  test('Validate existing PDF content using pdf2json', async ({ page }) => {
    console.log('Testing PDF validation with existing PDF...');
    
    const pdfFilePath = 'C:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
    
    // Expected test data (from CSV)
    const expectedData = {
      firstname: 'symonds',
      lastname: 'peter', 
      dateofbirth: '12/03/1980',
      streetaddress: 'lake 4 avenue',
      country: 'Brazil',
      zipcode: '4000',
      city: 'lay',
      occupation: 'Employee'
    };
    
    // Test PDF extraction and validation
    const validationResult = await validatePDFContent(pdfFilePath, expectedData);
    
    console.log('\n=== PDF VALIDATION RESULTS ===');
    validationResult.validationResults.forEach(result => {
      console.log(result);
    });
    console.log('================================\n');
    
    // Assert all fields validated successfully
    expect(validationResult.isValid).toBe(true);
    
    console.log('✓ PDF validation test completed successfully');
  });
});

/**
 * Validate PDF content using pdf2json
 */
async function validatePDFContent(pdfFilePath: string, testData: any) {
  console.log('Extracting text from PDF file using pdf2json...');
  
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const fs = require('fs');
    
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => {
      reject(new Error(`PDF parsing error: ${errData.parserError}`));
    });
    
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        let fullText = '';
        
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(textRun => {
              try {
                const decodedText = decodeURIComponent(textRun.T);
                fullText += decodedText + ' ';
              } catch (e) {
                // If decode fails, use raw text
                fullText += textRun.T + ' ';
              }
            });
          });
        });
        
        console.log('✓ PDF text extracted successfully');
        console.log(`Extracted text length: ${fullText.length} characters`);
        
        // Save PDF content for debugging
        fs.writeFileSync('./screenshots/pdf-validation-test.txt', fullText);
        console.log('PDF content saved to ./screenshots/pdf-validation-test.txt');
        
        // Validate the extracted text
        const validationResults = [];
        
        // Expected values
        const expectedValues = {
          firstName: testData.firstname || 'symonds',
          lastName: testData.lastname || 'peter', 
          birthDate: testData.dateofbirth || '12/03/1980',
          gender: 'Male', // Default first radio selection
          country: testData.country || 'Brazil',
          zipCode: testData.zipcode || '4000',
          city: testData.city || 'lay',
          streetAddress: testData.streetaddress || 'lake 4 avenue',
          occupation: testData.occupation || 'Employee'
        };
        
        // Validate each field
        const fields = [
          { field: 'First Name', expected: expectedValues.firstName, pattern: new RegExp(`First Name:?\\s*${expectedValues.firstName}`, 'i') },
          { field: 'Last Name', expected: expectedValues.lastName, pattern: new RegExp(`Last Name:?\\s*${expectedValues.lastName}`, 'i') },
          { field: 'Birthdate', expected: expectedValues.birthDate, pattern: new RegExp(`Birthdate:?\\s*${expectedValues.birthDate.replace(/\//g, '\\/')}`, 'i') },
          { field: 'Gender', expected: expectedValues.gender, pattern: new RegExp(`Gender:?\\s*${expectedValues.gender}`, 'i') },
          { field: 'Country', expected: expectedValues.country, pattern: new RegExp(`Country:?\\s*${expectedValues.country}`, 'i') },
          { field: 'ZIP Code', expected: expectedValues.zipCode, pattern: new RegExp(`ZIP:?\\s*${expectedValues.zipCode}`, 'i') },
          { field: 'City', expected: expectedValues.city, pattern: new RegExp(`City:?\\s*${expectedValues.city}`, 'i') },
          { field: 'Street Address', expected: expectedValues.streetAddress, pattern: new RegExp(`Street Address:?\\s*${expectedValues.streetAddress}`, 'i') },
          { field: 'Occupation', expected: expectedValues.occupation, pattern: new RegExp(`Occupation:?\\s*${expectedValues.occupation}`, 'i') }
        ];
        
        let allFieldsValid = true;
        
        for (const { field, expected, pattern } of fields) {
          const found = pattern.test(fullText);
          
          if (found) {
            console.log(`✓ ${field}: ${expected} - FOUND`);
            validationResults.push(`✓ ${field}: ${expected} - VALIDATED`);
          } else {
            console.log(`✗ ${field}: ${expected} - NOT FOUND`);
            validationResults.push(`✗ ${field}: ${expected} - VALIDATION FAILED`);
            allFieldsValid = false;
          }
        }
        
        resolve({
          isValid: allFieldsValid,
          validationResults,
          pdfContent: fullText
        });
        
      } catch (error) {
        reject(new Error(`Error processing PDF data: ${error.message}`));
      }
    });
    
    pdfParser.loadPDF(pdfFilePath);
  });
}