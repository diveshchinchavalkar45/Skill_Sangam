import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbClient = null;

export async function getDb() {
  if (dbClient) return dbClient;

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL database via DATABASE_URL...');
      const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      // Test connection
      const testRes = await pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL successfully at:', testRes.rows[0].now);

      dbClient = {
        query: async (text, params) => pool.query(text, params),
        getClient: async () => pool.connect(),
        isPGlite: false,
        pool,
      };
      return dbClient;
    } catch (err) {
      console.warn('Failed to connect to DATABASE_URL, falling back to local persistent PGlite engine:', err.message);
    }
  }

  // Fallback to local persistent PGlite (Real WASM-based PostgreSQL engine)
  console.log('Initializing local embedded PostgreSQL engine (PGlite)...');
  const dataDir = path.join(process.env.APPDATA || os.homedir(), '.skillsangam', 'db');
  fs.mkdirSync(dataDir, { recursive: true });

  // Clean stale postmaster.pid if present from abrupt shutdown
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
      console.log('Cleaned up stale postmaster.pid from previous session.');
    } catch (_) {}
  }

  const pglite = new PGlite(dataDir);
  await pglite.waitReady;
  console.log('Local embedded PostgreSQL (PGlite) engine is ready at:', dataDir);

  // Clean shutdown handlers
  process.on('SIGINT', async () => {
    try { await pglite.close(); } catch (_) {}
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    try { await pglite.close(); } catch (_) {}
    process.exit(0);
  });

  dbClient = {
    query: async (text, params = []) => {
      const res = await pglite.query(text, params);
      return {
        rows: res.rows || [],
        rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
        fields: res.fields || [],
      };
    },
    getClient: async () => ({
      query: async (text, params = []) => {
        const res = await pglite.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rows ? res.rows.length : (res.affectedRows || 0),
        };
      },
      release: () => {},
    }),
    isPGlite: true,
    pgliteInstance: pglite,
  };

  return dbClient;
}

export async function query(text, params = []) {
  const db = await getDb();
  return db.query(text, params);
}

export async function initDb() {
  const db = await getDb();
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running database schema migrations...');
  if (db.isPGlite) {
    await db.pgliteInstance.exec(schemaSql);
  } else {
    await db.query(schemaSql);
  }
  console.log('Database schema verified successfully.');
}

export default {
  query,
  getDb,
  initDb,
};
