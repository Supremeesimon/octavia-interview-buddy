const { Client } = require('pg');
require('dotenv').config({ path: './.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.KOYEB_DATABASE_URL || process.env.DATABASE_URL_LOCAL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute the migration file
    const fs = require('fs');
    const migrationFile = './database/migrations/006_add_subscriptions_table.sql';
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');

    console.log('Executing migration...');
    await client.query(migrationSql);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();