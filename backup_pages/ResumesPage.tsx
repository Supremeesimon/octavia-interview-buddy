
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResumesList from '@/components/ResumesList';
import { useIsMobile } from '@/hooks/use-mobile';

const ResumesPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <ResumesList />
      </main>
      <Footer />
    </div>
  );
};

export default ResumesPage;
