const db = require('../backend/config/database');

async function debugDatabase() {
  try {
    console.log('=== Database Debug Script ===\n');
    
    // 1. Check institutions
    console.log('1. Institutions:');
    const institutions = await db.query('SELECT id, name, domain FROM institutions ORDER BY created_at');
    institutions.rows.forEach(inst => {
      console.log(`   - ${inst.name} (${inst.id})`);
    });
    
    // 2. Check session pools
    console.log('\n2. Session Pools:');
    const pools = await db.query(`
      SELECT sp.*, i.name as institution_name 
      FROM session_pools sp 
      LEFT JOIN institutions i ON sp.institution_id = i.id 
      ORDER BY sp.created_at
    `);
    pools.rows.forEach(pool => {
      console.log(`   - ${pool.institution_name || 'Unknown'}: ${pool.used_sessions}/${pool.total_sessions} used`);
      console.log(`     Pool ID: ${pool.id}`);
      console.log(`     Institution ID: ${pool.institution_id}\n`);
    });
    
    // 3. Check session allocations
    console.log('3. Session Allocations:');
    const allocations = await db.query(`
      SELECT sa.*, sp.institution_id, i.name as institution_name
      FROM session_allocations sa
      LEFT JOIN session_pools sp ON sa.session_pool_id = sp.id
      LEFT JOIN institutions i ON sp.institution_id = i.id
      ORDER BY sa.created_at
    `);
    if (allocations.rows.length === 0) {
      console.log('   No session allocations found');
    } else {
      allocations.rows.forEach(alloc => {
        console.log(`   - ${alloc.institution_name || 'Unknown'}: ${alloc.name}`);
        console.log(`     Allocated: ${alloc.allocated_sessions}, Used: ${alloc.used_sessions}`);
        console.log(`     Allocation ID: ${alloc.id}`);
        console.log(`     Pool ID: ${alloc.session_pool_id}\n`);
      });
    }
    
    // 4. Check a specific query similar to what's in the controller
    console.log('4. Testing specific query from controller:');
    if (pools.rows.length > 0) {
      const testPoolId = pools.rows[0].id;
      console.log(`   Testing with pool ID: ${testPoolId}`);
      
      const result = await db.query(
        `SELECT id, session_pool_id, name, department_id, student_id, 
                allocated_sessions as allocated_count, used_sessions as used_count,
                created_at, updated_at
         FROM session_allocations 
         WHERE session_pool_id = $1
         ORDER BY created_at DESC`,
        [testPoolId]
      );
      
      console.log(`   Query result: ${result.rows.length} rows found`);
      result.rows.forEach(row => {
        console.log(`     - ${row.name}: ${row.allocated_count} allocated, ${row.used_count} used`);
      });
    } else {
      console.log('   No session pools to test with');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    console.error('Error stack:', error.stack);
  }
}

debugDatabase();