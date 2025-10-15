import React, { useEffect, useState } from 'react';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

interface AnalyticsTestComponentProps {
  institutionId: string;
}

const AnalyticsTestComponent: React.FC<AnalyticsTestComponentProps> = ({ institutionId }) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runTests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test all the analytics methods
        const results = {
          licenseInfo: await InstitutionDashboardService.getLicenseInfo(institutionId),
          studentAnalytics: await InstitutionDashboardService.getStudentAnalytics(institutionId),
          resumeAnalytics: await InstitutionDashboardService.getResumeAnalytics(institutionId),
          interviewAnalytics: await InstitutionDashboardService.getInterviewAnalytics(institutionId),
          platformEngagement: await InstitutionDashboardService.getPlatformEngagement(institutionId)
        };
        
        setTestResults(results);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    };
    
    if (institutionId) {
      runTests();
    }
  }, [institutionId]);

  if (loading) {
    return <div>Loading analytics test...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Analytics Test Results</h2>
      
      {testResults && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">License Info</h3>
            <pre className="bg-white p-2 rounded text-sm">
              {JSON.stringify(testResults.licenseInfo, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Student Analytics</h3>
            <pre className="bg-white p-2 rounded text-sm">
              {JSON.stringify(testResults.studentAnalytics, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Resume Analytics (First 2)</h3>
            <pre className="bg-white p-2 rounded text-sm">
              {JSON.stringify(testResults.resumeAnalytics.slice(0, 2), null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Interview Analytics (First 2)</h3>
            <pre className="bg-white p-2 rounded text-sm">
              {JSON.stringify(testResults.interviewAnalytics.slice(0, 2), null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Platform Engagement</h3>
            <pre className="bg-white p-2 rounded text-sm">
              {JSON.stringify(testResults.platformEngagement, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTestComponent;