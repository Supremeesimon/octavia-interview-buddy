import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  Interview, 
  InterviewFeedback,
  StudentStats,
  InstitutionStats
} from '@/types';

export class InterviewService {
  private readonly COLLECTIONS = {
    interviews: 'interviews',
    feedback: 'interview-feedback',
    sessions: 'interview-sessions',
    studentStats: 'student-stats',
    institutionStats: 'institution-stats',
    endOfCallAnalysis: 'end-of-call-analysis',
    departmentStats: 'department-stats' // Add department stats collection
  } as const;

  // Create a new interview session
  async createInterview(interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> {
    try {
      const interviewId = doc(collection(db, this.COLLECTIONS.interviews)).id;
      
      const newInterview: Interview = {
        id: interviewId,
        ...interviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, this.COLLECTIONS.interviews, interviewId), {
        ...newInterview,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return newInterview;
    } catch (error) {
      console.error('Error creating interview:', error);
      throw new Error('Failed to create interview');
    }
  }

  // Update interview status
  async updateInterviewStatus(interviewId: string, status: Interview['status']): Promise<void> {
    try {
      const interviewRef = doc(db, this.COLLECTIONS.interviews, interviewId);
      await updateDoc(interviewRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating interview status:', error);
      throw new Error('Failed to update interview status');
    }
  }

  // Save interview transcript
  async saveTranscript(interviewId: string, transcript: string): Promise<void> {
    try {
      const interviewRef = doc(db, this.COLLECTIONS.interviews, interviewId);
      await updateDoc(interviewRef, {
        transcript,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving transcript:', error);
      throw new Error('Failed to save transcript');
    }
  }

  // Save interview recording URL
  async saveRecording(interviewId: string, recordingUrl: string, duration: number): Promise<void> {
    try {
      const interviewRef = doc(db, this.COLLECTIONS.interviews, interviewId);
      await updateDoc(interviewRef, {
        recordingUrl,
        recordingDuration: duration,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving recording:', error);
      throw new Error('Failed to save recording');
    }
  }

  // Save interview feedback
  async saveFeedback(feedbackData: Omit<InterviewFeedback, 'id' | 'createdAt'>): Promise<InterviewFeedback> {
    try {
      const feedbackId = doc(collection(db, this.COLLECTIONS.feedback)).id;
      
      const newFeedback: InterviewFeedback = {
        id: feedbackId,
        ...feedbackData,
        createdAt: new Date()
      };

      await setDoc(doc(db, this.COLLECTIONS.feedback, feedbackId), newFeedback);

      return newFeedback;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw new Error('Failed to save feedback');
    }
  }

  // Get interview by ID
  async getInterview(interviewId: string): Promise<Interview | null> {
    try {
      const interviewDoc = await getDoc(doc(db, this.COLLECTIONS.interviews, interviewId));
      
      if (interviewDoc.exists()) {
        return { 
          id: interviewDoc.id, 
          ...(interviewDoc.data() as any)
        } as Interview;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting interview:', error);
      throw new Error('Failed to get interview');
    }
  }

  // Get interviews for a student
  async getStudentInterviews(studentId: string): Promise<Interview[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.interviews),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Interview));
    } catch (error) {
      console.error('Error getting student interviews:', error);
      throw new Error('Failed to get student interviews');
    }
  }

  // Get interview feedback
  async getInterviewFeedback(interviewId: string): Promise<InterviewFeedback | null> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.feedback),
        where('interviewId', '==', interviewId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...(doc.data() as any)
        } as InterviewFeedback;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting interview feedback:', error);
      throw new Error('Failed to get interview feedback');
    }
  }

  // Update student statistics
  async updateStudentStats(studentId: string, stats: Partial<StudentStats>): Promise<void> {
    try {
      const statsRef = doc(db, this.COLLECTIONS.studentStats, studentId);
      await setDoc(statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating student stats:', error);
      throw new Error('Failed to update student stats');
    }
  }

  // Get student statistics
  async getStudentStats(studentId: string): Promise<StudentStats | null> {
    try {
      const statsDoc = await getDoc(doc(db, this.COLLECTIONS.studentStats, studentId));
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          id: statsDoc.id,
          totalInterviews: data.totalInterviews || 0,
          completedInterviews: data.completedInterviews || 0,
          averageScore: data.averageScore || 0,
          improvementRate: data.improvementRate || 0,
          lastInterviewDate: data.lastInterviewDate ? new Date(data.lastInterviewDate) : undefined,
          strongestSkills: data.strongestSkills || [],
          areasForImprovement: data.areasForImprovement || []
        } as StudentStats;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting student stats:', error);
      throw new Error('Failed to get student stats');
    }
  }

  // Update institution statistics
  async updateInstitutionStats(institutionId: string, stats: Partial<InstitutionStats>): Promise<void> {
    try {
      const statsRef = doc(db, this.COLLECTIONS.institutionStats, institutionId);
      await setDoc(statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating institution stats:', error);
      throw new Error('Failed to update institution stats');
    }
  }

  // Get institution statistics
  async getInstitutionStats(institutionId: string): Promise<InstitutionStats | null> {
    try {
      const statsDoc = await getDoc(doc(db, this.COLLECTIONS.institutionStats, institutionId));
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          id: statsDoc.id,
          totalStudents: data.totalStudents || 0,
          activeStudents: data.activeStudents || 0,
          totalInterviews: data.totalInterviews || 0,
          averageScore: data.averageScore || 0,
          sessionUtilization: data.sessionUtilization || 0,
          topPerformingDepartments: data.topPerformingDepartments || [],
          monthlyUsage: data.monthlyUsage || []
        } as InstitutionStats;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting institution stats:', error);
      throw new Error('Failed to get institution stats');
    }
  }

  // Get recent interviews for analytics
  async getRecentInterviews(limitCount: number = 50): Promise<Interview[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.interviews),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Interview));
    } catch (error) {
      console.error('Error getting recent interviews:', error);
      throw new Error('Failed to get recent interviews');
    }
  }

  // Save end-of-call analysis data with proper hierarchy
  async saveEndOfCallAnalysis(analysisData: any): Promise<void> {
    try {
      const analysisId = doc(collection(db, this.COLLECTIONS.endOfCallAnalysis)).id;
      
      const analysisRecord = {
        id: analysisId,
        ...analysisData,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, this.COLLECTIONS.endOfCallAnalysis, analysisId), analysisRecord);
      
      // Update student statistics
      if (analysisData.studentId) {
        await this.updateStudentStatsFromAnalysis(analysisData.studentId, analysisData);
      }
      
      // Update department statistics
      if (analysisData.department) {
        await this.updateDepartmentStatsFromAnalysis(analysisData.department, analysisData);
      }
      
      // Update institution statistics
      if (analysisData.institutionId) {
        await this.updateInstitutionStatsFromAnalysis(analysisData.institutionId, analysisData);
      }
    } catch (error) {
      console.error('Error saving end-of-call analysis:', error);
      throw new Error('Failed to save end-of-call analysis');
    }
  }

  // Get end-of-call analysis for an interview
  async getEndOfCallAnalysis(callId: string): Promise<any | null> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.endOfCallAnalysis),
        where('callId', '==', callId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...(doc.data() as any)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting end-of-call analysis:', error);
      throw new Error('Failed to get end-of-call analysis');
    }
  }

  // Get all end-of-call analyses for a student (data isolation)
  async getStudentAnalyses(studentId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.endOfCallAnalysis),
        where('studentId', '==', studentId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error getting student analyses:', error);
      throw new Error('Failed to get student analyses');
    }
  }

  // Get all end-of-call analyses for a department (data isolation)
  async getDepartmentAnalyses(departmentId: string, institutionId: string): Promise<any[]> {
    try {
      // Ensure department belongs to the institution for data isolation
      const q = query(
        collection(db, this.COLLECTIONS.endOfCallAnalysis),
        where('departmentId', '==', departmentId),
        where('institutionId', '==', institutionId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error getting department analyses:', error);
      throw new Error('Failed to get department analyses');
    }
  }

  // Get all end-of-call analyses for an institution (data isolation)
  async getInstitutionAnalyses(institutionId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.endOfCallAnalysis),
        where('institutionId', '==', institutionId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error getting institution analyses:', error);
      throw new Error('Failed to get institution analyses');
    }
  }

  // Get all end-of-call analyses for platform admin (no filtering)
  async getAllAnalyses(limitCount: number = 100): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.endOfCallAnalysis),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error getting all analyses:', error);
      throw new Error('Failed to get all analyses');
    }
  }

  // Update student statistics based on analysis data
  private async updateStudentStatsFromAnalysis(studentId: string, analysisData: any): Promise<void> {
    try {
      // Get current stats
      const currentStats = await this.getStudentStats(studentId);
      
      // Calculate new stats
      const newStats = {
        totalInterviews: (currentStats?.totalInterviews || 0) + 1,
        completedInterviews: (currentStats?.completedInterviews || 0) + 1,
        averageScore: this.calculateNewAverage(
          currentStats?.averageScore || 0,
          currentStats?.completedInterviews || 0,
          analysisData.overallScore || 0
        ),
        improvementRate: currentStats?.improvementRate || 0,
        lastInterviewDate: new Date(),
        strongestSkills: this.updateSkillsList(
          currentStats?.strongestSkills || [],
          analysisData.strengths || []
        ),
        areasForImprovement: this.updateSkillsList(
          currentStats?.areasForImprovement || [],
          analysisData.improvements || []
        )
      };

      // Save updated stats
      await this.updateStudentStats(studentId, newStats);
    } catch (error) {
      console.error('Error updating student stats from analysis:', error);
    }
  }

  // Update department statistics based on analysis data
  private async updateDepartmentStatsFromAnalysis(departmentId: string, analysisData: any): Promise<void> {
    try {
      // Get current stats
      const currentStats = await this.getDepartmentStats(departmentId);
      
      // Calculate new stats
      const newStats = {
        totalStudents: currentStats?.totalStudents || 0,
        activeStudents: currentStats?.activeStudents || 0,
        totalInterviews: (currentStats?.totalInterviews || 0) + 1,
        averageScore: this.calculateNewAverage(
          currentStats?.averageScore || 0,
          currentStats?.totalInterviews || 0,
          analysisData.overallScore || 0
        ),
        topPerformingStudents: this.updateStudentRankings(
          currentStats?.topPerformingStudents || [],
          analysisData.studentId,
          analysisData.overallScore || 0
        ),
        skillDistribution: this.updateSkillDistribution(
          currentStats?.skillDistribution || {},
          analysisData.strengths || [],
          analysisData.improvements || []
        )
      };

      // Save updated stats
      await this.updateDepartmentStats(departmentId, newStats);
    } catch (error) {
      console.error('Error updating department stats from analysis:', error);
    }
  }

  // Update institution statistics based on analysis data
  private async updateInstitutionStatsFromAnalysis(institutionId: string, analysisData: any): Promise<void> {
    try {
      // Get current stats
      const currentStats = await this.getInstitutionStats(institutionId);
      
      // Calculate new stats
      const newStats = {
        totalStudents: currentStats?.totalStudents || 0,
        activeStudents: currentStats?.activeStudents || 0,
        totalInterviews: (currentStats?.totalInterviews || 0) + 1,
        averageScore: this.calculateNewAverage(
          currentStats?.averageScore || 0,
          currentStats?.totalInterviews || 0,
          analysisData.overallScore || 0
        ),
        sessionUtilization: currentStats?.sessionUtilization || 0,
        topPerformingDepartments: this.updateDepartmentRankings(
          currentStats?.topPerformingDepartments || [],
          analysisData.departmentId,
          analysisData.overallScore || 0
        ),
        monthlyUsage: this.updateMonthlyUsage(
          currentStats?.monthlyUsage || [],
          analysisData.timestamp
        )
      };

      // Save updated stats
      await this.updateInstitutionStats(institutionId, newStats);
    } catch (error) {
      console.error('Error updating institution stats from analysis:', error);
    }
  }

  // Department statistics methods
  async updateDepartmentStats(departmentId: string, stats: Partial<any>): Promise<void> {
    try {
      const statsRef = doc(db, this.COLLECTIONS.departmentStats, departmentId);
      await setDoc(statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating department stats:', error);
      throw new Error('Failed to update department stats');
    }
  }

  async getDepartmentStats(departmentId: string): Promise<any | null> {
    try {
      const statsDoc = await getDoc(doc(db, this.COLLECTIONS.departmentStats, departmentId));
      
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          id: statsDoc.id,
          ...(data as any)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting department stats:', error);
      throw new Error('Failed to get department stats');
    }
  }

  // Helper method to calculate new average
  private calculateNewAverage(currentAverage: number, currentCount: number, newValue: number): number {
    if (currentCount === 0) return newValue;
    return ((currentAverage * currentCount) + newValue) / (currentCount + 1);
  }

  // Helper method to update skills list
  private updateSkillsList(currentSkills: string[], newSkills: string[]): string[] {
    const updatedSkills = [...currentSkills];
    
    for (const skill of newSkills) {
      if (!updatedSkills.includes(skill)) {
        updatedSkills.push(skill);
      }
    }
    
    return updatedSkills.slice(0, 10); // Limit to top 10 skills
  }

  // Helper method to update student rankings in department
  private updateStudentRankings(
    currentRankings: any[], 
    studentId: string, 
    score: number
  ): any[] {
    const updatedRankings = [...currentRankings];
    const existingStudentIndex = updatedRankings.findIndex(student => student.id === studentId);
    
    if (existingStudentIndex >= 0) {
      // Update existing student
      const student = updatedRankings[existingStudentIndex];
      updatedRankings[existingStudentIndex] = {
        ...student,
        averageScore: this.calculateNewAverage(student.averageScore, student.interviewCount, score),
        interviewCount: student.interviewCount + 1
      };
    } else {
      // Add new student
      updatedRankings.push({
        id: studentId,
        averageScore: score,
        interviewCount: 1
      });
    }
    
    // Sort by average score and return top 10
    return updatedRankings
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
  }

  // Helper method to update department rankings in institution
  private updateDepartmentRankings(
    currentRankings: any[], 
    departmentId: string, 
    score: number
  ): any[] {
    const updatedRankings = [...currentRankings];
    const existingDeptIndex = updatedRankings.findIndex(dept => dept.id === departmentId);
    
    if (existingDeptIndex >= 0) {
      // Update existing department
      const dept = updatedRankings[existingDeptIndex];
      updatedRankings[existingDeptIndex] = {
        ...dept,
        averageScore: this.calculateNewAverage(dept.averageScore, dept.interviewCount, score),
        interviewCount: dept.interviewCount + 1
      };
    } else {
      // Add new department
      updatedRankings.push({
        id: departmentId,
        averageScore: score,
        interviewCount: 1
      });
    }
    
    // Sort by average score and return top 10
    return updatedRankings
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
  }

  // Helper method to update skill distribution
  private updateSkillDistribution(
    currentDistribution: Record<string, number>, 
    strengths: string[], 
    improvements: string[]
  ): Record<string, number> {
    const updatedDistribution = { ...currentDistribution };
    
    // Update strengths (positive skills)
    for (const skill of strengths) {
      updatedDistribution[skill] = (updatedDistribution[skill] || 0) + 1;
    }
    
    // Update improvement areas (skills needing work)
    for (const skill of improvements) {
      updatedDistribution[skill] = (updatedDistribution[skill] || 0) + 1;
    }
    
    return updatedDistribution;
  }

  // Helper method to update monthly usage statistics
  private updateMonthlyUsage(currentUsage: any[], timestamp: Date): any[] {
    const updatedUsage = [...currentUsage];
    const date = new Date(timestamp);
    const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
    
    const existingMonthIndex = updatedUsage.findIndex(
      usage => usage.month === date.getMonth() && usage.year === date.getFullYear()
    );
    
    if (existingMonthIndex >= 0) {
      // Update existing month
      const month = updatedUsage[existingMonthIndex];
      updatedUsage[existingMonthIndex] = {
        ...month,
        interviews: month.interviews + 1
      };
    } else {
      // Add new month
      updatedUsage.push({
        month: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        interviews: 1,
        students: 1,
        averageScore: 0 // Will be updated when scores are available
      });
    }
    
    return updatedUsage;
  }
}

// Export singleton instance
export const interviewService = new InterviewService();