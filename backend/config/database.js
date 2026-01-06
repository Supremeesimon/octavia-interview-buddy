const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from both backend directory and parent directory
dotenv.config(); // Load from backend directory first
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }); // Then load from parent directory

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isKoyeb = !!process.env.K_SERVICE; // Koyeb sets this environment variable

console.log('Database configuration - Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  K_SERVICE: process.env.K_SERVICE,
  isProduction,
  isKoyeb
});

// PostgreSQL connection pool configuration
let poolConfig = {};

if (isKoyeb && process.env.KOYEB_DATABASE_URL) {
  // Koyeb production environment with Koyeb PostgreSQL
  console.log('Using Koyeb PostgreSQL database');
  poolConfig = {
    connectionString: process.env.KOYEB_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Koyeb PostgreSQL SSL connections
    }
  };
} else if (isProduction && process.env.DATABASE_URL) {
  // Other production environment with DATABASE_URL
  console.log('Using production DATABASE_URL');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'require' ? { rejectUnauthorized: false } : false
  };
} else {
  // Local development environment
  console.log('Using local development database configuration');
  poolConfig = {
    user: process.env.DB_USER || process.env.USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'octavia_interview_buddy',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
    connectionString: process.env.DATABASE_URL // Use connection string if available
  };
}

// Create PostgreSQL connection pool
const pool = new Pool(poolConfig);

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
    console.log('Connected to database:', res.rows[0].now);
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Export pool for graceful shutdown
};