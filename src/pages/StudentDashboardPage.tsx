
import React from 'react';
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
  
  const handleTabChange = (value: string) => {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <TooltipProvider>
          <div className="container mx-auto px-4 max-w-7xl">
            <Tabs defaultValue="dashboard" className="w-full mb-6" onValueChange={handleTabChange}>
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="dashboard">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="interviews">
                  Interviews
                </TabsTrigger>
                <TabsTrigger value="resumes">
                  Resumes
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <StudentDashboard />
          </div>
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;
