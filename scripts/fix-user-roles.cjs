const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  console.log('Initializing Firebase Admin SDK...');
  
  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Try to initialize with service account from file first
  const serviceAccountPath = path.join(__dirname, '../functions/service-account-key.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Found service account file at:', serviceAccountPath);
    const serviceAccount = require(serviceAccountPath);
    
    // Initialize with service account file
    const firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
    };
    
    // Add databaseURL only if it's set
    if (process.env.FIREBASE_DATABASE_URL) {
      firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }
    
    firebaseAdmin = admin.initializeApp(firebaseConfig);
    console.log('Firebase Admin initialized with service account file');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.log('Using service account from GOOGLE_APPLICATION_CREDENTIALS environment variable');
    // Try to initialize with service account from environment variable
    try {
      const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      // Initialize with service account from environment variable
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
      
      // Add databaseURL only if it's set
      if (process.env.FIREBASE_DATABASE_URL) {
        firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
      }
      
      firebaseAdmin = admin.initializeApp(firebaseConfig);
      console.log('Firebase Admin initialized with service account from environment variable');
    } catch (parseError) {
      console.error('Failed to load service account from GOOGLE_APPLICATION_CREDENTIALS:', parseError.message);
      throw new Error('Invalid service account file from GOOGLE_APPLICATION_CREDENTIALS');
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Using service account from FIREBASE_SERVICE_ACCOUNT environment variable');
    // Try to initialize with service account from environment variable
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Initialize with service account from environment variable
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
      
      // Add databaseURL only if it's set
      if (process.env.FIREBASE_DATABASE_URL) {
        firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
      }
      
      firebaseAdmin = admin.initializeApp(firebaseConfig);
      console.log('Firebase Admin initialized with service account from environment variable');
    } catch (parseError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', parseError.message);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
    }
  } else {
    // For development, try to use application default credentials
    console.log('Initializing with application default credentials (for development)');
    try {
      // Set the project ID from environment if available
      if (process.env.FIREBASE_PROJECT_ID) {
        process.env.GOOGLE_CLOUD_PROJECT = process.env.FIREBASE_PROJECT_ID;
      }
      
      firebaseAdmin = admin.initializeApp();
      console.log('Firebase Admin initialized with application default credentials');
    } catch (initError) {
      console.error('Failed to initialize with application default credentials:', initError.message);
      
      // In development, we might still want to proceed without Firebase Admin
      if (process.env.NODE_ENV === 'development') {
        console.warn('Proceeding without Firebase Admin in development mode');
        firebaseAdmin = null;
      } else {
        // In production, this is a critical error
        console.error('Critical: Firebase Admin failed to initialize in production');
        firebaseAdmin = null;
      }
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error.message);
  console.error('Stack trace:', error.stack);
  
  // In development, we might still want to proceed without Firebase Admin
  if (process.env.NODE_ENV === 'development') {
    console.warn('Proceeding without Firebase Admin in development mode');
    firebaseAdmin = null;
  } else {
    // In production, this is a critical error
    console.error('Critical: Firebase Admin failed to initialize in production');
    firebaseAdmin = null;
  }
}

const db = admin.firestore();

async function fixUserRoles() {
  if (!firebaseAdmin) {
    console.error('Firebase Admin SDK not initialized. Cannot fix user roles.');
    return;
  }

  try {
    console.log('=== Fixing User Roles ===\n');
    
    // Fix supremeesimon@gmail.com as platform admin
    console.log('Setting supremeesimon@gmail.com as platform admin...');
    
    // First, check if user exists anywhere
    let userFound = false;
    let userId = null;
    let userData = null;
    
    // Check external users
    try {
      const externalUsersSnapshot = await db.collection('externalUsers')
        .where('email', '==', 'supremeesimon@gmail.com')
        .limit(1)
        .get();
      
      if (!externalUsersSnapshot.empty) {
        const userDoc = externalUsersSnapshot.docs[0];
        userId = userDoc.id;
        userData = userDoc.data();
        console.log('Found user in externalUsers collection');
        userFound = true;
      }
    } catch (error) {
      console.log('Error checking externalUsers:', error.message);
    }
    
    // If not found, check if user exists in Firebase Auth
    if (!userFound) {
      console.log('Checking if user exists in Firebase Auth...');
      try {
        const userRecord = await admin.auth().getUserByEmail('supremeesimon@gmail.com');
        userId = userRecord.uid;
        console.log('Found existing user in Firebase Auth');
        
        userData = {
          name: userRecord.displayName || 'Simon Onabanjo',
          email: userRecord.email,
          role: 'platform_admin',
          emailVerified: userRecord.emailVerified,
          isEmailVerified: userRecord.emailVerified,
          createdAt: new Date(userRecord.metadata.creationTime),
          updatedAt: new Date(),
          lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : new Date(),
          sessionCount: 0,
          profileCompleted: true
        };
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('User not found in Firebase Auth, creating new user...');
          const userRecord = await admin.auth().createUser({
            email: 'supremeesimon@gmail.com',
            emailVerified: true,
            displayName: 'Simon Onabanjo'
          });
          userId = userRecord.uid;
          
          userData = {
            name: 'Simon Onabanjo',
            email: 'supremeesimon@gmail.com',
            role: 'platform_admin',
            emailVerified: true,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
            sessionCount: 0,
            profileCompleted: true
          };
        } else {
          throw authError;
        }
      }
    }
    
    // Create/update platform admin record
    if (userId && userData) {
      const platformAdminData = {
        ...userData,
        role: 'platform_admin',
        updatedAt: new Date()
      };
      
      await db.collection('platformAdmins').doc(userId).set(platformAdminData, { merge: true });
      console.log('✓ Successfully set supremeesimon@gmail.com as platform admin');
    }
    
    // Fix octavia.intelligence@gmail.com as institution admin
    console.log('\nSetting octavia.intelligence@gmail.com as institution admin...');
    
    // Look for an institution to assign this admin to
    let institutionId = null;
    try {
      const institutionsSnapshot = await db.collection('institutions').get();
      if (!institutionsSnapshot.empty) {
        // Use the first institution (or you can specify which one)
        institutionId = institutionsSnapshot.docs[0].id;
        const institutionData = institutionsSnapshot.docs[0].data();
        console.log(`Assigning to institution: ${institutionData.name} (${institutionId})`);
      }
    } catch (error) {
      console.log('Error finding institutions:', error.message);
    }
    
    // Check if user exists
    userFound = false;
    userId = null;
    userData = null;
    
    // Check external users first
    try {
      const externalUsersSnapshot = await db.collection('externalUsers')
        .where('email', '==', 'octavia.intelligence@gmail.com')
        .limit(1)
        .get();
      
      if (!externalUsersSnapshot.empty) {
        const userDoc = externalUsersSnapshot.docs[0];
        userId = userDoc.id;
        userData = userDoc.data();
        console.log('Found user in externalUsers collection');
        userFound = true;
      }
    } catch (error) {
      console.log('Error checking externalUsers:', error.message);
    }
    
    // If not found, check if user exists in Firebase Auth
    if (!userFound) {
      console.log('Checking if user exists in Firebase Auth...');
      try {
        const userRecord = await admin.auth().getUserByEmail('octavia.intelligence@gmail.com');
        userId = userRecord.uid;
        console.log('Found existing user in Firebase Auth');
        
        userData = {
          name: userRecord.displayName || 'Octavia Intelligence',
          email: userRecord.email,
          role: 'institution_admin',
          emailVerified: userRecord.emailVerified,
          isEmailVerified: userRecord.emailVerified,
          createdAt: new Date(userRecord.metadata.creationTime),
          updatedAt: new Date(),
          lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : new Date(),
          sessionCount: 0,
          profileCompleted: true
        };
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('User not found in Firebase Auth, creating new user...');
          const userRecord = await admin.auth().createUser({
            email: 'octavia.intelligence@gmail.com',
            emailVerified: true,
            displayName: 'Octavia Intelligence'
          });
          userId = userRecord.uid;
          
          userData = {
            name: 'Octavia Intelligence',
            email: 'octavia.intelligence@gmail.com',
            role: 'institution_admin',
            emailVerified: true,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
            sessionCount: 0,
            profileCompleted: true
          };
        } else {
          throw authError;
        }
      }
    }
    
    // Create/update institution admin record
    if (userId && userData && institutionId) {
      const institutionAdminData = {
        ...userData,
        role: 'institution_admin',
        institutionId: institutionId,
        updatedAt: new Date()
      };
      
      await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).set(institutionAdminData, { merge: true });
      console.log('✓ Successfully set octavia.intelligence@gmail.com as institution admin');
    } else if (userId && userData) {
      // If no institution found, put in external users as institution_admin
      const externalUserData = {
        ...userData,
        role: 'institution_admin',
        updatedAt: new Date()
      };
      
      await db.collection('externalUsers').doc(userId).set(externalUserData, { merge: true });
      console.log('✓ Set octavia.intelligence@gmail.com as institution admin in externalUsers collection');
    }
    
    console.log('\n=== User Role Fix Complete ===');
    console.log('Summary:');
    console.log('- supremeesimon@gmail.com: platform_admin');
    console.log('- octavia.intelligence@gmail.com: institution_admin');
    
  } catch (error) {
    console.error('Error fixing user roles:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
fixUserRoles();