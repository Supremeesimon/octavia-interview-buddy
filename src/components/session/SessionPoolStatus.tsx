
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface SessionPoolStatusProps {
  totalSessions: number;
  usedSessions: number;
}

const SessionPoolStatus = ({ totalSessions, usedSessions }: SessionPoolStatusProps) => {
  const availableSessions = totalSessions - usedSessions;
  const percentUsed = (usedSessions / totalSessions) * 100;
  
  return (
    <Card tooltip="Monitor your institution's current session usage and availability">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Session Pool Status
        </CardTitle>
        <CardDescription>
          Manage your institution's interview session availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap justify-between">
            <span className="font-medium">Session utilization</span>
            <span className="text-sm">{usedSessions} of {totalSessions} used ({percentUsed.toFixed(1)}%)</span>
          </div>
          
          <Progress value={percentUsed} className="h-2" />
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="font-medium text-amber-800">Available</div>
              <div className="text-xl md:text-2xl font-bold text-amber-900">{availableSessions}</div>
              <div className="text-xs text-amber-700 mt-1">Interview slots</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="font-medium text-blue-800">Used</div>
              <div className="text-xl md:text-2xl font-bold text-blue-900">{usedSessions}</div>
              <div className="text-xs text-blue-700 mt-1">Interview slots</div>
            </div>
          </div>
        </div>
        
        {availableSessions < totalSessions * 0.15 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">Low on sessions</div>
              <div className="text-sm text-amber-700">
                Your session pool is running low. Consider adding more sessions to ensure your students can continue booking interviews.
              </div>
            </div>
          </div>
        )}
        
        {availableSessions >= totalSessions * 0.75 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-green-800">Plenty of sessions available</div>
              <div className="text-sm text-green-700">
                Your session pool has sufficient capacity for student bookings.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionPoolStatus;
