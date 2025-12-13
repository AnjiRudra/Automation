# Database Integration Guide

## Overview

This Playwright test framework now includes comprehensive SQL database integration using SQLite3. You can execute SELECT, INSERT, UPDATE, and DELETE queries directly from your test cases.

## Features

✅ **SQL Operations:**
- SELECT (single, multiple rows, with WHERE/JOIN/GROUP BY)
- INSERT (new records)
- UPDATE (modify existing records)
- DELETE (remove records)

✅ **Built-in Utilities:**
- DatabaseHelper - Low-level database operations
- InsuranceDatabase - Domain-specific insurance quote/policy management
- Query builders for common patterns

✅ **Integration:**
- Seamless integration with Playwright tests
- Automatic schema initialization
- Transaction support
- Error handling and logging

---

## Installation

SQLite3 has been already installed. If you need to reinstall:

```bash
npm install sqlite3
```

---

## Usage Examples

### 1. Basic SELECT Query

```typescript
import { DatabaseHelper } from './helpers/DatabaseHelper';

const dbHelper = new DatabaseHelper('path/to/database.db');

// Get all customers
const customers = await dbHelper.select('SELECT * FROM Customers LIMIT 5');

// With WHERE clause
const usaCustomers = await dbHelper.select(
  'SELECT * FROM Customers WHERE Country = ?',
  ['USA']
);

// Get single row
const customer = await dbHelper.selectOne(
  'SELECT * FROM Customers WHERE CustomerID = ?',
  ['ALFKI']
);
```

### 2. INSERT Query

```typescript
const query = `
  INSERT INTO Customers (CustomerID, CompanyName, City, Country)
  VALUES (?, ?, ?, ?)
`;

const lastId = await dbHelper.insert(query, [
  'CUST1',
  'New Company',
  'New York',
  'USA'
]);

console.log(`Inserted record with ID: ${lastId}`);
```

### 3. UPDATE Query

```typescript
const query = 'UPDATE Customers SET City = ? WHERE CustomerID = ?';

const rowsAffected = await dbHelper.update(query, ['Updated City', 'CUST1']);

console.log(`Updated ${rowsAffected} rows`);
```

### 4. DELETE Query

```typescript
const query = 'DELETE FROM Customers WHERE CustomerID = ?';

const rowsDeleted = await dbHelper.delete(query, ['CUST1']);

console.log(`Deleted ${rowsDeleted} rows`);
```

### 5. Complex Query with JOIN

```typescript
const query = `
  SELECT 
    c.CompanyName,
    COUNT(o.OrderID) as total_orders,
    SUM(od.UnitPrice * od.Quantity) as total_spent
  FROM Customers c
  LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
  LEFT JOIN 'Order Details' od ON o.OrderID = od.OrderID
  GROUP BY c.CustomerID, c.CompanyName
  HAVING COUNT(o.OrderID) > 0
  ORDER BY total_spent DESC
  LIMIT 5
`;

const results = await dbHelper.select(query);
results.forEach(row => {
  console.log(`${row.CompanyName}: ${row.total_orders} orders, $${row.total_spent}`);
});
```

---

## Insurance Database Service

### Purpose

The `InsuranceDatabase` class provides domain-specific methods for managing insurance quotes and policies in your tests.

### Methods

#### Initialize Database

```typescript
import { InsuranceDatabase } from './helpers/InsuranceDatabase';

const insuranceDb = new InsuranceDatabase();
await insuranceDb.initializeSchema();
```

#### Save Quote

```typescript
const quoteId = await insuranceDb.saveQuote({
  quoteNumber: 'QT-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  insuranceSum: 500000,
  startDate: '2025-12-13'
});
```

#### Save Policy

```typescript
const policyId = await insuranceDb.savePolicy(quoteId, {
  policyNumber: 'POL-001',
  policyType: 'Silver',
  premium: 500,
  startDate: '2025-12-13',
  endDate: '2026-12-13'
});
```

#### Retrieve Quote

```typescript
const quote = await insuranceDb.getQuote(quoteId);
console.log(`Customer: ${quote.customer_name}, Status: ${quote.status}`);

const details = await insuranceDb.getQuoteDetails(quoteId);
```

#### Search Quotes

```typescript
const quotes = await insuranceDb.searchQuotesByCustomer('John Doe');
const allQuotes = await insuranceDb.getAllQuotes(10);
```

#### Update Quote Status

```typescript
await insuranceDb.updateQuoteStatus(quoteId, 'approved');
```

#### Delete Quote

```typescript
await insuranceDb.deleteQuote(quoteId);
```

#### Get Statistics

```typescript
const stats = await insuranceDb.getStatistics();
console.log(`Total Quotes: ${stats.totalQuotes}`);
console.log(`Total Policies: ${stats.totalPolicies}`);
console.log(`Average Premium: $${stats.averagePremium}`);
console.log(`Quotes by Status:`, stats.quotesByStatus);
```

---

## Database Schema

### Quotes Table

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  insurance_sum REAL,
  start_date DATE,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Quote Details Table

```sql
CREATE TABLE quote_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  FOREIGN KEY(quote_id) REFERENCES quotes(id)
);
```

### Policies Table

```sql
CREATE TABLE policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  policy_number TEXT UNIQUE NOT NULL,
  policy_type TEXT,
  premium REAL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(quote_id) REFERENCES quotes(id)
);
```

---

## Example: Complete Test with Database

```typescript
import { test } from '@playwright/test';
import { InsuranceDatabase } from './helpers/InsuranceDatabase';

let insuranceDb: InsuranceDatabase;

test.beforeAll(async () => {
  insuranceDb = new InsuranceDatabase();
  await insuranceDb.initializeSchema();
});

test.afterAll(async () => {
  await insuranceDb.close();
});

test('Complete Insurance Flow with Database', async ({ page }) => {
  // ... your test steps here ...

  // Save to database
  const quoteId = await insuranceDb.saveQuote({
    quoteNumber: `QT-${Date.now()}`,
    firstName: testData.firstname,
    lastName: testData.lastname,
    email: testData.email,
    phone: testData.phone,
    vehicleMake: testData.make,
    vehicleModel: testData.model,
    insuranceSum: testData.insurancesum,
    startDate: testData.startdate
  });

  // Save policy
  const policyId = await insuranceDb.savePolicy(quoteId, {
    policyNumber: `POL-${Date.now()}`,
    policyType: 'Silver',
    premium: 500,
    startDate: testData.startdate,
    endDate: '2026-12-13'
  });

  // Verify in database
  const savedQuote = await insuranceDb.getQuote(quoteId);
  expect(savedQuote.customer_name).toBe(testData.firstname + ' ' + testData.lastname);

  // Get statistics
  const stats = await insuranceDb.getStatistics();
  console.log(`Total quotes submitted: ${stats.totalQuotes}`);
});
```

---

## Running Database Tests

### Run Database Integration Tests

```bash
npx playwright test database.spec.ts
```

### Run Insurance Tests with Database

```bash
npx playwright test Tricentisdemowebsite.spec.ts --headed --project=webkit
```

### Run All Tests

```bash
npm test
```

---

## Using External Databases

To use an external SQLite database (like Northwind):

```typescript
const dbHelper = new DatabaseHelper('./path/to/northwind.db');

const customers = await dbHelper.select(
  'SELECT CustomerID, CompanyName FROM Customers LIMIT 5'
);
```

---

## Best Practices

1. **Always Close Connections**
   ```typescript
   await dbHelper.close();
   ```

2. **Use Parameterized Queries**
   ```typescript
   // Good - prevents SQL injection
   await dbHelper.select('SELECT * FROM Customers WHERE Country = ?', ['USA']);
   
   // Avoid
   await dbHelper.select(`SELECT * FROM Customers WHERE Country = '${country}'`);
   ```

3. **Handle Errors**
   ```typescript
   try {
     const result = await dbHelper.insert(query, params);
   } catch (err) {
     console.error('Insert failed:', err);
   }
   ```

4. **Check Table Existence**
   ```typescript
   const exists = await dbHelper.tableExists('Customers');
   if (exists) {
     // proceed
   }
   ```

5. **Use Transactions for Multiple Operations**
   ```typescript
   // Save quote and policy together
   const quoteId = await insuranceDb.saveQuote(quoteData);
   const policyId = await insuranceDb.savePolicy(quoteId, policyData);
   ```

---

## File Structure

```
tests/
├── helpers/
│   ├── DatabaseHelper.ts        # Low-level database operations
│   └── InsuranceDatabase.ts     # Domain-specific insurance service
├── database.spec.ts             # Database integration test examples
├── Tricentisdemowebsite.spec.ts # Main test with database integration
└── csvReader.ts
```

---

## Troubleshooting

### "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### "Database is locked"
This typically means multiple processes are accessing the database. Wait a moment and retry.

### "Table already exists"
The schema initialization checks for existing tables. You can safely run it multiple times.

### Permission Denied
Ensure the database file path has write permissions.

---

## Next Steps

1. ✅ Database integration implemented
2. ✅ CRUD operations available
3. ✅ Insurance-specific service created
4. ✅ Example tests provided

**You can now:**
- Save test results to database
- Query test data before/after tests
- Validate data consistency
- Generate database reports
- Integrate with CI/CD pipelines

---

## Support

For issues or questions:
1. Check the example tests in `database.spec.ts`
2. Review the InsuranceDatabase class methods
3. Consult SQLite3 documentation for advanced queries
