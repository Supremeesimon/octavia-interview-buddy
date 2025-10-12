import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDashboard from '@/components/StudentDashboard';
import SimpleResumesList from '@/components/SimpleResumesList';
import InterviewInterface from '@/components/InterviewInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

const StudentDashboardPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Set initial tab based on URL hash or query parameter
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (hash && ['dashboard', 'interviews', 'resumes'].includes(hash)) {
      setActiveTab(hash);
    } else if (tabParam && ['dashboard', 'interviews', 'resumes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  useEffect(() => {
    console.log('StudentDashboardPage rendered with user:', user, 'isLoading:', isLoading);
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
            <Tabs defaultValue="dashboard" className="w-full mb-6" onValueChange={handleTabChange} value={activeTab}>
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="dashboard" className={activeTab === "dashboard" ? "border-b-2 border-primary" : ""}>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="interviews" className={activeTab === "interviews" ? "border-b-2 border-primary" : ""}>
                  Interviews
                </TabsTrigger>
                <TabsTrigger value="resumes" className={activeTab === "resumes" ? "border-b-2 border-primary" : ""}>
                  Resumes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-6">
                <div className="overflow-hidden">
                  <StudentDashboard />
                </div>
              </TabsContent>
              
              <TabsContent value="interviews" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Interview Practice</h2>
                    <p className="text-muted-foreground">Start your AI-powered interview practice session</p>
                  </div>
                  <InterviewInterface />
                </div>
              </TabsContent>
              
              <TabsContent value="resumes" className="mt-6">
                <SimpleResumesList />
              </TabsContent>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;