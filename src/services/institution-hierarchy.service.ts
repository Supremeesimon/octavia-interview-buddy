import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Institution, UserProfile, UserRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class InstitutionHierarchyService {
  private static readonly INSTITUTIONS_COLLECTION = 'institutions';
  private static readonly EXTERNAL_USERS_COLLECTION = 'externalUsers';
  private static readonly PLATFORM_ADMINS_COLLECTION = 'platformAdmins';

  // Create a new institution with proper hierarchical structure
  static async createInstitution(data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generate a unique signup token for this institution
      const signupToken = uuidv4();
      
      // Create the institution document
      const institutionData = {
        ...data,
        customSignupLink: `${window.location.origin}/signup-institution/${signupToken}`,
        customSignupToken: signupToken,
        partnershipRequestDate: Timestamp.now(),
        approvalStatus: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      };

      const docRef = doc(collection(db, this.INSTITUTIONS_COLLECTION));
      await setDoc(docRef, institutionData);
      const institutionId = docRef.id;
      
      console.log(`Created institution with ID: ${institutionId}`);
      return institutionId;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw new Error(`Failed to create institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get institution by ID
  static async getInstitutionById(id: string): Promise<Institution | null> {
    try {
      const docRef = doc(db, this.INSTITUTIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Institution;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching institution:', error);
      return null;
    }
  }

  // Get institution by signup token
  static async getInstitutionByToken(token: string): Promise<Institution | null> {
    try {
      const q = query(
        collection(db, this.INSTITUTIONS_COLLECTION),
        where('customSignupToken', '==', token)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Institution;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching institution by token:', error);
      return null;
    }
  }

  // Create institution admin in the hierarchical structure
  static async createInstitutionAdmin(institutionId: string, userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Create the admin document in the institution's admins subcollection
      const adminData = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      const docRef = doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'admins'));
      await setDoc(docRef, adminData);
      
      const adminId = docRef.id;
      console.log(`Created institution admin with ID: ${adminId} for institution: ${institutionId}`);
      return adminId;
    } catch (error) {
      console.error('Error creating institution admin:', error);
      throw new Error(`Failed to create institution admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create department in the hierarchical structure
  static async createDepartment(institutionId: string, departmentName: string, createdBy: string): Promise<string> {
    try {
      // Generate a unique signup token for this department
      const signupToken = uuidv4();
      
      const departmentData = {
        departmentName,
        departmentSignupToken: signupToken,
        departmentSignupLink: `${window.location.origin}/signup-institution/${institutionId}?department=${encodeURIComponent(departmentName)}&token=${signupToken}`,
        createdAt: Timestamp.now(),
        createdBy
      };

      const docRef = doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments'));
      await setDoc(docRef, departmentData);
      
      const departmentId = docRef.id;
      console.log(`Created department with ID: ${departmentId} for institution: ${institutionId}`);
      return departmentId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get department by signup token
  static async getDepartmentByToken(institutionId: string, token: string): Promise<any | null> {
    try {
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const q = query(departmentsRef, where('departmentSignupToken', '==', token));
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching department by token:', error);
      return null;
    }
  }

  // Create teacher in the hierarchical structure
  static async createTeacher(institutionId: string, departmentId: string, userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Create the teacher document in the department's teachers subcollection
      const teacherData = {
        ...userData,
        departmentId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      const docRef = doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers'));
      await setDoc(docRef, teacherData);
      
      const teacherId = docRef.id;
      console.log(`Created teacher with ID: ${teacherId} for department: ${departmentId} in institution: ${institutionId}`);
      return teacherId;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw new Error(`Failed to create teacher: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create student in the hierarchical structure
  static async createStudent(institutionId: string, departmentId: string, userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>, teacherId?: string): Promise<string> {
    try {
      // Create the student document in the department's students subcollection
      const studentData = {
        ...userData,
        departmentId,
        teacherId,
        enrollmentStatus: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      const docRef = doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students'));
      await setDoc(docRef, studentData);
      
      const studentId = docRef.id;
      console.log(`Created student with ID: ${studentId} for department: ${departmentId} in institution: ${institutionId}`);
      return studentId;
    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error(`Failed to create student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create external user
  static async createExternalUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const externalUserData = {
        ...userData,
        authProvider: 'email', // or 'gmail' for OAuth
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        department: userData.department || null, // Handle undefined department
        yearOfStudy: userData.yearOfStudy || null, // Handle undefined yearOfStudy
      };

      const docRef = doc(collection(db, this.EXTERNAL_USERS_COLLECTION));
      await setDoc(docRef, externalUserData);
      
      const userId = docRef.id;
      console.log(`Created external user with ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error creating external user:', error);
      throw new Error(`Failed to create external user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create platform admin
  static async createPlatformAdmin(userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const platformAdminData = {
        ...userData,
        permissions: [], // Will be set based on role
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = doc(collection(db, this.PLATFORM_ADMINS_COLLECTION));
      await setDoc(docRef, platformAdminData);
      
      const adminId = docRef.id;
      console.log(`Created platform admin with ID: ${adminId}`);
      return adminId;
    } catch (error) {
      console.error('Error creating platform admin:', error);
      throw new Error(`Failed to create platform admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by role and ID from the hierarchical structure
  static async getUserById(role: UserRole, institutionId: string, departmentId: string, userId: string): Promise<UserProfile | null> {
    try {
      let docRef;
      
      switch (role) {
        case 'institution_admin':
          docRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'admins', userId);
          break;
        case 'teacher':
          docRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers', userId);
          break;
        case 'student':
          docRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students', userId);
          break;
        default:
          throw new Error(`Unsupported role: ${role}`);
      }
      
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data: any = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          email: data.email,
          role: data.role,
          institutionDomain: data.institutionDomain,
          emailVerified: data.emailVerified,
          isEmailVerified: data.isEmailVerified,
          department: data.department,
          yearOfStudy: data.yearOfStudy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          sessionCount: data.sessionCount || 0,
          profileCompleted: data.profileCompleted || false
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Update institution
  static async updateInstitution(id: string, data: Partial<Institution>): Promise<void> {
    try {
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, id);
      await updateDoc(institutionRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      throw new Error(`Failed to update institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete institution
  static async deleteInstitution(id: string): Promise<void> {
    try {
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, id);
      await deleteDoc(institutionRef);
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw new Error(`Failed to delete institution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search for user across all collections in the hierarchical structure
  static async findUserById(userId: string): Promise<{user: UserProfile, role: UserRole, institutionId?: string, departmentId?: string} | null> {
    try {
      // Check platform admins first
      const platformAdminDoc = await getDoc(doc(db, this.PLATFORM_ADMINS_COLLECTION, userId));
      if (platformAdminDoc.exists()) {
        const data = platformAdminDoc.data();
        return {
          user: {
            id: platformAdminDoc.id,
            ...data,
            role: 'platform_admin',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as UserProfile,
          role: 'platform_admin'
        };
      }

      // Check external users
      const externalUserDoc = await getDoc(doc(db, this.EXTERNAL_USERS_COLLECTION, userId));
      if (externalUserDoc.exists()) {
        const data = externalUserDoc.data();
        return {
          user: {
            id: externalUserDoc.id,
            ...data,
            role: 'student',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as UserProfile,
          role: 'student'
        };
      }

      // Check institutions for admins, teachers, and students
      const institutionsRef = collection(db, this.INSTITUTIONS_COLLECTION);
      const institutionsSnapshot = await getDocs(institutionsRef);

      for (const institutionDoc of institutionsSnapshot.docs) {
        const institutionId = institutionDoc.id;
        
        // Check admins subcollection
        const adminDoc = await getDoc(
          doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'admins', userId)
        );
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          return {
            user: {
              id: adminDoc.id,
              ...data,
              role: 'institution_admin',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as UserProfile,
            role: 'institution_admin',
            institutionId
          };
        }
        
        // Check departments for teachers and students
        const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
        const departmentsSnapshot = await getDocs(departmentsRef);
        
        for (const departmentDoc of departmentsSnapshot.docs) {
          const departmentId = departmentDoc.id;
          
          // Check teachers
          const teacherDoc = await getDoc(
            doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers', userId)
          );
          if (teacherDoc.exists()) {
            const data = teacherDoc.data();
            return {
              user: {
                id: teacherDoc.id,
                ...data,
                role: 'teacher',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
              } as UserProfile,
              role: 'teacher',
              institutionId,
              departmentId
            };
          }
          
          // Check students
          const studentDoc = await getDoc(
            doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students', userId)
          );
          if (studentDoc.exists()) {
            const data = studentDoc.data();
            return {
              user: {
                id: studentDoc.id,
                ...data,
                role: 'student',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
              } as UserProfile,
              role: 'student',
              institutionId,
              departmentId
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }
}