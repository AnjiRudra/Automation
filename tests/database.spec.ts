import { test } from '@playwright/test';
import { DatabaseHelper } from './helpers/DatabaseHelper';
import path from 'path';

/**
 * Database Integration Tests
 * Demonstrates SELECT, INSERT, UPDATE, DELETE operations
 */

let dbHelper: DatabaseHelper;

test.beforeAll(async () => {
  // Download northwind.db from GitHub or use local path
  const dbPath = path.join(__dirname, 'northwind.db');
  dbHelper = new DatabaseHelper(dbPath);
  
  // Check available tables
  const tables = await dbHelper.getTables();
  console.log('Available tables:', tables);
});

test.afterAll(async () => {
  await dbHelper.close();
});

test('Database - SELECT all customers', async () => {
  const query = `SELECT CustomerID, CompanyName, ContactName, City FROM Customers LIMIT 5`;
  const results = await dbHelper.select(query);
  
  console.log('Customers found:', results.length);
  results.forEach((customer: any) => {
    console.log(`  - ${customer.CompanyName} (${customer.ContactName}) from ${customer.City}`);
  });
});

test('Database - SELECT with WHERE clause', async () => {
  const query = `SELECT * FROM Customers WHERE Country = ?`;
  const results = await dbHelper.select(query, ['USA']);
  
  console.log(`Found ${results.length} customers from USA`);
});

test('Database - SELECT single row', async () => {
  const query = `SELECT * FROM Customers WHERE CustomerID = ?`;
  const customer = await dbHelper.selectOne(query, ['ALFKI']);
  
  if (customer) {
    console.log(`Customer found: ${customer.CompanyName}`);
  }
});

test('Database - SELECT products by category', async () => {
  const query = `
    SELECT p.ProductID, p.ProductName, p.UnitPrice, c.CategoryName
    FROM Products p
    JOIN Categories c ON p.CategoryID = c.CategoryID
    WHERE c.CategoryName = ?
    LIMIT 5
  `;
  const products = await dbHelper.select(query, ['Beverages']);
  
  console.log(`Found ${products.length} products in Beverages category`);
  products.forEach((product: any) => {
    console.log(`  - ${product.ProductName}: $${product.UnitPrice}`);
  });
});

test('Database - COUNT aggregate function', async () => {
  const query = `SELECT COUNT(*) as total_customers FROM Customers`;
  const result = await dbHelper.selectOne(query);
  
  console.log(`Total customers in database: ${result.total_customers}`);
});

test('Database - GROUP BY results', async () => {
  const query = `
    SELECT Country, COUNT(*) as customer_count
    FROM Customers
    GROUP BY Country
    ORDER BY customer_count DESC
    LIMIT 5
  `;
  const results = await dbHelper.select(query);
  
  console.log('Top 5 countries by customer count:');
  results.forEach((row: any) => {
    console.log(`  - ${row.Country}: ${row.customer_count} customers`);
  });
});

test('Database - JOIN multiple tables', async () => {
  const query = `
    SELECT o.OrderID, c.CompanyName, o.OrderDate, COUNT(od.ProductID) as product_count
    FROM Orders o
    JOIN Customers c ON o.CustomerID = c.CustomerID
    LEFT JOIN 'Order Details' od ON o.OrderID = od.OrderID
    GROUP BY o.OrderID
    LIMIT 5
  `;
  const results = await dbHelper.select(query);
  
  console.log(`Found ${results.length} orders`);
  results.forEach((order: any) => {
    console.log(`  - Order #${order.OrderID} from ${order.CompanyName}`);
  });
});

test('Database - INSERT new customer (test data)', async () => {
  const query = `
    INSERT INTO Customers (CustomerID, CompanyName, ContactName, City, Country)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = ['TEST1', 'Test Company', 'Test Contact', 'Test City', 'Test Country'];
  
  try {
    const lastID = await dbHelper.insert(query, params);
    console.log(`New customer inserted with ID: ${lastID}`);
    
    // Verify insert
    const verify = await dbHelper.selectOne(
      `SELECT * FROM Customers WHERE CustomerID = ?`,
      ['TEST1']
    );
    console.log(`Verified: ${verify.CompanyName}`);
  } catch (err) {
    console.log('Note: Insert may fail if CustomerID already exists or DB is read-only');
  }
});

test('Database - UPDATE customer (test data)', async () => {
  const query = `UPDATE Customers SET City = ? WHERE CustomerID = ?`;
  const params = ['Updated City', 'TEST1'];
  
  try {
    const affected = await dbHelper.update(query, params);
    console.log(`Rows updated: ${affected}`);
  } catch (err) {
    console.log('Note: Update may fail if CustomerID does not exist or DB is read-only');
  }
});

test('Database - DELETE record (test data)', async () => {
  const query = `DELETE FROM Customers WHERE CustomerID = ?`;
  const params = ['TEST1'];
  
  try {
    const affected = await dbHelper.delete(query, params);
    console.log(`Rows deleted: ${affected}`);
  } catch (err) {
    console.log('Note: Delete may fail if record does not exist or DB is read-only');
  }
});

test('Database - ORDER BY and pagination', async () => {
  const pageSize = 5;
  const page = 1;
  const offset = (page - 1) * pageSize;
  
  const query = `
    SELECT CustomerID, CompanyName, City
    FROM Customers
    ORDER BY CompanyName
    LIMIT ? OFFSET ?
  `;
  const results = await dbHelper.select(query, [pageSize, offset]);
  
  console.log(`Page ${page} results (${results.length} records):`);
  results.forEach((customer: any) => {
    console.log(`  - ${customer.CompanyName} (${customer.City})`);
  });
});

test('Database - Complex analytics query', async () => {
  const query = `
    SELECT 
      c.CompanyName,
      COUNT(o.OrderID) as total_orders,
      SUM(od.Quantity) as total_items,
      ROUND(SUM(od.UnitPrice * od.Quantity), 2) as total_spent
    FROM Customers c
    LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
    LEFT JOIN 'Order Details' od ON o.OrderID = od.OrderID
    GROUP BY c.CustomerID, c.CompanyName
    HAVING COUNT(o.OrderID) > 0
    ORDER BY total_spent DESC
    LIMIT 5
  `;
  const results = await dbHelper.select(query);
  
  console.log('Top 5 customers by spending:');
  results.forEach((row: any) => {
    console.log(`  - ${row.CompanyName}: ${row.total_orders} orders, $${row.total_spent} spent`);
  });
});
