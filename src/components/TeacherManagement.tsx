import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Building, Mail, Phone, Calendar, MoreHorizontal, Loader2 } from 'lucide-react';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';

interface TeacherWithInstitution extends UserProfile {
  institutionName?: string;
}

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
  }, []);

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
          
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
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
              <Button className="mt-4">
                <Users className="h-4 w-4 mr-2" />
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