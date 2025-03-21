
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/AdminDashboard';
import InstitutionManagement from '@/components/InstitutionManagement';
import StudentManagement from '@/components/StudentManagement';
import ResourceManagement from '@/components/ResourceManagement';
import BroadcastSystem from '@/components/BroadcastSystem';
import AIAnalytics from '@/components/AIAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';

const AdminControlPanel = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6">Platform Admin Control Panel</h1>
            
            <Tabs 
              defaultValue="dashboard" 
              className="w-full mb-6"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'w-full grid-cols-6'}`}>
                <TabsTrigger value="dashboard" data-tooltip="Platform overview, metrics, and performance">Dashboard</TabsTrigger>
                <TabsTrigger value="institutions" data-tooltip="Manage institution accounts and settings">Institutions</TabsTrigger>
                <TabsTrigger value="students" data-tooltip="Manage student accounts and activities">Students</TabsTrigger>
                <TabsTrigger value="resources" data-tooltip="Upload and manage platform resources">Resources</TabsTrigger>
                <TabsTrigger value="broadcasting" data-tooltip="Send announcements to users">Broadcast</TabsTrigger>
                <TabsTrigger value="analytics" data-tooltip="Advanced metrics and data analysis">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <AdminDashboard />
              </TabsContent>
              <TabsContent value="institutions">
                <InstitutionManagement />
              </TabsContent>
              <TabsContent value="students">
                <StudentManagement />
              </TabsContent>
              <TabsContent value="resources">
                <ResourceManagement />
              </TabsContent>
              <TabsContent value="broadcasting">
                <BroadcastSystem />
              </TabsContent>
              <TabsContent value="analytics">
                <AIAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default AdminControlPanel;
