const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
  try {
    console.log('Connecting to database...');
    
    // Read the migration file
    const migrationPath = path.resolve(__dirname, '../database/migrations/001_add_firebase_uid_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Applying migration...');
    console.log(migrationSQL);
    
    // Apply the migration
    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log('Migration applied successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyMigration();