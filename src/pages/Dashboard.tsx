
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstitutionDashboard from '@/components/InstitutionDashboard';
import { TooltipProvider } from '@/components/ui/tooltip';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <TooltipProvider>
          <InstitutionDashboard />
        </TooltipProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
