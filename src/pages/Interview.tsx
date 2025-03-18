
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewInterface from '@/components/InterviewInterface';

const Interview = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <InterviewInterface />
      </main>
      <Footer />
    </div>
  );
};

export default Interview;
