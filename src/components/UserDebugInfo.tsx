import React, { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const UserDebugInfo = () => {
  const { user, firebaseUser } = useFirebaseAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Debug: Current user data', { user, firebaseUser });
        
        if (user?.id) {
          console.log('Debug: Fetching interviews for user ID:', user.id);
          
          // Query interviews for this user
          const interviewsQuery = query(
            collection(db, 'interviews'),
            where('studentId', '==', user.id),
            orderBy('createdAt', 'desc')
          );
          
          const interviewsSnapshot = await getDocs(interviewsQuery);
          console.log('Debug: Found interviews:', interviewsSnapshot.size);
          
          const interviewsData = interviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setInterviews(interviewsData);
        }
      } catch (err) {
        console.error('Debug: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, firebaseUser]);

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">Loading user debug info...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 border border-red-300 rounded">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold mb-2">User Debug Information</h3>
      
      {user ? (
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
          
          <div className="mt-4">
            <h4 className="font-bold">Interviews Found: {interviews.length}</h4>
            {interviews.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {interviews.map(interview => (
                  <li key={interview.id}>
                    ID: {interview.id} | 
                    Status: {interview.status} | 
                    Score: {interview.score || 'N/A'} | 
                    Type: {interview.type}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No interviews found for your user ID</p>
            )}
          </div>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
};

export default UserDebugInfo;