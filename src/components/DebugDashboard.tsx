import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { interviewService } from '@/services/interview.service';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const DebugDashboard = () => {
  const { user, firebaseUser, isLoading } = useFirebaseAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    setLoading(true);
    try {
      const info: any = {
        timestamp: new Date().toISOString(),
        user: user,
        firebaseUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        } : null
      };

      if (user?.id) {
        // Check interviews collection
        try {
          const interviewsQuery = query(
            collection(db, 'interviews'),
            where('studentId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const interviewsSnapshot = await getDocs(interviewsQuery);
          info.interviews = {
            count: interviewsSnapshot.size,
            docs: interviewsSnapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          };
        } catch (error) {
          info.interviewsError = error.message;
        }

        // Check end-of-call analysis
        try {
          const analyses = await interviewService.getStudentAnalyses(user.id);
          info.analyses = {
            count: analyses.length,
            data: analyses.slice(0, 3)
          };
        } catch (error) {
          info.analysesError = error.message;
        }

        // Check feedback
        try {
          const feedback = await interviewService.getLatestStudentFeedback(user.id);
          info.feedback = feedback || 'No feedback found';
        } catch (error) {
          info.feedbackError = error.message;
        }

        // Check student stats
        try {
          const stats = await interviewService.getStudentStats(user.id);
          info.stats = stats || 'No stats found';
        } catch (error) {
          info.statsError = error.message;
        }
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      runDebugCheck();
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={runDebugCheck} disabled={loading}>
              {loading ? 'Checking...' : 'Run Debug Check'}
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugDashboard;