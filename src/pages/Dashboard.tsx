
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import SessionManagement from '@/components/SessionManagement';
import BillingControls from '@/components/BillingControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SessionPurchase {
  sessions: number;
  cost: number;
  date: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionPurchases, setSessionPurchases] = useState<SessionPurchase[]>([]);
  
  const handleSessionPurchase = (sessions: number, cost: number) => {
    const newPurchase = {
      sessions,
      cost,
      date: new Date()
    };
    
    setSessionPurchases(prev => [...prev, newPurchase]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6">Institution Dashboard</h1>
            
            <Tabs 
              defaultValue="overview" 
              className="w-full mb-6"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="session">Session Pool</TabsTrigger>
                <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <InstitutionDashboard />
              </TabsContent>
              <TabsContent value="session">
                <SessionManagement onSessionPurchase={handleSessionPurchase} />
              </TabsContent>
              <TabsContent value="billing">
                <BillingControls sessionPurchases={sessionPurchases} />
              </TabsContent>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
