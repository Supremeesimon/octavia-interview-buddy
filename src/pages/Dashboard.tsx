
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import SessionManagement from '@/components/SessionManagement';
import BillingControls from '@/components/BillingControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionPurchase {
  sessions: number;
  cost: number;
  date: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionPurchases, setSessionPurchases] = useState<SessionPurchase[]>([]);
  const isMobile = useIsMobile();
  
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
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="session"
                  tooltip="Manage your institution's interview session pool and allocation settings"
                >
                  Session Pool
                </TabsTrigger>
                <TabsTrigger 
                  value="billing"
                  tooltip="Manage billing, payments, and subscription details"
                >
                  Billing & Payments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="overflow-hidden">
                <InstitutionDashboard />
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
      <Footer />
      <Toaster />
    </div>
  );
};

export default Dashboard;
