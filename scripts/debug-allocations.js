// Debug script to test session allocations directly with database

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

async function debugAllocations() {
  try {
    console.log('Debugging session allocations...');
    
    const institutionId = '12345678-1234-1234-1234-123456789013'; // octavia.intelligence institution ID
    console.log('Finding session pool for institution:', institutionId);
    
    // First get the session pool ID for this institution
    const poolResult = await pgPool.query(
      'SELECT id FROM session_pools WHERE institution_id = $1',
      [institutionId]
    );
    
    console.log('Pool result:', poolResult.rows);
    
    if (poolResult.rows.length === 0) {
      console.log('No session pool found for this institution');
      return;
    }

    const sessionPoolId = poolResult.rows[0].id;
    console.log('Found session pool ID:', sessionPoolId);

    // Now get the session allocations for this session pool
    console.log('Querying session allocations for session pool:', sessionPoolId);
    
    const result = await pgPool.query(
      `SELECT id, session_pool_id, name, department_id, student_id, 
              allocated_sessions as allocated_count, used_sessions as used_count,
              created_at, updated_at
       FROM session_allocations 
       WHERE session_pool_id = $1
       ORDER BY created_at DESC`,
      [sessionPoolId]
    );
    
    console.log('Allocations query result:', result.rows);
    console.log('Number of allocations found:', result.rows.length);
    
  } catch (error) {
    console.error('Database query error:', error);
  } finally {
    await pgPool.end();
  }
}

// Run the debug script
debugAllocations();