import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file from functions directory
    const serviceAccountPath = join(__dirname, '../../functions/service-account-key.json');
    const serviceAccountBuffer = readFileSync(serviceAccountPath);
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString());
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Please ensure you have the service-account-key.json file in the functions directory');
    process.exit(1);
  }
}

const db = getFirestore();

async function setPlatformAdmin(email: string) {
  try {
    console.log(`Setting user with email ${email} as platform admin...`);
    
    // First, let's try to find the user in the old 'users' collection for backward compatibility
    console.log('Searching in legacy users collection...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('Found user in legacy collection:', {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        currentRole: userData.role
      });
      
      // Create a new platform admin document with the same data
      const platformAdminData = {
        ...userData,
        role: 'platform_admin',
        createdAt: userData.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminData);
      console.log('Successfully created platform admin in new collection');
      
      // Optionally, you might want to delete the old document
      // await userDoc.ref.delete();
      // console.log('Deleted user from legacy collection');
      
      return;
    }
    
    // If not found in legacy collection, search in the new hierarchical structure
    console.log('User not found in legacy collection. Searching in new structure...');
    
    // Search in externalUsers collection
    console.log('Searching in externalUsers collection...');
    const externalUsersRef = db.collection('externalUsers');
    const externalSnapshot = await externalUsersRef.where('email', '==', email).limit(1).get();
    
    if (!externalSnapshot.empty) {
      const userDoc = externalSnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log('Found user in externalUsers collection:', {
        id: userDoc.id,
        name: userData.name,
        email: userData.email
      });
      
      // Move user to platformAdmins collection
      const platformAdminData = {
        ...userData,
        role: 'platform_admin',
        createdAt: userData.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminData);
      console.log('Successfully moved user to platformAdmins collection');
      
      // Delete from externalUsers collection
      await userDoc.ref.delete();
      console.log('Deleted user from externalUsers collection');
      
      return;
    }
    
    // Search in institutions collection (admins, teachers, students)
    console.log('Searching in institutions collection...');
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      
      // Check admins subcollection
      const adminsRef = db.collection('institutions').doc(institutionId).collection('admins');
      const adminSnapshot = await adminsRef.where('email', '==', email).limit(1).get();
      
      if (!adminSnapshot.empty) {
        const userDoc = adminSnapshot.docs[0];
        const userData = userDoc.data();
        
        console.log('Found user in institution admins:', {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          institutionId
        });
        
        // Move user to platformAdmins collection
        const platformAdminData = {
          ...userData,
          role: 'platform_admin',
          createdAt: userData.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminData);
        console.log('Successfully moved user to platformAdmins collection');
        
        // Delete from institution admins collection
        await userDoc.ref.delete();
        console.log('Deleted user from institution admins collection');
        
        return;
      }
      
      // Check departments for teachers and students
      const departmentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        
        // Check teachers
        const teachersRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers');
        const teacherSnapshot = await teachersRef.where('email', '==', email).limit(1).get();
        
        if (!teacherSnapshot.empty) {
          const userDoc = teacherSnapshot.docs[0];
          const userData = userDoc.data();
          
          console.log('Found user in institution teachers:', {
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            institutionId,
            departmentId
          });
          
          // Move user to platformAdmins collection
          const platformAdminData = {
            ...userData,
            role: 'platform_admin',
            createdAt: userData.createdAt || new Date(),
            updatedAt: new Date()
          };
          
          await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminData);
          console.log('Successfully moved user to platformAdmins collection');
          
          // Delete from institution teachers collection
          await userDoc.ref.delete();
          console.log('Deleted user from institution teachers collection');
          
          return;
        }
        
        // Check students
        const studentsRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students');
        const studentSnapshot = await studentsRef.where('email', '==', email).limit(1).get();
        
        if (!studentSnapshot.empty) {
          const userDoc = studentSnapshot.docs[0];
          const userData = userDoc.data();
          
          console.log('Found user in institution students:', {
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            institutionId,
            departmentId
          });
          
          // Move user to platformAdmins collection
          const platformAdminData = {
            ...userData,
            role: 'platform_admin',
            createdAt: userData.createdAt || new Date(),
            updatedAt: new Date()
          };
          
          await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminData);
          console.log('Successfully moved user to platformAdmins collection');
          
          // Delete from institution students collection
          await userDoc.ref.delete();
          console.log('Deleted user from institution students collection');
          
          return;
        }
      }
    }
    
    console.log(`No user found with email ${email}`);
  } catch (error) {
    console.error('Error setting platform admin:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: npm run set-platform-admin <email>');
  console.log('Example: npm run set-platform-admin supremeesimon@gmail.com');
  process.exit(1);
}

setPlatformAdmin(email);