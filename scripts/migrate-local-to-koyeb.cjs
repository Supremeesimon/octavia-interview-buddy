/**
 * Migrate Data from Local PostgreSQL to Koyeb PostgreSQL
 * This script migrates all data from your local database to the Koyeb database respecting foreign key relationships
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

// Use Koyeb database connection
const koyebPool = new Pool({
  connectionString: process.env.KOYEB_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.KOYEB_DATABASE_URL && process.env.KOYEB_DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

// Define table migration order based on foreign key dependencies (from parent to child)
const migrationOrder = [
  'institutions',    // Parent table - no dependencies
  'users',           // Depends on institutions
  'session_pools',   // Depends on institutions
  'session_purchases', // Depends on institutions and users
  'resumes',         // Depends on users
  'interviews',      // Depends on users and resumes
  'session_allocations', // Depends on session_pools and users
  'interview_feedback', // Depends on interviews
  'student_stats',   // Depends on users
  'institution_stats', // Depends on institutions
  'activity_logs',   // Depends on users and institutions
  'notifications',   // Depends on users
  'student_session_requests' // Depends on users and institutions
];

async function migrateData() {
  console.log('Starting data migration from local PostgreSQL to Koyeb PostgreSQL...');
  console.log('Migration order:', migrationOrder);
  
  // Check if both database URLs are configured
  if (!process.env.KOYEB_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error('❌ Koyeb database URL not found in environment variables');
    console.error('Please make sure your .env.local file contains the Koyeb database connection string');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ Local database URL not found in environment variables');
    console.error('Please make sure your .env.local file contains the local database connection string');
    return;
  }

  let localClient, koyebClient;
  try {
    localClient = await localPool.connect();
    koyebClient = await koyebPool.connect();
    
    console.log('✅ Connected to both databases');
    console.log('Local database:', process.env.DB_NAME || 'octavia_interview_buddy');
    console.log('Koyeb database: koyebdb');
    
    // Clear existing data in Koyeb database (except the default admin user)
    console.log('\n--- Clearing existing data in Koyeb database ---');
    for (const tableName of [...migrationOrder].reverse()) {
      if (tableName !== 'users') { // Don't clear users table initially
        try {
          await koyebClient.query(`DELETE FROM "${tableName}"`);
          console.log(`✅ Cleared data from ${tableName}`);
        } catch (clearError) {
          console.error(`❌ Error clearing ${tableName}:`, clearError.message);
        }
      }
    }
    
    // Clear users except the default admin
    try {
      await koyebClient.query(`DELETE FROM users WHERE email != 'admin@octavia-interview.com'`);
      console.log(`✅ Cleared user data (preserving admin@octavia-interview.com)`);
    } catch (clearError) {
      console.error(`❌ Error clearing users:`, clearError.message);
    }
    
    // Migrate data in correct order (from parent to child tables)
    for (const tableName of migrationOrder) {
      console.log(`\n--- Migrating table: ${tableName} ---`);
      
      try {
        // Get all data from local table
        const localDataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
        const records = localDataResult.rows;
        
        console.log(`Found ${records.length} records in ${tableName}`);
        
        if (records.length > 0) {
          // Prepare records for insertion
          for (const record of records) {
            try {
              // For users table, handle the admin user specially
              if (tableName === 'users' && record.email === 'admin@octavia-interview.com') {
                // Skip the default admin user since it already exists
                continue;
              }
              
              // Prepare the values and columns for insertion
              const recordColumns = Object.keys(record);
              const recordValues = recordColumns.map(col => record[col]);
              const recordPlaceholders = recordColumns.map((_, index) => `$${index + 1}`).join(', ');
              
              let recordQuery = `INSERT INTO "${tableName}" (${recordColumns.join(', ')}) VALUES (${recordPlaceholders})`;
              
              // Use ON CONFLICT with the actual primary key constraint name
              if (tableName === 'institutions') {
                recordQuery += ' ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, domain = EXCLUDED.domain, contact_email = EXCLUDED.contact_email, contact_phone = EXCLUDED.contact_phone, address = EXCLUDED.address, logo_url = EXCLUDED.logo_url, website_url = EXCLUDED.website_url, approval_status = EXCLUDED.approval_status, is_active = EXCLUDED.is_active, platform_admin_id = EXCLUDED.platform_admin_id, stripe_customer_id = EXCLUDED.stripe_customer_id, updated_at = EXCLUDED.updated_at';
              } else if (tableName === 'users') {
                recordQuery += ' ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role, is_email_verified = EXCLUDED.is_email_verified, email_verification_token = EXCLUDED.email_verification_token, password_reset_token = EXCLUDED.password_reset_token, password_reset_expires = EXCLUDED.password_reset_expires, profile_picture_url = EXCLUDED.profile_picture_url, last_login_at = EXCLUDED.last_login_at, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at, firebase_uid = EXCLUDED.firebase_uid, institution_id = EXCLUDED.institution_id';
              } else {
                recordQuery += ' ON CONFLICT (id) DO UPDATE SET ' + recordColumns.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ');
              }
              
              await koyebClient.query(recordQuery, recordValues);
            } catch (individualError) {
              console.error(`  Error inserting record into ${tableName}:`, individualError.message);
              // Skip this record and continue with others
            }
          }
          
          console.log(`✅ Attempted migration of ${records.length} records to ${tableName}`);
        } else {
          console.log(`No records found in ${tableName} to migrate.`);
        }
      } catch (error) {
        console.error(`❌ Error migrating table ${tableName}:`, error.message);
      }
    }
    
    console.log('\n✅ Data migration completed!');
    
    // Verify the migration by checking record counts
    console.log('\n--- Verification ---');
    for (const tableName of migrationOrder) {
      try {
        const localCountResult = await localClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const koyebCountResult = await koyebClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
        
        const localCount = parseInt(localCountResult.rows[0].count);
        const koyebCount = parseInt(koyebCountResult.rows[0].count);
        
        console.log(`${tableName}: Local=${localCount}, Koyeb=${koyebCount} ${localCount === koyebCount ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`Error verifying ${tableName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('Error details:', error.code);
  } finally {
    if (localClient) {
      localClient.release();
    }
    if (koyebClient) {
      koyebClient.release();
    }
    await localPool.end();
    await koyebPool.end();
    console.log('\nDatabase connections closed.');
  }
}

// Run the migration
migrateData();