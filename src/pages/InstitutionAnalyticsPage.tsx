
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, BarChart3, Download, Calendar, Users, FileText, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import EndOfCallAnalysisDashboard from '@/components/EndOfCallAnalysisDashboard';
import { useAuth } from '@/hooks/use-auth';

// Mocked institution data - in a real app, this would come from an API
const mockInstitutionsData = [
  { 
    id: "1", 
    name: "University of Technology", 
    totalStudents: 1250, 
    activeStudents: 980, 
    interviewsCompleted: 3450, 
    avgScore: 82, 
    resumeUploads: 920,
    licensesUsed: "78%",
    engagement: "High"
  },
  { 
    id: "2", 
    name: "Business College", 
    totalStudents: 850, 
    activeStudents: 720, 
    interviewsCompleted: 2100, 
    avgScore: 79, 
    resumeUploads: 680,
    licensesUsed: "85%",
    engagement: "Medium"
  },
  { 
    id: "3", 
    name: "Engineering Institute", 
    totalStudents: 650, 
    activeStudents: 590, 
    interviewsCompleted: 1850, 
    avgScore: 85, 
    resumeUploads: 540,
    licensesUsed: "90%",
    engagement: "Very High"
  },
  { 
    id: "4", 
    name: "Liberal Arts College", 
    totalStudents: 780, 
    activeStudents: 520, 
    interviewsCompleted: 1200, 
    avgScore: 77, 
    resumeUploads: 480,
    licensesUsed: "67%",
    engagement: "Medium"
  },
];

const mockUserActivityData = [
  { name: 'Jan', value: 320 },
  { name: 'Feb', value: 350 },
  { name: 'Mar', value: 410 },
  { name: 'Apr', value: 480 },
  { name: 'May', value: 520 },
  { name: 'Jun', value: 590 },
];

const mockDepartmentData = [
  { name: "Computer Science", resumeScore: 84, interviewScore: 86, students: 120 },
  { name: "Electrical Engineering", resumeScore: 80, interviewScore: 78, students: 95 },
  { name: "Mechanical Engineering", resumeScore: 88, interviewScore: 85, students: 105 },
  { name: "Civil Engineering", resumeScore: 76, interviewScore: 79, students: 85 }
];

const InstitutionAnalyticsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Simulate fetching institution data based on ID
  useEffect(() => {
    // In a real app, this would be an API call
    const foundInstitution = mockInstitutionsData.find(inst => inst.id === id);
    
    if (foundInstitution) {
      setInstitution(foundInstitution);
    } else {
      toast({
        title: "Institution not found",
        description: "We couldn't find the institution you're looking for.",
        variant: "destructive"
      });
      // Redirect to admin page if institution not found
      navigate('/admin');
    }
    
    setLoading(false);
  }, [id, navigate, toast]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading institution data...</p>
      </div>
    );
  }
  
  if (!institution) {
    return null; // Will redirect from useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container mx-auto px-4">
          <TooltipProvider>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2"
                  onClick={() => navigate('/admin')}
                  tooltip="Return to admin dashboard"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{institution.name} Analytics</h1>
                  <p className="text-muted-foreground">Detailed performance metrics and insights</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="gap-2"
                tooltip="Download analytics as PDF or CSV"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    Active Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{institution.activeStudents}/{institution.totalStudents}</div>
                  <Progress 
                    value={(institution.activeStudents / institution.totalStudents) * 100} 
                    className="h-1.5 mb-1" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {((institution.activeStudents / institution.totalStudents) * 100).toFixed(0)}% activation rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{institution.interviewsCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg {(institution.interviewsCompleted / institution.activeStudents).toFixed(1)} per student
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Resumes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{institution.resumeUploads}</div>
                  <p className="text-xs text-muted-foreground">
                    {((institution.resumeUploads / institution.activeStudents) * 100).toFixed(0)}% of students
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    License Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{institution.licensesUsed}</div>
                  <p className="text-xs text-muted-foreground">
                    {institution.engagement} engagement level
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Student Performance</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="interviews">Interview Analysis</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Activity</CardTitle>
                      <CardDescription>Monthly active users and engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          users: { color: "hsl(var(--primary))" },
                        }}
                        className="aspect-[4/3]"
                      >
                        <LineChart data={mockUserActivityData}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#888888" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2} 
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                      <CardDescription>Interview and resume performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Interview Score</span>
                            <span className="text-sm font-medium">{institution.avgScore}/100</span>
                          </div>
                          <Progress value={institution.avgScore} className="h-2 mb-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Resume Quality</span>
                            <span className="text-sm font-medium">78/100</span>
                          </div>
                          <Progress value={78} className="h-2 mb-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Job Application Rate</span>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <Progress value={65} className="h-2 mb-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Interview Completion Rate</span>
                            <span className="text-sm font-medium">92%</span>
                          </div>
                          <Progress value={92} className="h-2 mb-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Performance</CardTitle>
                    <CardDescription>Detailed student metrics and performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Detailed student performance content would be displayed here.
                    </p>
                    <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="departments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Comparison</CardTitle>
                    <CardDescription>Performance metrics across different departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <ChartContainer
                        config={{
                          resumeScore: { color: "hsl(var(--primary))" },
                          interviewScore: { color: "hsl(var(--secondary))" },
                        }}
                        className="aspect-[21/9]"
                      >
                        <BarChart data={mockDepartmentData}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#888888" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <RechartsTooltip />
                          <Bar 
                            dataKey="resumeScore" 
                            fill="hsl(var(--primary))" 
                            name="Resume Score"
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="interviewScore" 
                            fill="hsl(var(--secondary))" 
                            name="Interview Score"
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="interviews" className="space-y-4">
                <EndOfCallAnalysisDashboard 
                  institutionId={id || ''} 
                  userRole={user?.role === 'platform_admin' ? 'platform_admin' : 'institution_admin'} 
                />
              </TabsContent>
              
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>Customized analytics and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Customized report content would be displayed here.
                    </p>
                    <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstitutionAnalyticsPage;
