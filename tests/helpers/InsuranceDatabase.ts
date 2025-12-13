import { DatabaseHelper } from './DatabaseHelper';
import path from 'path';

/**
 * Database service for insurance application testing
 * Stores and verifies quote/policy data in database
 */
export class InsuranceDatabase {
  private dbHelper: DatabaseHelper;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(__dirname, 'insurance_test.db');
    this.dbHelper = new DatabaseHelper(finalPath);
  }

  /**
   * Initialize insurance database schema
   */
  async initializeSchema(): Promise<void> {
    // Create tables if they don't exist
    const queries = [
      `CREATE TABLE IF NOT EXISTS quotes (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS quote_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        field_value TEXT,
        FOREIGN KEY(quote_id) REFERENCES quotes(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS policies (
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
      )`
    ];

    for (const query of queries) {
      try {
        await this.dbHelper.execute(query);
      } catch (err) {
        console.log('Schema already exists or other error:', err);
      }
    }

    console.log('✓ Insurance database schema initialized');
  }

  /**
   * Save quote to database
   */
  async saveQuote(quoteData: any): Promise<number> {
    const query = `
      INSERT INTO quotes 
      (quote_number, customer_name, email, phone, vehicle_make, vehicle_model, insurance_sum, start_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      quoteData.quoteNumber || `QT-${Date.now()}`,
      quoteData.firstName + ' ' + quoteData.lastName,
      quoteData.email,
      quoteData.phone,
      quoteData.vehicleMake,
      quoteData.vehicleModel,
      quoteData.insuranceSum,
      quoteData.startDate,
      'submitted'
    ];

    const quoteId = await this.dbHelper.insert(query, params);
    console.log(`✓ Quote saved with ID: ${quoteId}`);

    // Save detailed fields
    for (const [key, value] of Object.entries(quoteData)) {
      await this.saveQuoteDetail(quoteId, key, String(value));
    }

    return quoteId;
  }

  /**
   * Save individual quote detail
   */
  async saveQuoteDetail(quoteId: number, fieldName: string, fieldValue: string): Promise<void> {
    const query = `INSERT INTO quote_details (quote_id, field_name, field_value) VALUES (?, ?, ?)`;
    await this.dbHelper.insert(query, [quoteId, fieldName, fieldValue]);
  }

  /**
   * Get quote by ID
   */
  async getQuote(quoteId: number): Promise<any> {
    const query = `SELECT * FROM quotes WHERE id = ?`;
    return await this.dbHelper.selectOne(query, [quoteId]);
  }

  /**
   * Get quote details
   */
  async getQuoteDetails(quoteId: number): Promise<any[]> {
    const query = `SELECT field_name, field_value FROM quote_details WHERE quote_id = ?`;
    return await this.dbHelper.select(query, [quoteId]);
  }

  /**
   * Save policy
   */
  async savePolicy(quoteId: number, policyData: any): Promise<number> {
    const query = `
      INSERT INTO policies 
      (quote_id, policy_number, policy_type, premium, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      quoteId,
      policyData.policyNumber || `POL-${Date.now()}`,
      policyData.policyType || 'Comprehensive',
      policyData.premium,
      policyData.startDate,
      policyData.endDate,
      'active'
    ];

    const policyId = await this.dbHelper.insert(query, params);
    console.log(`✓ Policy saved with ID: ${policyId}`);
    return policyId;
  }

  /**
   * Get all quotes
   */
  async getAllQuotes(limit: number = 10): Promise<any[]> {
    const query = `SELECT * FROM quotes ORDER BY created_at DESC LIMIT ?`;
    return await this.dbHelper.select(query, [limit]);
  }

  /**
   * Search quotes by customer name
   */
  async searchQuotesByCustomer(customerName: string): Promise<any[]> {
    const query = `SELECT * FROM quotes WHERE customer_name LIKE ? ORDER BY created_at DESC`;
    return await this.dbHelper.select(query, [`%${customerName}%`]);
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(quoteId: number, status: string): Promise<number> {
    const query = `UPDATE quotes SET status = ? WHERE id = ?`;
    return await this.dbHelper.update(query, [status, quoteId]);
  }

  /**
   * Delete quote (and related details)
   */
  async deleteQuote(quoteId: number): Promise<number> {
    // Delete details first
    await this.dbHelper.delete(`DELETE FROM quote_details WHERE quote_id = ?`, [quoteId]);
    // Delete policies
    await this.dbHelper.delete(`DELETE FROM policies WHERE quote_id = ?`, [quoteId]);
    // Delete quote
    return await this.dbHelper.delete(`DELETE FROM quotes WHERE id = ?`, [quoteId]);
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<any> {
    const stats = {
      totalQuotes: 0,
      totalPolicies: 0,
      averagePremium: 0,
      quotesByStatus: []
    };

    const totalQuotesResult = await this.dbHelper.selectOne(
      `SELECT COUNT(*) as count FROM quotes`
    );
    stats.totalQuotes = totalQuotesResult.count;

    const totalPoliciesResult = await this.dbHelper.selectOne(
      `SELECT COUNT(*) as count FROM policies`
    );
    stats.totalPolicies = totalPoliciesResult.count;

    const avgPremiumResult = await this.dbHelper.selectOne(
      `SELECT AVG(premium) as avg FROM policies`
    );
    stats.averagePremium = avgPremiumResult.avg || 0;

    stats.quotesByStatus = await this.dbHelper.select(
      `SELECT status, COUNT(*) as count FROM quotes GROUP BY status`
    );

    return stats;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.dbHelper.close();
  }
}
