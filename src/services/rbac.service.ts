import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole, UserProfile } from '@/types';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';

export class RBACService {
  private static readonly INSTITUTIONS_COLLECTION = 'institutions';
  private static readonly EXTERNAL_USERS_COLLECTION = 'externalUsers';
  private static readonly PLATFORM_ADMINS_COLLECTION = 'platformAdmins';

  // Check if user has specific role
  static async checkUserRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      return userRole === requiredRole;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  // Get user role from the new hierarchical structure
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      // Check platform admins first
      const platformAdminDoc = await getDoc(doc(db, this.PLATFORM_ADMINS_COLLECTION, userId));
      if (platformAdminDoc.exists()) {
        return 'platform_admin';
      }

      // Check external users
      const externalUserDoc = await getDoc(doc(db, this.EXTERNAL_USERS_COLLECTION, userId));
      if (externalUserDoc.exists()) {
        return 'student'; // External users are always students
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
          return 'institution_admin';
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
            return 'teacher';
          }
          
          // Check students
          const studentDoc = await getDoc(
            doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students', userId)
          );
          if (studentDoc.exists()) {
            return 'student';
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Check if user has permission
  static async checkPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      
      if (!userRole) {
        return false;
      }

      // Define permissions for each role
      const rolePermissions: Record<UserRole, string[]> = {
        'student': [
          'view_own_interviews',
          'view_own_resumes',
          'create_interview',
          'upload_resume'
        ],
        'teacher': [
          'view_own_interviews',
          'view_own_resumes',
          'view_department_students',
          'view_department_interviews',
          'generate_student_links'
        ],
        'institution_admin': [
          'view_own_interviews',
          'view_own_resumes',
          'manage_institution_teachers',
          'manage_institution_students',
          'view_institution_analytics',
          'manage_departments'
        ],
        'platform_admin': [
          'manage_all_institutions',
          'manage_all_users',
          'view_platform_analytics',
          'manage_system_settings',
          'generate_institution_links'
        ]
      };

      return rolePermissions[userRole].includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  // Get user profile from the new hierarchical structure
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await InstitutionHierarchyService.findUserById(userId);
      return result ? result.user : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Check if user belongs to specific institution
  static async userBelongsToInstitution(userId: string, institutionId: string): Promise<boolean> {
    try {
      const result = await InstitutionHierarchyService.findUserById(userId);
      if (!result) return false;
      
      // Platform admins belong to all institutions
      if (result.role === 'platform_admin') return true;
      
      // Check if user's institution matches the provided institution
      return result.institutionId === institutionId;
    } catch (error) {
      console.error('Error checking institution membership:', error);
      return false;
    }
  }

  // Check if user belongs to specific department
  static async userBelongsToDepartment(userId: string, institutionId: string, departmentId: string): Promise<boolean> {
    try {
      const result = await InstitutionHierarchyService.findUserById(userId);
      if (!result) return false;
      
      // Platform admins belong to all departments
      if (result.role === 'platform_admin') return true;
      
      // Check if user's institution and department match the provided values
      return result.institutionId === institutionId && result.departmentId === departmentId;
    } catch (error) {
      console.error('Error checking department membership:', error);
      return false;
    }
  }
}