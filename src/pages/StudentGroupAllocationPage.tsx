import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Link } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { SessionService } from '@/services/session.service';
import type { SessionAllocation } from '@/services/session.service'; // Import SessionAllocation type

// Define student group interface
interface StudentGroup {
  id: string;
  name: string;
  sessionAllocation: number;
  studentCount: number;
  usedSessions: number;
}

const StudentGroupAllocationPage = () => {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [sessionAllocations, setSessionAllocations] = useState<SessionAllocation[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupStudentCount, setNewGroupStudentCount] = useState('');
  const [totalSessions, setTotalSessions] = useState(0);
  const [usedSessions, setUsedSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Calculate remaining sessions
  const remainingSessions = totalSessions - usedSessions;
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.institutionId) return;
      
      try {
        setLoading(true);
        
        // Load session pool data
        const sessionPool = await SessionService.getSessionPool();
        if (sessionPool) {
          setTotalSessions(sessionPool.totalSessions);
          setUsedSessions(sessionPool.usedSessions);
        }
        
        // Load session allocations for student groups
        const allocations = await SessionService.getSessionAllocations();
        setSessionAllocations(allocations);
        
        // Filter allocations that are for student groups (we'll use a naming convention)
        const groupAllocations = allocations.filter(a => 
          a.allocationType === 'student' && a.name?.includes('Group')
        );
        
        // Create student groups from allocations
        const groups: StudentGroup[] = groupAllocations.map(allocation => ({
          id: allocation.id,
          name: allocation.name?.replace(' Group Allocation', '') || 'Unnamed Group',
          sessionAllocation: allocation.allocatedSessions,
          studentCount: 0, // We don't have student count in session allocations, will be entered by user
          usedSessions: allocation.usedSessions
        }));
        
        setStudentGroups(groups);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load student group and session data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.institutionId, toast]);
  
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a student group name",
        variant: "destructive"
      });
      return;
    }
    
    const studentCount = parseInt(newGroupStudentCount) || 0;
    if (studentCount <= 0) {
      toast({
        title: "Invalid student count",
        description: "Please enter a valid number of students",
        variant: "destructive"
      });
      return;
    }
    
    // Create new group with default allocation of 0
    const newGroup: StudentGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      sessionAllocation: 0,
      studentCount,
      usedSessions: 0
    };
    
    setStudentGroups([...studentGroups, newGroup]);
    setNewGroupName('');
    setNewGroupStudentCount('');
    
    toast({
      title: "Student group added",
      description: `${newGroupName} added to allocation list`
    });
  };
  
  const handleAllocationChange = (id: string, value: number) => {
    // Update local state immediately for UI responsiveness
    const updatedGroups = studentGroups.map(group => 
      group.id === id ? { ...group, sessionAllocation: value } : group
    );
    
    setStudentGroups(updatedGroups);
    
    // Recalculate used sessions
    const totalAllocated = updatedGroups.reduce((sum, group) => sum + group.sessionAllocation, 0);
    setUsedSessions(totalAllocated);
    
    // Check if we have enough sessions
    if (totalAllocated > totalSessions) {
      toast({
        title: "Insufficient sessions",
        description: "You've allocated more sessions than available in your pool.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteGroup = (id: string) => {
    const groupToDelete = studentGroups.find(group => group.id === id);
    if (!groupToDelete) return;
    
    const updatedGroups = studentGroups.filter(group => group.id !== id);
    setStudentGroups(updatedGroups);
    
    // Recalculate used sessions
    const totalAllocated = updatedGroups.reduce((sum, group) => sum + group.sessionAllocation, 0);
    setUsedSessions(totalAllocated);
    
    toast({
      title: "Student group removed",
      description: `${groupToDelete.name} has been removed from allocations`
    });
  };
  
  const handleSaveAllocations = async () => {
    if (!user?.institutionId) {
      toast({
        title: "Authentication required",
        description: "Please log in to save allocations",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Save each group's allocation
      for (const group of studentGroups) {
        // Check if allocation already exists
        const existingAllocation = sessionAllocations.find(a => a.id === group.id);
        
        if (group.sessionAllocation > 0) {
          if (existingAllocation) {
            // Update existing allocation
            await SessionService.updateSessionAllocation(existingAllocation.id, {
              allocatedSessions: group.sessionAllocation
            });
          } else {
            // Create new allocation
            const newAllocation = await SessionService.createSessionAllocation({
              institutionId: user.institutionId,
              name: `${group.name} Group Allocation`,
              allocationType: 'student',
              allocatedSessions: group.sessionAllocation,
              endDate: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year from now
            });
            
            // Update the group with the real ID from the backend
            const updatedGroups = studentGroups.map(g => 
              g.id === group.id ? { ...g, id: newAllocation.id } : g
            );
            setStudentGroups(updatedGroups);
          }
        } else if (existingAllocation) {
          // Delete allocation if set to 0
          await SessionService.deleteSessionAllocation(existingAllocation.id);
        }
      }
      
      // Reload session allocations to get updated data
      const updatedAllocations = await SessionService.getSessionAllocations();
      setSessionAllocations(updatedAllocations);
      
      // Reload session pool to get updated totals
      const sessionPool = await SessionService.getSessionPool();
      if (sessionPool) {
        setTotalSessions(sessionPool.totalSessions);
        setUsedSessions(sessionPool.usedSessions);
      }
      
      toast({
        title: "Allocations saved",
        description: "Student group session allocations have been updated"
      });
    } catch (error) {
      console.error('Error saving allocations:', error);
      toast({
        title: "Error saving allocations",
        description: "Failed to save allocations. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-28">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center mb-6 gap-2">
              <Link to="/dashboard" className="text-primary hover:text-primary/80">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold">Student Group Allocation</h1>
            </div>
            
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center mb-6 gap-2">
            <Link to="/dashboard" className="text-primary hover:text-primary/80">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Student Group Allocation</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card tooltip="Overview of session allocation across student groups">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Session Allocation Overview
                </CardTitle>
                <CardDescription>
                  Distribute your institution's sessions across student groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                      <div className="text-2xl font-bold">{totalSessions}</div>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Remaining Unallocated</div>
                      <div className={`text-2xl font-bold ${remainingSessions < 0 ? 'text-destructive' : ''}`}>
                        {remainingSessions}
                      </div>
                    </div>
                  </div>
                  
                  {remainingSessions < 0 && (
                    <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                      Warning: You've allocated more sessions than available in your pool.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card tooltip="Add a new student group to allocate sessions to">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add Student Group
                </CardTitle>
                <CardDescription>
                  Add a new student group to your allocation plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input 
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Honors Program"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-count">Number of Students</Label>
                    <Input 
                      id="student-count"
                      value={newGroupStudentCount}
                      onChange={(e) => setNewGroupStudentCount(e.target.value)}
                      placeholder="e.g., 50"
                      className="mt-1"
                      type="number"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddGroup} className="ml-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student Group
                </Button>
              </CardFooter>
            </Card>
            
            <Card tooltip="Configure session allocation for each student group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Student Group Allocations
                </CardTitle>
                <CardDescription>
                  Adjust how many sessions each student group receives
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentGroups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No student groups added yet. Add groups above to begin allocating sessions.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Group</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Session Allocation</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGroups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.studentCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={[group.sessionAllocation]}
                                onValueChange={(values) => handleAllocationChange(group.id, values[0])}
                                max={totalSessions}
                                step={1}
                                className="w-40"
                              />
                              <span className="text-sm font-medium w-12 text-right">
                                {group.sessionAllocation}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ConfirmationDialog
                              details={{
                                title: `Delete ${group.name}?`,
                                description: "This will remove the student group from allocations and free up any assigned sessions.",
                                confirmText: "Delete",
                                destructive: true
                              }}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                              onConfirm={() => handleDeleteGroup(group.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAllocations}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Allocations
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentGroupAllocationPage;