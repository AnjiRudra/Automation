import fs from 'fs';
import path from 'path';

export interface TestData {
  make: string;
  enginePerformance: string;
  numberofseats: string;
  fuel: string;
  listprice: string;
  licenseplatenumber: string;
  annualmileage: string;
  firstname: string;
  lastname: string;
  dateofbirth: string;
  streetaddress: string;
  country: string;
  zipcode: string;
  city: string;
  occupation: string;
  website: string;
  insurancesum: string;
  meritrating: string;
  damageinsurance: string;
  courtesycar: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmpassword: string;
  comments: string;
}

/**
 * Read CSV file and return array of test data
 * @param filePath - Path to the CSV file
 * @returns Array of test data objects
 */
export async function readCSV(filePath: string): Promise<TestData[]> {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    
    // Split by newline and filter empty lines
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row');
    }
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const data: TestData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row as TestData);
    }
    
    console.log(`✓ Successfully loaded ${data.length} test data row(s) from ${absolutePath}`);
    return data;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
}

/**
 * Read a single row from CSV file
 * @param filePath - Path to the CSV file
 * @param rowIndex - Index of the row to read (0-based, excluding header)
 * @returns Test data object for the specified row
 */
export async function readCSVRow(filePath: string, rowIndex: number = 0): Promise<TestData> {
  const data = await readCSV(filePath);
  
  if (rowIndex >= data.length) {
    throw new Error(`Row index ${rowIndex} out of bounds. Total rows: ${data.length}`);
  }
  
  return data[rowIndex];
}

/**
 * Get all test data from CSV file (for parameterized tests)
 * @param filePath - Path to the CSV file
 * @returns Array of test data objects
 */
export async function getAllTestData(filePath: string): Promise<TestData[]> {
  return await readCSV(filePath);
}
