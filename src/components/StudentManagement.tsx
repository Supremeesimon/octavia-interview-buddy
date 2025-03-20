
import React, { useState } from 'react';
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

// Mock data for students
const mockStudents = [
  { 
    id: 1, 
    name: 'Alex Thompson', 
    email: 'alex.t@harvard.edu', 
    institution: 'Harvard University', 
    interviewsCompleted: 8, 
    lastActive: '2023-05-12', 
    performanceScore: 92 
  },
  { 
    id: 2, 
    name: 'Jamie Rodriguez', 
    email: 'j.rodriguez@stanford.edu', 
    institution: 'Stanford University', 
    interviewsCompleted: 5, 
    lastActive: '2023-05-10', 
    performanceScore: 88 
  },
  { 
    id: 3, 
    name: 'Casey Kim', 
    email: 'c.kim@mit.edu', 
    institution: 'MIT', 
    interviewsCompleted: 12, 
    lastActive: '2023-05-11', 
    performanceScore: 95 
  },
  { 
    id: 4, 
    name: 'Taylor Wong', 
    email: 't.wong@yale.edu', 
    institution: 'Yale University', 
    interviewsCompleted: 3, 
    lastActive: '2023-05-08', 
    performanceScore: 79 
  },
  { 
    id: 5, 
    name: 'Jordan Smith', 
    email: 'j.smith@princeton.edu', 
    institution: 'Princeton University', 
    interviewsCompleted: 7, 
    lastActive: '2023-05-09', 
    performanceScore: 87 
  },
];

// Mock data for student detail
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
                {filteredStudents.length === 0 ? (
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
                              className={`h-full rounded-full ${
                                student.performanceScore >= 90 ? 'bg-green-500' : 
                                student.performanceScore >= 80 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${student.performanceScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{student.performanceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
      {selectedStudent && (
        <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Student Profile</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedStudent.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                      <p className="text-muted-foreground">{selectedStudent.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Institution</p>
                      <p className="font-medium">{selectedStudent.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interviews Completed</p>
                      <p className="font-medium">{selectedStudent.interviewsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="font-medium">{selectedStudent.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                      <p className="font-medium">{selectedStudent.performanceScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="interviews">
                <TabsList className="w-full">
                  <TabsTrigger value="interviews" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Interviews
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Feedback Summary
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="interviews">
                  <div className="mt-4">
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
                                <div className="h-2 w-12 rounded-full bg-gray-200 mr-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      interview.score >= 90 ? 'bg-green-500' : 
                                      interview.score >= 80 ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${interview.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{interview.score}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="feedback">
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Strengths</TableHead>
                          <TableHead>Areas for Improvement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockFeedback.map((feedback) => (
                          <TableRow key={feedback.id}>
                            <TableCell className="font-medium">{feedback.category}</TableCell>
                            <TableCell>{feedback.strength}</TableCell>
                            <TableCell>{feedback.improvement}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentManagement;
