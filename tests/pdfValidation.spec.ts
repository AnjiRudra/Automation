import { test, expect } from '@playwright/test';
import { readCSVRow } from './csvReader';
import path from 'path';
import { PDFContentValidator } from './helpers/PDFContentValidator';

/**
 * Standalone PDF Validation Test
 * This test validates PDF content against expected data without running the full workflow
 */
test('PDF Content Validation - Tricentis Insurance Quote', async ({ page }) => {
  // Load test data from CSV
  const csvPath = path.join(__dirname, 'testdata.csv');
  const testData = await readCSVRow(csvPath, 0);

  // PDF file path - adjust this to your actual PDF location
  const pdfFilePath = 'c:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
  
  // Expected pricing based on Ultimate plan
  const expectedPricing = "3,325.00$ p.a.";

  console.log('Starting PDF content validation test...');
  console.log(`PDF Path: ${pdfFilePath}`);
  console.log('Test Data:', {
    firstname: testData.firstname,
    lastname: testData.lastname,
    make: testData.make,
    insurancesum: testData.insurancesum
  });

  // Initialize PDF validator
  const pdfValidator = new PDFContentValidator(page);

  try {
    // Perform comprehensive PDF validation
    const validationResult = await pdfValidator.validateCompleteQuote(
      pdfFilePath, 
      testData, 
      expectedPricing
    );

    // Assert validation results
    expect(validationResult.isValid).toBe(true);
    
    console.log('✓ PDF validation completed successfully');
    
    // Log detailed validation report
    console.log('\n=== PDF VALIDATION REPORT ===');
    validationResult.validationReport.forEach(report => {
      console.log(report);
    });
    console.log('===============================\n');

  } catch (error) {
    console.error('✗ PDF validation failed:', error.message);
    throw error;
  }
});

/**
 * PDF Field Extraction Test
 * This test extracts and displays all recognizable fields from the PDF for debugging
 */
test('PDF Field Extraction Debug', async ({ page }) => {
  const pdfFilePath = 'c:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
  
  console.log('Starting PDF field extraction debug...');
  
  const pdfValidator = new PDFContentValidator(page);
  
  try {
    // Extract raw PDF text for inspection
    const pdfParse = require('pdf-parse');
    const fs = require('fs');
    
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`PDF file not found at: ${pdfFilePath}`);
    }
    
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdfParse(pdfBuffer);
    
    console.log('\n=== RAW PDF CONTENT ===');
    console.log(data.text);
    console.log('=======================\n');
    
    // Extract specific fields for inspection
    const fieldsToExtract = [
      'First Name', 'Last Name', 'Birthdate', 'Gender',
      'Country', 'ZIP', 'City', 'Street Address', 'Occupation',
      'Make', 'Model', 'Engine Performance', 'Cylinder Capacity',
      'Date of Manufacture', 'Number of Seats', 'Fuel Type',
      'List Price', 'Annual Mileage',
      'Start Date', 'Insurance Sum', 'Merit Rating', 'Legal Defence Insurance',
      'Damage Insurance', 'Courtesy Car', 'Euro Protection', 'Price Option',
      'PRICING'
    ];
    
    console.log('\n=== EXTRACTED FIELDS ===');
    for (const field of fieldsToExtract) {
      const value = extractFieldFromPDF(data.text, field);
      console.log(`${field}: ${value || 'NOT FOUND'}`);
    }
    console.log('========================\n');
    
  } catch (error) {
    console.error('Error during PDF extraction:', error.message);
    throw error;
  }
});

/**
 * Helper function to extract field from PDF text
 */
function extractFieldFromPDF(content: string, fieldName: string): string | null {
  const patterns = [
    new RegExp(`${fieldName}[:\\s]+([^\\n\\r]+)`, 'gi'),
    new RegExp(`${fieldName}[:\\s]*([A-Za-z0-9\\s\\/\\-\\.]+)`, 'gi'),
    new RegExp(`${fieldName}\\s*:\\s*([^\\n\\r]+)`, 'gi'),
    new RegExp(`${fieldName}\\s+([^\\n\\r]+)`, 'gi')
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      const value = match[0].replace(new RegExp(`${fieldName}[:\\s]*`, 'gi'), '').trim();
      if (value && value.length > 0) {
        return value;
      }
    }
  }
  
  return null;
}

/**
 * Expected vs Actual Comparison Test
 * This test shows expected vs actual values for each field
 */
test('PDF Expected vs Actual Comparison', async ({ page }) => {
  // Load test data from CSV
  const csvPath = path.join(__dirname, 'testdata.csv');
  const testData = await readCSVRow(csvPath, 0);

  const pdfFilePath = 'c:\\Temp\\PDFReports\\Tricentis_Insurance_Quote.pdf';
  
  console.log('Starting Expected vs Actual comparison...');
  
  try {
    const pdfParse = require('pdf-parse');
    const fs = require('fs');
    
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`PDF file not found at: ${pdfFilePath}`);
    }
    
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdfParse(pdfBuffer);
    
    // Define field mappings
    const fieldMappings = [
      { pdfField: 'First Name', testDataField: 'firstname', expected: testData.firstname },
      { pdfField: 'Last Name', testDataField: 'lastname', expected: testData.lastname },
      { pdfField: 'Birthdate', testDataField: 'dateofbirth', expected: testData.dateofbirth },
      { pdfField: 'Street Address', testDataField: 'streetaddress', expected: testData.streetaddress },
      { pdfField: 'Country', testDataField: 'country', expected: testData.country },
      { pdfField: 'ZIP', testDataField: 'zipcode', expected: testData.zipcode },
      { pdfField: 'City', testDataField: 'city', expected: testData.city },
      { pdfField: 'Occupation', testDataField: 'occupation', expected: testData.occupation },
      { pdfField: 'Make', testDataField: 'make', expected: testData.make },
      { pdfField: 'Engine Performance', testDataField: 'enginePerformance', expected: testData.enginePerformance },
      { pdfField: 'Number of Seats', testDataField: 'numberofseats', expected: testData.numberofseats },
      { pdfField: 'Fuel Type', testDataField: 'fuel', expected: testData.fuel },
      { pdfField: 'List Price', testDataField: 'listprice', expected: testData.listprice },
      { pdfField: 'Annual Mileage', testDataField: 'annualmileage', expected: testData.annualmileage },
      { pdfField: 'Insurance Sum', testDataField: 'insurancesum', expected: testData.insurancesum },
      { pdfField: 'Merit Rating', testDataField: 'meritrating', expected: testData.meritrating },
      { pdfField: 'Damage Insurance', testDataField: 'damageinsurance', expected: testData.damageinsurance },
      { pdfField: 'Courtesy Car', testDataField: 'courtesycar', expected: testData.courtesycar }
    ];
    
    console.log('\n=== EXPECTED vs ACTUAL COMPARISON ===');
    console.log('Format: Field Name | Expected Value → Actual PDF Value | Match Status');
    console.log('─'.repeat(80));
    
    let totalFields = 0;
    let matchedFields = 0;
    
    for (const mapping of fieldMappings) {
      const actualValue = extractFieldFromPDF(data.text, mapping.pdfField);
      const isMatch = actualValue && (
        actualValue.toLowerCase().includes(mapping.expected.toLowerCase()) ||
        mapping.expected.toLowerCase().includes(actualValue.toLowerCase())
      );
      
      totalFields++;
      if (isMatch) matchedFields++;
      
      const status = isMatch ? '✓ MATCH' : '✗ NO MATCH';
      const actualDisplay = actualValue || 'NOT FOUND';
      
      console.log(`${mapping.pdfField.padEnd(20)} | ${mapping.expected.padEnd(15)} → ${actualDisplay.padEnd(15)} | ${status}`);
    }
    
    console.log('─'.repeat(80));
    console.log(`Summary: ${matchedFields}/${totalFields} fields matched (${Math.round(matchedFields/totalFields*100)}%)`);
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('Error during comparison:', error.message);
    throw error;
  }
});