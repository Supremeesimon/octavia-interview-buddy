const db = require('../backend/config/database');

async function checkInstitutionColumns() {
  try {
    console.log('Checking institutions table columns...');
    
    // Get column information
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'institutions'
      ORDER BY ordinal_position
    `);
    
    console.log('Institutions table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, ${row.is_nullable})`);
    });
    
    // Check if session_length column exists
    const sessionLengthExists = result.rows.some(row => row.column_name === 'session_length');
    console.log(`\nSession length column exists: ${sessionLengthExists}`);
    
  } catch (error) {
    console.error('Error checking columns:', error);
  }
}

checkInstitutionColumns();