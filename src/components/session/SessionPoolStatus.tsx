import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface SessionPoolStatusProps {
  totalSessions: number;
  usedSessions: number;
}

const SessionPoolStatus = ({ totalSessions, usedSessions }: SessionPoolStatusProps) => {
  // Ensure we don't have negative values
  const validTotalSessions = Math.max(0, totalSessions || 0);
  const validUsedSessions = Math.max(0, Math.min(validTotalSessions, usedSessions || 0));
  const availableSessions = validTotalSessions - validUsedSessions;
  
  // Handle the case when totalSessions is 0 to avoid NaN
  const percentUsed = validTotalSessions > 0 ? (validUsedSessions / validTotalSessions) * 100 : 0;
  
  return (
    <Card tooltip="Monitor your institution's current interview session usage and availability">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Interview Session Pool Status
        </CardTitle>
        <CardDescription>
          Manage your institution's interview session availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between">
            <span className="font-medium">Interview session utilization</span>
            <span className="text-sm">{validUsedSessions} of {validTotalSessions} used ({percentUsed.toFixed(1)}%)</span>
          </div>
          
          <Progress value={percentUsed} className="h-2" />
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 overflow-hidden">
              <div className="font-medium text-amber-800">Available</div>
              <div className="text-xl md:text-2xl font-bold text-amber-900 truncate">{availableSessions}</div>
              <div className="text-xs text-amber-700 mt-1">Interview slots</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 overflow-hidden">
              <div className="font-medium text-blue-800">Used</div>
              <div className="text-xl md:text-2xl font-bold text-blue-900 truncate">{validUsedSessions}</div>
              <div className="text-xs text-blue-700 mt-1">Interview slots</div>
            </div>
          </div>
        </div>
        
        {validTotalSessions > 0 && availableSessions < validTotalSessions * 0.15 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">Low on interview sessions</div>
              <div className="text-sm text-amber-700">
                Your interview session pool is running low. Consider adding more interview sessions to ensure your students can continue booking interviews.
              </div>
            </div>
          </div>
        )}
        
        {validTotalSessions > 0 && availableSessions >= validTotalSessions * 0.75 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-green-800">Plenty of interview sessions available</div>
              <div className="text-sm text-green-700">
                Your interview session pool has sufficient capacity for student bookings.
              </div>
            </div>
          </div>
        )}
        
        {validTotalSessions === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800">No interview sessions purchased yet</div>
              <div className="text-sm text-blue-700">
                Your institution hasn't purchased any interview sessions yet. Visit the Interview Session Purchase section to add interview sessions to your pool.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionPoolStatus;