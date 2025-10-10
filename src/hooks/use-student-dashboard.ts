import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from './use-firebase-auth';
import type { Interview, StudentStats } from '@/types';

interface StudentDashboardData {
  interviews: Interview[];
  stats: StudentStats | null;
  scheduledInterview: Interview | null;
  completedInterviews: number;
  averageScore: number;
  hasResumes: boolean;
  hasLinkedIn: boolean;
  hasScheduledInterviews: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useStudentDashboard = (): StudentDashboardData => {
  const { user } = useFirebaseAuth();
  const [data, setData] = useState<StudentDashboardData>({
    interviews: [],
    stats: null,
    scheduledInterview: null,
    completedInterviews: 0,
    averageScore: 0,
    hasResumes: false,
    hasLinkedIn: false,
    hasScheduledInterviews: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch student stats
        const statsDoc = await getDoc(doc(db, 'student-stats', user.id));
        const stats = statsDoc.exists() ? statsDoc.data() as StudentStats : null;

        // Check for resumes
        const resumesQuery = query(
          collection(db, 'resumes'),
          where('userId', '==', user.id)
        );
        
        const resumesSnapshot = await getDocs(resumesQuery);
        const hasResumes = !resumesSnapshot.empty;

        // Set up real-time listener for interviews
        const interviewsQuery = query(
          collection(db, 'interviews'),
          where('studentId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
          const interviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any)
          } as Interview));

          // Find scheduled interview (next upcoming)
          const now = new Date();
          const scheduledInterview = interviews.find(interview => 
            interview.status === 'scheduled' && 
            interview.scheduledAt && 
            new Date(interview.scheduledAt) > now
          ) || null;

          // Check for scheduled interviews
          const hasScheduledInterviews = interviews.some(interview => 
            interview.status === 'scheduled' && 
            interview.scheduledAt && 
            new Date(interview.scheduledAt) > now
          );

          // Check for LinkedIn profile (simplified check - in a real implementation, 
          // you would check for actual LinkedIn URLs in the resume data)
          const hasLinkedIn = interviews.some(interview => 
            interview.resumeId && interview.resumeId.includes('linkedin')
          );

          // Calculate completed interviews and average score
          const completedInterviews = interviews.filter(i => i.status === 'completed').length;
          const totalScore = interviews
            .filter(i => i.status === 'completed' && i.score)
            .reduce((sum, interview) => sum + (interview.score || 0), 0);
          const averageScore = completedInterviews > 0 ? totalScore / completedInterviews : 0;

          setData({
            interviews,
            stats,
            scheduledInterview,
            completedInterviews,
            averageScore,
            hasResumes,
            hasLinkedIn,
            hasScheduledInterviews,
            isLoading: false,
            error: null
          });
        }, (error) => {
          console.error('Error fetching interviews:', error);
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load interview data'
          }));
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchData();
  }, [user?.id]);

  return data;
};