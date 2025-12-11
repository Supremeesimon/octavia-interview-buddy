const { Pool } = require('pg');
const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your_firebase_api_key_here',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'octavia-practice-interviewer.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'octavia-practice-interviewer',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'octavia-practice-interviewer.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your_messaging_sender_id',
  appId: process.env.VITE_FIREBASE_APP_ID || 'your_firebase_app_id',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'your_measurement_id'
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore
const db = getFirestore(app);

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL,
});

async function createMissingUsersSimple() {
  try {
    console.log('Analyzing missing users and preparing SQL commands...');
    
    const client = await pool.connect();
    
    // Get institution interest requests
    const interestRequestsSnap = await getDocs(collection(db, 'institution_interests'));
    const interestRequests = [];
    interestRequestsSnap.forEach(doc => {
      interestRequests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`\n=== GENERATING SQL COMMANDS FOR ${interestRequests.length} REQUESTS ===`);
    
    const sqlCommands = [];
    
    for (const request of interestRequests) {
      console.log(`\nProcessing: ${request.institutionName} (${request.email})`);
      
      // Check if user already exists
      const pgUserResult = await client.query(`
        SELECT id, email, name, role, institution_id 
        FROM users 
        WHERE email = $1
      `, [request.email]);
      
      if (pgUserResult.rowCount > 0) {
        console.log(`  ✅ User already exists: ${pgUserResult.rows[0].name}`);
        const existingUser = pgUserResult.rows[0];
        
        // Check if user has an institution
        if (!existingUser.institution_id) {
          console.log(`  ⚠️  User exists but has no institution.`);
          
          // Find the corresponding Firebase institution
          const fbInstitutionsSnap = await getDocs(collection(db, 'institutions'));
          let targetInstitution = null;
          
          fbInstitutionsSnap.forEach(instDoc => {
            const instData = instDoc.data();
            if (instData.name === request.institutionName) {
              targetInstitution = {
                id: instDoc.id,
                ...instData
              };
            }
          });
          
          if (targetInstitution) {
            console.log(`  🔗 Found matching Firebase institution: ${targetInstitution.name} (${targetInstitution.id})`);
            
            // Generate SQL to create institution and link user
            sqlCommands.push(`
-- Create institution for ${request.email}
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('${targetInstitution.id}', '${targetInstitution.name}', '${targetInstitution.domain || ''}', '${targetInstitution.approvalStatus || 'pending'}', ${targetInstitution.isActive ? 'true' : 'false'}, NOW(), NOW());
            
-- Link user to institution
UPDATE users 
SET institution_id = '${targetInstitution.id}', updated_at = NOW()
WHERE email = '${request.email}';
            `);
          } else {
            console.log(`  ❌ Could not find matching Firebase institution for ${request.institutionName}`);
          }
        } else {
          console.log(`  ℹ️  User already has an institution assigned.`);
        }
      } else {
        console.log(`  ⚠️  User does not exist.`);
        
        // Find the corresponding Firebase institution
        const fbInstitutionsSnap = await getDocs(collection(db, 'institutions'));
        let targetInstitution = null;
        
        fbInstitutionsSnap.forEach(instDoc => {
          const instData = instDoc.data();
          if (instData.name === request.institutionName) {
            targetInstitution = {
              id: instDoc.id,
              ...instData
            };
          }
        });
        
        if (targetInstitution) {
          console.log(`  🔗 Found matching Firebase institution: ${targetInstitution.name} (${targetInstitution.id})`);
          
          // Generate SQL to create both institution and user
          sqlCommands.push(`
-- Create institution for ${request.institutionName}
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('${targetInstitution.id}', '${targetInstitution.name}', '${targetInstitution.domain || ''}', '${targetInstitution.approvalStatus || 'pending'}', ${targetInstitution.isActive ? 'true' : 'false'}, NOW(), NOW());

-- Create user for ${request.email}
-- Note: Password will need to be set via the application reset process
INSERT INTO users (email, password_hash, name, role, institution_id, is_email_verified, created_at, updated_at)
VALUES ('${request.email}', 'TEMP_PASSWORD_HASH_PLACEHOLDER', '${request.contactName || request.institutionName}', 'institution_admin', '${targetInstitution.id}', false, NOW(), NOW());
          `);
          
          console.log(`  📝 SQL commands generated for creating user and institution`);
        } else {
          console.log(`  ❌ Could not find matching Firebase institution for ${request.institutionName}`);
        }
      }
    }
    
    client.release();
    
    // Output all SQL commands
    console.log('\n' + '='.repeat(50));
    console.log('SQL COMMANDS TO FIX INSTITUTION CONNECTIONS');
    console.log('='.repeat(50));
    
    sqlCommands.forEach((sql, index) => {
      console.log(`\n--- Command Set ${index + 1} ---`);
      console.log(sql.trim());
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('END OF SQL COMMANDS');
    console.log('='.repeat(50));
    console.log('\n📋 Instructions:');
    console.log('1. Review the SQL commands above');
    console.log('2. Replace TEMP_PASSWORD_HASH_PLACEHOLDER with an actual bcrypt hash');
    console.log('3. Run these commands in your PostgreSQL database');
    console.log('4. Users will need to reset their passwords after first login');
    
    console.log('\n✅ Analysis completed');
    
  } catch (error) {
    console.error('❌ Error generating fix commands:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
createMissingUsersSimple();