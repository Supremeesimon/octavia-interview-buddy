const { Pool } = require('pg');
const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
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

async function createMissingUsers() {
  try {
    console.log('Creating missing users and fixing institution connections...');
    
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
    
    console.log(`\n=== PROCESSING ${interestRequests.length} INSTITUTION INTEREST REQUESTS ===`);
    
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
          console.log(`  ⚠️  User exists but has no institution. Will link to appropriate institution.`);
          
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
            
            // Create a new institution in PostgreSQL to match
            const pgInstitutionResult = await client.query(`
              INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
              RETURNING id
            `, [
              targetInstitution.id, // Use Firebase ID to maintain consistency
              targetInstitution.name,
              targetInstitution.domain || '',
              targetInstitution.approvalStatus || 'pending',
              targetInstitution.isActive ? true : false
            ]);
            
            const newInstitutionId = pgInstitutionResult.rows[0].id;
            console.log(`  🆕 Created PostgreSQL institution: ${newInstitutionId}`);
            
            // Link user to institution
            await client.query(`
              UPDATE users 
              SET institution_id = $1, updated_at = NOW()
              WHERE id = $2
            `, [newInstitutionId, existingUser.id]);
            
            console.log(`  🔗 Linked user to institution: ${newInstitutionId}`);
          } else {
            console.log(`  ❌ Could not find matching Firebase institution for ${request.institutionName}`);
          }
        } else {
          console.log(`  ℹ️  User already has an institution assigned.`);
        }
      } else {
        console.log(`  ⚠️  User does not exist. In a real implementation, we would create the user here.`);
        console.log(`  ℹ️  For now, we'll just show what would be done:`);
        
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
          console.log(`  🔗 Would link to Firebase institution: ${targetInstitution.name} (${targetInstitution.id})`);
          console.log(`  🆕 Would create user: ${request.email}`);
          console.log(`  🆕 Would create institution in PostgreSQL with ID: ${targetInstitution.id}`);
          console.log(`  🔗 Would link user to institution`);
        } else {
          console.log(`  ❌ Could not find matching Firebase institution for ${request.institutionName}`);
        }
      }
    }
    
    client.release();
    console.log('\n✅ Institution connection analysis completed');
    
  } catch (error) {
    console.error('❌ Error fixing institution connections:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
createMissingUsers();