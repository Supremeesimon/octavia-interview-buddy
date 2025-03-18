
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstitutionDashboard from '@/components/InstitutionDashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <InstitutionDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
