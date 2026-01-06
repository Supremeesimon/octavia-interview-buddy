/**
 * List Data in Local PostgreSQL Database
 * This script connects to your local PostgreSQL database and lists the data in each table
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Use local database connection
const localPool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL, // Use connection string if available
});

async function listLocalPostgreSQLData() {
  console.log('Listing data in local PostgreSQL database...');
  
  // Check if local database URL is configured
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.error('❌ Local database connection parameters not found in environment variables');
    console.error('Available environment variables (containing DATABASE or DB_):');
    Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB_')).forEach(key => {
      console.log(`  ${key}: ${process.env[key] ? '[SET]' : '[NOT SET]'}`);
    });
    console.error('Please make sure your .env.local file contains the local database connection string');
    return;
  }

  let client;
  try {
    client = await localPool.connect();
    console.log('✅ Connected to local PostgreSQL database');
    console.log('Database:', process.env.DB_NAME || 'octavia_interview_buddy');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\nFound ${tablesResult.rows.length} tables:`);
    for (const row of tablesResult.rows) {
      console.log(`- ${row.table_name}`);
    }
    
    // List data in each table
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`\n--- Data in table: ${tableName} ---`);
      
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const count = parseInt(countResult.rows[0].count);
        
        console.log(`Total records: ${count}`);
        
        if (count > 0) {
          // Get first 5 records to show sample data
          const sampleResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 5`);
          
          console.log('Sample records:');
          sampleResult.rows.forEach((record, index) => {
            // Print each record's key-value pairs
            console.log(`  ${index + 1}.`);
            Object.keys(record).forEach(key => {
              console.log(`     ${key}: ${record[key]}`);
            });
          });
          
          if (count > 5) {
            console.log(`  ... and ${count - 5} more records`);
          }
        } else {
          console.log('No records found in this table.');
        }
      } catch (error) {
        console.error(`Error querying table ${tableName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error listing data:', error.message);
    console.error('Error details:', error.code);
    console.log('\nThis error might occur if:');
    console.log('- PostgreSQL is not running locally');
    console.log('- Database name is incorrect');
    console.log('- Authentication credentials are wrong');
    console.log('- Connection parameters are incorrect');
  } finally {
    if (client) {
      client.release();
    }
    await localPool.end();
    console.log('\nLocal database connection closed.');
  }
}

// Run the data listing
listLocalPostgreSQLData();