const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL,
});

async function analyzeUserData() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('\n=== USER DATA ACCUMULATION ANALYSIS ===');
      
      // Get all users with their data accumulation
      const usersResult = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.role,
          u.firebase_uid,
          u.created_at,
          COUNT(DISTINCT r.id) as resume_count,
          COUNT(DISTINCT i.id) as interview_count,
          COUNT(DISTINCT ia.id) as feedback_count,
          COALESCE(SUM(i.duration), 0) as total_interview_time,
          AVG(i.overall_score) as avg_interview_score,
          COUNT(DISTINCT al.id) as activity_log_count
        FROM users u
        LEFT JOIN resumes r ON u.id = r.student_id
        LEFT JOIN interviews i ON u.id = i.student_id
        LEFT JOIN interview_feedback ia ON i.id = ia.interview_id
        LEFT JOIN activity_logs al ON u.id = al.user_id
        GROUP BY u.id, u.email, u.name, u.role, u.firebase_uid, u.created_at
        ORDER BY u.created_at DESC
      `);
      
      console.log(`Found ${usersResult.rowCount} users with data analysis:`);
      
      usersResult.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Firebase UID: ${user.firebase_uid || 'None'}`);
        console.log(`   Member since: ${user.created_at}`);
        console.log(`   Resumes uploaded: ${user.resume_count}`);
        console.log(`   Interviews conducted: ${user.interview_count}`);
        console.log(`   Feedback received: ${user.feedback_count}`);
        console.log(`   Total interview time: ${user.total_interview_time} seconds (${Math.round(user.total_interview_time/60)} minutes)`);
        console.log(`   Average interview score: ${user.avg_interview_score ? Math.round(user.avg_interview_score) : 'N/A'}/100`);
        console.log(`   Activity logs: ${user.activity_log_count}`);
      });
      
      // Summary statistics
      console.log('\n=== SUMMARY STATISTICS ===');
      
      // Total data across all users
      const totalResult = await client.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT r.id) as total_resumes,
          COUNT(DISTINCT i.id) as total_interviews,
          COUNT(DISTINCT ia.id) as total_feedback,
          COALESCE(SUM(i.duration), 0) as total_interview_time,
          COUNT(DISTINCT al.id) as total_activities
        FROM users u
        LEFT JOIN resumes r ON u.id = r.student_id
        LEFT JOIN interviews i ON u.id = i.student_id
        LEFT JOIN interview_feedback ia ON i.id = ia.interview_id
        LEFT JOIN activity_logs al ON u.id = al.user_id
      `);
      
      const totals = totalResult.rows[0];
      console.log(`Total users: ${totals.total_users}`);
      console.log(`Total resumes: ${totals.total_resumes}`);
      console.log(`Total interviews: ${totals.total_interviews}`);
      console.log(`Total feedback entries: ${totals.total_feedback}`);
      console.log(`Total interview time: ${totals.total_interview_time} seconds (${Math.round(totals.total_interview_time/60)} minutes)`);
      console.log(`Total activity logs: ${totals.total_activities}`);
      
      // Most active users
      console.log('\n=== MOST ACTIVE USERS ===');
      
      const activeUsers = await client.query(`
        SELECT 
          u.email,
          u.name,
          COUNT(DISTINCT i.id) as interview_count,
          COALESCE(SUM(i.duration), 0) as total_time,
          AVG(i.overall_score) as avg_score
        FROM users u
        LEFT JOIN interviews i ON u.id = i.student_id
        GROUP BY u.id, u.email, u.name
        HAVING COUNT(DISTINCT i.id) > 0
        ORDER BY interview_count DESC, total_time DESC
        LIMIT 5
      `);
      
      if (activeUsers.rowCount > 0) {
        console.log('Top users by interview activity:');
        activeUsers.rows.forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.name} (${user.email})`);
          console.log(`   Interviews: ${user.interview_count}`);
          console.log(`   Total time: ${user.total_time} seconds (${Math.round(user.total_time/60)} minutes)`);
          console.log(`   Avg score: ${user.avg_score ? Math.round(user.avg_score) : 'N/A'}/100`);
        });
      } else {
        console.log('No users have conducted interviews yet.');
      }
      
      console.log('\n✅ Data analysis completed successfully');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error analyzing user data:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
analyzeUserData();