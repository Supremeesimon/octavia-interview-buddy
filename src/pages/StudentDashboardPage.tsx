
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDashboard from '@/components/StudentDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

const StudentDashboardPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case 'dashboard':
        // Stay on this page
        break;
      case 'interviews':
        navigate('/interview');
        break;
      case 'resumes':
        navigate('/resumes');
        break;
    }
  };
  
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
            </Tabs>
            
            <div className="overflow-hidden">
              <StudentDashboard />
            </div>
          </div>
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;
