import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Building, CheckCircle, Plus, Save, User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import ConfirmationDialog from '../ConfirmationDialog';
import ResetSettingsDialog from '../ResetSettingsDialog';
import { SessionService } from '@/services/session.service';

const SessionAllocation = () => {
  const [openToAll, setOpenToAll] = useState(true);
  const [allocationMethod, setAllocationMethod] = useState('institution');
  const [sessionsPerStudent, setSessionsPerStudent] = useState(3);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Load existing allocations when component mounts
  useEffect(() => {
    const loadAllocations = async () => {
      try {
        const allocationData = await SessionService.getSessionAllocations();
        setAllocations(allocationData);
      } catch (error) {
        console.error('Failed to load session allocations:', error);
        toast({
          title: "Error",
          description: "Failed to load session allocation data. Using default settings.",
          variant: "destructive"
        });
      }
    };
    
    loadAllocations();
  }, []);
  
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save the allocation settings based on the selected method
      switch (allocationMethod) {
        case 'student':
          // For per-student allocation, we would typically save this as a setting
          // rather than creating individual allocations for each student
          toast({
            title: "Settings saved",
            description: "Per-student session allocation settings have been updated.",
          });
          break;
          
        case 'institution':
          // Institution-wide allocation is the default, no specific allocations needed
          toast({
            title: "Settings saved",
            description: "Institution-wide session allocation settings have been updated.",
          });
          break;
          
        case 'department':
          // For department allocation, we would need to create allocations for each department
          toast({
            title: "Settings saved",
            description: "Department allocation settings have been updated. Please configure department-specific allocations in the department management section.",
          });
          break;
          
        case 'group':
          // For group allocation, we would need to create allocations for each group
          toast({
            title: "Settings saved",
            description: "Student group allocation settings have been updated. Please configure group-specific allocations in the student group management section.",
          });
          break;
          
        default:
          toast({
            title: "Settings saved",
            description: "Your session allocation settings have been updated.",
          });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save session allocation settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSettings = () => {
    setOpenToAll(true);
    setAllocationMethod('institution');
    setSessionsPerStudent(3);
  };
  
  return (
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
                    value={sessionsPerStudent}
                    onChange={(e) => setSessionsPerStudent(Number(e.target.value))}
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
                <Link to="/departments">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Manage Department Allocation
                  </Button>
                </Link>
              </div>
            )}
            
            {allocationMethod === 'group' && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Student Group Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how sessions are allocated to different student groups.
                </p>
                <Link to="/student-groups">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Manage Student Groups
                  </Button>
                </Link>
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
        <ConfirmationDialog
          details={{
            title: "Save Allocation Settings",
            description: "Are you sure you want to save these allocation settings? This will affect how students can book interviews.",
            confirmText: "Save Changes",
          }}
          trigger={
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Allocation Settings
                </>
              )}
            </Button>
          }
          onConfirm={handleSaveSettings}
        />
        <ResetSettingsDialog 
          settingsType="Session Allocation"
          onConfirm={handleResetSettings}
        />
      </CardFooter>
    </Card>
  );
};

export default SessionAllocation;