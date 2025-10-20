import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  UserPlus, 
  ChevronDown, 
  Filter,
  Link as LinkIcon,
  Copy,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
  Calendar,
  Download,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionDashboardService } from '@/services/institution-dashboard.service';
import { Institution } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

const InstitutionManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitutionDetails, setSelectedInstitutionDetails] = useState<any>(null);
  const [institutionStudents, setInstitutionStudents] = useState<any[]>([]);
  const [institutionTeachers, setInstitutionTeachers] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loadingSessionInfo, setLoadingSessionInfo] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>({
    avgInterviewScore: 0,
    resumeUploadRate: 0,
    platformEngagement: 0,
    departmentPerformance: []
  });
  const [loadingAnalyticsData, setLoadingAnalyticsData] = useState(false);
  
  // Fetch real institution data
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
  
  const handleApproveInstitution = async (institutionId: string) => {
    try {
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "You must be logged in as a platform admin to approve institutions",
          variant: "destructive",
        });
        return;
      }
      
      await InstitutionService.approveInstitution(institutionId, currentUser.id);
      toast({
        title: "Success",
        description: "Institution approved successfully",
      });
      
      // Refresh the institutions list
      const data = await InstitutionService.getAllInstitutions();
      setInstitutions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve institution",
        variant: "destructive",
      });
      console.error("Error approving institution:", error);
    }
  };

  // Load detailed information for a selected institution
  const loadInstitutionDetails = async (institution: any) => {
    setSelectedInstitutionDetails(institution);
    setLoadingDetails(true);
    setLoadingSessionInfo(true);
    setLoadingAnalyticsData(true);
    
    try {
      // Fetch students and teachers for this institution
      const [studentsData, teachersData] = await Promise.all([
        InstitutionDashboardService.getInstitutionStudents(institution.id),
        InstitutionDashboardService.getInstitutionTeachers(institution.id)
      ]);
      
      setInstitutionStudents(studentsData);
      setInstitutionTeachers(teachersData);
      
      // Fetch session info for this institution
      try {
        const sessionInfo = await InstitutionDashboardService.getSessionInfo(institution.id);
        setSessionInfo(sessionInfo);
      } catch (error) {
        console.error('Error fetching session info:', error);
        // Set default session info if fetch fails
        setSessionInfo({
          totalSessions: institution.sessionPool?.totalSessions || 0,
          usedSessions: institution.sessionPool?.usedSessions || 0,
          availableSessions: institution.sessionPool?.availableSessions || 0,
          usagePercentage: 0
        });
      }
      
      // Fetch analytics data for this institution
      try {
        const [
          studentAnalytics,
          platformEngagement,
          resumeAnalytics
        ] = await Promise.all([
          InstitutionDashboardService.getStudentAnalytics(institution.id),
          InstitutionDashboardService.getPlatformEngagement(institution.id),
          InstitutionDashboardService.getResumeAnalytics(institution.id)
        ]);
        
        // Calculate resume upload rate from resume analytics
        let resumeUploadRate = 0;
        if (resumeAnalytics && resumeAnalytics.length > 0 && studentsData.length > 0) {
          const studentsWithResume = resumeAnalytics.filter(student => 
            student.resumesGenerated && student.resumesGenerated > 0
          ).length;
          resumeUploadRate = Math.round((studentsWithResume / studentsData.length) * 100);
        }
        
        // Process the analytics data properly without mock values
        const processedDepartmentPerformance = platformEngagement.departmentPerformance?.map((dept: any) => ({
          name: dept.name || 'Unknown Department',
          studentCount: dept.studentCount || 0,
          avgScore: dept.avgScore || 0,
          completionRate: dept.completionRate || 0
        })) || [];
        
        // Helper function to safely parse percentage values
        const parsePercentage = (value: string): number => {
          if (!value) return 0;
          const num = parseInt(value.replace('%', ''));
          return isNaN(num) ? 0 : num;
        };
        
        setAnalyticsData({
          avgInterviewScore: platformEngagement.resumeInterviewCorrelation ? 
            parsePercentage(platformEngagement.resumeInterviewCorrelation) : 0,
          resumeUploadRate: resumeUploadRate,
          platformEngagement: platformEngagement.sessionActivationRate ? 
            parsePercentage(platformEngagement.sessionActivationRate) : 0,
          departmentPerformance: processedDepartmentPerformance
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Set default analytics data if fetch fails
        setAnalyticsData({
          avgInterviewScore: 0,
          resumeUploadRate: 0,
          platformEngagement: 0,
          departmentPerformance: []
        });
      }
    } catch (error) {
      console.error('Error fetching institution details:', error);
      toast({
        title: "Error",
        description: "Failed to load institution details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
      setLoadingSessionInfo(false);
      setLoadingAnalyticsData(false);
    }
  };

  // Convert institutions to the format expected by the component
  const formattedInstitutions = institutions.map(inst => ({
    id: inst.id,
    name: inst.name,
    adminName: inst.platform_admin_id || 'Not assigned', // Placeholder
    adminEmail: inst.platform_admin_id ? `${inst.platform_admin_id}@example.com` : 'Not assigned', // Placeholder
    studentsCount: inst.stats?.totalStudents || 0,
    plan: inst.settings?.allowedBookingsPerMonth ? 
      inst.settings.allowedBookingsPerMonth > 1000 ? 'Enterprise' : 
      inst.settings.allowedBookingsPerMonth > 500 ? 'Scale' : 
      inst.settings.allowedBookingsPerMonth > 100 ? 'Ship' : 'Build' : 'Build',
    status: inst.isActive ? 'Active' : 'Inactive',
    // Add session pool information
    totalSessions: inst.sessionPool?.totalSessions || 0,
    usedSessions: inst.sessionPool?.usedSessions || 0,
    availableSessions: inst.sessionPool?.availableSessions || 0
  }));

  const filteredInstitutions = institutions.map(inst => ({
    ...inst,
    // Convert to the format expected by the component
    adminName: inst.platform_admin_id || 'Not assigned',
    adminEmail: inst.platform_admin_id ? `${inst.platform_admin_id}@example.com` : 'Not assigned',
    studentsCount: inst.stats?.totalStudents || 0,
    plan: inst.settings?.allowedBookingsPerMonth ? 
      inst.settings.allowedBookingsPerMonth > 1000 ? 'Enterprise' : 
      inst.settings.allowedBookingsPerMonth > 500 ? 'Scale' : 
      inst.settings.allowedBookingsPerMonth > 100 ? 'Ship' : 'Build' : 'Build',
    status: inst.isActive ? 'Active' : 'Inactive',
    approvalStatus: inst.approvalStatus || 'pending',
    // Add session pool information
    totalSessions: inst.sessionPool?.totalSessions || 0,
    usedSessions: inst.sessionPool?.usedSessions || 0,
    availableSessions: inst.sessionPool?.availableSessions || 0
  })).filter(institution => institution.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Filter students based on search query
  const filteredStudents = institutionStudents.filter(student => 
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // Filter teachers based on search query
  const filteredTeachers = institutionTeachers.filter(teacher => 
    teacher.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())
  );

  const handleAddInstitution = () => {
    setShowAddDialog(false);
    // Handle add institution logic
  };
  
  const handleAssignAdmin = () => {
    setShowAssignDialog(false);
    // Handle assign admin logic
  };
  
  const handleGenerateLink = (institution: any) => {
    setSelectedInstitution(institution);
    // Generate a custom signup link for the institution with a secure token
    const token = institution.customSignupToken || institution.id;
    const link = `${window.location.origin}/signup-institution/${token}`;
    setGeneratedLink(link);
    setShowLinkDialog(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleEditInstitution = (institution: any) => {
    setSelectedInstitution(institution);
    setShowAddDialog(true);
  };
  
  // Export data function
  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export has started and will be sent to your email.",
    });
  };
  
  return (
    <div className="space-y-6">
      {!selectedInstitutionDetails ? (
        // Institution List View
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">Institution Management</h2>
            </div>
            
            <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'flex-row gap-4'}`}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search institutions..."
                  className={`pl-8 ${isMobile ? 'w-full' : 'w-[250px]'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => setShowAddDialog(true)}
                tooltip="Add a new institution"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Institution
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Session Pool</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading institutions...
                        </TableCell>
                      </TableRow>
                    ) : filteredInstitutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No institutions found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInstitutions.map((institution) => (
                        <TableRow key={institution.id}>
                          <TableCell className="font-medium">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium"
                              onClick={() => loadInstitutionDetails(institution)}
                            >
                              {institution.name}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{institution.adminName}</div>
                              <div className="text-xs text-muted-foreground">{institution.adminEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{institution.studentsCount}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${institution.plan === 'Enterprise' ? 'bg-blue-100 text-blue-800' : 
                                institution.plan === 'Scale' ? 'bg-purple-100 text-purple-800' : 
                                institution.plan === 'Ship' ? 'bg-green-100 text-green-800' : 
                                'bg-gray-100 text-gray-800'}`
                            }>
                              {institution.plan}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${institution.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                            }>
                              {institution.status}
                            </div>
                            {institution.approvalStatus === 'pending' && (
                              <div className="mt-1">
                                <Badge variant="destructive" className="text-xs">
                                  Pending Approval
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Used: {institution.usedSessions}/{institution.totalSessions}</div>
                              <div className="text-xs text-muted-foreground">
                                Available: {institution.availableSessions}
                              </div>
                              {institution.totalSessions > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${(institution.usedSessions / institution.totalSessions) * 100}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {institution.approvalStatus === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  tooltip={`Approve ${institution.name}`}
                                  onClick={() => handleApproveInstitution(institution.id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                tooltip={`Generate signup link for ${institution.name}`}
                                onClick={() => handleGenerateLink(institution)}
                              >
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                tooltip={`Assign admin to ${institution.name}`}
                                onClick={() => {
                                  setSelectedInstitution(institution);
                                  setShowAssignDialog(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                tooltip={`Edit ${institution.name}`}
                                onClick={() => handleEditInstitution(institution)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                tooltip={`Delete ${institution.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Institution Detail View
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedInstitutionDetails(null);
                  setSessionInfo(null);
                  setAnalyticsData(null);
                }}
                className="mb-4"
              >
                ← Back to Institutions
              </Button>
              <h2 className="text-2xl font-bold">{selectedInstitutionDetails.name}</h2>
              <p className="text-muted-foreground">Detailed view of institution data</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{institutionStudents.length}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{institutionTeachers.length}</div>
                    <div className="text-sm text-muted-foreground">Total Teachers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${sessionInfo ? (sessionInfo.usedSessions * 10) : (selectedInstitutionDetails.sessionPool?.usedSessions * 10 || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {sessionInfo ? sessionInfo.availableSessions : (selectedInstitutionDetails.sessionPool?.availableSessions || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Available Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for detailed views */}
          <Tabs defaultValue="students">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="finances">Financials</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search students..."
                        className="pl-8 w-full md:w-[250px]"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={exportData} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Signup Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingDetails ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading students...
                            </TableCell>
                          </TableRow>
                        ) : filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No students found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.department || 'Unassigned'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={student.status === 'Active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {student.status || 'Active'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  View Profile
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="teachers">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search teachers..."
                        className="pl-8 w-full md:w-[250px]"
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={exportData} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Signup Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingDetails ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading teachers...
                            </TableCell>
                          </TableRow>
                        ) : filteredTeachers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No teachers found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTeachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.email}</TableCell>
                              <TableCell>{teacher.department || 'Unassigned'}</TableCell>
                              <TableCell>{teacher.studentsCount || 'N/A'}</TableCell>
                              <TableCell>
                                {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  View Profile
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="finances">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>
                    Track spending and session usage for {selectedInstitutionDetails.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Sessions Purchased</div>
                          <div className="text-2xl font-bold">
                            {sessionInfo ? sessionInfo.totalSessions : (selectedInstitutionDetails.sessionPool?.totalSessions || 0)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Sessions Used</div>
                          <div className="text-2xl font-bold">
                            {sessionInfo ? sessionInfo.usedSessions : (selectedInstitutionDetails.sessionPool?.usedSessions || 0)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Spent</div>
                          <div className="text-2xl font-bold">
                            ${sessionInfo ? (sessionInfo.usedSessions * 10) : (selectedInstitutionDetails.sessionPool?.usedSessions * 10 || 0)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Session Usage</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Used: {sessionInfo ? sessionInfo.usedSessions : (selectedInstitutionDetails.sessionPool?.usedSessions || 0)}</span>
                            <span>Available: {sessionInfo ? sessionInfo.availableSessions : (selectedInstitutionDetails.sessionPool?.availableSessions || 0)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ 
                                width: sessionInfo?.totalSessions ? 
                                  `${(sessionInfo.usedSessions / sessionInfo.totalSessions) * 100}%` : 
                                  selectedInstitutionDetails.sessionPool?.totalSessions ? 
                                  `${(selectedInstitutionDetails.sessionPool.usedSessions / selectedInstitutionDetails.sessionPool.totalSessions) * 100}%` : 
                                  '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Recent Transactions</h3>
                      <div className="text-center py-4 text-muted-foreground">
                        Transaction history not available
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Insights into student performance and platform engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {loadingAnalyticsData ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading analytics data...
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-muted-foreground">Avg. Interview Score</div>
                              <div className="text-2xl font-bold">
                                {analyticsData?.avgInterviewScore ? `${analyticsData.avgInterviewScore}%` : '0%'}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-muted-foreground">Resume Upload Rate</div>
                              <div className="text-2xl font-bold">
                                {analyticsData?.resumeUploadRate ? `${analyticsData.resumeUploadRate}%` : '0%'}
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-muted-foreground">Platform Engagement</div>
                              <div className="text-2xl font-bold">
                                {analyticsData?.platformEngagement ? `${analyticsData.platformEngagement}%` : '0%'}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-4">Department Performance</h3>
                          {analyticsData?.departmentPerformance?.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Department</TableHead>
                                  <TableHead>Students</TableHead>
                                  <TableHead>Avg. Score</TableHead>
                                  <TableHead>Completion Rate</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {analyticsData.departmentPerformance.map((dept: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>{dept.name || 'Unknown Department'}</TableCell>
                                    <TableCell>{dept.studentCount || '0'}</TableCell>
                                    <TableCell>{dept.avgScore ? `${dept.avgScore}%` : '0%'}</TableCell>
                                    <TableCell>{dept.completionRate ? `${dept.completionRate}%` : '0%'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No department performance data available
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Add/Edit Institution Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedInstitution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 'Update the details for this institution.' : 'Fill in the details to add a new institution to the platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
              <Input
                id="name"
                defaultValue={selectedInstitution?.name || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminName" className="text-right text-sm font-medium">Admin Name</label>
              <Input
                id="adminName"
                defaultValue={selectedInstitution?.adminName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminEmail" className="text-right text-sm font-medium">Admin Email</label>
              <Input
                id="adminEmail"
                defaultValue={selectedInstitution?.adminEmail || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="plan" className="text-right text-sm font-medium">Plan</label>
              <select 
                id="plan" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={selectedInstitution?.plan || 'Build'}
              >
                <option value="Build">Build</option>
                <option value="Ship">Ship</option>
                <option value="Scale">Scale</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">Status</label>
              <select 
                id="status" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={selectedInstitution?.status || 'Active'}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Discard changes"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              tooltip={selectedInstitution ? "Save institution changes" : "Add new institution"}
              onClick={handleAddInstitution}
            >
              {selectedInstitution ? 'Save Changes' : 'Add Institution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Admin Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Institution Administrator</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 
                `Assign or change the administrator for ${selectedInstitution.name}.` : 
                'Assign an administrator to this institution.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminName" className="text-right text-sm font-medium">Name</label>
              <Input
                id="adminName"
                defaultValue={selectedInstitution?.adminName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="adminEmail" className="text-right text-sm font-medium">Email</label>
              <Input
                id="adminEmail"
                defaultValue={selectedInstitution?.adminEmail || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="permission" className="text-right text-sm font-medium">Permissions</label>
              <select 
                id="permission" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="Full"
              >
                <option value="Full">Full Admin Access</option>
                <option value="ReadOnly">Read Only</option>
                <option value="Limited">Limited Access</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Discard changes"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              tooltip="Assign administrator to institution"
              onClick={handleAssignAdmin}
            >
              Assign Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Custom Signup Link</DialogTitle>
            <DialogDescription>
              {selectedInstitution ? 
                `Share this link with ${selectedInstitution.name} for easy signup.` : 
                'Share this link for easy signup.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="flex-1"
              />
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                tooltip="Copy link to clipboard"
              >
                {copied ? <span className="text-green-500">Copied!</span> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This link will automatically assign users to {selectedInstitution?.name} when they sign up.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              tooltip="Close dialog"
              onClick={() => setShowLinkDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionManagement;