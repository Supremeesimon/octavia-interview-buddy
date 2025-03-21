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
  Star
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const InstitutionDashboard = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  
  const totalLicenses = 1000;
  const usedLicenses = 368;
  const pendingApprovals = 15;
  const approvedStudents = 353;
  const rejectedStudents = 42;
  
  const demoSignupLink = "https://octavia.ai/signup/institution-xyz";
  
  const students = [
    { id: 1, name: "Emma Thompson", email: "ethompson@edu.com", status: "Active", interviewsCompleted: 3, resumeUploaded: true, signupDate: "2023-05-10", lastActivity: "2 days ago" },
    { id: 2, name: "John Davis", email: "jdavis@edu.com", status: "Active", interviewsCompleted: 2, resumeUploaded: true, signupDate: "2023-05-11", lastActivity: "1 day ago" },
    { id: 3, name: "Maria Garcia", email: "mgarcia@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up" },
    { id: 4, name: "Ahmed Hassan", email: "ahassan@edu.com", status: "Active", interviewsCompleted: 5, resumeUploaded: true, signupDate: "2023-05-08", lastActivity: "3 hours ago" },
    { id: 5, name: "Sarah Johnson", email: "sjohnson@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up" },
    { id: 6, name: "Michael Brown", email: "mbrown@edu.com", status: "Rejected", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-14", lastActivity: "Rejected (invalid email)" },
    { id: 7, name: "Wei Zhang", email: "wzhang@edu.com", status: "Active", interviewsCompleted: 1, resumeUploaded: true, signupDate: "2023-05-12", lastActivity: "12 hours ago" },
    { id: 8, name: "Alex Rivera", email: "arivera@edu.com", status: "Pending", interviewsCompleted: 0, resumeUploaded: false, signupDate: "2023-05-15", lastActivity: "Just signed up" },
  ];
  
  const scheduledInterviews = [
    { id: 1, studentName: "Emma Thompson", date: "2023-06-15", time: "14:00", type: "Technical" },
    { id: 2, studentName: "John Davis", date: "2023-06-15", time: "15:30", type: "Behavioral" },
    { id: 3, studentName: "Wei Zhang", date: "2023-06-16", time: "10:00", type: "Technical" },
  ];
  
  const resumeAnalytics = [
    { 
      id: 1, 
      studentName: "Emma Thompson", 
      resumeViews: 24,
      timeOnSections: { summary: "40s", experience: "75s", education: "30s", skills: "50s" },
      contactClicks: 5,
      downloads: 3,
      improvementScore: 87,
      aiUsage: 12,
      resumesGenerated: 3,
      jobMatches: 8,
      jobClickRate: "65%"
    },
    { 
      id: 2, 
      studentName: "John Davis", 
      resumeViews: 18,
      timeOnSections: { summary: "35s", experience: "60s", education: "25s", skills: "40s" },
      contactClicks: 3,
      downloads: 2,
      improvementScore: 72,
      aiUsage: 8,
      resumesGenerated: 2,
      jobMatches: 6,
      jobClickRate: "50%"
    },
    { 
      id: 3, 
      studentName: "Wei Zhang", 
      resumeViews: 32,
      timeOnSections: { summary: "45s", experience: "90s", education: "35s", skills: "65s" },
      contactClicks: 7,
      downloads: 4,
      improvementScore: 93,
      aiUsage: 15,
      resumesGenerated: 4,
      jobMatches: 12,
      jobClickRate: "75%"
    }
  ];
  
  const interviewAnalytics = [
    {
      id: 1,
      studentName: "Emma Thompson",
      responseQuality: 85,
      commonMistakes: ["Lack of specificity", "Filler words"],
      avgResponseTime: "45s",
      sentiment: "Confident",
      keywordUsage: "High",
      practiceAttempts: 12,
      topicPerformance: { behavioral: 88, technical: 82, situational: 86 },
      feedbackEngagement: "90%",
      improvementTrajectory: "+15%",
      benchmarkPercentile: "88th",
      difficultyTolerance: "High",
      confidenceLevel: "Moderate",
      improvementScore: 82,
      dropOffRate: "5%"
    },
    {
      id: 2,
      studentName: "John Davis",
      responseQuality: 78,
      commonMistakes: ["Rambling", "Limited examples"],
      avgResponseTime: "52s",
      sentiment: "Somewhat nervous",
      keywordUsage: "Medium",
      practiceAttempts: 8,
      topicPerformance: { behavioral: 75, technical: 80, situational: 79 },
      feedbackEngagement: "75%",
      improvementTrajectory: "+10%",
      benchmarkPercentile: "65th",
      difficultyTolerance: "Medium",
      confidenceLevel: "Low",
      improvementScore: 74,
      dropOffRate: "12%"
    },
    {
      id: 3,
      studentName: "Wei Zhang",
      responseQuality: 92,
      commonMistakes: ["Technical overexplanation"],
      avgResponseTime: "38s",
      sentiment: "Very confident",
      keywordUsage: "Very High",
      practiceAttempts: 15,
      topicPerformance: { behavioral: 90, technical: 95, situational: 92 },
      feedbackEngagement: "95%",
      improvementTrajectory: "+20%",
      benchmarkPercentile: "95th",
      difficultyTolerance: "Very High",
      confidenceLevel: "High",
      improvementScore: 93,
      dropOffRate: "2%"
    }
  ];
  
  const platformEngagement = {
    resumeInterviewCorrelation: "78%",
    mostUsedFeatures: ["Interview Practice", "Resume Review", "Job Matching"],
    licenseActivationRate: "84%",
    studentsAtRisk: 15,
    departmentPerformance: [
      { name: "Computer Science", avgScore: 87 },
      { name: "Business", avgScore: 82 },
      { name: "Engineering", avgScore: 85 },
      { name: "Liberal Arts", avgScore: 79 }
    ]
  };
  
  const copySignupLink = () => {
    navigator.clipboard.writeText(demoSignupLink);
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
    toast.success("New signup link generated successfully!");
  };
  
  const exportData = () => {
    toast.success("Exporting student data...");
  };
  
  const exportAnalyticsData = () => {
    toast.success("Exporting analytics data...");
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
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Institution Dashboard</h1>
        <p className="text-muted-foreground">Manage your students and track progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Licenses</h3>
            <Users className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{usedLicenses} / {totalLicenses}</div>
          <Progress value={(usedLicenses / totalLicenses) * 100} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalLicenses - usedLicenses} licenses available</span>
            <span>{Math.round((usedLicenses / totalLicenses) * 100)}% used</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Students</h3>
            <UserCheck className="text-primary h-5 w-5" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{approvedStudents}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{pendingApprovals}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{rejectedStudents}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Student Signup Link</h3>
            <LinkIcon className="text-primary h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-4 overflow-hidden">
            <div className="text-sm truncate flex-1">{demoSignupLink}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0" 
              onClick={copySignupLink}
            >
              {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">Share this link with your students</p>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={regenerateLink}>
              Regenerate
            </Button>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="students">
        <TabsList className="mb-6">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="interviews">Scheduled Interviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                  
                  <Button variant="outline" size="sm" onClick={exportData} className="gap-2">
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
                      <TableHead>Signup Date</TableHead>
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
                          <TableCell>{student.signupDate}</TableCell>
                          <TableCell>{student.lastActivity}</TableCell>
                          <TableCell className="text-right">
                            {student.status === 'Pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8"
                                  onClick={() => approveStudent(student.id)}
                                >
                                  <CheckCheck className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => rejectStudent(student.id)}
                                >
                                  <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-8">
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
              {pendingApprovals > 0 ? (
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
                            >
                              <CheckCheck className="h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => rejectStudent(student.id)}
                              className="gap-1"
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
                          <Button variant="ghost" size="sm">View Details</Button>
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
              <h2 className="text-2xl font-bold">Student Analytics</h2>
              <Button onClick={exportAnalyticsData} className="gap-2">
                <Download className="h-4 w-4" />
                Export Analytics
              </Button>
            </div>
            
            <Tabs defaultValue="resume">
              <TabsList className="mb-6">
                <TabsTrigger value="resume">Resume Analytics</TabsTrigger>
                <TabsTrigger value="interview">Interview Analytics</TabsTrigger>
                <TabsTrigger value="platform">Platform Engagement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resume">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Analytics</CardTitle>
                    <CardDescription>
                      Track how students' resumes perform and evolve over time
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
                        <div className="flex gap-2">
                          <select 
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="all">All Departments</option>
                            <option value="cs">Computer Science</option>
                            <option value="business">Business</option>
                            <option value="engineering">Engineering</option>
                            <option value="liberal-arts">Liberal Arts</option>
                          </select>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {resumeAnalytics.map(student => (
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
                                      <CardDescription>Resume Performance Metrics</CardDescription>
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
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                    <div>
                                      <div className="text-2xl font-bold">{student.resumeViews}</div>
                                      <div className="text-xs text-muted-foreground">Resume Views</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.contactClicks}</div>
                                      <div className="text-xs text-muted-foreground">Contact Clicks</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.downloads}</div>
                                      <div className="text-xs text-muted-foreground">Downloads</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.jobMatches}</div>
                                      <div className="text-xs text-muted-foreground">Job Matches</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.jobClickRate}</div>
                                      <div className="text-xs text-muted-foreground">Job Click Rate</div>
                                    </div>
                                  </div>
                                  
                                  <CollapsibleContent>
                                    <div className="pt-4 space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Time Spent on Resume Sections</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                          {Object.entries(student.timeOnSections).map(([section, time]) => (
                                            <div key={section} className="bg-muted p-2 rounded-md text-center">
                                              <div className="text-xs text-muted-foreground capitalize">{section}</div>
                                              <div className="font-medium">{time}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Improvement Score</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={student.improvementScore} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.improvementScore}/100</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">AI Usage Frequency</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={(student.aiUsage / 20) * 100} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.aiUsage} times</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Resumes Generated</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={(student.resumesGenerated / 5) * 100} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.resumesGenerated}</span>
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
              
              <TabsContent value="interview">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Analytics</CardTitle>
                    <CardDescription>
                      Track how students perform during practice interviews
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
                        <div className="flex gap-2">
                          <select 
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="all">All Departments</option>
                            <option value="cs">Computer Science</option>
                            <option value="business">Business</option>
                            <option value="engineering">Engineering</option>
                            <option value="liberal-arts">Liberal Arts</option>
                          </select>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {interviewAnalytics.map(student => (
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
                                      <CardDescription>Interview Performance Metrics</CardDescription>
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
                                      <div className="text-2xl font-bold">{student.responseQuality}</div>
                                      <div className="text-xs text-muted-foreground">Response Quality</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.avgResponseTime}</div>
                                      <div className="text-xs text-muted-foreground">Avg Response Time</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.practiceAttempts}</div>
                                      <div className="text-xs text-muted-foreground">Practice Attempts</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.improvementTrajectory}</div>
                                      <div className="text-xs text-muted-foreground">Improvement</div>
                                    </div>
                                  </div>
                                  
                                  <CollapsibleContent>
                                    <div className="pt-4 space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Topic Performance</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                          {Object.entries(student.topicPerformance).map(([topic, score]) => (
                                            <div key={topic} className="space-y-1">
                                              <div className="flex justify-between">
                                                <span className="text-xs text-muted-foreground capitalize">{topic}</span>
                                                <span className="text-xs font-medium">{score}/100</span>
                                              </div>
                                              <Progress value={score} className="h-2" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Common Mistakes</h4>
                                          <div className="text-sm">
                                            {student.commonMistakes.map((mistake, index) => (
                                              <div key={index} className="flex items-center gap-1 text-amber-600">
                                                <X className="h-3 w-3" />
                                                <span>{mistake}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Strengths</h4>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.keywordUsage === 'High' || student.keywordUsage === 'Very High' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Keyword Usage: {student.keywordUsage}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.sentiment === 'Confident' || student.sentiment === 'Very confident' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Sentiment: {student.sentiment}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.difficultyTolerance === 'High' || student.difficultyTolerance === 'Very High' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Difficulty Tolerance: {student.difficultyTolerance}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.confidenceLevel === 'High' || student.confidenceLevel === 'Moderate' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Confidence: {student.confidenceLevel}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Feedback Engagement</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.feedbackEngagement)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.feedbackEngagement}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Benchmark Percentile</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.benchmarkPercentile)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.benchmarkPercentile}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Drop-off Rate</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.dropOffRate)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.dropOffRate}</span>
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
              
              <TabsContent value="platform">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Engagement & Institutional Intelligence</CardTitle>
                    <CardDescription>
                      Overall platform usage and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                              <div className="text-4xl font-bold text-primary mb-2">{platformEngagement.resumeInterviewCorrelation}</div>
                              <div className="text-sm text-muted-foreground">Resume vs Interview Performance Correlation</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Shows how writing skills align with verbal performance
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                              <div className="text-4xl font-bold text-primary mb-2">{platformEngagement.licenseActivationRate}</div>
                              <div className="text-sm text-muted-foreground">License Activation Rate</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Percentage of available licenses being actively used
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                              <div className="text-4xl font-bold text-destructive mb-2">{platformEngagement.studentsAtRisk}</div>
                              <div className="text-sm text-muted-foreground">Students at Risk</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Students likely to struggle in real-world interviews
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Most Used Features</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {platformEngagement.mostUsedFeatures.map((feature, index) => (
                                <div key={index}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">{feature}</span>
                                    <span className="text-sm font-medium">{100 - index * 15}%</span>
                                  </div>
                                  <Progress value={100 - index * 15} className="h-2" />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Department Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {platformEngagement.departmentPerformance.map((dept, index) => (
                                <div key={index}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">{dept.name}</span>
                                    <span className="text-sm font-medium">{dept.avgScore}/100</span>
                                  </div>
                                  <Progress value={dept.avgScore} className="h-2" />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Aggregate Cohort Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted/50 h-64 rounded-lg flex items-center justify-center">
                              <BarChart3 className="h-12 w-12 text-muted-foreground opacity-30" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>View analytics and reports for your institution</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Interview Completion Rates</h3>
                  <div className="bg-muted/50 h-64 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground opacity-30" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2 text-primary">78%</div>
                        <div className="text-sm text-muted-foreground">Resume Upload Rate</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2 text-primary">63%</div>
                        <div className="text-sm text-muted-foreground">Interview Completion Rate</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2 text-primary">81</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Institution Settings</CardTitle>
              <CardDescription>Manage your institution profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Institution Profile</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Institution Name</label>
                        <input 
                          type="text" 
                          defaultValue="University of Technology" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <input 
                          type="text" 
                          defaultValue="https://uot.edu" 
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Email Domain(s) for Student Verification</label>
                      <input 
                        type="text" 
                        defaultValue="uot.edu, tech.uot.edu" 
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Enter comma-separated domains"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Only students with email addresses from these domains will be able to sign up
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">New Student Signups</div>
                          <div className="text-sm text-muted-foreground">
                            Receive notifications when students sign up
                          </div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Interview Reports</div>
                          <div className="text-sm text-muted-foreground">
                            Receive weekly summaries of student interviews
                          </div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionDashboard;
