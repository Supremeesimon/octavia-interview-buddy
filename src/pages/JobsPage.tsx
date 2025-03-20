
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobsList from '@/components/JobsList';
import { useIsMobile } from '@/hooks/use-mobile';

const JobsPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <JobsList />
      </main>
      <Footer />
    </div>
  );
};

export default JobsPage;
