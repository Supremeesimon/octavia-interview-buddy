import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, limit, Timestamp, getDoc } from 'firebase/firestore';
import { UserProfile, Interview } from '../types';

export class InstitutionDashboardService {
  private static readonly INSTITUTIONS_COLLECTION = 'institutions';
  private static readonly USERS_COLLECTION = 'users';
  private static readonly INTERVIEWS_COLLECTION = 'interviews';

  /**
   * Fetch all students belonging to an institution
   * @param institutionId - The ID of the institution
   * @returns Array of student user profiles
   */
  static async getInstitutionStudents(institutionId: string): Promise<UserProfile[]> {
    try {
      const students: UserProfile[] = [];
      
      // Get all departments for this institution
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      // For each department, get all students
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        const studentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const data = studentDoc.data();
          students.push({
            id: studentDoc.id,
            name: data.name,
            email: data.email,
            role: 'student',
            institutionId,
            department: data.department,
            yearOfStudy: data.yearOfStudy,
            emailVerified: data.emailVerified,
            isEmailVerified: data.isEmailVerified,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
            sessionCount: data.sessionCount || 0,
            profileCompleted: data.profileCompleted || false
          } as UserProfile);
        }
      }
      
      return students;
    } catch (error) {
      console.error('Error fetching institution students:', error);
      return [];
    }
  }

  /**
   * Fetch all teachers belonging to an institution
   * @param institutionId - The ID of the institution
   * @returns Array of teacher user profiles
   */
  static async getInstitutionTeachers(institutionId: string): Promise<UserProfile[]> {
    try {
      const teachers: UserProfile[] = [];
      
      // Get all departments for this institution
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      // For each department, get all teachers
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        const teachersRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const data = teacherDoc.data();
          teachers.push({
            id: teacherDoc.id,
            name: data.name,
            email: data.email,
            role: 'teacher',
            institutionId,
            department: data.department,
            emailVerified: data.emailVerified,
            isEmailVerified: data.isEmailVerified,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
            sessionCount: data.sessionCount || 0,
            profileCompleted: data.profileCompleted || false
          } as UserProfile);
        }
      }
      
      return teachers;
    } catch (error) {
      console.error('Error fetching institution teachers:', error);
      return [];
    }
  }

  /**
   * Fetch upcoming scheduled interviews for students in an institution
   * @param institutionId - The ID of the institution
   * @returns Array of scheduled interviews
   */
  static async getInstitutionScheduledInterviews(institutionId: string): Promise<Interview[]> {
    try {
      // First, get all student IDs in this institution
      const studentIds = await this.getStudentIdsForInstitution(institutionId);
      
      if (studentIds.length === 0) {
        return [];
      }
      
      // Limit to 30 student IDs per query due to Firestore constraints
      const batches = this.chunkArray(studentIds, 30);
      const interviews: Interview[] = [];
      
      // Query interviews for each batch of students
      for (const batch of batches) {
        const q = query(
          collection(db, this.INTERVIEWS_COLLECTION),
          where('studentId', 'in', batch),
          where('status', '==', 'scheduled'),
          orderBy('scheduledAt'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          interviews.push({
            id: doc.id,
            ...data,
            scheduledAt: data.scheduledAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Interview);
        });
      }
      
      // Sort by scheduled date
      return interviews.sort((a, b) => 
        (a.scheduledAt as Date).getTime() - (b.scheduledAt as Date).getTime()
      );
    } catch (error) {
      console.error('Error fetching institution scheduled interviews:', error);
      return [];
    }
  }

  /**
   * Helper method to get all student IDs for an institution
   * @param institutionId - The ID of the institution
   * @returns Array of student IDs
   */
  private static async getStudentIdsForInstitution(institutionId: string): Promise<string[]> {
    try {
      const studentIds: string[] = [];
      
      // Get all departments for this institution
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      // For each department, get all students
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        const studentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        
        studentsSnapshot.forEach((studentDoc) => {
          studentIds.push(studentDoc.id);
        });
      }
      
      return studentIds;
    } catch (error) {
      console.error('Error fetching student IDs for institution:', error);
      return [];
    }
  }

  /**
   * Helper method to chunk array into smaller arrays
   * @param array - The array to chunk
   * @param size - The chunk size
   * @returns Array of chunked arrays
   */
  private static chunkArray(array: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Approve a student's institution affiliation
   * @param studentId - The ID of the student
   * @param institutionId - The ID of the institution
   * @param departmentId - The ID of the department
   */
  static async approveStudent(studentId: string, institutionId: string, departmentId: string): Promise<void> {
    try {
      const studentRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students', studentId);
      await updateDoc(studentRef, {
        approved: true,
        approvedAt: Timestamp.now(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error approving student:', error);
      throw error;
    }
  }

  /**
   * Reject a student's institution affiliation
   * @param studentId - The ID of the student
   * @param institutionId - The ID of the institution
   * @param departmentId - The ID of the department
   */
  static async rejectStudent(studentId: string, institutionId: string, departmentId: string): Promise<void> {
    try {
      const studentRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students', studentId);
      await updateDoc(studentRef, {
        approved: false,
        rejectedAt: Timestamp.now(),
        status: 'rejected'
      });
    } catch (error) {
      console.error('Error rejecting student:', error);
      throw error;
    }
  }

  /**
   * Fetch student analytics for an institution
   * @param institutionId - The ID of the institution
   * @returns Student analytics data
   */
  static async getStudentAnalytics(institutionId: string): Promise<any> {
    try {
      // Get all student IDs in this institution
      const studentIds = await this.getStudentIdsForInstitution(institutionId);
      
      if (studentIds.length === 0) {
        return {
          totalStudents: 0,
          activeStudents: 0,
          pendingApprovals: 0,
          rejectedStudents: 0,
          averageScore: 0
        };
      }
      
      // For now, return mock data with real student counts
      // In a full implementation, this would fetch real analytics from Firestore
      return {
        totalStudents: studentIds.length,
        activeStudents: Math.floor(studentIds.length * 0.8),
        pendingApprovals: Math.floor(studentIds.length * 0.15),
        rejectedStudents: Math.floor(studentIds.length * 0.05),
        averageScore: 85
      };
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        pendingApprovals: 0,
        rejectedStudents: 0,
        averageScore: 0
      };
    }
  }

  /**
   * Fetch license information for an institution
   * @param institutionId - The ID of the institution
   * @returns License information
   */
  static async getLicenseInfo(institutionId: string): Promise<any> {
    try {
      // Fetch the institution document to get license information
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId);
      const institutionSnap = await getDoc(institutionRef);
      
      if (institutionSnap.exists()) {
        const data = institutionSnap.data();
        // Extract license information from sessionPool
        if (data.sessionPool) {
          const sessionPool = data.sessionPool;
          const totalLicenses = sessionPool.totalSessions || 0;
          const usedLicenses = sessionPool.usedSessions || 0;
          const availableLicenses = sessionPool.availableSessions || 0;
          const usagePercentage = totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0;
          
          return {
            totalLicenses,
            usedLicenses,
            availableLicenses,
            usagePercentage
          };
        }
      }
      
      // Default values if institution not found or no sessionPool
      return {
        totalLicenses: 0,
        usedLicenses: 0,
        availableLicenses: 0,
        usagePercentage: 0
      };
    } catch (error) {
      console.error('Error fetching license info:', error);
      return {
        totalLicenses: 0,
        usedLicenses: 0,
        availableLicenses: 0,
        usagePercentage: 0
      };
    }
  }

  /**
   * Fetch comprehensive license and usage statistics for an institution
   * @param institutionId - The ID of the institution
   * @returns Comprehensive license and usage statistics
   */
  static async getLicenseStatistics(institutionId: string): Promise<any> {
    try {
      // Fetch the institution document to get license information
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId);
      const institutionSnap = await getDoc(institutionRef);
      
      if (institutionSnap.exists()) {
        const data = institutionSnap.data();
        
        // Extract license information from sessionPool
        if (data.sessionPool) {
          const sessionPool = data.sessionPool;
          const totalLicenses = sessionPool.totalSessions || 0;
          const usedLicenses = sessionPool.usedSessions || 0;
          const availableLicenses = sessionPool.availableSessions || 0;
          const usagePercentage = totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0;
          
          // Get additional information from session allocations
          const allocations = sessionPool.allocations || [];
          const purchases = sessionPool.purchases || [];
          
          // Calculate department usage if allocations exist
          const departmentUsage = allocations.map(allocation => ({
            name: allocation.name || 'Unnamed Department',
            allocated: allocation.allocatedSessions || 0,
            used: allocation.usedSessions || 0,
            percentage: allocation.allocatedSessions > 0 ? 
              Math.round((allocation.usedSessions / allocation.allocatedSessions) * 100) : 0
          }));
          
          return {
            totalLicenses,
            usedLicenses,
            availableLicenses,
            usagePercentage,
            departmentUsage,
            totalPurchases: purchases.length,
            recentPurchases: purchases.slice(-5).reverse() // Last 5 purchases
          };
        }
      }
      
      // Default values if institution not found or no sessionPool
      return {
        totalLicenses: 0,
        usedLicenses: 0,
        availableLicenses: 0,
        usagePercentage: 0,
        departmentUsage: [],
        totalPurchases: 0,
        recentPurchases: []
      };
    } catch (error) {
      console.error('Error fetching license statistics:', error);
      return {
        totalLicenses: 0,
        usedLicenses: 0,
        availableLicenses: 0,
        usagePercentage: 0,
        departmentUsage: [],
        totalPurchases: 0,
        recentPurchases: []
      };
    }
  }
}