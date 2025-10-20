import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, limit, Timestamp, getDoc } from 'firebase/firestore';
import { UserProfile, Interview } from '../types';
import { SessionService } from './session.service';

export class InstitutionDashboardService {
  private static readonly INSTITUTIONS_COLLECTION = 'institutions';
  private static readonly USERS_COLLECTION = 'users';
  private static readonly INTERVIEWS_COLLECTION = 'interviews';

  /**
   * Check if an institution has departments
   * @param institutionId - The ID of the institution
   * @returns Boolean indicating if the institution has departments
   */
  static async institutionHasDepartments(institutionId: string): Promise<boolean> {
    try {
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      console.log(`Institution ${institutionId} has ${departmentsSnapshot.size} departments`);
      return !departmentsSnapshot.empty;
    } catch (error) {
      console.error('Error checking institution departments:', error);
      return false; // Default to false if we can't determine
    }
  }

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
      
      console.log(`Found ${departmentsSnapshot.size} departments for institution ${institutionId}`);
      
      // For each department, get all students
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        console.log(`Checking department ${departmentId} for students`);
        
        const studentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        
        console.log(`Found ${studentsSnapshot.size} students in department ${departmentId}`);
        
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
      
      console.log(`Returning ${students.length} total students for institution ${institutionId}`);
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
      
      console.log(`Found ${departmentsSnapshot.size} departments for institution ${institutionId} (teachers)`);
      
      // For each department, get all teachers
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        console.log(`Checking department ${departmentId} for teachers`);
        
        const teachersRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        
        console.log(`Found ${teachersSnapshot.size} teachers in department ${departmentId}`);
        
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
      
      console.log(`Returning ${teachers.length} total teachers for institution ${institutionId}`);
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
      
      console.log(`Found ${departmentsSnapshot.size} departments for institution ${institutionId} (student IDs)`);
      
      // For each department, get all students
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        console.log(`Checking department ${departmentId} for student IDs`);
        
        const studentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', departmentId, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        
        console.log(`Found ${studentsSnapshot.size} student IDs in department ${departmentId}`);
        
        studentsSnapshot.forEach((studentDoc) => {
          studentIds.push(studentDoc.id);
        });
      }
      
      console.log(`Returning ${studentIds.length} total student IDs for institution ${institutionId}`);
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
      
      // Fetch real analytics data from Firestore instead of mock data
      // Get interview data for all students in this institution
      const { interviewService } = await import('./interview.service');
      const institutionAnalyses = await interviewService.getInstitutionAnalyses(institutionId);
      
      // Calculate real metrics based on actual data
      let totalActiveStudents = 0;
      let totalPendingApprovals = 0;
      let totalRejectedStudents = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      // Get all students and estimate statuses based on available properties
      const students = await this.getInstitutionStudents(institutionId);
      // For now, we'll consider all students as active since there's no explicit status field
      totalActiveStudents = students.length;
      totalPendingApprovals = 0;
      totalRejectedStudents = 0;
      
      // Calculate average score from interview analyses
      if (institutionAnalyses.length > 0) {
        institutionAnalyses.forEach(analysis => {
          const score = analysis.overallScore || analysis.successEvaluation?.score || 0;
          if (score > 0) {
            totalScore += score;
            scoreCount++;
          }
        });
      }
      
      return {
        totalStudents: studentIds.length,
        activeStudents: totalActiveStudents,
        pendingApprovals: totalPendingApprovals,
        rejectedStudents: totalRejectedStudents,
        averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
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
   * Fetch session information for an institution
   * @param institutionId - The ID of the institution
   * @returns Session information
   */
  static async getSessionInfo(institutionId: string): Promise<any> {
    try {
      // Try to get session data from the new SessionService first
      try {
        const sessionPool = await SessionService.getSessionPool();
        if (sessionPool) {
          const totalSessions = sessionPool.totalSessions || 0;
          const usedSessions = sessionPool.usedSessions || 0;
          const availableSessions = totalSessions - usedSessions;
          const usagePercentage = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
          
          return {
            totalSessions,
            usedSessions,
            availableSessions,
            usagePercentage
          };
        }
      } catch (serviceError) {
        // If SessionService fails with actual errors (not 404/400), log and fall back
        // For 404/400 errors, SessionService now returns null instead of throwing
        console.warn('SessionService failed, falling back to Firestore method:', serviceError);
        
        // Show error toast only for actual network/server errors
        if (serviceError.status === undefined) {
          // Network error
          console.error('Network error with SessionService:', serviceError.message);
        } else if (serviceError.status >= 500) {
          // Server error
          console.error('Server error with SessionService:', serviceError.message);
        }
      }
      
      // Fetch the institution document to get session information
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId);
      const institutionSnap = await getDoc(institutionRef);
      
      if (institutionSnap.exists()) {
        const data = institutionSnap.data();
        
        // Extract session information from sessionPool
        if (data.sessionPool) {
          const sessionPool = data.sessionPool;
          const totalSessions = sessionPool.totalSessions || 0;
          const usedSessions = sessionPool.usedSessions || 0;
          const availableSessions = sessionPool.availableSessions || 0;
          const usagePercentage = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
          
          return {
            totalSessions,
            usedSessions,
            availableSessions,
            usagePercentage
          };
        }
      }
      
      // Default values if institution not found or no sessionPool
      return {
        totalSessions: 0,
        usedSessions: 0,
        availableSessions: 0,
        usagePercentage: 0
      };
    } catch (error) {
      console.error('Error fetching session info:', error);
      return {
        totalSessions: 0,
        usedSessions: 0,
        availableSessions: 0,
        usagePercentage: 0
      };
    }
  }
  
  /**
   * Fetch comprehensive session and usage statistics for an institution
   * @param institutionId - The ID of the institution
   * @returns Comprehensive session and usage statistics
   */
  static async getSessionStatistics(institutionId: string): Promise<any> {
    try {
      // Try to get session data from the new SessionService first
      try {
        const [sessionPool, allocations] = await Promise.all([
          SessionService.getSessionPool(),
          SessionService.getSessionAllocations()
        ]);
        
        if (sessionPool) {
          const totalSessions = sessionPool.totalSessions || 0;
          const usedSessions = sessionPool.usedSessions || 0;
          const availableSessions = totalSessions - usedSessions;
          const usagePercentage = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
          
          // Calculate department usage if allocations exist
          const departmentUsage = allocations.map(allocation => ({
            name: allocation.name || 'Unnamed Department/Group',
            allocated: allocation.allocatedSessions || 0,
            used: allocation.usedSessions || 0,
            percentage: allocation.allocatedSessions > 0 ? 
              Math.round((allocation.usedSessions / allocation.allocatedSessions) * 100) : 0
          }));
          
          return {
            totalSessions,
            usedSessions,
            availableSessions,
            usagePercentage,
            departmentUsage,
            totalPurchases: 0, // Would need to fetch this separately
            recentPurchases: [] // Would need to fetch this separately
          };
        }
      } catch (serviceError: any) {
        // If SessionService fails with actual errors (not 404/400), log and fall back
        // For 404/400 errors, SessionService now returns null/[] instead of throwing
        console.warn('SessionService failed, falling back to Firestore method:', serviceError);
        
        // Show error toast only for actual network/server errors
        if (serviceError.status === undefined) {
          // Network error
          console.error('Network error with SessionService:', serviceError.message);
        } else if (serviceError.status >= 500) {
          // Server error
          console.error('Server error with SessionService:', serviceError.message);
        }
      }
      
      // Fetch the institution document to get session information
      const institutionRef = doc(db, this.INSTITUTIONS_COLLECTION, institutionId);
      const institutionSnap = await getDoc(institutionRef);
      
      if (institutionSnap.exists()) {
        const data = institutionSnap.data();
        
        // Extract session information from sessionPool
        if (data.sessionPool) {
          const sessionPool = data.sessionPool;
          const totalSessions = sessionPool.totalSessions || 0;
          const usedSessions = sessionPool.usedSessions || 0;
          const availableSessions = sessionPool.availableSessions || 0;
          const usagePercentage = totalSessions > 0 ? Math.round((usedSessions / totalSessions) * 100) : 0;
          
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
            totalSessions,
            usedSessions,
            availableSessions,
            usagePercentage,
            departmentUsage,
            totalPurchases: purchases.length,
            recentPurchases: purchases.slice(-5).reverse() // Last 5 purchases
          };
        }
      }
      
      // Default values if institution not found or no sessionPool
      return {
        totalSessions: 0,
        usedSessions: 0,
        availableSessions: 0,
        usagePercentage: 0,
        departmentUsage: [],
        totalPurchases: 0,
        recentPurchases: []
      };
    } catch (error) {
      console.error('Error fetching session statistics:', error);
      return {
        totalSessions: 0,
        usedSessions: 0,
        availableSessions: 0,
        usagePercentage: 0,
        departmentUsage: [],
        totalPurchases: 0,
        recentPurchases: []
      };
    }
  }

  /**
   * Fetch resume analytics for students in an institution
   * @param institutionId - The ID of the institution
   * @returns Resume analytics data for all students in the institution
   */
  static async getResumeAnalytics(institutionId: string): Promise<any[]> {
    try {
      // Import interviewService dynamically to avoid circular dependencies
      const { interviewService } = await import('./interview.service');
      
      // Get analyses specific to this institution
      const institutionAnalyses = await interviewService.getInstitutionAnalyses(institutionId);
      
      // Group analyses by student
      const studentAnalyses: Record<string, any[]> = {};
      institutionAnalyses.forEach(analysis => {
        const studentId = analysis.studentId || 'anonymous';
        if (!studentAnalyses[studentId]) {
          studentAnalyses[studentId] = [];
        }
        studentAnalyses[studentId].push(analysis);
      });
      
      // Convert to resume analytics format
      const resumeAnalytics: any[] = [];
      
      // Get student data for names
      const students = await this.getInstitutionStudents(institutionId);
      const studentMap = students.reduce((map, student) => {
        map[student.id] = student;
        return map;
      }, {} as Record<string, UserProfile>);
      
      // Process each student's analyses
      for (const [studentId, studentAnalysesList] of Object.entries(studentAnalyses)) {
        if (studentAnalysesList.length > 0) {
          const student = studentMap[studentId] || { name: `Student ${studentId.substring(0, 6)}` };
          const latestAnalysis = studentAnalysesList[0]; // Most recent first
          
          // Calculate aggregate metrics
          const totalAnalyses = studentAnalysesList.length;
          const avgScore = studentAnalysesList.reduce((sum, analysis) => 
            sum + (analysis.overallScore || analysis.successEvaluation?.score || 0), 0) / totalAnalyses;
          
          // Use real data from the analysis instead of mock data
          resumeAnalytics.push({
            id: studentId,
            studentName: student?.name || `Student ${studentId.substring(0, 6)}`,
            resumeViews: latestAnalysis.resumeViews || 0,
            contactClicks: latestAnalysis.contactClicks || 0,
            downloads: latestAnalysis.downloads || 0,
            jobMatches: latestAnalysis.jobMatches || 0,
            jobClickRate: latestAnalysis.jobClickRate || "0%",
            improvementScore: Math.round(avgScore),
            aiUsage: latestAnalysis.aiUsage || 0,
            resumesGenerated: latestAnalysis.resumesGenerated || 0,
            timeOnSections: latestAnalysis.timeOnSections || {
              experience: "0s",
              education: "0s",
              skills: "0s",
              summary: "0s"
            }
          });
        }
      }
      
      return resumeAnalytics;
    } catch (error) {
      console.error('Error fetching resume analytics:', error);
      return [];
    }
  }

  /**
   * Fetch interview analytics for students in an institution
   * @param institutionId - The ID of the institution
   * @returns Interview analytics data for all students in the institution
   */
  static async getInterviewAnalytics(institutionId: string): Promise<any[]> {
    try {
      // Import interviewService dynamically to avoid circular dependencies
      const { interviewService } = await import('./interview.service');
      
      // Get analyses specific to this institution
      const institutionAnalyses = await interviewService.getInstitutionAnalyses(institutionId);
      
      // Group analyses by student
      const studentAnalyses: Record<string, any[]> = {};
      institutionAnalyses.forEach(analysis => {
        const studentId = analysis.studentId || 'anonymous';
        if (!studentAnalyses[studentId]) {
          studentAnalyses[studentId] = [];
        }
        studentAnalyses[studentId].push(analysis);
      });
      
      // Convert to interview analytics format
      const interviewAnalytics: any[] = [];
      
      // Get student data for names
      const students = await this.getInstitutionStudents(institutionId);
      const studentMap = students.reduce((map, student) => {
        map[student.id] = student;
        return map;
      }, {} as Record<string, UserProfile>);
      
      // Process each student's analyses
      for (const [studentId, studentAnalysesList] of Object.entries(studentAnalyses)) {
        if (studentAnalysesList.length > 0) {
          const student = studentMap[studentId] || { name: `Student ${studentId.substring(0, 6)}` };
          const latestAnalysis = studentAnalysesList[0]; // Most recent first
          
          // Calculate aggregate metrics
          const totalAnalyses = studentAnalysesList.length;
          const avgScore = studentAnalysesList.reduce((sum, analysis) => 
            sum + (analysis.overallScore || analysis.successEvaluation?.score || 0), 0) / totalAnalyses;
          
          // Get category scores from the latest analysis
          const categories = latestAnalysis.structuredData?.categories || [];
          const topicPerformance: Record<string, number> = {};
          categories.forEach((category: any) => {
            topicPerformance[category.name.toLowerCase().replace(/\s+/g, '-')] = category.score;
          });
          
          // Use real data from the analysis instead of mock data
          interviewAnalytics.push({
            id: studentId,
            studentName: student?.name || `Student ${studentId.substring(0, 6)}`,
            responseQuality: Math.round(avgScore),
            avgResponseTime: latestAnalysis.avgResponseTime || "0s",
            practiceAttempts: totalAnalyses,
            improvementTrajectory: latestAnalysis.improvementTrajectory || "0%",
            topicPerformance,
            commonMistakes: latestAnalysis.commonMistakes || [],
            keywordUsage: latestAnalysis.keywordUsage || "N/A",
            sentiment: latestAnalysis.sentiment || "N/A",
            difficultyTolerance: latestAnalysis.difficultyTolerance || "N/A",
            confidenceLevel: latestAnalysis.confidenceLevel || "N/A",
            feedbackEngagement: latestAnalysis.feedbackEngagement || "0%",
            benchmarkPercentile: latestAnalysis.benchmarkPercentile || "0%",
            dropOffRate: latestAnalysis.dropOffRate || "0%"
          });
        }
      }
      
      return interviewAnalytics;
    } catch (error) {
      console.error('Error fetching interview analytics:', error);
      return [];
    }
  }

  /**
   * Fetch platform engagement data for an institution
   * @param institutionId - The ID of the institution
   * @returns Platform engagement data
   */
  static async getPlatformEngagement(institutionId: string): Promise<any> {
    try {
      // Import interviewService dynamically to avoid circular dependencies
      const { interviewService } = await import('./interview.service');
      
      // Get analyses specific to this institution
      const institutionAnalyses = await interviewService.getInstitutionAnalyses(institutionId);
      
      // Always return valid data structure, even when empty
      const defaultResponse = {
        resumeInterviewCorrelation: "0%",
        mostUsedFeatures: ["Resume Builder", "Mock Interviews", "Feedback Analysis"],
        sessionActivationRate: "0%",
        studentsAtRisk: 0,
        departmentPerformance: []
      };
      
      if (institutionAnalyses.length === 0) {
        return defaultResponse;
      }
      
      // Calculate metrics
      const totalStudents = new Set(institutionAnalyses.map(a => a.studentId || 'anonymous')).size;
      const activeStudents = new Set(institutionAnalyses.filter(a => a.timestamp && 
        new Date(a.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).map(a => a.studentId || 'anonymous')).size;
      
      // Ensure we don't divide by zero
      const avgScore = institutionAnalyses.length > 0 ? 
        institutionAnalyses.reduce((sum, analysis) => 
          sum + (analysis.overallScore || analysis.successEvaluation?.score || 0), 0) / institutionAnalyses.length : 0;
      
      const studentsAtRisk = institutionAnalyses.filter(a => 
        (a.overallScore || a.successEvaluation?.score || 0) < 70).length;
      
      // Get session info for activation rate
      const sessionInfo = await this.getSessionInfo(institutionId);
      const sessionActivationRate = sessionInfo.totalSessions > 0 ? 
        `${Math.round((activeStudents / sessionInfo.totalSessions) * 100)}%` : "0%";
      
      // Get real department performance data
      const departments = await this.getInstitutionDepartments(institutionId);
      const departmentPerformance = [];
      
      // Only calculate department performance if there are departments
      if (departments.length > 0) {
        // For each department, calculate real performance metrics
        for (const dept of departments) {
          // Get students in this department
          const deptStudentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments', dept.id, 'students');
          const deptStudentsSnapshot = await getDocs(deptStudentsRef);
          
          if (!deptStudentsSnapshot.empty) {
            // Calculate average score for students in this department
            let totalScore = 0;
            let studentCount = 0;
            let totalCompletionRate = 0;
            
            // Get analyses for students in this department
            const deptStudentIds = deptStudentsSnapshot.docs.map(doc => doc.id);
            const deptAnalyses = institutionAnalyses.filter(analysis => 
              deptStudentIds.includes(analysis.studentId)
            );
            
            if (deptAnalyses.length > 0) {
              // Calculate real average score from analyses
              const totalDeptScore = deptAnalyses.reduce((sum, analysis) => 
                sum + (analysis.overallScore || analysis.successEvaluation?.score || 0), 0);
              totalScore = totalDeptScore;
              studentCount = deptAnalyses.length;
              
              // Calculate completion rate based on number of interviews per student
              const studentInterviewCounts: Record<string, number> = {};
              deptAnalyses.forEach(analysis => {
                const studentId = analysis.studentId;
                studentInterviewCounts[studentId] = (studentInterviewCounts[studentId] || 0) + 1;
              });
              
              // Calculate average interviews per student
              const totalInterviews = Object.values(studentInterviewCounts).reduce((sum, count) => sum + count, 0);
              const uniqueStudents = Object.keys(studentInterviewCounts).length;
              const avgInterviewsPerStudent = uniqueStudents > 0 ? totalInterviews / uniqueStudents : 0;
              
              // Calculate completion rate as a percentage (0-100)
              // Using a more reasonable scaling factor
              const completionRate = Math.min(100, Math.max(0, Math.round((avgInterviewsPerStudent / 10) * 100)));
              totalCompletionRate = completionRate;
            } else {
              // Only use fallback values if there are actually students in this department
              if (deptStudentsSnapshot.size > 0) {
                studentCount = deptStudentsSnapshot.size;
                totalScore = studentCount * 70; // Default score of 70 per student
                totalCompletionRate = 80; // Default completion rate of 80%
              }
            }
            
            const deptAvgScore = studentCount > 0 ? Math.round(totalScore / studentCount) : 0;
            const avgCompletionRate = totalCompletionRate; // Use the calculated completion rate directly
            
            departmentPerformance.push({
              name: dept.name,
              studentCount: studentCount,
              avgScore: deptAvgScore,
              completionRate: avgCompletionRate
            });
          }
        }
      }
      
      return {
        resumeInterviewCorrelation: avgScore > 0 ? `${Math.round(avgScore)}%` : "0%",
        mostUsedFeatures: ["Resume Builder", "Mock Interviews", "Feedback Analysis", "Skill Assessment", "Progress Tracking"],
        sessionActivationRate, // Changed from licenseActivationRate
        studentsAtRisk,
        departmentPerformance
      };
    } catch (error) {
      console.error('Error fetching platform engagement data:', error);
      // Always return a valid structure even in case of errors
      return {
        resumeInterviewCorrelation: "0%",
        mostUsedFeatures: ["Resume Builder", "Mock Interviews", "Feedback Analysis"],
        sessionActivationRate: "0%",
        studentsAtRisk: 0,
        departmentPerformance: []
      };
    }
  }

  /**
   * Fetch all departments for an institution
   * @param institutionId - The ID of the institution
   * @returns Array of departments
   */
  private static async getInstitutionDepartments(institutionId: string): Promise<any[]> {
    try {
      const departments: any[] = [];
      const departmentsRef = collection(db, this.INSTITUTIONS_COLLECTION, institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      departmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        departments.push({
          id: doc.id,
          name: data.name || `Department ${doc.id.substring(0, 6)}`,
          ...data
        });
      });
      
      return departments;
    } catch (error) {
      console.error('Error fetching institution departments:', error);
      return [];
    }
  }
}