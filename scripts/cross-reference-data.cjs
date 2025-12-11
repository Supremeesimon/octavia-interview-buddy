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

async function crossReferenceData() {
  try {
    console.log('Cross-referencing Firebase and PostgreSQL data...');
    
    // Get PostgreSQL users
    const client = await pool.connect();
    const pgUsersResult = await client.query(`
      SELECT id, email, name, role, institution_id, firebase_uid 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    const pgUsers = pgUsersResult.rows;
    console.log(`\n=== POSTGRESQL USERS (${pgUsers.length}) ===`);
    pgUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Institution ID: ${user.institution_id || 'None'}`);
      console.log(`   Firebase UID: ${user.firebase_uid || 'None'}`);
    });
    
    // Get PostgreSQL institutions
    const pgInstitutionsResult = await client.query(`
      SELECT id, name, domain, approval_status 
      FROM institutions 
      ORDER BY created_at DESC
    `);
    
    const pgInstitutions = pgInstitutionsResult.rows;
    console.log(`\n=== POSTGRESQL INSTITUTIONS (${pgInstitutions.length}) ===`);
    pgInstitutions.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.name}`);
      console.log(`   Domain: ${inst.domain || 'None'}`);
      console.log(`   ID: ${inst.id}`);
      console.log(`   Status: ${inst.approval_status || 'None'}`);
    });
    
    // Get Firebase institutions
    const fbInstitutionsSnap = await getDocs(collection(db, 'institutions'));
    const fbInstitutions = [];
    fbInstitutionsSnap.forEach(doc => {
      fbInstitutions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`\n=== FIREBASE INSTITUTIONS (${fbInstitutions.length}) ===`);
    fbInstitutions.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.name}`);
      console.log(`   Domain: ${inst.domain || 'None'}`);
      console.log(`   ID: ${inst.id}`);
      console.log(`   Status: ${inst.approvalStatus || 'None'}`);
    });
    
    // Cross-reference analysis
    console.log('\n=== CROSS-REFERENCE ANALYSIS ===');
    
    // Check if PostgreSQL institution IDs match Firebase institution IDs
    console.log('\n1. Institution ID Matching:');
    pgUsers.forEach(user => {
      if (user.institution_id) {
        const pgInst = pgInstitutions.find(inst => inst.id === user.institution_id);
        const fbInst = fbInstitutions.find(inst => inst.id === user.institution_id);
        
        console.log(`\nUser: ${user.email}`);
        console.log(`  PostgreSQL Institution: ${pgInst ? pgInst.name : 'Not found'} (${user.institution_id})`);
        console.log(`  Firebase Institution: ${fbInst ? fbInst.name : 'Not found'} (${user.institution_id})`);
      }
    });
    
    // Check domain matching
    console.log('\n2. Domain-Based Matching:');
    pgUsers.forEach(user => {
      const userEmailDomain = user.email.split('@')[1];
      if (userEmailDomain) {
        const matchingPgInst = pgInstitutions.find(inst => inst.domain === userEmailDomain);
        const matchingFbInst = fbInstitutions.find(inst => inst.domain === userEmailDomain);
        
        if (matchingPgInst || matchingFbInst) {
          console.log(`\nUser: ${user.email} (domain: ${userEmailDomain})`);
          if (matchingPgInst) {
            console.log(`  Matches PostgreSQL Institution: ${matchingPgInst.name}`);
          }
          if (matchingFbInst) {
            console.log(`  Matches Firebase Institution: ${matchingFbInst.name}`);
          }
        }
      }
    });
    
    // Check Firebase UID connections
    console.log('\n3. Firebase UID Connections:');
    pgUsers.forEach(user => {
      if (user.firebase_uid) {
        console.log(`\nUser: ${user.email}`);
        console.log(`  Has Firebase UID: ${user.firebase_uid}`);
        console.log(`  This indicates they've authenticated via Firebase`);
      }
    });
    
    client.release();
    console.log('\n✅ Cross-reference analysis completed');
    
  } catch (error) {
    console.error('❌ Error in cross-reference analysis:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
crossReferenceData();