const { Pool } = require('pg');
const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

async function findMissingUsers() {
  try {
    console.log('Finding missing users from institution interest requests...');
    
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
    
    console.log(`\n=== INSTITUTION INTEREST REQUESTS (${interestRequests.length}) ===`);
    interestRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.institutionName}`);
      console.log(`   Contact: ${request.contactName} (${request.email})`);
      console.log(`   Status: ${request.status || 'Not provided'}`);
    });
    
    // Check if users exist for these emails
    console.log('\n=== CHECKING IF USERS EXIST ===');
    const missingUsers = [];
    
    for (const request of interestRequests) {
      console.log(`\nChecking for user with email: ${request.email}`);
      
      // Check PostgreSQL users
      const pgUserResult = await client.query(`
        SELECT id, email, name, role, institution_id 
        FROM users 
        WHERE email = $1
      `, [request.email]);
      
      if (pgUserResult.rowCount > 0) {
        console.log(`  ✅ Found in PostgreSQL: ${pgUserResult.rows[0].name} (${pgUserResult.rows[0].email})`);
        console.log(`     Role: ${pgUserResult.rows[0].role}`);
        console.log(`     Institution ID: ${pgUserResult.rows[0].institution_id || 'None'}`);
      } else {
        console.log(`  ❌ Not found in PostgreSQL`);
        missingUsers.push(request);
      }
    }
    
    console.log(`\n=== MISSING USERS (${missingUsers.length}) ===`);
    missingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.contactName} (${user.email})`);
      console.log(`   Institution: ${user.institutionName}`);
    });
    
    client.release();
    return missingUsers;
    
  } catch (error) {
    console.error('❌ Error finding missing users:', error.message);
    return [];
  } finally {
    await pool.end();
  }
}

// Run the function
findMissingUsers().then(missingUsers => {
  console.log('\n✅ Analysis completed');
  if (missingUsers.length > 0) {
    console.log(`\nFound ${missingUsers.length} missing users that need to be created.`);
  }
});