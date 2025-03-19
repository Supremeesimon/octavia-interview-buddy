
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import InstitutionContactForm from '@/components/InstitutionContactForm';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        <Hero />
        <Features />
        <InstitutionContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
