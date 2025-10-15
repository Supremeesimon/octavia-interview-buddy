const functions = require('firebase-functions');
const { Pool } = require('pg');

// Function to apply database migration
exports.applyDatabaseMigration = functions.https.onRequest(async (req, res) => {
  // Only allow GET requests for this function
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    res.status(500).json({
      success: false,
      message: 'DATABASE_URL environment variable is not configured'
    });
    return;
  }

  try {
    // Get database connection details from environment variables
    const dbConfig = {
      connectionString: process.env.DATABASE_URL,
    };

    // Create a connection pool
    const pool = new Pool(dbConfig);

    // Migration SQL to add firebase_uid column
    const migrationSQL = `
      -- Add the firebase_uid column to the users table
      ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
      
      -- Add an index for better performance when querying by firebase_uid
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      
      -- Add a comment to document the purpose of the column
      COMMENT ON COLUMN users.firebase_uid IS 'Firebase UID for users authenticated via Firebase';
    `;

    console.log('Applying database migration...');
    
    // Apply the migration
    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log('Migration applied successfully!');
      
      res.status(200).json({
        success: true,
        message: 'Database migration applied successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error applying migration:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed. Please ensure PostgreSQL is running and DATABASE_URL is correctly configured.',
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error applying database migration',
        error: error.message
      });
    }
  }
});