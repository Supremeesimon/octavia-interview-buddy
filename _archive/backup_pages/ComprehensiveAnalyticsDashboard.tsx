import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, BarChart3, Download, Calendar, Users, Building, GraduationCap } from 'lucide-react';
import PlatformAnalyticsDashboard from '@/components/PlatformAnalyticsDashboard';
import EndOfCallAnalysisDashboard from '@/components/EndOfCallAnalysisDashboard';
import DepartmentAnalyticsDashboard from '@/components/DepartmentAnalyticsDashboard';
import StudentAnalyticsDashboard from '@/components/StudentAnalyticsDashboard';

const ComprehensiveAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Determine the appropriate dashboard component based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'platform_admin':
        return <PlatformAnalyticsDashboard />;
      case 'institution_admin':
        return (
          <EndOfCallAnalysisDashboard 
            institutionId={user?.institutionId || ''}
            userRole="institution_admin"
          />
        );
      case 'student':
        return <StudentAnalyticsDashboard studentId={user?.id || ''} />;
      default:
        return <div>Access denied</div>;
    }
  };

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
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                  <p className="text-muted-foreground">
                    {user?.role === 'platform_admin' && 'Platform-wide performance metrics and insights'}
                    {user?.role === 'institution_admin' && 'Institution performance metrics and insights'}
                    {user?.role === 'student' && 'Your interview performance and progress'}
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            
            {/* Role-specific tabs */}
            {user?.role !== 'student' && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="students">Student Performance</TabsTrigger>
                  {user?.role === 'platform_admin' && (
                    <TabsTrigger value="institutions">Institutions</TabsTrigger>
                  )}
                  {user?.role === 'institution_admin' && (
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                  )}
                  <TabsTrigger value="interviews">Interview Analysis</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {renderDashboard()}
                </TabsContent>
                
                <TabsContent value="students" className="space-y-4">
                  {user?.role === 'platform_admin' ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Student Performance</h3>
                      <p className="text-muted-foreground">Detailed student analytics across all institutions</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Student Analytics</h3>
                      <p className="text-muted-foreground">Performance metrics for students in your institution</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="institutions" className="space-y-4">
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Institution Analytics</h3>
                    <p className="text-muted-foreground">Performance comparison across all partner institutions</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="departments" className="space-y-4">
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Department Analytics</h3>
                    <p className="text-muted-foreground">Performance metrics for departments in your institution</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="interviews" className="space-y-4">
                  {renderDashboard()}
                </TabsContent>
                
                <TabsContent value="reports" className="space-y-4">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Custom Reports</h3>
                    <p className="text-muted-foreground">Generate and download detailed analytics reports</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {/* For students, show dashboard directly without tabs */}
            {user?.role === 'student' && renderDashboard()}
            
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComprehensiveAnalyticsDashboard;