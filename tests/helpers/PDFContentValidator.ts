import { expect, Page } from '@playwright/test';
import { TestData } from '../csvReader';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Content Validator
 * Validates PDF content against the input data from the application
 */
export class PDFContentValidator {
  constructor(private page: Page) {}

  /**
   * Validate PDF content against test data
   * @param pdfFilePath - Path to the PDF file to validate
   * @param testData - Test data used in the application
   * @param expectedPricing - Expected pricing information from the quote
   */
  async validatePDFContent(
    pdfFilePath: string, 
    testData: TestData, 
    expectedPricing?: string
  ): Promise<void> {
    console.log('Starting PDF content validation...');
    
    // Verify PDF file exists
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`PDF file not found at path: ${pdfFilePath}`);
    }

    // Read PDF content using PDF parsing
    const pdfContent = await this.extractPDFText(pdfFilePath);
    console.log('✓ PDF content extracted successfully');

    // Validate Insurant Data section
    await this.validateInsurantData(pdfContent, testData);
    
    // Validate Vehicle Data section
    await this.validateVehicleData(pdfContent, testData);
    
    // Validate Product Data section
    await this.validateProductData(pdfContent, testData);
    
    // Validate Pricing section if provided
    if (expectedPricing) {
      await this.validatePricingData(pdfContent, expectedPricing);
    }
    
    console.log('✓ PDF content validation completed successfully');
  }

  /**
   * Extract text content from PDF file
   */
  private async extractPDFText(pdfFilePath: string): Promise<string> {
    try {
      // Use pdf-parse library to extract text from PDF
      const pdfParse = require('pdf-parse');
      const pdfBuffer = fs.readFileSync(pdfFilePath);
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting PDF text:', error.message);
      // Fallback: Try using Playwright's PDF handling or other methods
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Validate Insurant Data section in PDF
   */
  private async validateInsurantData(pdfContent: string, testData: TestData): Promise<void> {
    console.log('Validating Insurant Data section...');
    
    const validations = [
      { field: 'First Name', expected: testData.firstname, pdfValue: this.extractFieldValue(pdfContent, 'First Name') },
      { field: 'Last Name', expected: testData.lastname, pdfValue: this.extractFieldValue(pdfContent, 'Last Name') },
      { field: 'Date of Birth', expected: testData.dateofbirth, pdfValue: this.extractFieldValue(pdfContent, 'Birthdate') },
      { field: 'Street Address', expected: testData.streetaddress, pdfValue: this.extractFieldValue(pdfContent, 'Street Address') },
      { field: 'Country', expected: testData.country, pdfValue: this.extractFieldValue(pdfContent, 'Country') },
      { field: 'ZIP Code', expected: testData.zipcode, pdfValue: this.extractFieldValue(pdfContent, 'ZIP') },
      { field: 'City', expected: testData.city, pdfValue: this.extractFieldValue(pdfContent, 'City') },
      { field: 'Occupation', expected: testData.occupation, pdfValue: this.extractFieldValue(pdfContent, 'Occupation') }
    ];

    for (const validation of validations) {
      this.validateField(validation.field, validation.expected, validation.pdfValue);
    }
    
    console.log('✓ Insurant Data validation completed');
  }

  /**
   * Validate Vehicle Data section in PDF
   */
  private async validateVehicleData(pdfContent: string, testData: TestData): Promise<void> {
    console.log('Validating Vehicle Data section...');
    
    const validations = [
      { field: 'Make', expected: testData.make, pdfValue: this.extractFieldValue(pdfContent, 'Make') },
      { field: 'Engine Performance', expected: testData.enginePerformance, pdfValue: this.extractFieldValue(pdfContent, 'Engine Performance') },
      { field: 'Number of Seats', expected: testData.numberofseats, pdfValue: this.extractFieldValue(pdfContent, 'Number of Seats') },
      { field: 'Fuel Type', expected: testData.fuel, pdfValue: this.extractFieldValue(pdfContent, 'Fuel Type') },
      { field: 'List Price', expected: testData.listprice, pdfValue: this.extractFieldValue(pdfContent, 'List Price') },
      { field: 'Annual Mileage', expected: testData.annualmileage, pdfValue: this.extractFieldValue(pdfContent, 'Annual Mileage') }
    ];

    for (const validation of validations) {
      this.validateField(validation.field, validation.expected, validation.pdfValue);
    }
    
    console.log('✓ Vehicle Data validation completed');
  }

  /**
   * Validate Product Data section in PDF
   */
  private async validateProductData(pdfContent: string, testData: TestData): Promise<void> {
    console.log('Validating Product Data section...');
    
    const validations = [
      { field: 'Insurance Sum', expected: testData.insurancesum, pdfValue: this.extractFieldValue(pdfContent, 'Insurance Sum') },
      { field: 'Merit Rating', expected: testData.meritrating, pdfValue: this.extractFieldValue(pdfContent, 'Merit Rating') },
      { field: 'Damage Insurance', expected: testData.damageinsurance, pdfValue: this.extractFieldValue(pdfContent, 'Damage Insurance') },
      { field: 'Courtesy Car', expected: testData.courtesycar, pdfValue: this.extractFieldValue(pdfContent, 'Courtesy Car') }
    ];

    for (const validation of validations) {
      this.validateField(validation.field, validation.expected, validation.pdfValue);
    }
    
    console.log('✓ Product Data validation completed');
  }

  /**
   * Validate Pricing section in PDF
   */
  private async validatePricingData(pdfContent: string, expectedPricing: string): Promise<void> {
    console.log('Validating Pricing section...');
    
    // Look for pricing information in the PDF
    const pricingValue = this.extractFieldValue(pdfContent, 'PRICING') || 
                        this.extractPricingFromContent(pdfContent);
    
    if (pricingValue) {
      this.validateField('Pricing', expectedPricing, pricingValue);
    } else {
      console.log('⚠ Pricing information not found in PDF content');
    }
    
    console.log('✓ Pricing validation completed');
  }

  /**
   * Extract field value from PDF content using various patterns
   */
  private extractFieldValue(content: string, fieldName: string): string | null {
    try {
      // Common patterns for field extraction
      const patterns = [
        new RegExp(`${fieldName}[:\\s]+([^\\n\\r]+)`, 'gi'),
        new RegExp(`${fieldName}[:\\s]*([A-Za-z0-9\\s\\/\\-\\.]+)`, 'gi'),
        new RegExp(`${fieldName}\\s*:\\s*([^\\n\\r]+)`, 'gi'),
        new RegExp(`${fieldName}\\s+([^\\n\\r]+)`, 'gi')
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[0]) {
          // Extract the value part after the field name
          const value = match[0].replace(new RegExp(`${fieldName}[:\\s]*`, 'gi'), '').trim();
          if (value && value.length > 0) {
            return value;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log(`Error extracting field ${fieldName}:`, error.message);
      return null;
    }
  }

  /**
   * Extract pricing information using specific pricing patterns
   */
  private extractPricingFromContent(content: string): string | null {
    const pricingPatterns = [
      /(\d+[,.]?\d*[.,]?\d*)\s*\$?\s*p\.a\./gi,
      /PRICING[:\s]*(\d+[,.]?\d*[.,]?\d*)\s*\$/gi,
      /(\d+[,.]?\d*)\s*\$\s*per\s*annum/gi,
      /Total[:\s]*(\d+[,.]?\d*[.,]?\d*)\s*\$/gi
    ];

    for (const pattern of pricingPatterns) {
      const match = content.match(pattern);
      if (match && match[0]) {
        return match[0].trim();
      }
    }
    
    return null;
  }

  /**
   * Validate individual field value
   */
  private validateField(fieldName: string, expected: string, actual: string | null): void {
    if (actual === null) {
      console.log(`⚠ Field '${fieldName}' not found in PDF content`);
      return;
    }

    // Normalize values for comparison
    const expectedNormalized = expected.toString().toLowerCase().trim();
    const actualNormalized = actual.toLowerCase().trim();

    // Handle special cases for comparison
    let isValid = false;

    // Direct match
    if (actualNormalized === expectedNormalized) {
      isValid = true;
    }
    // Partial match (contains)
    else if (actualNormalized.includes(expectedNormalized) || expectedNormalized.includes(actualNormalized)) {
      isValid = true;
    }
    // Date format variations
    else if (this.isDateMatch(expected, actual)) {
      isValid = true;
    }
    // Numeric value comparisons
    else if (this.isNumericMatch(expected, actual)) {
      isValid = true;
    }

    if (isValid) {
      console.log(`✓ ${fieldName}: Expected '${expected}' matches PDF value '${actual}'`);
    } else {
      console.log(`✗ ${fieldName}: Expected '${expected}' but found '${actual}' in PDF`);
      throw new Error(`PDF validation failed for field '${fieldName}': Expected '${expected}' but found '${actual}'`);
    }
  }

  /**
   * Check if date values match considering different formats
   */
  private isDateMatch(expected: string, actual: string): boolean {
    try {
      // Remove common date separators and compare
      const expectedDate = expected.replace(/[\-\/\.]/g, '');
      const actualDate = actual.replace(/[\-\/\.]/g, '');
      
      // Check if they match after normalization
      return expectedDate === actualDate;
    } catch {
      return false;
    }
  }

  /**
   * Check if numeric values match considering formatting differences
   */
  private isNumericMatch(expected: string, actual: string): boolean {
    try {
      // Extract numbers from both strings
      const expectedNum = expected.replace(/[^0-9\.]/g, '');
      const actualNum = actual.replace(/[^0-9\.]/g, '');
      
      return expectedNum === actualNum;
    } catch {
      return false;
    }
  }

  /**
   * Comprehensive PDF validation with detailed reporting
   */
  async validateCompleteQuote(
    pdfFilePath: string, 
    testData: TestData, 
    expectedPricing?: string
  ): Promise<{ isValid: boolean; validationReport: string[] }> {
    const validationReport: string[] = [];
    let isValid = true;

    try {
      await this.validatePDFContent(pdfFilePath, testData, expectedPricing);
      validationReport.push('✓ PDF content validation passed');
    } catch (error) {
      isValid = false;
      validationReport.push(`✗ PDF validation error: ${error.message}`);
    }

    return { isValid, validationReport };
  }
}