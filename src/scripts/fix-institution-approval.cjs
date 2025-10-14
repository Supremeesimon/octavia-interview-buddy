#!/usr/bin/env node

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');

// Try to initialize with service account
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  
  if (Object.keys(serviceAccount).length > 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    // Initialize with default credentials (for development)
    admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials');
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

const db = getFirestore();

async function fixInstitutionApproval() {
  try {
    const institutionName = "Leadcity University";
    
    // Query for the institution by name
    const institutionQuery = db.collection('institutions').where('name', '==', institutionName);
    const institutionSnapshot = await institutionQuery.get();
    
    if (institutionSnapshot.empty) {
      console.log(`No institution found with name: ${institutionName}`);
      return;
    }
    
    const institutionDoc = institutionSnapshot.docs[0];
    const institutionData = institutionDoc.data();
    
    console.log('Current institution data:');
    console.log('ID:', institutionDoc.id);
    console.log('Name:', institutionData.name);
    console.log('Approval Status:', institutionData.approvalStatus || 'Not set');
    console.log('Platform Admin ID:', institutionData.platform_admin_id || 'Not set');
    
    // Check if already approved
    if (institutionData.approvalStatus === 'approved' && institutionData.platform_admin_id) {
      console.log('Institution is already properly approved.');
      return;
    }
    
    // Update the institution with approval status and platform admin ID
    const updateData = {
      approvalStatus: 'approved',
      platform_admin_id: institutionData.platform_admin_id || 'FIXED_MANUALLY', // Use existing or set default
      updatedAt: Timestamp.now()
    };
    
    await institutionDoc.ref.update(updateData);
    
    console.log('Institution approval fixed successfully!');
    console.log('Updated fields:');
    console.log('- approvalStatus:', updateData.approvalStatus);
    console.log('- platform_admin_id:', updateData.platform_admin_id);
    
  } catch (error) {
    console.error('Error fixing institution approval:', error);
    process.exit(1);
  }
}

// Run the fix
fixInstitutionApproval().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});