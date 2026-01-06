/**
 * Koyeb PostgreSQL Connection Test
 * This script tests the connection to a Koyeb-hosted PostgreSQL database
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuration for Koyeb PostgreSQL
// These environment variables should be set after creating the database on Koyeb
const koyebPool = new Pool({
  user: process.env.KOYEB_DB_USER || process.env.DEST_DB_USER,
  host: process.env.KOYEB_DB_HOST || process.env.DEST_DB_HOST,
  database: process.env.KOYEB_DB_NAME || process.env.DEST_DB_NAME,
  password: process.env.KOYEB_DB_PASSWORD || process.env.DEST_DB_PASSWORD,
  port: process.env.KOYEB_DB_PORT || process.env.DEST_DB_PORT || 5432,
  connectionString: process.env.KOYEB_DATABASE_URL || process.env.DEST_DATABASE_URL,
  ssl: process.env.KOYEB_DATABASE_URL && process.env.KOYEB_DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function testKoyebConnection() {
  console.log('Testing Koyeb PostgreSQL database connection...');
  
  // Check if required environment variables are set
  if (!process.env.KOYEB_DATABASE_URL && 
      !(process.env.KOYEB_DB_USER && process.env.KOYEB_DB_HOST && 
        process.env.KOYEB_DB_NAME && process.env.KOYEB_DB_PASSWORD)) {
    console.log('\n⚠️  Warning: Koyeb database environment variables not set.');
    console.log('\nPlease set one of the following:');
    console.log('Option 1: KOYEB_DATABASE_URL');
    console.log('Option 2: All of KOYEB_DB_USER, KOYEB_DB_HOST, KOYEB_DB_NAME, KOYEB_DB_PASSWORD');
    console.log('\nAfter creating your PostgreSQL database on Koyeb, you will receive connection details.');
    console.log('Add these to your .env.local file.');
    return;
  }

  try {
    // Test the connection
    const result = await koyebPool.query('SELECT NOW() as now, version() as version');
    
    console.log('✅ Successfully connected to Koyeb PostgreSQL database!');
    console.log('\nConnection details:');
    console.log('Time:', result.rows[0].now);
    console.log('Version:', result.rows[0].version);
    
    // Test if our application tables exist
    console.log('\nChecking for application tables...');
    const tablesResult = await koyebPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tableNames.length} tables:`, tableNames);
    
    if (tableNames.length > 0) {
      console.log('\n✅ Koyeb PostgreSQL database is ready for use!');
      console.log('Your application can connect to this database by updating the environment variables.');
    } else {
      console.log('\nℹ️  Database is connected but appears to be empty.');
      console.log('You may need to run your schema migration to create the necessary tables.');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to Koyeb PostgreSQL database:', error.message);
    console.error('Error details:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\nThis error typically means:');
      console.log('1. The host address is incorrect');
      console.log('2. The database instance is not yet ready');
      console.log('3. Network access is restricted');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\nThis error typically means:');
      console.log('1. The port is incorrect');
      console.log('2. The database is not accepting connections');
    } else if (error.code === '28P01') {
      console.log('\nThis error typically means:');
      console.log('1. The username or password is incorrect');
    }
  } finally {
    // Close the connection pool
    await koyebPool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the connection test
testKoyebConnection();