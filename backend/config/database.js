const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL, // Use connection string if available
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};