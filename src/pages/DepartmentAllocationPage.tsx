
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

interface Department {
  id: string;
  name: string;
  sessionAllocation: number;
  studentCount: number;
}

const DepartmentAllocationPage = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Computer Science', sessionAllocation: 25, studentCount: 120 },
    { id: '2', name: 'Business', sessionAllocation: 20, studentCount: 180 },
    { id: '3', name: 'Engineering', sessionAllocation: 30, studentCount: 150 },
  ]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentStudentCount, setNewDepartmentStudentCount] = useState('');
  const [totalSessions, setTotalSessions] = useState(1000);
  const [remainingSessions, setRemainingSessions] = useState(925);
  
  const handleAddDepartment = () => {
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
    
    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      name: newDepartmentName,
      sessionAllocation: 0,
      studentCount
    };
    
    setDepartments([...departments, newDepartment]);
    setNewDepartmentName('');
    setNewDepartmentStudentCount('');
    
    toast({
      title: "Department added",
      description: `${newDepartmentName} added to allocation list`
    });
  };
  
  const handleAllocationChange = (id: string, value: number) => {
    const updatedDepartments = departments.map(dept => 
      dept.id === id ? { ...dept, sessionAllocation: value } : dept
    );
    
    setDepartments(updatedDepartments);
    
    // Recalculate remaining sessions
    const totalAllocated = updatedDepartments.reduce((sum, dept) => sum + dept.sessionAllocation, 0);
    setRemainingSessions(totalSessions - totalAllocated);
  };
  
  const handleDeleteDepartment = (id: string) => {
    const departmentToDelete = departments.find(dept => dept.id === id);
    if (!departmentToDelete) return;
    
    const updatedDepartments = departments.filter(dept => dept.id !== id);
    setDepartments(updatedDepartments);
    
    // Recalculate remaining sessions
    const totalAllocated = updatedDepartments.reduce((sum, dept) => sum + dept.sessionAllocation, 0);
    setRemainingSessions(totalSessions - totalAllocated);
    
    toast({
      title: "Department removed",
      description: `${departmentToDelete.name} has been removed from allocations`
    });
  };
  
  const handleSaveAllocations = () => {
    toast({
      title: "Allocations saved",
      description: "Department session allocations have been updated"
    });
  };
  
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
      <Footer />
    </div>
  );
};

export default DepartmentAllocationPage;
