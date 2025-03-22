
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const PrivacyPolicyPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last Updated: June 1, 2023</p>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Octavia's Privacy Policy. This document explains how we collect, use, and protect your personal information when you use our AI-powered interview practice platform.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We collect the following types of information:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                <li><strong>Resume Data:</strong> Information you provide when uploading or manually entering your resume.</li>
                <li><strong>Interview Data:</strong> Audio recordings and transcripts from your practice interviews.</li>
                <li><strong>Usage Information:</strong> How you interact with our platform, including features used and time spent.</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers.</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and improve our interview practice services</li>
                <li>Generate personalized feedback and recommendations</li>
                <li>Analyze and improve the effectiveness of our AI models</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Your Educational Institution:</strong> If you're accessing Octavia through a partnership with your school, we may share usage data and performance metrics with authorized representatives.</li>
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform (e.g., cloud hosting, analytics).</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt out of certain data uses</li>
                <li>Download your data in a portable format</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website or through direct communication.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy, please contact us at privacy@octavia.ai.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
