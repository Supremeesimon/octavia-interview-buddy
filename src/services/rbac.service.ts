import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole, UserProfile } from '@/types';

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

      // Check institutions collection for admins, teachers, and students
      // This is a simplified approach - in a real implementation, we'd need to search subcollections
      // For now, we'll return null to indicate we couldn't determine the role
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
      // Check platform admins first
      const platformAdminDoc = await getDoc(doc(db, this.PLATFORM_ADMINS_COLLECTION, userId));
      if (platformAdminDoc.exists()) {
        const data = platformAdminDoc.data();
        return {
          id: platformAdminDoc.id,
          ...data,
          role: 'platform_admin',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }

      // Check external users
      const externalUserDoc = await getDoc(doc(db, this.EXTERNAL_USERS_COLLECTION, userId));
      if (externalUserDoc.exists()) {
        const data = externalUserDoc.data();
        return {
          id: externalUserDoc.id,
          ...data,
          role: 'student',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }

      // Check institutions collection for admins, teachers, and students
      // This is a simplified approach - in a real implementation, we'd need to search subcollections
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Check if user belongs to specific institution
  static async userBelongsToInstitution(userId: string, institutionId: string): Promise<boolean> {
    try {
      // This is a simplified approach - in a real implementation, we'd need to check subcollections
      // For now, we'll return true for platform admins and false for others
      const userRole = await this.getUserRole(userId);
      return userRole === 'platform_admin';
    } catch (error) {
      console.error('Error checking institution membership:', error);
      return false;
    }
  }

  // Check if user belongs to specific department
  static async userBelongsToDepartment(userId: string, institutionId: string, departmentId: string): Promise<boolean> {
    try {
      // This is a simplified approach - in a real implementation, we'd need to check subcollections
      // For now, we'll return true for platform admins and false for others
      const userRole = await this.getUserRole(userId);
      return userRole === 'platform_admin';
    } catch (error) {
      console.error('Error checking department membership:', error);
      return false;
    }
  }
}