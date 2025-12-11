const { Pool } = require('pg');
const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
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

async function checkContactFormConnections() {
  try {
    console.log('Checking contact form connections...');
    
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
    
    // Check if any user emails match Firebase institution domains
    console.log('\n=== EMAIL DOMAIN TO FIREBASE INSTITUTION MATCHING ===');
    pgUsers.forEach(user => {
      const userEmailDomain = user.email.split('@')[1];
      if (userEmailDomain) {
        const matchingFbInst = fbInstitutions.find(inst => inst.domain === userEmailDomain);
        if (matchingFbInst) {
          console.log(`\nUser: ${user.email} (domain: ${userEmailDomain})`);
          console.log(`  Matches Firebase Institution: ${matchingFbInst.name} (${matchingFbInst.id})`);
        }
      }
    });
    
    // Check for institution interest requests (these might be the contact form submissions)
    console.log('\n=== CHECKING FOR INSTITUTION INTEREST REQUESTS ===');
    try {
      const interestRequestsSnap = await getDocs(collection(db, 'institution_interests'));
      console.log(`Found ${interestRequestsSnap.size} institution interest requests:`);
      
      if (interestRequestsSnap.empty) {
        console.log('  No institution interest requests found.');
      } else {
        interestRequestsSnap.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n  Request ${index + 1}:`);
          console.log(`    Institution Name: ${data.institutionName || 'Not provided'}`);
          console.log(`    Contact Email: ${data.email || 'Not provided'}`);
          console.log(`    Contact Name: ${data.contactName || 'Not provided'}`);
          console.log(`    Status: ${data.status || 'Not provided'}`);
          console.log(`    Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toString() : 'Unknown'}`);
        });
      }
    } catch (error) {
      console.log('  Error accessing institution_interests collection:', error.message);
    }
    
    // Check for any collections that might contain contact form data
    console.log('\n=== CHECKING FOR CONTACT FORM RELATED COLLECTIONS ===');
    const possibleCollections = ['contact_forms', 'institution_requests', 'signup_requests', 'partnership_requests'];
    
    for (const collectionName of possibleCollections) {
      try {
        const snap = await getDocs(collection(db, collectionName));
        console.log(`\n  Collection: ${collectionName}`);
        console.log(`    Documents found: ${snap.size}`);
        
        if (snap.size > 0) {
          snap.forEach((doc, index) => {
            const data = doc.data();
            console.log(`    Document ${index + 1} (${doc.id}):`);
            // Print first few fields to avoid overwhelming output
            const keys = Object.keys(data);
            keys.slice(0, 5).forEach(key => {
              console.log(`      ${key}: ${data[key]}`);
            });
            if (keys.length > 5) {
              console.log(`      ... and ${keys.length - 5} more fields`);
            }
          });
        }
      } catch (error) {
        console.log(`    Error accessing ${collectionName}: ${error.message}`);
      }
    }
    
    // Look for any documents that might reference the specific institution names
    console.log('\n=== SEARCHING FOR REFERENCES TO SPECIFIC INSTITUTIONS ===');
    const targetInstitutions = ['Awolowo University', 'Lethbridge Polytechnic', 'Leadcity University'];
    
    for (const instName of targetInstitutions) {
      console.log(`\n  Searching for references to: "${instName}"`);
      
      // Check in PostgreSQL users table
      const pgMatchResult = await client.query(`
        SELECT id, email, name, institution_id 
        FROM users 
        WHERE name ILIKE $1 OR email ILIKE $1
      `, [`%${instName}%`]);
      
      if (pgMatchResult.rowCount > 0) {
        console.log(`    Found in PostgreSQL users:`);
        pgMatchResult.rows.forEach(row => {
          console.log(`      - ${row.email} (${row.name})`);
        });
      }
      
      // Check in PostgreSQL institutions table
      const pgInstMatchResult = await client.query(`
        SELECT id, name, domain 
        FROM institutions 
        WHERE name ILIKE $1
      `, [`%${instName}%`]);
      
      if (pgInstMatchResult.rowCount > 0) {
        console.log(`    Found in PostgreSQL institutions:`);
        pgInstMatchResult.rows.forEach(row => {
          console.log(`      - ${row.name} (${row.domain})`);
        });
      }
    }
    
    client.release();
    console.log('\n✅ Contact form connections check completed');
    
  } catch (error) {
    console.error('❌ Error in contact form connections check:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the function
checkContactFormConnections();