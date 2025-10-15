
import React, { useState, useEffect } from 'react';
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
import ResetSettingsDialog from './ResetSettingsDialog';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import SessionManagement from './SessionManagement';
import type { UserProfile, Institution } from '@/types';
import { getGreetingWithName } from '@/utils/greeting.utils';

interface InstitutionDashboardProps {
  user: UserProfile;
}

const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ user }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('students');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('resume');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loadingInstitution, setLoadingInstitution] = useState(true);
  const [dashboardStudents, setDashboardStudents] = useState<any[]>([]);
  const [dashboardTeachers, setDashboardTeachers] = useState<any[]>([]);
  const [dashboardScheduledInterviews, setDashboardScheduledInterviews] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Analytics data state
  const [resumeAnalytics, setResumeAnalytics] = useState<any[]>([]);
  const [interviewAnalytics, setInterviewAnalytics] = useState<any[]>([]);
  const [platformEngagement, setPlatformEngagement] = useState<any>({
    resumeInterviewCorrelation: "0%",
    mostUsedFeatures: [],
    licenseActivationRate: "0%",
    studentsAtRisk: 0,
    departmentPerformance: []
  });
  
  // License information state
  const [totalLicenses, setTotalLicenses] = useState(1000);
  const [usedLicenses, setUsedLicenses] = useState(300);
  const [availableLicenses, setAvailableLicenses] = useState(700);
  const [licenseUsagePercentage, setLicenseUsagePercentage] = useState(30);
  
  // Student analytics state
  const [approvedStudents, setApprovedStudents] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [rejectedStudents, setRejectedStudents] = useState(0);
  
  // Fetch institution details and dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.institutionId) {
        setLoadingInstitution(false);
        setLoadingData(false);
        return;
      }
      
      try {
        // Fetch institution details
        const institutionData = await InstitutionService.getInstitutionById(user.institutionId);
        setInstitution(institutionData);
        
        // Fetch real data for the dashboard
        const [studentsData, teachersData, interviewsData, studentAnalytics, licenseInfo] = await Promise.all([
          InstitutionDashboardService.getInstitutionStudents(user.institutionId),
          InstitutionDashboardService.getInstitutionTeachers(user.institutionId),
          InstitutionDashboardService.getInstitutionScheduledInterviews(user.institutionId),
          InstitutionDashboardService.getStudentAnalytics(user.institutionId),
          InstitutionDashboardService.getLicenseInfo(user.institutionId)
        ]);
        
        setDashboardStudents(studentsData);
        setDashboardTeachers(teachersData);
        setDashboardScheduledInterviews(interviewsData);
        
        // Update license info
        setTotalLicenses(licenseInfo.totalLicenses);
        setUsedLicenses(licenseInfo.usedLicenses);
        setAvailableLicenses(licenseInfo.availableLicenses);
        setLicenseUsagePercentage(licenseInfo.usagePercentage);
        
        // Update student analytics
        setApprovedStudents(studentAnalytics.activeStudents);
        setPendingApprovals(studentAnalytics.pendingApprovals);
        setRejectedStudents(studentAnalytics.rejectedStudents);
        
        // Initialize signup links after institution data is loaded
        if (institutionData) {
          const studentLink = institutionData.customSignupLink 
            ? `${institutionData.customSignupLink}?type=student`
            : `https://octavia.ai/signup-institution/${user.institutionId}?type=student`;
          
          const teacherLink = institutionData.customSignupLink 
            ? `${institutionData.customSignupLink}?type=teacher`
            : `https://octavia.ai/signup-institution/${user.institutionId}?type=teacher`;
          
          setSignupLink(studentLink);
          setTeacherSignupLink(teacherLink);
        }
        
        setLoadingInstitution(false);
        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoadingInstitution(false);
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Fetch analytics data when the analytics tab is selected
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (activeMainTab === 'analytics' && user?.institutionId) {
        try {
          const [resumeData, interviewData, engagementData] = await Promise.all([
            InstitutionDashboardService.getResumeAnalytics(user.institutionId),
            InstitutionDashboardService.getInterviewAnalytics(user.institutionId),
            InstitutionDashboardService.getPlatformEngagement(user.institutionId)
          ]);
          
          setResumeAnalytics(resumeData);
          setInterviewAnalytics(interviewData);
          setPlatformEngagement(engagementData);
        } catch (error) {
          console.error("Error fetching analytics data:", error);
        }
      }
    };
    
    fetchAnalyticsData();
  }, [activeMainTab, user?.institutionId]);
  
  // Generate a unique signup link for the institution
  const generateSignupLink = (userType: 'student' | 'teacher' = 'student') => {
    // Use the actual institution ID from the user context
    if (institution && institution.customSignupLink) {
      // Use the institution's custom signup link with the user type parameter
      return `${institution.customSignupLink}?type=${userType}`;
    }
    
    // Fallback for now
    if (user?.institutionId) {
      return `https://octavia.ai/signup-institution/${user.institutionId}?type=${userType}`;
    }
    
    return '';
  };
  
  const [signupLink, setSignupLink] = useState('');
  const [teacherSignupLink, setTeacherSignupLink] = useState('');
  
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
  
  const regenerateLink = async (userType: 'student' | 'teacher' = 'student') => {
    if (institution && user.institutionId) {
      try {
        // Regenerate the institution's signup token
        const { link } = await InstitutionService.regenerateSignupToken(user.institutionId);
        
        // Update the institution state with the new link
        setInstitution({
          ...institution,
          customSignupLink: link
        });
        
        // Update the signup links with the new link and user type
        const newLink = `${link}?type=${userType}`;
        if (userType === 'student') {
          setSignupLink(newLink);
        } else {
          setTeacherSignupLink(newLink);
        }
        
        toast.success(`New ${userType} signup link generated successfully!`);
      } catch (error) {
        console.error('Error regenerating signup link:', error);
        toast.error(`Failed to regenerate ${userType} signup link`);
      }
    } else {
      // Fallback to the old method
      const newLink = generateSignupLink(userType);
      if (userType === 'student') {
        setSignupLink(newLink);
      } else {
        setTeacherSignupLink(newLink);
      }
      toast.success(`New ${userType} signup link generated successfully!`);
    }
  };
  
  const copyTeacherSignupLink = () => {
    navigator.clipboard.writeText(teacherSignupLink);
    setCopiedLink(true);
    toast.success("Teacher link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const exportData = () => {
    toast.success("Exporting student data...");
  };
  
  const exportAnalyticsData = () => {
    toast.success("Exporting analytics data...");
  };
  
  const resetSettings = () => {
    toast.success("Settings reset to default values");
  };
  
  const toggleStudentDetails = (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
    }
  };
  
  const filteredStudents = dashboardStudents.filter(student => {
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
      {/* Show current user info with dynamic greeting */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        {user && (
          <div className="text-2xl font-bold text-primary">
            {getGreetingWithName(user.name)}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Licenses</h3>
            <Users className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{usedLicenses} / {totalLicenses}</div>
          <Progress value={(usedLicenses / totalLicenses) * 100} className="h-2 mb-2" tooltip="Progress bar showing license usage" />
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
            <h3 className="font-medium">Signup Links</h3>
            <LinkIcon className="text-primary h-5 w-5" />
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <UserCheck className="h-4 w-4 text-primary" />
                Student Signup Link
              </h4>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2 overflow-hidden">
                <div className="text-sm truncate flex-1">{signupLink}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0" 
                  onClick={copySignupLink}
                  tooltip="Copy student signup link to clipboard"
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
                  onClick={() => regenerateLink('student')}
                  tooltip="Generate a new student signup link (invalidates the current link)"
                >
                  Regenerate
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" />
                Teacher Signup Link
              </h4>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-2 overflow-hidden">
                <div className="text-sm truncate flex-1">{teacherSignupLink}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0" 
                  onClick={copyTeacherSignupLink}
                  tooltip="Copy teacher signup link to clipboard"
                >
                  {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">Share this link with your teachers</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs" 
                  onClick={() => regenerateLink('teacher')}
                  tooltip="Generate a new teacher signup link (invalidates the current link)"
                >
                  Regenerate
                </Button>
              </div>
            </div>
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
            tooltip="View and manage all students in your institution"
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
            value="session"
            tooltip="Manage your institution's interview session pool and allocation settings"
            className={activeMainTab === "session" ? "border-b-2 border-primary" : ""}
          >
            Session Pool
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            tooltip="Access detailed performance metrics and analytics"
            className={activeMainTab === "analytics" ? "border-b-2 border-primary" : ""}
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="reports"
            tooltip="Generate and export institution reports"
            className={activeMainTab === "reports" ? "border-b-2 border-primary" : ""}
          >
            Reports
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            tooltip="Configure institution preferences and settings"
            className={activeMainTab === "settings" ? "border-b-2 border-primary" : ""}
          >
            Settings
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
              {pendingApprovals > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {dashboardStudents
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
              {dashboardScheduledInterviews.length > 0 ? (
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
                    {dashboardScheduledInterviews.map(interview => (
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
        
        <TabsContent value="session">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Session Management</h2>
                <p className="text-muted-foreground">
                  Manage your institution's interview session pool and allocation settings
                </p>
              </div>
            </div>
            
            <SessionManagement 
              institutionId={user?.institutionId}
              totalSessions={totalLicenses}
              usedSessions={usedLicenses}
              onSessionPurchase={(sessions, cost) => {
                // Update the license info when sessions are purchased
                setTotalLicenses(prev => prev + sessions);
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Student Analytics</h2>
              <Button 
                onClick={exportAnalyticsData} 
                className="gap-2"
                tooltip="Export analytics data to CSV format"
              >
                <Download className="h-4 w-4" />
                Export Analytics
              </Button>
            </div>
            
            <Tabs 
              defaultValue="resume" 
              value={activeAnalyticsTab}
              onValueChange={setActiveAnalyticsTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger 
                  value="resume"
                  tooltip="View metrics about student resumes and their performance"
                  className={activeAnalyticsTab === "resume" ? "border-b-2 border-primary" : ""}
                >
                  Resume Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="interview"
                  tooltip="View metrics about student interview performance"
                  className={activeAnalyticsTab === "interview" ? "border-b-2 border-primary" : ""}
                >
                  Interview Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="platform"
                  tooltip="View overall platform usage statistics"
                  className={activeAnalyticsTab === "platform" ? "border-b-2 border-primary" : ""}
                >
                  Platform Engagement
                </TabsTrigger>
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
                                      <CardTitle className="text-lg">{student.studentName as string}</CardTitle>
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
                                      <div className="text-2xl font-bold">{student.resumeViews as number}</div>
                                      <div className="text-xs text-muted-foreground">Resume Views</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.contactClicks as number}</div>
                                      <div className="text-xs text-muted-foreground">Contact Clicks</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.downloads as number}</div>
                                      <div className="text-xs text-muted-foreground">Downloads</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.jobMatches as number}</div>
                                      <div className="text-xs text-muted-foreground">Job Matches</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.jobClickRate as string}</div>
                                      <div className="text-xs text-muted-foreground">Job Click Rate</div>
                                    </div>
                                  </div>
                                  
                                  <CollapsibleContent>
                                    <div className="pt-4 space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Time Spent on Resume Sections</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                          {Object.entries(student.timeOnSections || {}).map(([section, time]) => (
                                            <div key={section} className="bg-muted p-2 rounded-md text-center">
                                              <div className="text-xs text-muted-foreground capitalize">{section}</div>
                                              <div className="font-medium">{String(time)}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Improvement Score</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={Number(student.improvementScore)} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.improvementScore as number}/100</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">AI Usage Frequency</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={(Number(student.aiUsage) / 20) * 100} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.aiUsage as number} times</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Resumes Generated</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress value={(Number(student.resumesGenerated) / 5) * 100} className="h-2 flex-1" />
                                            <span className="font-medium text-sm">{student.resumesGenerated as number}</span>
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
                                      <CardTitle className="text-lg">{student.studentName as string}</CardTitle>
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
                                      <div className="text-2xl font-bold">{student.responseQuality as number}</div>
                                      <div className="text-xs text-muted-foreground">Response Quality</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.avgResponseTime as string}</div>
                                      <div className="text-xs text-muted-foreground">Avg Response Time</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.practiceAttempts as number}</div>
                                      <div className="text-xs text-muted-foreground">Practice Attempts</div>
                                    </div>
                                    <div>
                                      <div className="text-2xl font-bold">{student.improvementTrajectory as string}</div>
                                      <div className="text-xs text-muted-foreground">Improvement</div>
                                    </div>
                                  </div>
                                  
                                  <CollapsibleContent>
                                    <div className="pt-4 space-y-4">
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Topic Performance</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                          {Object.entries(student.topicPerformance || {}).map(([topic, score]) => (
                                            <div key={topic} className="space-y-1">
                                              <div className="flex justify-between">
                                                <span className="text-xs text-muted-foreground capitalize">{topic}</span>
                                                <span className="text-xs font-medium">{Number(score)}/100</span>
                                              </div>
                                              <Progress value={Number(score)} className="h-2" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Common Mistakes</h4>
                                          <div className="text-sm">
                                            {(student.commonMistakes || []).map((mistake: string, index: number) => (
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
                                              <span className="text-sm">Keyword Usage: {student.keywordUsage as string}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.sentiment === 'Confident' || student.sentiment === 'Very confident' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Sentiment: {student.sentiment as string}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.difficultyTolerance === 'High' || student.difficultyTolerance === 'Very High' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Difficulty Tolerance: {student.difficultyTolerance as string}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full ${student.confidenceLevel === 'High' || student.confidenceLevel === 'Moderate' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                              <span className="text-sm">Confidence: {student.confidenceLevel as string}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Feedback Engagement</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.feedbackEngagement as string)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.feedbackEngagement as string}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Benchmark Percentile</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.benchmarkPercentile as string)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.benchmarkPercentile as string}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">Drop-off Rate</h4>
                                          <div className="flex items-center gap-2">
                                            <Progress 
                                              value={parseInt(student.dropOffRate as string)} 
                                              className="h-2 flex-1" 
                                            />
                                            <span className="font-medium text-sm">{student.dropOffRate as string}</span>
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
                              <div className="text-4xl font-bold text-primary mb-2">{platformEngagement.resumeInterviewCorrelation as string}</div>
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
                              <div className="text-4xl font-bold text-primary mb-2">{platformEngagement.licenseActivationRate as string}</div>
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
                              <div className="text-4xl font-bold text-destructive mb-2">{platformEngagement.studentsAtRisk as number}</div>
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
                              {(platformEngagement.mostUsedFeatures || []).map((feature: string, index: number) => (
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
                              {(platformEngagement.departmentPerformance || []).map((dept: any, index: number) => (
                                <div key={index}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">{dept.name as string}</span>
                                    <span className="text-sm font-medium">{dept.avgScore as number}/100</span>
                                  </div>
                                  <Progress value={dept.avgScore as number} className="h-2" />
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
                  <Button 
                    className="gap-2"
                    tooltip="Export this report as PDF, CSV, or Excel"
                  >
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
                
                <div className="flex justify-between">
                  <ResetSettingsDialog
                    settingsType="institution"
                    onConfirm={resetSettings}
                  />
                  <Button 
                    tooltip="Save all changes to institution settings"
                  >
                    Save Settings
                  </Button>
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
