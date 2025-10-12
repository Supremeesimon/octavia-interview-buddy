import React, { useState } from 'react';
import Header from '@/components/Header';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import SessionManagement from '@/components/SessionManagement';
import BillingControls from '@/components/BillingControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useNavigate } from 'react-router-dom';

interface SessionPurchase {
  sessions: number;
  cost: number;
  date: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionPurchases, setSessionPurchases] = useState<SessionPurchase[]>([]);
  const isMobile = useIsMobile();
  const { user, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  
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
              defaultValue="overview" 
              className="w-full mb-6"
              onValueChange={setActiveTab}
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
                <InstitutionDashboard user={user} />
              </TabsContent>
              <TabsContent value="session" className="overflow-hidden">
                <SessionManagement onSessionPurchase={handleSessionPurchase} />
              </TabsContent>
              <TabsContent value="billing" className="overflow-hidden">
                <BillingControls sessionPurchases={sessionPurchases} />
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