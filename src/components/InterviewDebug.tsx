import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

const InterviewDebug = () => {
  const { user } = useFirebaseAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    console.log('🔍 Debug: Setting up interview query for user ID:', user.id);
    
    // Test the exact same query used by the dashboard
    const interviewsQuery = query(
      collection(db, 'interviews'),
      where('studentId', '==', user.id),
      orderBy('createdAt', 'desc'),
      // limit(10) // Removed limit for debugging
    );

    const unsubscribe = onSnapshot(interviewsQuery, 
      (snapshot) => {
        console.log('🔍 Debug: Interview snapshot received, doc count:', snapshot.docs.length);
        try {
          const interviewData = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('🔍 Debug: Raw data for interview:', doc.id, data);
            
            // Log the createdAt field specifically to see its structure
            console.log('🔍 Debug: createdAt field:', data.createdAt);
            if (data.createdAt && data.createdAt._seconds) {
              console.log('🔍 Debug: createdAt._seconds:', data.createdAt._seconds);
              console.log('🔍 Debug: createdAt as Date:', new Date(data.createdAt._seconds * 1000));
            }
            
            // Process the data exactly like the dashboard does
            const processedData = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt ? (data.createdAt._seconds ? new Date(data.createdAt._seconds * 1000) : new Date(data.createdAt)) : new Date(),
              updatedAt: data.updatedAt ? (data.updatedAt._seconds ? new Date(data.updatedAt._seconds * 1000) : new Date(data.updatedAt)) : new Date(),
              scheduledAt: data.scheduledAt ? (data.scheduledAt._seconds ? new Date(data.scheduledAt._seconds * 1000) : new Date(data.scheduledAt)) : new Date(),
              startedAt: data.startedAt ? (data.startedAt._seconds ? new Date(data.startedAt._seconds * 1000) : new Date(data.startedAt)) : undefined,
              endedAt: data.endedAt ? (data.endedAt._seconds ? new Date(data.endedAt._seconds * 1000) : new Date(data.endedAt)) : undefined
            };
            
            console.log('🔍 Debug: Processed data for interview:', processedData);
            console.log('🔍 Debug: Processed createdAt type:', typeof processedData.createdAt);
            console.log('🔍 Debug: Processed createdAt value:', processedData.createdAt);
            console.log('🔍 Debug: Processed createdAt isValid:', processedData.createdAt instanceof Date && !isNaN(processedData.createdAt.getTime()));
            
            return processedData;
          });
          
          console.log('🔍 Debug: Processed interviews:', interviewData);
          setInterviews(interviewData);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('🔍 Debug: Error processing interview data:', err);
          setError(err instanceof Error ? err.message : 'Failed to process interview data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('🔍 Debug: Error fetching interviews:', err);
        setError(`Firebase error: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-bold">Interview Debug - Loading...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold">Interview Debug - Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold mb-2">Interview Debug Information</h3>
      
      {user ? (
        <div>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          
          <div className="mt-4">
            <h4 className="font-bold">Interviews Found: {interviews.length}</h4>
            {interviews.length > 0 ? (
              <div className="mt-2 space-y-2">
                {interviews.map(interview => (
                  <div key={interview.id} className="p-2 bg-white rounded border">
                    <p><strong>ID:</strong> {interview.id}</p>
                    <p><strong>Status:</strong> {interview.status}</p>
                    <p><strong>Type:</strong> {interview.type}</p>
                    <p><strong>Score:</strong> {interview.score || 'N/A'}</p>
                    <p><strong>Created:</strong> {interview.createdAt?.toString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No interviews found for this user</p>
            )}
          </div>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
};

export default InterviewDebug;