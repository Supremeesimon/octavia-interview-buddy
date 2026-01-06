import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from '@/components/Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useAccountSwitcher } from '@/hooks/use-account-switcher';
import { Loader2 } from 'lucide-react';

// Lazy load components
const TeacherDashboard = lazy(() => import('@/components/TeacherDashboard'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const TeacherDashboardPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useFirebaseAuth();
  const { isSwitching } = useAccountSwitcher(); // Add account switcher state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Set initial tab based on URL hash or query parameter
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (hash && ['dashboard', 'interviews', 'students', 'resources'].includes(hash)) {
      setActiveTab(hash);
    } else if (tabParam && ['dashboard', 'interviews', 'students', 'resources'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  useEffect(() => {
    console.log('TeacherDashboardPage rendered with user:', user, 'isLoading:', isLoading);
  }, [user, isLoading]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL to reflect current tab
    navigate(`${location.pathname}?tab=${value}`, { replace: true });
  };
  
  // Show loading state while auth is checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user is switching to a non-teacher account
  if (user && user.role !== 'teacher' && isSwitching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Switching account...</span>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to login');
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden w-full">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'} w-full`}>
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Manage your students and track their progress</p>
            </div>
            
            <Tabs defaultValue="dashboard" className="w-full mb-6" onValueChange={handleTabChange} value={activeTab}>
              <TabsList className={`${isMobile ? 'grid-cols-2 gap-2 mb-4' : 'w-full grid-cols-5'} grid overflow-x-auto`}>
                <TabsTrigger 
                  value="dashboard" 
                  tooltip="Overview of your class performance and metrics"
                  className={activeTab === "dashboard" ? "border-b-2 border-primary" : ""}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="students" 
                  tooltip="Manage your students and their accounts"
                  className={activeTab === "students" ? "border-b-2 border-primary" : ""}
                >
                  Students
                </TabsTrigger>
                <TabsTrigger 
                  value="interviews" 
                  tooltip="View and schedule interview sessions"
                  className={activeTab === "interviews" ? "border-b-2 border-primary" : ""}
                >
                  Interviews
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  tooltip="Detailed performance analytics and insights"
                  className={activeTab === "analytics" ? "border-b-2 border-primary" : ""}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  tooltip="Access teaching resources and materials"
                  className={activeTab === "resources" ? "border-b-2 border-primary" : ""}
                >
                  Resources
                </TabsTrigger>
              </TabsList>
              
              <div className="overflow-hidden">
                <TabsContent value="dashboard">
                  <Suspense fallback={<LoadingSpinner />}>
                    <TeacherDashboard />
                  </Suspense>
                </TabsContent>
                <TabsContent value="students">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Student Management</h2>
                      <p className="text-muted-foreground">Manage your students and their accounts</p>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherDashboard />
                    </Suspense>
                  </div>
                </TabsContent>
                <TabsContent value="interviews">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Interview Management</h2>
                      <p className="text-muted-foreground">View and schedule interview sessions</p>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherDashboard />
                    </Suspense>
                  </div>
                </TabsContent>
                <TabsContent value="analytics">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Performance Analytics</h2>
                      <p className="text-muted-foreground">Detailed performance analytics and insights</p>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherDashboard />
                    </Suspense>
                  </div>
                </TabsContent>
                <TabsContent value="resources">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Teaching Resources</h2>
                      <p className="text-muted-foreground">Access materials and guides to help your students</p>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TeacherDashboard />
                    </Suspense>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
    </div>
  );
};

export default TeacherDashboardPage;