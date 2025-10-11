import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from './use-firebase-auth';
import { useFirebaseStorage } from './use-firebase-storage';
import { interviewService } from '@/services/interview.service';
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
        let stats = null;
        try {
          stats = await interviewService.getStudentStats(user.id);
          console.log('Stats:', stats);
        } catch (error) {
          console.log('Error fetching student stats (continuing anyway):', error);
        }

        // Set up real-time listener for interviews
        console.log('Setting up interviews query for user ID:', user.id);
        const interviewsQuery = query(
          collection(db, 'interviews'),
          where('studentId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribe = onSnapshot(interviewsQuery, async (snapshot) => {
          try {
            console.log('Interviews snapshot received, doc count:', snapshot.docs.length);
            const interviews = snapshot.docs.map(doc => {
              const data = doc.data() as any;
              console.log('.getRaw data for interview:', doc.id, data);
              
              // Ensure createdAt and updatedAt are proper Date objects
              const processDate = (dateValue: any): Date => {
                if (!dateValue) return new Date();
                if (dateValue instanceof Date) return dateValue;
                if (typeof dateValue === 'object' && dateValue?._seconds) {
                  return new Date(dateValue._seconds * 1000);
                }
                if (typeof dateValue === 'string') {
                  return new Date(dateValue);
                }
                return new Date();
              };
              
              const processedData = {
                id: doc.id,
                ...data,
                createdAt: processDate(data.createdAt),
                updatedAt: processDate(data.updatedAt),
                scheduledAt: data.scheduledAt ? processDate(data.scheduledAt) : new Date(),
                startedAt: data.startedAt ? processDate(data.startedAt) : undefined,
                endedAt: data.endedAt ? processDate(data.endedAt) : undefined
              };
              
              // Additional debugging for date issues
              console.log('Interview date processing:', {
                id: doc.id,
                rawCreatedAt: data.createdAt,
                processedCreatedAt: processedData.createdAt,
                isDateValid: processedData.createdAt instanceof Date && !isNaN(processedData.createdAt.getTime())
              });
              
              return processedData as Interview;
            });

            // Also fetch end-of-call analysis data and convert to interview format
            console.log('Fetching end-of-call analysis for user ID:', user.id);
            let analysisData = [];
            try {
              analysisData = await interviewService.getStudentAnalyses(user.id);
              console.log('End-of-call analysis count:', analysisData.length);
              console.log('End-of-call analysis data:', analysisData);
            } catch (error) {
              console.log('Error fetching end-of-call analysis (continuing anyway):', error);
            }
            
            // Convert analysis data to interview format
            const analysisAsInterviews = analysisData.map((analysis, index) => {
              console.log(`Processing analysis ${index}:`, analysis);
              
              // Extract score from successEvaluation if available
              const score = analysis.successEvaluation?.score || 
                           analysis.overallScore || 
                           (analysis.evaluation ? Math.round((analysis.evaluation.communicationSkills + analysis.evaluation.technicalKnowledge + analysis.evaluation.problemSolving) / 3) : 0);
              
              // Create a date from timestamp
              const processDate = (dateValue: any): Date => {
                if (!dateValue) return new Date();
                if (dateValue instanceof Date) return dateValue;
                if (typeof dateValue === 'object' && dateValue?._seconds) {
                  return new Date(dateValue._seconds * 1000);
                }
                if (typeof dateValue === 'string') {
                  return new Date(dateValue);
                }
                return new Date();
              };
              
              const createdAt = processDate(analysis.timestamp || analysis.createdAt);
              
              const result = {
                id: analysis.id,
                studentId: analysis.studentId || user.id,
                type: analysis.interviewType || analysis.type || 'general',
                status: 'completed',
                score: score,
                createdAt: createdAt,
                updatedAt: createdAt,
                scheduledAt: createdAt,
                // Add other fields from analysis data
                transcript: analysis.transcript || '',
                recordingUrl: analysis.recordingUrl || '',
                duration: analysis.duration || 0,
                sessionId: analysis.sessionId || 'analysis-' + analysis.id,
                resumeId: analysis.resumeId || '',
                summary: analysis.summary || '',
                successEvaluation: analysis.successEvaluation || {},
                structuredData: analysis.structuredData || {},
                interviewType: analysis.interviewType || analysis.type || 'general'
              } as Interview;
              
              console.log(`Converted analysis ${index} to interview:`, result);
              return result;
            });

            // Combine both interview sources
            const allInterviews = [...interviews, ...analysisAsInterviews]
              .sort((a, b) => {
                // Handle case where one or both dates might be invalid
                const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 10); // Limit to 10 most recent

            console.log('Combined interviews:', allInterviews);
            console.log('Total interviews count:', allInterviews.length);

            // Find scheduled interview (next upcoming)
            const now = new Date();
            const scheduledInterview = allInterviews.find(interview => 
              interview.status === 'scheduled' && 
              interview.scheduledAt && 
              interview.scheduledAt instanceof Date &&
              interview.scheduledAt > now
            ) || null;

            // Check for scheduled interviews
            const hasScheduledInterviews = allInterviews.some(interview => 
              interview.status === 'scheduled' && 
              interview.scheduledAt && 
              interview.scheduledAt instanceof Date &&
              interview.scheduledAt > now
            );

            // Check for LinkedIn profile (simplified check - in a real implementation, 
            // you would check for actual LinkedIn URLs in the resume data)
            const hasLinkedIn = allInterviews.some(interview => 
              interview.resumeId && interview.resumeId.includes('linkedin')
            );

            // Calculate completed interviews and average score
            const completedInterviews = allInterviews.filter(i => i.status === 'completed').length;
            const validScores = allInterviews
              .filter(i => i.status === 'completed' && typeof i.score === 'number' && !isNaN(i.score));
            const totalScore = validScores
              .reduce((sum, interview) => sum + (interview.score || 0), 0);
            const averageScore = validScores.length > 0 ? totalScore / validScores.length : 0;

            console.log('Dashboard data:', {
              completedInterviews,
              averageScore,
              hasScheduledInterviews,
              validScores: validScores.length,
              totalInterviews: allInterviews.length
            });

            setData(prev => ({
              ...prev,
              interviews: allInterviews,
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