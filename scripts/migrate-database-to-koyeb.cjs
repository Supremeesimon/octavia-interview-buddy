/**
 * Database Migration Helper Script
 * This script helps migrate data from one PostgreSQL database to another
 * Useful for migrating from local to Koyeb PostgreSQL
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Source database (current local database)
const sourcePool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL, // Use connection string if available
});

// Destination database (Koyeb PostgreSQL) - using different environment variables
const destinationPool = new Pool({
  user: process.env.KOYEB_DB_USER || process.env.DEST_DB_USER,
  host: process.env.KOYEB_DB_HOST || process.env.DEST_DB_HOST,
  database: process.env.KOYEB_DB_NAME || process.env.DEST_DB_NAME,
  password: process.env.KOYEB_DB_PASSWORD || process.env.DEST_DB_PASSWORD,
  port: process.env.KOYEB_DB_PORT || process.env.DEST_DB_PORT || 5432,
  connectionString: process.env.KOYEB_DATABASE_URL || process.env.DEST_DATABASE_URL,
});

async function testConnections() {
  console.log('Testing source database connection...');
  try {
    const result = await sourcePool.query('SELECT NOW()');
    console.log('✓ Source database connected successfully');
  } catch (error) {
    console.error('✗ Source database connection failed:', error.message);
    return false;
  }

  console.log('Testing destination database connection...');
  try {
    const result = await destinationPool.query('SELECT NOW()');
    console.log('✓ Destination database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Destination database connection failed:', error.message);
    return false;
  }
}

async function getTableNames() {
  const result = await sourcePool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  `);
  return result.rows.map(row => row.table_name);
}

async function getTableData(tableName) {
  const result = await sourcePool.query(`SELECT * FROM ${tableName}`);
  return result.rows;
}

async function copyTableData(tableName, data) {
  if (data.length === 0) {
    console.log(`No data to copy for table: ${tableName}`);
    return;
  }

  // Get column names from the first row
  const columns = Object.keys(data[0]);
  const columnList = columns.join(', ');
  
  // Create placeholders for values
  const valuePlaceholders = (row, index) => {
    const values = columns.map((col, colIndex) => `$${index * columns.length + colIndex + 1}`);
    return `(${values.join(', ')})`;
  };

  // Prepare values array
  const values = [];
  data.forEach(row => {
    columns.forEach(col => {
      values.push(row[col]);
    });
  });

  // Build the query
  const placeholders = data.map((_, index) => valuePlaceholders(_, index)).join(', ');
  const query = `INSERT INTO ${tableName} (${columnList}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;

  try {
    await destinationPool.query(query, values);
    console.log(`✓ Copied ${data.length} rows to table: ${tableName}`);
  } catch (error) {
    console.error(`✗ Failed to copy data to table ${tableName}:`, error.message);
    throw error;
  }
}

async function migrateDatabase() {
  console.log('Starting database migration process...');
  
  // Test both database connections
  const connectionsOk = await testConnections();
  if (!connectionsOk) {
    console.error('Database connections failed. Please check your configuration.');
    return;
  }

  try {
    console.log('\nGetting list of tables...');
    const tables = await getTableNames();
    console.log(`Found ${tables.length} tables:`, tables);

    // Migrate each table
    for (const table of tables) {
      console.log(`\nMigrating table: ${table}`);
      
      // Get data from source
      const tableData = await getTableData(table);
      console.log(`Retrieved ${tableData.length} rows from ${table}`);
      
      // Clear existing data in destination (optional - be careful!)
      // Uncomment the next line if you want to clear the destination table first
      // await destinationPool.query(`DELETE FROM ${table}`);
      
      // Copy data to destination
      if (tableData.length > 0) {
        await copyTableData(table, tableData);
      }
    }

    console.log('\n✓ Database migration completed successfully!');
  } catch (error) {
    console.error('✗ Database migration failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close both connection pools
    await sourcePool.end();
    await destinationPool.end();
    console.log('Database connections closed.');
  }
}

// Run the migration
migrateDatabase();