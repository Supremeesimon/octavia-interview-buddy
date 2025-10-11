import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from './use-firebase-auth';
import { useFirebaseStorage } from './use-firebase-storage';
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
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const { listUserFiles } = useFirebaseStorage();
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

  // Load user's resumes from Firebase
  useEffect(() => {
    let isMounted = true;
    
    const loadResumes = async () => {
      if (!user || isAuthLoading) return;
      
      try {
        const userFiles = await listUserFiles(user.id, 'resumes');
        
        if (isMounted) {
          // Process files to extract original filenames
          const processedFiles = userFiles.map((file: any) => {
            // Extract original filename by removing the resume ID prefix
            // Filename format is: resume_{timestamp}_{random}_{original_filename}
            let displayName = file.name;
            const nameParts = file.name.split('_');
            if (nameParts.length > 3) {
              // Reconstruct the original filename
              displayName = nameParts.slice(3).join('_');
            }
            
            return {
              id: file.name,
              name: displayName,
              originalName: file.name, // Keep the original for reference
              size: file.size,
              updated: file.updated,
              downloadURL: file.downloadURL,
              contentType: file.contentType
            };
          });
          
          setData(prev => ({
            ...prev,
            hasResumes: processedFiles.length > 0,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
        if (isMounted) {
          setData(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      }
    };
    
    loadResumes();
    
    return () => {
      isMounted = false;
    };
  }, [user, listUserFiles, isAuthLoading]);

  useEffect(() => {
    console.log('useStudentDashboard useEffect triggered, user:', user);
    if (!user) {
      console.log('No user, setting isLoading to false');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching data for user ID:', user.id);
        // Fetch student stats
        const statsDoc = await getDoc(doc(db, 'student-stats', user.id));
        const stats = statsDoc.exists() ? statsDoc.data() as StudentStats : null;
        console.log('Stats:', stats);

        // Set up real-time listener for interviews
        console.log('Setting up interviews query for user ID:', user.id);
        const interviewsQuery = query(
          collection(db, 'interviews'),
          where('studentId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
          try {
            console.log('Interviews snapshot received, doc count:', snapshot.docs.length);
            const interviews = snapshot.docs.map(doc => {
              const data = doc.data() as any;
              console.log('.getRaw data for interview:', doc.id, data);
              
              // Ensure createdAt and updatedAt are proper Date objects
              const processedData = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? new Date(data.createdAt._seconds * 1000) : new Date(),
                updatedAt: data.updatedAt ? new Date(data.updatedAt._seconds * 1000) : new Date(),
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt._seconds * 1000) : new Date(),
                startedAt: data.startedAt ? new Date(data.startedAt._seconds * 1000) : undefined,
                endedAt: data.endedAt ? new Date(data.endedAt._seconds * 1000) : undefined
              };
              
              return processedData as Interview;
            });

            console.log('Processed interviews:', interviews);

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

            console.log('Dashboard data:', {
              completedInterviews,
              averageScore,
              hasScheduledInterviews
            });

            setData(prev => ({
              ...prev,
              interviews,
              stats,
              scheduledInterview,
              completedInterviews,
              averageScore,
              hasResumes: prev.hasResumes,
              hasLinkedIn,
              hasScheduledInterviews,
              isLoading: false,
              error: null
            }));
          } catch (error) {
            console.error('Error processing interview data:', error);
            setData(prev => ({
              ...prev,
              isLoading: false,
              error: 'Failed to process interview data'
            }));
          }
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
          error: error instanceof Error ? error.message : 'Failed to load dashboard data'
        }));
      }
    };

    fetchData();
  }, [user?.id]);

  return data;
};