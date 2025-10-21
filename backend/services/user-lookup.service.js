const firebaseAdmin = require('../config/firebase');

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - The string to validate
 * @returns {boolean} True if valid UUID, false otherwise
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Lookup user institution data from Firestore
 * @param {string} userId - The Firebase user ID
 * @returns {Promise<Object|null>} User institution data or null if not found
 */
async function lookupUserInFirestore(userId) {
  try {
    // Check if Firebase Admin is initialized
    if (!firebaseAdmin) {
      console.warn('Firebase Admin not initialized, skipping Firestore lookup');
      return null;
    }

    const db = firebaseAdmin.firestore();
    
    // Check platform admins first
    try {
      const platformAdminDoc = await db.collection('platformAdmins').doc(userId).get();
      if (platformAdminDoc.exists) {
        return {
          role: 'platform_admin'
        };
      }
    } catch (error) {
      // Continue to next collection if we don't have permission
      console.debug('No permission to read platform admins collection, continuing...');
    }

    // Check external users
    try {
      const externalUserDoc = await db.collection('externalUsers').doc(userId).get();
      if (externalUserDoc.exists) {
        return {
          role: 'student'
        };
      }
    } catch (error) {
      // Continue to next collection if we don't have permission
      console.debug('No permission to read external users collection, continuing...');
    }

    // Check institutions for admins, teachers, and students
    try {
      const institutionsSnapshot = await db.collection('institutions').get();

      for (const institutionDoc of institutionsSnapshot.docs) {
        const institutionId = institutionDoc.id;
        
        // Validate that the institution ID is a valid UUID before returning it
        if (!isValidUUID(institutionId)) {
          console.debug(`Skipping institution ${institutionId} as it's not a valid UUID`);
          continue;
        }
        
        try {
          // Check admins subcollection
          const adminDoc = await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).get();
          if (adminDoc.exists) {
            const data = adminDoc.data();
            return {
              role: 'institution_admin',
              institutionId
            };
          }
        } catch (error) {
          // Continue to next institution if we don't have permission
          console.debug(`No permission to read admins for institution ${institutionId}, continuing...`);
          continue;
        }
        
        try {
          // Check departments for teachers and students
          const departmentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').get();
          
          for (const departmentDoc of departmentsSnapshot.docs) {
            const departmentId = departmentDoc.id;
            
            try {
              // Check teachers
              const teacherDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc(userId).get();
              if (teacherDoc.exists) {
                return {
                  role: 'teacher',
                  institutionId,
                  departmentId
                };
              }
            } catch (error) {
              // Continue to next department if we don't have permission
              console.debug(`No permission to read teachers for department ${departmentId}, continuing...`);
              continue;
            }
            
            try {
              // Check students
              const studentDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc(userId).get();
              if (studentDoc.exists) {
                return {
                  role: 'student',
                  institutionId,
                  departmentId
                };
              }
            } catch (error) {
              // Continue to next department if we don't have permission
              console.debug(`No permission to read students for department ${departmentId}, continuing...`);
              continue;
            }
          }
        } catch (error) {
          // Continue to next institution if we don't have permission
          console.debug(`No permission to read departments for institution ${institutionId}, continuing...`);
          continue;
        }
      }
    } catch (error) {
      // If we don't have permission to read institutions, log it but don't fail
      console.debug('No permission to read institutions collection, continuing...');
    }

    return null;
  } catch (error) {
    console.error('Error looking up user in Firestore:', error);
    return null;
  }
}

module.exports = {
  lookupUserInFirestore
};