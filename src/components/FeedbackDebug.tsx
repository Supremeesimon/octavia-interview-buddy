import React, { useEffect, useState } from 'react';
import { interviewService } from '@/services/interview.service';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

const FeedbackDebug = () => {
  const { user } = useFirebaseAuth();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Feedback Debug: Fetching latest feedback for user ID:', user.id);
        const result = await interviewService.getLatestStudentFeedback(user.id);
        console.log('🔍 Feedback Debug: Retrieved feedback:', result);
        setFeedback(result);
        setLoading(false);
      } catch (err) {
        console.error('🔍 Feedback Debug: Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-bold">Feedback Debug - Loading...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold">Feedback Debug - Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold mb-2">Feedback Debug Information</h3>
      
      {user ? (
        <div>
          <p><strong>User ID:</strong> {user.id}</p>
          
          <div className="mt-4">
            <h4 className="font-bold">Latest Feedback:</h4>
            {feedback ? (
              <div className="mt-2 p-2 bg-white rounded border">
                <p><strong>Feedback ID:</strong> {feedback.id}</p>
                <p><strong>Interview ID:</strong> {feedback.interviewId}</p>
                <p><strong>Overall Score:</strong> {feedback.overallScore}</p>
                <p><strong>Categories:</strong> {feedback.categories?.length || 0}</p>
                <p><strong>Has Strengths:</strong> {feedback.strengths && feedback.strengths.length > 0 ? 'Yes' : 'No'}</p>
                <p><strong>Has Improvements:</strong> {feedback.improvements && feedback.improvements.length > 0 ? 'Yes' : 'No'}</p>
                <p><strong>Has Detailed Analysis:</strong> {feedback.detailedAnalysis ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-gray-600">No feedback found</p>
            )}
          </div>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
};

export default FeedbackDebug;