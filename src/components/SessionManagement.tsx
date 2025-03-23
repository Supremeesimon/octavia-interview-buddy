import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Clock, Users, Database, Building, User, Save, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import ResetSettingsDialog from './ResetSettingsDialog';

interface SessionManagementProps {
  onSessionPurchase?: (sessions: number, cost: number) => void;
}

const SessionManagement = ({ onSessionPurchase }: SessionManagementProps) => {
  const { toast } = useToast();
  const [sessionLength, setSessionLength] = useState(15); // Default 15 minutes
  const [totalSessions, setTotalSessions] = useState(1000);
  const [usedSessions, setUsedSessions] = useState(362);
  const [additionalSessions, setAdditionalSessions] = useState('');
  const [openToAll, setOpenToAll] = useState(true);
  const [allocationMethod, setAllocationMethod] = useState('institution');
  
  const availableSessions = totalSessions - usedSessions;
  const percentUsed = (usedSessions / totalSessions) * 100;
  const pricePerMinute = 0.15; // $0.15 per minute
  const sessionCost = (sessionLength * pricePerMinute).toFixed(2);
  
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
    
    const totalCost = parseFloat((sessionsToAdd * sessionLength * pricePerMinute).toFixed(2));
    
    toast({
      title: "Sessions added",
      description: `${sessionsToAdd} sessions added to your pool for $${totalCost}`,
    });
    
    // Notify parent component about session purchase for billing update
    if (onSessionPurchase) {
      onSessionPurchase(sessionsToAdd, totalCost);
    }
  };
  
  const handleSessionLengthChange = (value: number[]) => {
    setSessionLength(value[0]);
  };
  
  const calculateBundleCost = (sessions: number) => {
    return (sessions * sessionLength * pricePerMinute).toFixed(2);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <Card tooltip="Configure the length of each interview session">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Session Duration
            </CardTitle>
            <CardDescription>
              Set the duration for each interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label htmlFor="session-length">Minutes per session</Label>
                <span className="font-medium">{sessionLength} minutes</span>
              </div>
              
              <Slider 
                id="session-length"
                min={5} 
                max={30} 
                step={1} 
                value={[sessionLength]} 
                onValueChange={handleSessionLengthChange}
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>5 min</span>
                <span>15 min</span>
                <span>30 min</span>
              </div>
              
              <div className="bg-muted p-3 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Session duration:</span>
                  <span className="font-medium">{sessionLength} minutes</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Price per minute:</span>
                  <span>${pricePerMinute.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between font-medium">
                  <span>Cost per session:</span>
                  <span>${sessionCost}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card tooltip="Purchase additional interview sessions for your institution's pool">
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
              Each session allows one student to have a {sessionLength}-minute interview with Octavia AI.
            </p>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="font-medium">Quick Add Options</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setAdditionalSessions('100')}>
                +100 Sessions
                <span className="text-xs ml-1 text-muted-foreground">${calculateBundleCost(100)}</span>
              </Button>
              <Button variant="outline" onClick={() => setAdditionalSessions('500')}>
                +500 Sessions
                <span className="text-xs ml-1 text-muted-foreground">${calculateBundleCost(500)}</span>
              </Button>
              <Button variant="outline" onClick={() => setAdditionalSessions('1000')}>
                +1000 Sessions
                <span className="text-xs ml-1 text-muted-foreground">${calculateBundleCost(1000)}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card tooltip="Control how interview sessions are distributed to your students">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Session Allocation
          </CardTitle>
          <CardDescription>
            Control how interview sessions are distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Open to All Students</h3>
              <p className="text-sm text-muted-foreground">
                Allow all students to book from the shared session pool
              </p>
            </div>
            <Switch 
              checked={openToAll} 
              onCheckedChange={setOpenToAll}
            />
          </div>
          
          {!openToAll && (
            <>
              <div className="space-y-2">
                <Label>Allocation Method</Label>
                <ToggleGroup type="single" value={allocationMethod} onValueChange={(value) => value && setAllocationMethod(value)}>
                  <ToggleGroupItem value="institution" className="flex items-center gap-2 flex-1">
                    <Building className="h-4 w-4" />
                    <span>Institution-Wide</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="department" className="flex items-center gap-2 flex-1">
                    <Building className="h-4 w-4" />
                    <span>Per Department</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="student" className="flex items-center gap-2 flex-1">
                    <User className="h-4 w-4" />
                    <span>Per Student</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="group" className="flex items-center gap-2 flex-1">
                    <Users className="h-4 w-4" />
                    <span>Student Groups</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {allocationMethod === 'student' && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Sessions Per Student</h3>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      min="1" 
                      defaultValue="3"
                      className="w-24" 
                    />
                    <span>sessions per student</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Each student will be allowed to book this many sessions per month.
                  </p>
                </div>
              )}
              
              {allocationMethod === 'department' && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Department Allocation</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how sessions are allocated to different departments.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Department
                  </Button>
                </div>
              )}
              
              {allocationMethod === 'group' && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Student Group Allocation</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how sessions are allocated to different student groups.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Student Group
                  </Button>
                </div>
              )}
            </>
          )}
          
          <div className="bg-primary/5 p-4 rounded-md">
            <h3 className="font-medium mb-2">How Session Allocation Works</h3>
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
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Allocation Settings
          </Button>
          <ResetSettingsDialog 
            settingsType="Session Allocation"
            onConfirm={() => {
              setOpenToAll(true);
              setAllocationMethod('institution');
            }}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionManagement;
