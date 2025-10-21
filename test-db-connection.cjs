// Simple test to verify database connection and check users
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/octavia_interview_buddy',
});

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
    console.log('Current time:', result.rows[0].now);
    
    // Check if users table exists and has data
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`✓ Users table exists with ${usersResult.rows[0].count} records`);
      
      // Show first few users (without sensitive data)
      const sampleUsers = await pool.query('SELECT id, email, name, role, firebase_uid FROM users LIMIT 3');
      console.log('Sample users:', sampleUsers.rows);
    } catch (error) {
      console.log('Users table may not exist or is empty:', error.message);
    }
    
    // Close the pool
    await pool.end();
    
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
}

testDatabase();