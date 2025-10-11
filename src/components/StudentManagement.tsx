import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  MessageSquare, 
  User, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstitutionService } from '@/services/institution.service';
import { Institution } from '@/types';

// Mock data for student detail (keeping this for now as we don't have a student service yet)
const mockInterviews = [
  { 
    id: 1, 
    date: '2023-05-12', 
    role: 'Software Engineer',
    company: 'Google',
    duration: '23 min',
    score: 94 
  },
  { 
    id: 2, 
    date: '2023-05-06', 
    role: 'Product Manager',
    company: 'Amazon',
    duration: '18 min',
    score: 89 
  },
  { 
    id: 3, 
    date: '2023-04-28', 
    role: 'UX Designer',
    company: 'Apple',
    duration: '21 min',
    score: 91 
  },
];

const mockFeedback = [
  { 
    id: 1, 
    category: 'Communication',
    strength: 'Clear and concise answers',
    improvement: 'Could provide more detailed examples'
  },
  { 
    id: 2, 
    category: 'Technical Knowledge',
    strength: 'Strong fundamental understanding',
    improvement: 'Work on system design explanations'
  },
  { 
    id: 3, 
    category: 'Problem Solving',
    strength: 'Methodical approach to challenges',
    improvement: 'Consider alternative solutions more frequently'
  },
];

const StudentManagement = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch real institution data (students belong to institutions)
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await InstitutionService.getAllInstitutions();
        setInstitutions(data);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutions();
  }, []);
  
  // Convert institutions to student data format
  const mockStudents = institutions.flatMap(inst => {
    // For now, we'll generate mock students based on institution data
    // In a real implementation, we would fetch actual student data
    const studentCount = inst.stats?.totalStudents || 0;
    return Array.from({ length: Math.min(studentCount, 5) }, (_, i) => ({
      id: `${inst.id}-${i + 1}`,
      name: `${inst.name} Student ${i + 1}`,
      email: `student${i + 1}@${inst.name.toLowerCase().replace(/\s+/g, '')}.edu`,
      institution: inst.name,
      interviewsCompleted: Math.floor(Math.random() * 20),
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      performanceScore: Math.floor(Math.random() * 40) + 60
    }));
  });
  
  const filteredStudents = mockStudents.filter(
    student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.institution.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Student Management</h2>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'flex-row gap-4'}`}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className={`pl-8 ${isMobile ? 'w-full' : 'w-[250px]'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.institution}</TableCell>
                      <TableCell>{student.interviewsCompleted}</TableCell>
                      <TableCell>{student.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`h-2 w-16 rounded-full bg-gray-200 mr-2 overflow-hidden`}
                          >
                            <div 
                              className={`h-full ${
                                student.performanceScore >= 90 ? 'bg-green-500' : 
                                student.performanceScore >= 80 ? 'bg-blue-500' : 
                                student.performanceScore >= 70 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${student.performanceScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{student.performanceScore}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Student Detail Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}</DialogTitle>
            <DialogDescription>
              {selectedStudent?.email} • {selectedStudent?.institution}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Interviews Completed</div>
                    <div className="text-2xl font-bold">{selectedStudent?.interviewsCompleted || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Performance Score</div>
                    <div className="text-2xl font-bold">{selectedStudent?.performanceScore || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Last Active</div>
                    <div className="text-2xl font-bold">{selectedStudent?.lastActive || 'N/A'}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="interviews">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>{interview.date}</TableCell>
                      <TableCell>{interview.role}</TableCell>
                      <TableCell>{interview.company}</TableCell>
                      <TableCell>{interview.duration}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`h-2 w-16 rounded-full bg-gray-200 mr-2 overflow-hidden`}
                          >
                            <div 
                              className={`h-full ${
                                interview.score >= 90 ? 'bg-green-500' : 
                                interview.score >= 80 ? 'bg-blue-500' : 
                                interview.score >= 70 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${interview.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{interview.score}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="feedback">
              <div className="space-y-4">
                {mockFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">{feedback.category}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Strengths</div>
                          <div className="mt-1">{feedback.strength}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Areas for Improvement</div>
                          <div className="mt-1">{feedback.improvement}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;