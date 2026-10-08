import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class Database {
  private pool: pg.Pool | null = null;
  private pglite: PGlite | null = null;
  private isInitialized = false;

  public async init() {
    if (this.isInitialized) return;

    const databaseUrl = process.env.DATABASE_URL;
    let poolConnected = false;

    // Only attempt external PostgreSQL pool if DATABASE_URL is provided and not pointing to local daemon
    if (
      databaseUrl &&
      databaseUrl.trim().length > 0 &&
      !databaseUrl.includes('localhost') &&
      !databaseUrl.includes('127.0.0.1') &&
      !databaseUrl.includes('0.0.0.0')
    ) {
      let candidatePool: pg.Pool | null = null;
      try {
        console.log('[DB] Attempting connection to external PostgreSQL via DATABASE_URL...');
        candidatePool = new Pool({
          connectionString: databaseUrl,
          ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
          max: 5,
          connectionTimeoutMillis: 3000,
          idleTimeoutMillis: 5000,
        });

        // Attach error handler immediately to prevent unhandled 'error' events on the EventEmitter
        candidatePool.on('error', (err) => {
          console.warn('[DB] Handled PostgreSQL pool background error:', err.message);
        });

        // Test connectivity quickly
        await candidatePool.query('SELECT 1');
        this.pool = candidatePool;
        poolConnected = true;
        console.log('[DB] Connected to external PostgreSQL successfully.');
      } catch (err: any) {
        console.warn('[DB] External PostgreSQL connection failed:', err.message, '- Falling back cleanly to embedded PGlite.');
        if (candidatePool) {
          try {
            await candidatePool.end();
          } catch {
            // Ignore cleanup failure
          }
        }
        this.pool = null;
        poolConnected = false;
      }
    }

    if (!poolConnected) {
      console.log('[DB] Using embedded PostgreSQL engine (PGlite) with filesystem persistence...');
      const dbDir = path.resolve(process.cwd(), 'data', 'pgdata');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.pglite = new PGlite(dbDir);
    }

    this.isInitialized = true;
  }

  public async exec(sql: string): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
    if (this.pool) {
      await this.pool.query(sql);
    } else if (this.pglite) {
      await this.pglite.exec(sql);
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (this.pool) {
        const result = await this.pool.query(sql, params);
        return {
          rows: result.rows as T[],
          rowCount: result.rowCount ?? result.rows.length,
        };
      } else if (this.pglite) {
        // If there are no parameters and the SQL contains multiple statements, use exec
        if ((!params || params.length === 0) && sql.includes(';') && sql.trim().indexOf(';') < sql.trim().length - 1) {
          await this.pglite.exec(sql);
          return {
            rows: [],
            rowCount: 0,
          };
        }
        const result = await this.pglite.query(sql, params);
        return {
          rows: (result.rows || []) as T[],
          rowCount: (result.rows || []).length,
        };
      } else {
        throw new Error('Database is not initialized');
      }
    } catch (error: any) {
      console.error('[DB Query Error]:', error.message, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }

  public async transaction<T>(callback: (query: (sql: string, params?: any[]) => Promise<QueryResult<any>>) => Promise<T>): Promise<T> {
    await this.query('BEGIN');
    try {
      const result = await callback(this.query.bind(this));
      await this.query('COMMIT');
      return result;
    } catch (error) {
      await this.query('ROLLBACK');
      throw error;
    }
  }
}

export const db = new Database();
