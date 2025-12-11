import React, { useState, Suspense, lazy, useEffect } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy load components
const InstitutionDashboard = lazy(() => import('@/components/InstitutionDashboard'));
const SessionManagement = lazy(() => import('@/components/SessionManagement'));
const BillingControls = lazy(() => import('@/components/BillingControls'));

interface SessionPurchase {
  sessions: number;
  cost: number;
  date: Date;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Dashboard = () => {
  const [sessionPurchases, setSessionPurchases] = useState<SessionPurchase[]>([]);
  const isMobile = useIsMobile();
  const { user, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  
  // Get initial tab from localStorage or default to 'overview'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedTab = localStorage.getItem('dashboardActiveTab');
        const validTabs = ['overview', 'session', 'billing'];
        const initialTab = savedTab && validTabs.includes(savedTab) ? savedTab : 'overview';
        return initialTab;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return 'overview';
      }
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState('overview');
  
  // Set the initial tab after component mounts
  useEffect(() => {
    const initialTab = getInitialTab();
    setActiveTab(initialTab);
  }, []);
  
  // Update localStorage when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dashboardActiveTab', value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };
  
  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    navigate('/login');
    return null;
  }
  
  // Show loading state while auth is checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect non-institution admins
  if (user && user.role !== 'institution_admin') {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'student':
        navigate('/student');
        break;
      case 'platform_admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
    return null;
  }
  
  const handleSessionPurchase = (sessions: number, cost: number) => {
    const newPurchase = {
      sessions,
      cost,
      date: new Date()
    };
    
    setSessionPurchases(prev => [...prev, newPurchase]);
  };
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden w-full">
      <Header />
      <main className="flex-grow py-20 md:py-28 w-full">
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Institution Dashboard</h1>
            
            <Tabs 
              className="w-full mb-6"
              onValueChange={handleTabChange}
              value={activeTab}
            >
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger 
                  value="overview"
                  tooltip="Overview of your institution's performance metrics and key statistics"
                  className={activeTab === "overview" ? "border-b-2 border-primary" : ""}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="session"
                  tooltip="Manage your institution's interview session pool and allocation settings"
                  className={activeTab === "session" ? "border-b-2 border-primary" : ""}
                >
                  Session Pool
                </TabsTrigger>
                <TabsTrigger 
                  value="billing"
                  tooltip="Manage billing, payments, and subscription details"
                  className={activeTab === "billing" ? "border-b-2 border-primary" : ""}
                >
                  Billing & Payments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="overflow-hidden">
                <Suspense fallback={<LoadingSpinner />}>
                  <InstitutionDashboard user={user} />
                </Suspense>
              </TabsContent>
              <TabsContent value="session" className="overflow-hidden">
                <Suspense fallback={<LoadingSpinner />}>
                  <SessionManagement 
                    onSessionPurchase={handleSessionPurchase} 
                    institutionId={user?.institutionId}
                  />
                </Suspense>
              </TabsContent>
              <TabsContent value="billing" className="overflow-hidden">
                <Suspense fallback={<LoadingSpinner />}>
                  <BillingControls sessionPurchases={sessionPurchases} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
      <Toaster />
    </div>
  );
};

export default Dashboard;