
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Users, Save, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const SessionManagement = () => {
  const { toast } = useToast();
  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [totalSessions, setTotalSessions] = useState(1000);
  const [usedSessions, setUsedSessions] = useState(362);
  const [additionalSessions, setAdditionalSessions] = useState('');
  
  const availableSessions = totalSessions - usedSessions;
  const percentUsed = (usedSessions / totalSessions) * 100;
  
  const handleAddSessions = () => {
    const sessionsToAdd = parseInt(additionalSessions);
    if (isNaN(sessionsToAdd) || sessionsToAdd <= 0) {
      toast({
        title: "Invalid session count",
        description: "Please enter a valid number of sessions to add",
        variant: "destructive"
      });
      return;
    }
    
    setTotalSessions(prev => prev + sessionsToAdd);
    setAdditionalSessions('');
    
    toast({
      title: "Sessions added",
      description: `${sessionsToAdd} sessions added to your pool`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Session Pool Status
            </CardTitle>
            <CardDescription>
              Manage your institution's interview session availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Session utilization</span>
                <span className="text-sm">{usedSessions} of {totalSessions} used ({percentUsed.toFixed(1)}%)</span>
              </div>
              
              <Progress value={percentUsed} className="h-2" />
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="font-medium text-amber-800">Available</div>
                  <div className="text-2xl font-bold text-amber-900">{availableSessions}</div>
                  <div className="text-xs text-amber-700 mt-1">Interview slots</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="font-medium text-blue-800">Used</div>
                  <div className="text-2xl font-bold text-blue-900">{usedSessions}</div>
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Sessions
            </CardTitle>
            <CardDescription>
              Increase your interview session capacity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-sessions">Number of sessions to add</Label>
              <div className="flex space-x-2">
                <Input
                  id="add-sessions"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={additionalSessions}
                  onChange={(e) => setAdditionalSessions(e.target.value)}
                />
                <Button onClick={handleAddSessions}>Add Sessions</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Each session allows one student to have a 15-minute interview with Octavia AI.
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="font-medium">Quick Add Options</div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => setAdditionalSessions('100')}>
                  +100 Sessions
                </Button>
                <Button variant="outline" onClick={() => setAdditionalSessions('500')}>
                  +500 Sessions
                </Button>
                <Button variant="outline" onClick={() => setAdditionalSessions('1000')}>
                  +1000 Sessions
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md mt-4">
              <div className="font-medium">Pricing Information</div>
              <div className="text-sm text-muted-foreground mt-1">
                <p>Sessions are charged at $4.99 per 100 sessions.</p>
                <p className="mt-1">
                  All students have access to the session pool. Each student can book multiple sessions, as long as there are available slots in your pool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student Access
          </CardTitle>
          <CardDescription>
            All students have access to the session pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">How the Session Pool Works</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>All students have access to book interview sessions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sessions are drawn from the institution's shared pool</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Each student can book multiple sessions if available</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>When the pool is depleted, add more sessions to continue</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-md">
              <h3 className="font-medium mb-2">Your Institution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total students</div>
                  <div className="text-xl font-bold">1,000</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active this month</div>
                  <div className="text-xl font-bold">825</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
