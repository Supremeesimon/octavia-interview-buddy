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

      const docRef = await setDoc(doc(collection(db, this.INSTITUTIONS_COLLECTION)), institutionData);
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

      const docRef = await setDoc(
        doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'admins')),
        adminData
      );
      
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
      const departmentData = {
        departmentName,
        createdAt: Timestamp.now(),
        createdBy
      };

      const docRef = await setDoc(
        doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments')),
        departmentData
      );
      
      const departmentId = docRef.id;
      console.log(`Created department with ID: ${departmentId} for institution: ${institutionId}`);
      return departmentId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const docRef = await setDoc(
        doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers')),
        teacherData
      );
      
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

      const docRef = await setDoc(
        doc(collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students')),
        studentData
      );
      
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
        lastLogin: Timestamp.now()
      };

      const docRef = await setDoc(
        doc(collection(db, this.EXTERNAL_USERS_COLLECTION)),
        externalUserData
      );
      
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

      const docRef = await setDoc(
        doc(collection(db, this.PLATFORM_ADMINS_COLLECTION)),
        platformAdminData
      );
      
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
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
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
}