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
        const feedback = await interviewService.getLatestStudentFeedback(user.id);
        setData({
          feedback,
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