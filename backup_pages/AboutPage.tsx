
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const AboutPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">About Octavia</h1>
          
          <div className="space-y-8">
            <section className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                Octavia is an AI-powered interview practice platform designed to help students prepare for job interviews with confidence. Our mission is to bridge the gap between education and employment by providing accessible, effective interview training.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                Octavia was founded in 2023 by a team of educators, technologists, and career development experts who recognized the challenges students face when preparing for job interviews. By leveraging cutting-edge AI technology, we created a platform that simulates realistic interview experiences, providing immediate feedback and personalized coaching.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
              <p className="text-muted-foreground mb-6">
                Powered by advanced voice AI technology and sophisticated natural language processing, Octavia creates dynamic, conversational interview experiences that adapt to each student's responses. Our platform analyzes multiple dimensions of interview performance, from content relevance to delivery style, providing comprehensive feedback that helps students improve.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                We envision a future where every student has equal access to high-quality interview preparation, regardless of their background or resources. By partnering with educational institutions and career centers, we aim to make interview training a standard component of career readiness programs, helping more students launch successful careers.
              </p>
            </section>
            
            <Card className="mt-12">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-center">Ready to experience Octavia?</h3>
                <div className="flex justify-center mt-6">
                  <a href="/interview" className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">
                    Try an Interview
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
