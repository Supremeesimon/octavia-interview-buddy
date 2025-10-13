import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import { Institution } from '@/types';

export class DataMigrationService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly INSTITUTIONS_COLLECTION = 'institutions';

  // Migrate all existing data from flat structure to hierarchical structure
  static async migrateAllData(): Promise<void> {
    try {
      console.log('Starting data migration from flat to hierarchical structure...');
      
      // First migrate institutions
      await this.migrateInstitutions();
      
      // Then migrate users
      await this.migrateUsers();
      
      console.log('Data migration completed successfully!');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw new Error(`Failed to migrate data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Migrate institutions from flat to hierarchical structure
  static async migrateInstitutions(): Promise<void> {
    try {
      console.log('Migrating institutions...');
      
      const institutionsQuery = collection(db, this.INSTITUTIONS_COLLECTION);
      const institutionsSnapshot = await getDocs(institutionsQuery);
      
      console.log(`Found ${institutionsSnapshot.size} institutions to migrate`);
      
      for (const institutionDoc of institutionsSnapshot.docs) {
        const institutionData = institutionDoc.data() as Institution;
        console.log(`Migrating institution: ${institutionData.name} (${institutionDoc.id})`);
        
        // Update the institution with the new required fields
        await InstitutionHierarchyService.updateInstitution(institutionDoc.id, {
          customSignupLink: institutionData.customSignupLink || `${window.location.origin}/signup-institution/${institutionDoc.id}`,
          customSignupToken: institutionData.customSignupToken || institutionDoc.id,
          partnershipRequestDate: institutionData.partnerRequestDate || new Date(),
          approvalStatus: institutionData.approvalStatus || 'approved',
          isActive: institutionData.isActive !== undefined ? institutionData.isActive : true
        });
        
        console.log(`Updated institution: ${institutionData.name}`);
      }
      
      console.log('Institution migration completed!');
    } catch (error) {
      console.error('Error migrating institutions:', error);
      throw new Error(`Failed to migrate institutions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Migrate users from flat to hierarchical structure
  static async migrateUsers(): Promise<void> {
    try {
      console.log('Migrating users...');
      
      const usersQuery = collection(db, this.USERS_COLLECTION);
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log(`Found ${usersSnapshot.size} users to migrate`);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        console.log(`Migrating user: ${userData.name} (${userDoc.id}) with role: ${userData.role}`);
        
        // Skip users without institutionId
        if (!userData.institutionId) {
          // This is likely an external user
          await InstitutionHierarchyService.createExternalUser({
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isEmailVerified: userData.isEmailVerified,
            emailVerified: userData.emailVerified,
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
            lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
            sessionCount: userData.sessionCount || 0,
            profileCompleted: userData.profileCompleted || false
          });
          console.log(`Migrated external user: ${userData.name}`);
          continue;
        }
        
        // Get the institution
        const institution = await InstitutionHierarchyService.getInstitutionById(userData.institutionId);
        if (!institution) {
          console.warn(`User ${userData.name} has invalid institution ID: ${userData.institutionId}`);
          continue;
        }
        
        // Create appropriate user based on role
        switch (userData.role) {
          case 'institution_admin':
            await InstitutionHierarchyService.createInstitutionAdmin(userData.institutionId, {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isEmailVerified: userData.isEmailVerified,
              emailVerified: userData.emailVerified,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
              sessionCount: userData.sessionCount || 0,
              profileCompleted: userData.profileCompleted || false
            });
            console.log(`Migrated institution admin: ${userData.name}`);
            break;
            
          case 'teacher':
            // For teachers, we need to create a department first
            // We'll use a default department for now
            const departmentId = await InstitutionHierarchyService.createDepartment(
              userData.institutionId, 
              userData.department || 'Default Department', 
              userDoc.id
            );
            
            await InstitutionHierarchyService.createTeacher(userData.institutionId, departmentId, {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isEmailVerified: userData.isEmailVerified,
              emailVerified: userData.emailVerified,
              department: userData.department,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
              sessionCount: userData.sessionCount || 0,
              profileCompleted: userData.profileCompleted || false
            });
            console.log(`Migrated teacher: ${userData.name}`);
            break;
            
          case 'student':
            // For students, we need to create a department first
            // We'll use a default department for now
            const studentDepartmentId = await InstitutionHierarchyService.createDepartment(
              userData.institutionId, 
              userData.department || 'Default Department', 
              userDoc.id
            );
            
            await InstitutionHierarchyService.createStudent(userData.institutionId, studentDepartmentId, userDoc.id, {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isEmailVerified: userData.isEmailVerified,
              emailVerified: userData.emailVerified,
              department: userData.department,
              yearOfStudy: userData.yearOfStudy,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
              sessionCount: userData.sessionCount || 0,
              profileCompleted: userData.profileCompleted || false
            });
            console.log(`Migrated student: ${userData.name}`);
            break;
            
          case 'platform_admin':
            await InstitutionHierarchyService.createPlatformAdmin({
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isEmailVerified: userData.isEmailVerified,
              emailVerified: userData.emailVerified,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate() || new Date(),
              sessionCount: userData.sessionCount || 0,
              profileCompleted: userData.profileCompleted || false
            });
            console.log(`Migrated platform admin: ${userData.name}`);
            break;
            
          default:
            console.warn(`Unknown role for user ${userData.name}: ${userData.role}`);
        }
      }
      
      console.log('User migration completed!');
    } catch (error) {
      console.error('Error migrating users:', error);
      throw new Error(`Failed to migrate users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get migration statistics
  static async getMigrationStats(): Promise<{ 
    totalUsers: number; 
    totalInstitutions: number; 
    migratedUsers: number; 
    migratedInstitutions: number 
  }> {
    try {
      // Count total users in old structure
      const usersQuery = collection(db, this.USERS_COLLECTION);
      const usersSnapshot = await getDocs(usersQuery);
      
      // Count total institutions in old structure
      const institutionsQuery = collection(db, this.INSTITUTIONS_COLLECTION);
      const institutionsSnapshot = await getDocs(institutionsQuery);
      
      // For now, we'll return the same counts for migrated data
      // In a real implementation, we'd check the new collections
      return {
        totalUsers: usersSnapshot.size,
        totalInstitutions: institutionsSnapshot.size,
        migratedUsers: usersSnapshot.size,
        migratedInstitutions: institutionsSnapshot.size
      };
    } catch (error) {
      console.error('Error getting migration stats:', error);
      return {
        totalUsers: 0,
        totalInstitutions: 0,
        migratedUsers: 0,
        migratedInstitutions: 0
      };
    }
  }
}