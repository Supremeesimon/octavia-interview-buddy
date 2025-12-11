// Debug script to understand why session pool is showing 0/0

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Connect to PostgreSQL database
const pgPool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function debugSessionIssue() {
  try {
    console.log('Debugging session pool issue...');
    
    // 1. Check if the octavia.intelligence institution exists
    console.log('\n1. Checking institutions...');
    const institutionResult = await pgPool.query(
      `SELECT id, name, domain FROM institutions WHERE name ILIKE '%octavia%'`
    );
    
    console.log('Institutions found:', institutionResult.rows);
    
    // 2. Check session pools for these institutions
    console.log('\n2. Checking session pools...');
    for (const inst of institutionResult.rows) {
      console.log(`Checking session pool for institution: ${inst.name} (${inst.id})`);
      const poolResult = await pgPool.query(
        `SELECT * FROM session_pools WHERE institution_id = $1`,
        [inst.id]
      );
      
      console.log(`Session pool for ${inst.name}:`, poolResult.rows);
    }
    
    // 3. Check users for these institutions
    console.log('\n3. Checking users...');
    for (const inst of institutionResult.rows) {
      console.log(`Checking users for institution: ${inst.name} (${inst.id})`);
      const userResult = await pgPool.query(
        `SELECT id, email, name, role FROM users WHERE institution_id = $1`,
        [inst.id]
      );
      
      console.log(`Users for ${inst.name}:`, userResult.rows);
    }
    
    // 4. Check if there's a user with email 'octavia.intelligence@gmail.com'
    console.log('\n4. Checking specific user...');
    const specificUserResult = await pgPool.query(
      `SELECT id, email, name, role, institution_id FROM users WHERE email = 'octavia.intelligence@gmail.com'`
    );
    
    console.log('Specific user:', specificUserResult.rows);
    
    if (specificUserResult.rows.length > 0) {
      const user = specificUserResult.rows[0];
      console.log(`\n5. Checking session pool for user's institution...`);
      const userPoolResult = await pgPool.query(
        `SELECT * FROM session_pools WHERE institution_id = $1`,
        [user.institution_id]
      );
      
      console.log('User session pool:', userPoolResult.rows);
    }
    
  } catch (error) {
    console.error('Error debugging session issue:', error);
  } finally {
    await pgPool.end();
  }
}

// Run the debug script
debugSessionIssue();