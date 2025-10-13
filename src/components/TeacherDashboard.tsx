import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle,
  FileText,
  Calendar,
  BarChart3,
  Download,
  Settings,
  Mail,
  UserCheck,
  UserX,
  Filter,
  Search,
  ArrowUpDown,
  CheckCheck,
  X,
  ChevronDown,
  ChevronUp,
  FileUp,
  MessageSquare,
  Star,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';

const TeacherDashboard = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('students');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('performance');
  const [signupLink, setSignupLink] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  
  // Generate a unique signup link for the teacher's students using the new hierarchical structure
  const generateSignupLink = async () => {
    try {
      // In a real implementation, these would come from user context
      const teacherId = "teacher-xyz"; // This would come from user context
      const instId = institutionId || "institution-abc"; // This would come from user context
      const deptId = departmentId || "department-def"; // This would come from user context
      
      // Create a department-specific signup link
      const department = await InstitutionHierarchyService.getDepartmentByToken(instId, deptId);
      if (department && department.departmentSignupLink) {
        return department.departmentSignupLink;
      }
      
      // Fallback to a generic link
      const timestamp = Date.now().toString(36);
      return `https://octavia.ai/signup-institution/${instId}?department=${deptId}&t=${timestamp}`;
    } catch (error) {
      console.error('Error generating signup link:', error);
      // Fallback to a generic link
      const timestamp = Date.now().toString(36);
      return `https://octavia.ai/signup/student?t=${timestamp}`;
    }
  };
  
  // Initialize the signup link when component mounts
  React.useEffect(() => {
    generateSignupLink().then(link => setSignupLink(link));
  }, [departmentId, institutionId]);
  
  // Mock data for the teacher's students
  const students = [
    { id: 1, name: "Emma Thompson", email: "ethompson@edu.com", status: "Active", interviewsCompleted: 3, resumeUploaded: true, signupDate: "2023-05-10", lastActivity: "2 days ago", avgScore: 85 },
    { id: 2, name: "John Davis", email: "jdavis@edu.com", status: "Active", interviewsCompleted: 2, resumeUploaded: true, signupDate: "2023-05-11", lastActivity: "1 day ago", avgScore: 78 },
    { id: 3, name: "Maria Garcia", email: "mgarcia@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up", avgScore: 0 },
    { id: 4, name: "Ahmed Hassan", email: "ahassan@edu.com", status: "Active", interviewsCompleted: 5, resumeUploaded: true, signupDate: "2023-05-08", lastActivity: "3 hours ago", avgScore: 92 },
    { id: 5, name: "Sarah Johnson", email: "sjohnson@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up", avgScore: 0 },
    { id: 6, name: "Michael Brown", email: "mbrown@edu.com", status: "Active", interviewsCompleted: 1, resumeUploaded: true, signupDate: "2023-05-12", lastActivity: "12 hours ago", avgScore: 72 },
    { id: 7, name: "Wei Zhang", email: "wzhang@edu.com", status: "Active", interviewsCompleted: 4, resumeUploaded: true, signupDate: "2023-05-12", lastActivity: "12 hours ago", avgScore: 88 },
    { id: 8, name: "Alex Rivera", email: "arivera@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up", avgScore: 0 },
  ];
  
  const scheduledInterviews = [
    { id: 1, studentName: "Emma Thompson", date: "2023-06-15", time: "14:00", type: "Technical" },
    { id: 2, studentName: "John Davis", date: "2023-06-15", time: "15:30", type: "Behavioral" },
    { id: 3, studentName: "Wei Zhang", date: "2023-06-16", time: "10:00", type: "Technical" },
  ];
  
  const classPerformance = {
    avgScore: 82,
    improvementRate: "+12%",
    interviewsCompleted: 24,
    studentsActive: 6,
    topPerformers: [
      { name: "Ahmed Hassan", score: 92 },
      { name: "Wei Zhang", score: 88 },
      { name: "Emma Thompson", score: 85 }
    ]
  };
  
  const studentPerformance = [
    {
      id: 1,
      studentName: "Emma Thompson",
      overallScore: 85,
      communication: 88,
      technical: 82,
      problemSolving: 86,
      interviews: 3,
      lastInterview: "2023-06-10",
      improvement: "+8%"
    },
    {
      id: 2,
      studentName: "John Davis",
      overallScore: 78,
      communication: 75,
      technical: 80,
      problemSolving: 79,
      interviews: 2,
      lastInterview: "2023-06-08",
      improvement: "+5%"
    },
    {
      id: 3,
      studentName: "Ahmed Hassan",
      overallScore: 92,
      communication: 90,
      technical: 95,
      problemSolving: 92,
      interviews: 5,
      lastInterview: "2023-06-12",
      improvement: "+15%"
    }
  ];
  
  const copySignupLink = () => {
    navigator.clipboard.writeText(signupLink);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const approveStudent = (studentId) => {
    toast.success(`Student #${studentId} approved successfully`);
  };
  
  const rejectStudent = (studentId) => {
    toast.success(`Student #${studentId} rejected`);
  };
  
  const regenerateLink = () => {
    const newLink = generateSignupLink();
    setSignupLink(newLink);
    toast.success("New signup link generated successfully!");
  };
  
  const exportData = () => {
    toast.success("Exporting student data...");
  };
  
  const toggleStudentDetails = (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && student.status === 'Pending') ||
      (statusFilter === 'active' && student.status === 'Active') ||
      (statusFilter === 'rejected' && student.status === 'Rejected');
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Class Performance</h3>
            <TrendingUp className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{classPerformance.avgScore}</div>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span className="text-green-600 font-medium">{classPerformance.improvementRate}</span>
            <span className="mx-1">•</span>
            <span>{classPerformance.interviewsCompleted} interviews</span>
          </div>
          <Progress value={classPerformance.avgScore} className="h-2" />
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Active Students</h3>
            <UserCheck className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{classPerformance.studentsActive}</div>
          <div className="text-sm text-muted-foreground">
            {students.filter(s => s.status === 'Pending').length} pending approvals
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Student Signup Link</h3>
            <LinkIcon className="text-primary h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-4 overflow-hidden">
            <div className="text-sm truncate flex-1">{signupLink}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0" 
              onClick={copySignupLink}
              tooltip="Copy signup link to clipboard"
            >
              {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">Share this link with your students</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs" 
              onClick={regenerateLink}
              tooltip="Generate a new signup link (invalidates the current link)"
            >
              Regenerate
            </Button>
          </div>
        </Card>
      </div>
      
      <Tabs 
        defaultValue="students" 
        value={activeMainTab}
        onValueChange={setActiveMainTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger 
            value="students"
            tooltip="View and manage your students"
            className={activeMainTab === "students" ? "border-b-2 border-primary" : ""}
          >
            Students
          </TabsTrigger>
          <TabsTrigger 
            value="approvals"
            tooltip="Review and approve pending student registrations"
            className={activeMainTab === "approvals" ? "border-b-2 border-primary" : ""}
          >
            Pending Approvals
          </TabsTrigger>
          <TabsTrigger 
            value="interviews"
            tooltip="View upcoming interview sessions"
            className={activeMainTab === "interviews" ? "border-b-2 border-primary" : ""}
          >
            Scheduled Interviews
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            tooltip="Access detailed performance metrics and analytics"
            className={activeMainTab === "analytics" ? "border-b-2 border-primary" : ""}
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="resources"
            tooltip="Access teaching resources and materials"
            className={activeMainTab === "resources" ? "border-b-2 border-primary" : ""}
          >
            Resources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="pl-8 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportData} 
                    className="gap-2"
                    tooltip="Export student data to CSV"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[250px]">Name / Email</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Interviews</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <div>{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs 
                              ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                student.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {student.resumeUploaded ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <X className="h-4 w-4 text-red-500" />
                            }
                          </TableCell>
                          <TableCell>{student.interviewsCompleted}</TableCell>
                          <TableCell>
                            {student.avgScore > 0 ? (
                              <span className="font-medium">{student.avgScore}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{student.lastActivity}</TableCell>
                          <TableCell className="text-right">
                            {student.status === 'Pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8"
                                  onClick={() => approveStudent(student.id)}
                                  tooltip="Approve this student's registration"
                                >
                                  <CheckCheck className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => rejectStudent(student.id)}
                                  tooltip="Reject this student's registration"
                                >
                                  <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8"
                                tooltip="View detailed student profile"
                              >
                                View Profile
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No students found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {students.filter(s => s.status === 'Pending').length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {students
                      .filter(student => student.status === 'Pending')
                      .map(student => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                            <div className="text-xs text-muted-foreground mt-1">Signed up {student.signupDate}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => approveStudent(student.id)}
                              className="gap-1"
                              tooltip="Approve this student's registration"
                            >
                              <CheckCheck className="h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => rejectStudent(student.id)}
                              className="gap-1"
                              tooltip="Reject this student's registration"
                            >
                              <X className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <UserCheck className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
              <CardDescription>Upcoming interview sessions for your students</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledInterviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Interview Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledInterviews.map(interview => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">{interview.studentName}</TableCell>
                        <TableCell>{interview.date}</TableCell>
                        <TableCell>{interview.time}</TableCell>
                        <TableCell>{interview.type} Interview</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            tooltip="View interview details and settings"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <Calendar className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">No scheduled interviews</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Student Performance Analytics</h2>
              <Button 
                onClick={exportData} 
                className="gap-2"
                tooltip="Export analytics data to CSV format"
              >
                <Download className="h-4 w-4" />
                Export Analytics
              </Button>
            </div>
            
            <Tabs 
              defaultValue="performance" 
              value={activeAnalyticsTab}
              onValueChange={setActiveAnalyticsTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger 
                  value="performance"
                  tooltip="View overall student performance metrics"
                  className={activeAnalyticsTab === "performance" ? "border-b-2 border-primary" : ""}
                >
                  Performance Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="detailed"
                  tooltip="View detailed performance breakdown by student"
                  className={activeAnalyticsTab === "detailed" ? "border-b-2 border-primary" : ""}
                >
                  Detailed Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="improvement"
                  tooltip="Track student improvement over time"
                  className={activeAnalyticsTab === "improvement" ? "border-b-2 border-primary" : ""}
                >
                  Improvement Tracking
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Performance Overview</CardTitle>
                    <CardDescription>
                      Overall performance metrics for your students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Average Score</p>
                              <p className="text-3xl font-bold">{classPerformance.avgScore}</p>
                            </div>
                            <Award className="h-10 w-10 text-primary opacity-80" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Improvement Rate</p>
                              <p className="text-3xl font-bold text-green-600">{classPerformance.improvementRate}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Top Performers</p>
                              <div className="mt-2 space-y-1">
                                {classPerformance.topPerformers.map((student, index) => (
                                  <div key={index} className="flex items-center text-sm">
                                    <span className="font-medium mr-2">#{index + 1}</span>
                                    <span>{student.name}</span>
                                    <span className="ml-auto font-medium">{student.score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Star className="h-10 w-10 text-yellow-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Performance by Category</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Communication Skills</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Average</span>
                              <span className="text-sm font-medium">84%</span>
                            </div>
                            <Progress value={84} className="h-2" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Technical Knowledge</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Average</span>
                              <span className="text-sm font-medium">81%</span>
                            </div>
                            <Progress value={81} className="h-2" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Problem Solving</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Average</span>
                              <span className="text-sm font-medium">83%</span>
                            </div>
                            <Progress value={83} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="detailed">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Student Analysis</CardTitle>
                    <CardDescription>
                      Individual performance breakdown for each student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search students..."
                            className="pl-8 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
                          />
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {studentPerformance.map(student => (
                            <Collapsible 
                              key={student.id}
                              open={expandedStudent === student.id}
                              onOpenChange={() => toggleStudentDetails(student.id)}
                            >
                              <Card>
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <CardTitle className="text-lg">{student.studentName}</CardTitle>
                                      <CardDescription>Performance Metrics</CardDescription>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="sm" className="w-9 p-0">
                                        {expandedStudent === student.id ? 
                                          <ChevronUp className="h-4 w-4" /> : 
                                          <ChevronDown className="h-4 w-4" />
                                        }
                                      </Button>
                                    </CollapsibleTrigger>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-3 pt-0">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                      <div className="text-2xl font-bold">{student.overallScore}</div>
                                      <div className="text-xs text-muted-foreground">Overall Score</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.interviews}</div>
                                      <div className="text-xs text-muted-foreground">Interviews</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.lastInterview}</div>
                                      <div className="text-xs text-muted-foreground">Last Interview</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold text-green-600">{student.improvement}</div>
                                      <div className="text-xs text-muted-foreground">Improvement</div>
                                    </div>
                                  </div>
                                  
                                  <CollapsibleContent>
                                    <div className="pt-4 space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Category Breakdown</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div className="space-y-1">
                                            <div className="flex justify-between">
                                              <span className="text-xs text-muted-foreground">Communication</span>
                                              <span className="text-xs font-medium">{student.communication}%</span>
                                            </div>
                                            <Progress value={student.communication} className="h-2" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex justify-between">
                                              <span className="text-xs text-muted-foreground">Technical</span>
                                              <span className="text-xs font-medium">{student.technical}%</span>
                                            </div>
                                            <Progress value={student.technical} className="h-2" />
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex justify-between">
                                              <span className="text-xs text-muted-foreground">Problem Solving</span>
                                              <span className="text-xs font-medium">{student.problemSolving}%</span>
                                            </div>
                                            <Progress value={student.problemSolving} className="h-2" />
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-end">
                                        <Button variant="outline" size="sm">View Full Report</Button>
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </CardContent>
                              </Card>
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="improvement">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Improvement Tracking</CardTitle>
                    <CardDescription>
                      Track how students are improving over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 h-64 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Improvement tracking chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Resources</CardTitle>
              <CardDescription>
                Access materials and guides to help your students succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <BookOpen className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Interview Preparation Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comprehensive guide to help students prepare for technical interviews
                    </p>
                    <Button variant="outline" className="w-full">
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Common Interview Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Collection of frequently asked interview questions with sample answers
                    </p>
                    <Button variant="outline" className="w-full">
                      View Questions
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Feedback Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Standardized feedback templates for consistent student evaluation
                    </p>
                    <Button variant="outline" className="w-full">
                      Download Templates
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;