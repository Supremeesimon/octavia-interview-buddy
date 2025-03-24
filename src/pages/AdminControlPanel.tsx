
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
import FinancialManagement from '@/components/FinancialManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

const AdminControlPanel = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden w-full">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'} w-full`}>
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6">Platform Admin Control Panel</h1>
            
            <Tabs 
              defaultValue="dashboard" 
              className="w-full mb-6"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className={`${isMobile ? 'grid-cols-2 gap-2 mb-4' : 'w-full grid-cols-7'} grid overflow-x-auto`}>
                <TabsTrigger 
                  value="dashboard" 
                  tooltip="Platform overview, metrics, and performance statistics"
                  className={activeTab === "dashboard" ? "border-b-2 border-primary" : ""}
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="institutions" 
                  tooltip="Manage institution accounts, settings, and subscription status"
                  className={activeTab === "institutions" ? "border-b-2 border-primary" : ""}
                >
                  Institutions
                </TabsTrigger>
                <TabsTrigger 
                  value="students" 
                  tooltip="Manage student accounts, access, and activity metrics"
                  className={activeTab === "students" ? "border-b-2 border-primary" : ""}
                >
                  Students
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  tooltip="Upload and manage platform resources, templates, and content"
                  className={activeTab === "resources" ? "border-b-2 border-primary" : ""}
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="broadcasting" 
                  tooltip="Send announcements and notifications to platform users"
                  className={activeTab === "broadcasting" ? "border-b-2 border-primary" : ""}
                >
                  Broadcast
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  tooltip="Advanced data analysis and performance insights"
                  className={activeTab === "analytics" ? "border-b-2 border-primary" : ""}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  tooltip="Platform pricing management, margins, and revenue tracking"
                  className={activeTab === "financial" ? "border-b-2 border-primary" : ""}
                >
                  Financial
                </TabsTrigger>
              </TabsList>
              
              <div className="overflow-hidden">
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
                <TabsContent value="financial">
                  <FinancialManagement />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </TooltipProvider>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default AdminControlPanel;
