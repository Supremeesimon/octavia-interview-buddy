const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Determine database configuration
let connectionString;
if (process.env.KOYEB_DATABASE_URL) {
  // Use Koyeb database with SSL requirement
  connectionString = process.env.KOYEB_DATABASE_URL + '?sslmode=require';
  console.log('Using Koyeb database with SSL');
} else if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL');
} else {
  // Local database
  connectionString = `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'octavia_interview'}`;
  console.log('Using local database configuration');
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: connectionString,
});

async function applyMigrations() {
  try {
    console.log('Connecting to database...');
    
    // Get all migration files
    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => 
      file.endsWith('.sql') && file.match(/^\d+_.*\.sql$/)
    ).sort();
    
    console.log('Found migration files:', migrationFiles);
    
    // Apply each migration
    for (const migrationFile of migrationFiles) {
      console.log(`Applying migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('Migration SQL:');
      console.log(migrationSQL);
      
      // Apply the migration
      const client = await pool.connect();
      try {
        await client.query(migrationSQL);
        console.log(`Migration ${migrationFile} applied successfully!`);
      } catch (error) {
        console.error(`Error applying migration ${migrationFile}:`, error.message);
        // Don't stop on error, continue with other migrations
      } finally {
        client.release();
      }
    }
    
    console.log('All migrations applied!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  } finally {
    await pool.end();
  }
}

// Run the migrations
applyMigrations();