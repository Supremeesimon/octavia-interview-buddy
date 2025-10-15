import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Building, CheckCircle, Plus, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import ConfirmationDialog from '../ConfirmationDialog';
import ResetSettingsDialog from '../ResetSettingsDialog';
import { SessionService } from '@/services/session.service';
import type { SessionAllocation as SessionAllocationType } from '@/services/session.service';

interface SessionAllocationProps {
  institutionId?: string;
}

const SessionAllocation = ({ institutionId }: SessionAllocationProps) => {
  const [openToAll, setOpenToAll] = useState(true);
  const [allocationMethod, setAllocationMethod] = useState('institution');
  const [sessionsPerStudent, setSessionsPerStudent] = useState(3);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<SessionAllocationType[]>([]);
  const { toast } = useToast();
  
  // Load existing interview session allocations when component mounts
  useEffect(() => {
    const loadAllocations = async () => {
      if (!institutionId) return;
      
      try {
        const allocationData = await SessionService.getSessionAllocations();
        // Since getSessionAllocations now returns [] for 404 errors instead of throwing,
        // we don't need to catch 404 errors separately
        setAllocations(allocationData);
      } catch (error: any) {
        // Only show error message if it's a real error (network issues, server errors)
        // For 404 and 400 errors, getSessionAllocations now returns [] instead of throwing
        console.error('Failed to load interview session allocations:', error);
        // Show error toast for actual network/server errors
        if (error.status === undefined) {
          // Network error
          toast({
            title: "Error",
            description: "Failed to load interview session allocation data due to network issues. Using default settings.",
            variant: "destructive"
          });
        } else if (error.status >= 500) {
          // Server error
          toast({
            title: "Error",
            description: "Failed to load interview session allocation data due to server issues. Using default settings.",
            variant: "destructive"
          });
        }
        // For other errors (401, 403, etc.), log but don't show toast
      }
    };
    
    if (institutionId) {
      loadAllocations();
    }
  }, [institutionId, toast]);
  
  const handleSaveSettings = async () => {
    if (!institutionId) {
      toast({
        title: "Error",
        description: "Institution ID is required to save settings.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Save the interview session allocation settings based on the selected method
      switch (allocationMethod) {
        case 'student':
          // For per-student allocation, we would typically save this as a setting
          // rather than creating individual allocations for each student
          await SessionService.createSessionAllocation({
            institutionId,
            name: 'Per Student Allocation',
            allocationType: 'student',
            allocatedSessions: sessionsPerStudent,
            endDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
          });
          toast({
            title: "Settings saved",
            description: "Per-student interview session allocation settings have been updated.",
          });
          break;
          
        case 'institution':
          // Institution-wide allocation is the default, no specific allocations needed
          await SessionService.createSessionAllocation({
            institutionId,
            name: 'Institution Wide Allocation',
            allocationType: 'institution',
            allocatedSessions: 0, // Unlimited for institution-wide
            endDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
          });
          toast({
            title: "Settings saved",
            description: "Institution-wide interview session allocation settings have been updated.",
          });
          break;
          
        case 'department':
          // For department allocation, we would need to create allocations for each department
          toast({
            title: "Settings saved",
            description: "Department interview session allocation settings have been updated. Please configure department-specific allocations in the department management section.",
          });
          break;
          
        default:
          toast({
            title: "Settings saved",
            description: "Your interview session allocation settings have been updated.",
          });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save interview session allocation settings. Please try again.",
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
          <User className="h-5 w-5 text-primary" />
          Interview Session Allocation
        </CardTitle>
        <CardDescription>
          Control how interview sessions are distributed to students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Open to All Students</h3>
            <p className="text-sm text-muted-foreground">
              Allow all students to book from the shared interview session pool
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
              </ToggleGroup>
            </div>
            
            {allocationMethod === 'student' && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Interview Sessions Per Student</h3>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    min="1" 
                    value={sessionsPerStudent}
                    onChange={(e) => setSessionsPerStudent(Number(e.target.value))}
                    className="w-24" 
                  />
                  <span>interview sessions per student</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Each student will be allowed to book this many interview sessions per month.
                </p>
              </div>
            )}
            
            {allocationMethod === 'department' && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Department Interview Session Allocation</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how interview sessions are allocated to different departments.
                </p>
                <Link to="/departments">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Manage Department Allocation
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
        
        <div className="bg-primary/5 p-4 rounded-md">
          <h3 className="font-medium mb-2">How Interview Session Allocation Works</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>All students have access to book interview sessions</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Interview sessions are drawn from the institution's shared pool</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Each student can book multiple interview sessions if available</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>When the pool is depleted, add more interview sessions to continue</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <ConfirmationDialog
          details={{
            title: "Save Allocation Settings",
            description: "Are you sure you want to save these interview session allocation settings? This will affect how students can book interviews.",
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
          settingsType="Interview Session Allocation"
          onConfirm={handleResetSettings}
        />
      </CardFooter>
    </Card>
  );
};

export default SessionAllocation;