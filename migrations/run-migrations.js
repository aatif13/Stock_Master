import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Running migrations...');
    
    // Read and execute migration file
    const migrationFile = path.join(__dirname, '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('✅ Migrations completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

