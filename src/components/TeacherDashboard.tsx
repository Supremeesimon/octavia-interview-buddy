import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Building,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import InterviewSessionApproval from './InterviewSessionApproval';

const TeacherDashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalStudents: 124,
    activeStudents: 87,
    interviewsThisWeek: 23,
    pendingRequests: 5,
    avgStudentScore: 78
  };
  
  // In a real implementation, this would come from auth context
  const currentUserId = "teacher_123";
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your department's interview sessions and student progress
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeStudents}</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.interviewsThisWeek}</div>
                <div className="text-sm text-muted-foreground">Interviews This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-teal-100">
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgStudentScore}%</div>
                <div className="text-sm text-muted-foreground">Avg. Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session Requests
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Interview Session Requests
              </CardTitle>
              <CardDescription>
                Review and approve interview session requests from students in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InterviewSessionApproval 
                departmentId="engineering" 
                institutionId="inst_123" 
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Management
              </CardTitle>
              <CardDescription>
                View and manage students in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center h-64">
                <Users className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">Student management features will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Department Analytics
              </CardTitle>
              <CardDescription>
                Track interview performance and student progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center h-64">
                <BarChart3 className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">Analytics dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Interview Scheduling
              </CardTitle>
              <CardDescription>
                Schedule interviews for students in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center h-64">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">Scheduling features will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;