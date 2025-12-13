import sqlite3 from 'sqlite3';
import path from 'path';

/**
 * Database utility for executing SQL queries
 */
export class DatabaseHelper {
  private db: sqlite3.Database;
  private dbPath: string;

  /**
   * Initialize database connection
   */
  constructor(dbPath: string = ':memory:') {
    this.dbPath = dbPath;
    this.db = new (sqlite3.verbose()).Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log(`✓ Connected to database: ${dbPath}`);
      }
    });
  }

  /**
   * Execute a SELECT query and return results
   */
  async select(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('SELECT Error:', err);
          reject(err);
        } else {
          console.log(`✓ SELECT executed - Rows returned: ${rows?.length || 0}`);
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Execute an INSERT query
   */
  async insert(query: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('INSERT Error:', err);
          reject(err);
        } else {
          console.log(`✓ INSERT executed - Last insert ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Execute an UPDATE query
   */
  async update(query: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('UPDATE Error:', err);
          reject(err);
        } else {
          console.log(`✓ UPDATE executed - Rows affected: ${this.changes}`);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Execute a DELETE query
   */
  async delete(query: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('DELETE Error:', err);
          reject(err);
        } else {
          console.log(`✓ DELETE executed - Rows affected: ${this.changes}`);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Execute any SQL query
   */
  async execute(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        this.select(query, params).then(resolve).catch(reject);
      } else if (query.trim().toUpperCase().startsWith('INSERT')) {
        this.insert(query, params).then(resolve).catch(reject);
      } else if (query.trim().toUpperCase().startsWith('UPDATE')) {
        this.update(query, params).then(resolve).catch(reject);
      } else if (query.trim().toUpperCase().startsWith('DELETE')) {
        this.delete(query, params).then(resolve).catch(reject);
      } else {
        this.db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      }
    });
  }

  /**
   * Get a single row from SELECT query
   */
  async selectOne(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('SELECT One Error:', err);
          reject(err);
        } else {
          console.log(`✓ SELECT ONE executed`);
          resolve(row);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('✓ Database connection closed');
          resolve();
        }
      });
    });
  }

  /**
   * Check if table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
    const result = await this.selectOne(query, [tableName]);
    return !!result;
  }

  /**
   * Get all tables
   */
  async getTables(): Promise<string[]> {
    const query = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    const rows = await this.select(query);
    return rows.map((row: any) => row.name);
  }
}
