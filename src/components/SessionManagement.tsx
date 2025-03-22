
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Users, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SessionManagement = () => {
  const { toast } = useToast();
  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [globalSettings, setGlobalSettings] = useState(true);
  const [studentOverrides, setStudentOverrides] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', sessionMinutes: 15 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', sessionMinutes: 15 },
    { id: 3, name: 'Alex Johnson', email: 'alex.johnson@example.com', sessionMinutes: 15 }
  ]);
  
  const handleSliderChange = (value: number[]) => {
    setSessionMinutes(value[0]);
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Session settings saved",
      description: `Default session time set to ${sessionMinutes} minutes per student`,
    });
  };
  
  const handleStudentOverride = (id: number, minutes: number) => {
    setStudentOverrides(
      studentOverrides.map(student => 
        student.id === id ? { ...student, sessionMinutes: minutes } : student
      )
    );
  };
  
  const handleResetOverrides = () => {
    setStudentOverrides(
      studentOverrides.map(student => ({ ...student, sessionMinutes: sessionMinutes }))
    );
    toast({
      title: "Student overrides reset",
      description: "All students now use the default session duration",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Default Session Duration
            </CardTitle>
            <CardDescription>
              Set the default interview session duration for all students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{sessionMinutes} minutes</span>
                <span className="text-sm text-muted-foreground">
                  {sessionMinutes > 15 ? `+$${((sessionMinutes - 15) * 0.15).toFixed(2)} per student` : 'Default pricing'}
                </span>
              </div>
              
              <Slider 
                defaultValue={[15]} 
                max={30} 
                min={5} 
                step={1} 
                value={[sessionMinutes]}
                onValueChange={handleSliderChange}
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>5 min</span>
                <span>15 min (standard)</span>
                <span>30 min</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Switch 
                id="global-settings" 
                checked={globalSettings}
                onCheckedChange={setGlobalSettings}
              />
              <Label htmlFor="global-settings">Apply to all students</Label>
            </div>
            
            <Button 
              onClick={handleSaveSettings} 
              className="w-full mt-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Session Settings
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Session Usage Summary
            </CardTitle>
            <CardDescription>
              Overview of your current session allocation and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total students:</span>
                <span className="font-medium">120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Default minutes per student:</span>
                <span className="font-medium">{sessionMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total allocated minutes:</span>
                <span className="font-medium">{120 * sessionMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Minutes used this month:</span>
                <span className="font-medium">876 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Minutes remaining:</span>
                <span className="font-medium">{(120 * sessionMinutes) - 876} minutes</span>
              </div>
            </div>
            
            <div className="h-px bg-border my-2"></div>
            
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Projected monthly usage:</span>
                <span>{120 * sessionMinutes * 2} minutes</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Based on current student activity</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Student-Specific Session Settings</CardTitle>
              <CardDescription>
                Customize session duration for individual students
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetOverrides}
              tooltip="Reset all students to default session duration"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted p-3 rounded-t-md">
              <div className="col-span-5 font-medium">Student</div>
              <div className="col-span-4 font-medium">Session Duration</div>
              <div className="col-span-3 font-medium">Price Adjustment</div>
            </div>
            <div className="divide-y">
              {studentOverrides.map(student => (
                <div key={student.id} className="grid grid-cols-12 p-3 items-center">
                  <div className="col-span-5">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center space-x-2 w-full max-w-[200px]">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={student.sessionMinutes <= 5}
                        onClick={() => handleStudentOverride(student.id, Math.max(5, student.sessionMinutes - 1))}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        {student.sessionMinutes} min
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={student.sessionMinutes >= 30}
                        onClick={() => handleStudentOverride(student.id, Math.min(30, student.sessionMinutes + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm">
                    {student.sessionMinutes > 15 ? 
                      <span className="text-amber-600">+${((student.sessionMinutes - 15) * 0.15).toFixed(2)}</span> : 
                      <span className="text-green-600">Standard</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
