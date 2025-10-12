
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const TermsOfServicePage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last Updated: June 1, 2023</p>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Octavia's interview practice platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Octavia provides an AI-powered interview practice platform that allows users to engage in simulated interview sessions, receive feedback, and improve their interview skills. Our services include resume analysis, practice interviews, performance feedback, and other related features.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When creating an account on Octavia:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must provide accurate and complete information.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>You may not share your account with others or create multiple accounts.</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
              <p className="text-muted-foreground mb-4">
                By uploading resumes, participating in practice interviews, or otherwise providing content to Octavia:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your content to provide and improve our services.</li>
                <li>You represent that you have all necessary rights to the content you provide.</li>
                <li>You understand that we may use anonymized and aggregated data derived from your content to train and improve our AI models.</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">
                You may not use Octavia to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations.</li>
                <li>Infringe on the intellectual property rights of others.</li>
                <li>Harass, abuse, or harm others.</li>
                <li>Engage in any activity that could damage, disable, or impair our services.</li>
                <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
                <li>Submit false or misleading information in practice interviews to manipulate feedback results.</li>
              </ul>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Octavia and its affiliates, officers, employees, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or goodwill, arising out of or in connection with these Terms or your use of our services.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                Octavia is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or that any defects will be corrected.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may modify these Terms at any time. If we make material changes, we will notify you through our website or by email. Your continued use of Octavia after such changes constitutes your acceptance of the modified Terms.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
              </p>
            </section>
            
            <section className="my-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at legal@octavia.ai.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
