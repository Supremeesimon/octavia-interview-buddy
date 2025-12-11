import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Link } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { DepartmentService, Department } from '@/services/department.service';
import { SessionService, SessionAllocation } from '@/services/session.service';

interface DepartmentAllocation extends Department {
  sessionAllocation: number;
  usedSessions: number;
}

const DepartmentAllocationPage = () => {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [departments, setDepartments] = useState<DepartmentAllocation[]>([]);
  const [sessionAllocations, setSessionAllocations] = useState<SessionAllocation[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentStudentCount, setNewDepartmentStudentCount] = useState('');
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
        
        // Load departments for this institution
        const institutionDepartments = await DepartmentService.getDepartmentsByInstitution(user.institutionId);
        
        // Load session allocations
        const allocations = await SessionService.getSessionAllocations();
        setSessionAllocations(allocations);
        
        // Combine departments with their session allocations
        const departmentAllocations = institutionDepartments.map(dept => {
          // Find existing allocation for this department
          const allocation = allocations.find(a => a.departmentId === dept.id);
          
          return {
            ...dept,
            sessionAllocation: allocation?.allocatedSessions || 0,
            usedSessions: allocation?.usedSessions || 0
          };
        });
        
        setDepartments(departmentAllocations);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load department and session data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.institutionId, toast]);
  
  const handleAddDepartment = async () => {
    if (!user?.institutionId) {
      toast({
        title: "Authentication required",
        description: "Please log in to add departments",
        variant: "destructive"
      });
      return;
    }
    
    if (!newDepartmentName.trim()) {
      toast({
        title: "Department name required",
        description: "Please enter a department name",
        variant: "destructive"
      });
      return;
    }
    
    const studentCount = parseInt(newDepartmentStudentCount) || 0;
    if (studentCount <= 0) {
      toast({
        title: "Invalid student count",
        description: "Please enter a valid number of students",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create department in Firestore
      const departmentId = await DepartmentService.createDepartment({
        name: newDepartmentName,
        institutionId: user.institutionId,
        studentCount: studentCount
      });
      
      // Add to local state
      const newDepartment: DepartmentAllocation = {
        id: departmentId,
        name: newDepartmentName,
        institutionId: user.institutionId,
        studentCount: studentCount,
        sessionAllocation: 0,
        usedSessions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setDepartments([...departments, newDepartment]);
      setNewDepartmentName('');
      setNewDepartmentStudentCount('');
      
      toast({
        title: "Department added",
        description: `${newDepartmentName} added to allocation list`
      });
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "Error adding department",
        description: "Failed to add department. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAllocationChange = async (id: string, value: number) => {
    // Update local state immediately for UI responsiveness
    const updatedDepartments = departments.map(dept => 
      dept.id === id ? { ...dept, sessionAllocation: value } : dept
    );
    
    setDepartments(updatedDepartments);
    
    // Recalculate used sessions
    const totalAllocated = updatedDepartments.reduce((sum, dept) => sum + dept.sessionAllocation, 0);
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
  
  const handleDeleteDepartment = async (id: string) => {
    const departmentToDelete = departments.find(dept => dept.id === id);
    if (!departmentToDelete) return;
    
    try {
      // Delete department from Firestore
      await DepartmentService.deleteDepartment(id);
      
      // Update local state
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      setDepartments(updatedDepartments);
      
      // Recalculate used sessions
      const totalAllocated = updatedDepartments.reduce((sum, dept) => sum + dept.sessionAllocation, 0);
      setUsedSessions(totalAllocated);
      
      toast({
        title: "Department removed",
        description: `${departmentToDelete.name} has been removed from allocations`
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error removing department",
        description: "Failed to remove department. Please try again.",
        variant: "destructive"
      });
    }
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
      // Save each department's allocation
      for (const dept of departments) {
        // Check if allocation already exists
        const existingAllocation = sessionAllocations.find(a => a.departmentId === dept.id);
        
        if (dept.sessionAllocation > 0) {
          if (existingAllocation) {
            // Update existing allocation
            await SessionService.updateSessionAllocation(existingAllocation.id, {
              allocatedSessions: dept.sessionAllocation
            });
          } else {
            // Create new allocation
            await SessionService.createSessionAllocation({
              institutionId: user.institutionId,
              departmentId: dept.id,
              name: `${dept.name} Allocation`,
              allocationType: 'department',
              allocatedSessions: dept.sessionAllocation,
              endDate: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year from now
            });
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
        description: "Department session allocations have been updated"
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
              <h1 className="text-3xl font-bold">Department Allocation</h1>
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
            <h1 className="text-3xl font-bold">Department Allocation</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card tooltip="Overview of session allocation across departments">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Session Allocation Overview
                </CardTitle>
                <CardDescription>
                  Distribute your institution's sessions across departments
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
            
            <Card tooltip="Add a new department to allocate sessions to">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add Department
                </CardTitle>
                <CardDescription>
                  Add a new department to your allocation plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department-name">Department Name</Label>
                    <Input 
                      id="department-name"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-count">Number of Students</Label>
                    <Input 
                      id="student-count"
                      value={newDepartmentStudentCount}
                      onChange={(e) => setNewDepartmentStudentCount(e.target.value)}
                      placeholder="e.g., 100"
                      className="mt-1"
                      type="number"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddDepartment} className="ml-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </CardFooter>
            </Card>
            
            <Card tooltip="Configure session allocation for each department">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Department Allocations
                </CardTitle>
                <CardDescription>
                  Adjust how many sessions each department receives
                </CardDescription>
              </CardHeader>
              <CardContent>
                {departments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No departments added yet. Add departments above to begin allocating sessions.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Session Allocation</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell>{dept.studentCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={[dept.sessionAllocation]}
                                onValueChange={(values) => handleAllocationChange(dept.id, values[0])}
                                max={totalSessions}
                                step={1}
                                className="w-40"
                              />
                              <span className="text-sm font-medium w-12 text-right">
                                {dept.sessionAllocation}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ConfirmationDialog
                              details={{
                                title: `Delete ${dept.name}?`,
                                description: "This will remove the department from allocations and free up any assigned sessions.",
                                confirmText: "Delete",
                                destructive: true
                              }}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                              onConfirm={() => handleDeleteDepartment(dept.id)}
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

export default DepartmentAllocationPage;