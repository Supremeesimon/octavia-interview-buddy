import { useState, useEffect } from 'react';
import { interviewService } from '@/services/interview.service';
import { useFirebaseAuth } from './use-firebase-auth';
import type { InterviewFeedback } from '@/types';

interface InterviewFeedbackData {
  feedback: InterviewFeedback | null;
  isLoading: boolean;
  error: string | null;
}

export const useInterviewFeedback = (): InterviewFeedbackData => {
  const { user } = useFirebaseAuth();
  const [data, setData] = useState<InterviewFeedbackData>({
    feedback: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchFeedback = async () => {
      try {
        console.log('Fetching latest feedback for student:', user.id);
        const feedback = await interviewService.getLatestStudentFeedback(user.id);
        console.log('Retrieved feedback:', feedback);
        console.log('Feedback type:', typeof feedback);
        console.log('Feedback keys:', feedback ? Object.keys(feedback) : 'null');
        
        // If no feedback found, try to get it from end-of-call analysis directly
        if (!feedback) {
          console.log('No direct feedback found, checking end-of-call analysis...');
          const analyses = await interviewService.getStudentAnalyses(user.id);
          if (analyses && analyses.length > 0) {
            // Get the most recent analysis
            const latestAnalysis = analyses[0];
            console.log('Latest analysis for feedback conversion:', latestAnalysis);
            
            // Process date properly
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
            
            // Convert analysis to feedback format
            const convertedFeedback: any = {
              id: 'feedback-' + latestAnalysis.id,
              interviewId: latestAnalysis.id,
              overallScore: latestAnalysis.successEvaluation?.score || 
                           latestAnalysis.overallScore || 0,
              categories: [],
              strengths: latestAnalysis.structuredData?.strengths || [],
              improvements: latestAnalysis.structuredData?.improvements || [],
              recommendations: latestAnalysis.structuredData?.recommendations || [],
              detailedAnalysis: latestAnalysis.summary || latestAnalysis.detailedAnalysis || '',
              createdAt: processDate(latestAnalysis.timestamp || latestAnalysis.createdAt)
            };
            
            // Add categories if they exist
            if (latestAnalysis.structuredData?.categories && Array.isArray(latestAnalysis.structuredData.categories)) {
              convertedFeedback.categories = latestAnalysis.structuredData.categories.map((cat: any) => ({
                name: cat.name || 'Category',
                score: cat.score || 0,
                weight: cat.weight || 0,
                description: cat.description || ''
              }));
            }
            
            console.log('Converted feedback from analysis:', convertedFeedback);
            setData({
              feedback: convertedFeedback as InterviewFeedback,
              isLoading: false,
              error: null
            });
            return;
          }
        }
        
        setData({
          feedback: feedback as InterviewFeedback,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching interview feedback:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load feedback data'
        }));
      }
    };

    fetchFeedback();
  }, [user?.id]);

  return data;
};