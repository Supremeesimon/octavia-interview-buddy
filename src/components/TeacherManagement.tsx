import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Building, Mail, Phone, Calendar, MoreHorizontal, Loader2, Plus } from 'lucide-react';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeacherWithInstitution extends UserProfile {
  institutionName?: string;
}

interface Department {
  id: string;
  name: string;
}

// Helper function to fetch departments by institution ID
const fetchDepartmentsByInstitutionId = async (institutionId: string) => {
  try {
    const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    
    return departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().departmentName || 'Unnamed Department'
    }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const TeacherManagement = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<TeacherWithInstitution[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherWithInstitution[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithInstitution | null>(null);
  
  // Add teacher modal state
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    institutionId: '',
    departmentId: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch real institution data and teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch institutions
        const institutionsData = await InstitutionService.getAllInstitutions();
        setInstitutions(institutionsData);
        
        // Fetch all teachers from all institutions
        const allTeachers: TeacherWithInstitution[] = [];
        
        for (const institution of institutionsData) {
          try {
            const institutionTeachers = await InstitutionDashboardService.getInstitutionTeachers(institution.id);
            const teachersWithInstitution = institutionTeachers.map(teacher => ({
              ...teacher,
              institutionName: institution.name
            }));
            allTeachers.push(...teachersWithInstitution);
          } catch (error) {
            console.error(`Error fetching teachers for institution ${institution.id}:`, error);
            // Continue with other institutions even if one fails
          }
        }
        
        setTeachers(allTeachers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load teacher data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter teachers based on search query
  useEffect(() => {
    let result = teachers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        (teacher.institutionName && teacher.institutionName.toLowerCase().includes(query))
      );
    }
    
    setFilteredTeachers(result);
  }, [searchQuery, teachers]);

  // Fetch departments when institution is selected
  const handleInstitutionChange = async (institutionId: string) => {
    setNewTeacher(prev => ({ ...prev, institutionId, departmentId: '' }));
    if (!institutionId) {
      setDepartments([]);
      return;
    }
    
    try {
      setLoadingDepartments(true);
      const departmentsData = await fetchDepartmentsByInstitutionId(institutionId);
      setDepartments(departmentsData);
      
      // Log for debugging
      console.log('Fetched departments:', departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Handle adding a new teacher
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newTeacher.name || !newTeacher.email || !newTeacher.institutionId || !newTeacher.departmentId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTeacher.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real implementation, we would:
      // 1. Create a Firebase Auth user
      // 2. Create the teacher in the hierarchical structure
      // For now, we'll just show a success message and refresh the teacher list
      
      toast({
        title: "Success",
        description: "Teacher added successfully! In a full implementation, this would create a new teacher account.",
      });
      
      // Reset form and close dialog
      setNewTeacher({
        name: '',
        email: '',
        institutionId: '',
        departmentId: ''
      });
      setDepartments([]);
      setShowAddTeacherDialog(false);
      
      // Refresh teacher list
      const institutionsData = await InstitutionService.getAllInstitutions();
      const allTeachers: TeacherWithInstitution[] = [];
      
      for (const institution of institutionsData) {
        try {
          const institutionTeachers = await InstitutionDashboardService.getInstitutionTeachers(institution.id);
          const teachersWithInstitution = institutionTeachers.map(teacher => ({
            ...teacher,
            institutionName: institution.name
          }));
          allTeachers.push(...teachersWithInstitution);
        } catch (error) {
          console.error(`Error fetching teachers for institution ${institution.id}:`, error);
        }
      }
      
      setTeachers(allTeachers);
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Teacher Management</h2>
          <p className="text-muted-foreground">
            Manage all teachers across institutions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teachers..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={showAddTeacherDialog} onOpenChange={setShowAddTeacherDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Add a new teacher to an institution. Fill in the teacher's details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    placeholder="Enter teacher's full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    placeholder="Enter teacher's email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Select 
                    value={newTeacher.institutionId} 
                    onValueChange={handleInstitutionChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={newTeacher.departmentId} 
                    onValueChange={(value) => setNewTeacher({...newTeacher, departmentId: value})}
                    disabled={!newTeacher.institutionId || loadingDepartments}
                    required
                  >
                    <SelectTrigger 
                      className={(!newTeacher.institutionId || loadingDepartments) && departments.length === 0 ? "opacity-50" : ""}
                    >
                      <SelectValue placeholder={
                        loadingDepartments 
                          ? "Loading departments..." 
                          : !newTeacher.institutionId 
                            ? "Select an institution first" 
                            : departments.length === 0 
                              ? "No departments found" 
                              : "Select a department"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))
                      ) : (
                        // Fixed the issue by providing a unique non-empty value
                        <SelectItem value="no-departments" disabled>
                          {loadingDepartments 
                            ? "Loading departments..." 
                            : !newTeacher.institutionId 
                              ? "Select an institution first" 
                              : "No departments available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddTeacherDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!newTeacher.name || !newTeacher.email || !newTeacher.institutionId || !newTeacher.departmentId}
                  >
                    Add Teacher
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredTeachers.length}</div>
                <div className="text-sm text-muted-foreground">Total Teachers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{institutions.length}</div>
                <div className="text-sm text-muted-foreground">Institutions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredTeachers.filter(t => t.email).length}
                </div>
                <div className="text-sm text-muted-foreground">With Email</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No teachers found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No teachers match your search criteria' : 'Get started by adding a new teacher'}
              </p>
              <Button className="mt-4" onClick={() => setShowAddTeacherDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          ) : (
            <div className={`${isMobile ? '' : 'rounded-md border'}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        <div>{teacher.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {teacher.institutionName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {teacher.institutionName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {teacher.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {teacher.department || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;