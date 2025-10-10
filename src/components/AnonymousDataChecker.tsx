import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { interviewService } from '@/services/interview.service';

const AnonymousDataChecker = () => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Anonymous Data Checker: Fetching all analyses...');
      // Get all analyses (for development/testing only)
      const allAnalyses = await interviewService.getAllAnalyses(50);
      console.log('Anonymous Data Checker: Found', allAnalyses.length, 'total analyses');
      
      // Filter for anonymous users (those without studentId)
      const anonymousAnalyses = allAnalyses.filter(analysis => !analysis.studentId);
      console.log('Anonymous Data Checker: Found', anonymousAnalyses.length, 'anonymous analyses');
      setAnalyses(anonymousAnalyses);
      
      // Also check interviews collection
      console.log('Anonymous Data Checker: Fetching recent interviews...');
      const recentInterviews = await interviewService.getRecentInterviews(20);
      console.log('Anonymous Data Checker: Found', recentInterviews.length, 'recent interviews');
      
      const anonymousInterviews = recentInterviews.filter(interview => !interview.studentId);
      console.log('Anonymous Data Checker: Found', anonymousInterviews.length, 'anonymous interviews');
      setInterviews(anonymousInterviews);
    } catch (err: any) {
      console.error('Anonymous Data Checker: Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkData();
  }, []);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Anonymous Interview Data Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkData} disabled={loading}>
              {loading ? 'Checking...' : 'Refresh Data'}
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">End-of-Call Analyses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found {analyses.length} anonymous analyses
              </p>
              
              {analyses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analyses.map((analysis, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">Analysis {index + 1}</div>
                      <div className="text-sm space-y-1 mt-2">
                        <div>Call ID: {analysis.callId?.substring(0, 8)}...</div>
                        <div>Timestamp: {analysis.timestamp?.toString()}</div>
                        <div>Type: {analysis.interviewType}</div>
                        <div>Duration: {analysis.duration} seconds</div>
                        <div>Score: {analysis.overallScore}/100</div>
                        <div>Summary: {analysis.summary?.substring(0, 50)}...</div>
                        <div className="text-xs text-muted-foreground">
                          Student ID: {analysis.studentId || '(empty - anonymous)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No anonymous analyses found
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Interview Records</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Found {interviews.length} anonymous interviews
              </p>
              
              {interviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {interviews.map((interview, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="font-medium">Interview {index + 1}</div>
                      <div className="text-sm space-y-1 mt-2">
                        <div>ID: {interview.id?.substring(0, 8)}...</div>
                        <div>Created: {interview.createdAt?.toString()}</div>
                        <div>Status: {interview.status}</div>
                        <div>Type: {interview.type}</div>
                        <div>Has Transcript: {interview.transcript ? 'Yes' : 'No'}</div>
                        <div className="text-xs text-muted-foreground">
                          Student ID: {interview.studentId || '(empty - anonymous)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No anonymous interviews found
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium mb-2">Debug Information:</p>
            <p>• This page shows interview data for users without a student ID (anonymous users)</p>
            <p>• Data is collected during interviews but not linked to user accounts</p>
            <p>• To access historical data, users must create an account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousDataChecker;