/**
 * Apply Database Schema to Koyeb PostgreSQL
 * This script applies the schema to your Koyeb-hosted PostgreSQL database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Use Koyeb database connection
const koyebPool = new Pool({
  connectionString: process.env.KOYEB_DATABASE_URL,
  ssl: process.env.KOYEB_DATABASE_URL && process.env.KOYEB_DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function applySchema() {
  console.log('Applying database schema to Koyeb PostgreSQL...');
  
  // Check if Koyeb database URL is configured
  if (!process.env.KOYEB_DATABASE_URL) {
    console.error('❌ KOYEB_DATABASE_URL not found in environment variables');
    console.error('Please make sure your .env.local file contains the Koyeb database connection string');
    console.log('Current environment variables available:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB_')));
    return;
  }

  let client;
  try {
    client = await koyebPool.connect();
    console.log('✅ Connected to Koyeb PostgreSQL database');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Loading schema from:', schemaPath);
    
    // Execute the schema
    console.log('Executing schema...');
    await client.query(schemaSQL);
    
    console.log('✅ Database schema applied successfully to Koyeb PostgreSQL!');
    
    // Verify that key tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\nCreated ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    console.error('Error details:', error.code);
  } finally {
    if (client) {
      client.release();
    }
    await koyebPool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the schema application
applySchema();