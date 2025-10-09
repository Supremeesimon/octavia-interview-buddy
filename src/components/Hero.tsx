
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInView } from '@/lib/animations';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, { threshold: 0.1 });
  
  // Elements for staggered animation
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isInView) {
      const elements = [
        title1Ref.current,
        title2Ref.current,
        subtitleRef.current,
        ctaRef.current
      ];
      
      elements.forEach((el, index) => {
        if (el) {
          setTimeout(() => {
            el.classList.remove('opacity-0');
            el.classList.add('opacity-100');
          }, 100 * index);
        }
      });
    }
  }, [isInView]);
  
  return (
    <section 
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative pt-20 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-background opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-100 blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-20 text-center">
        <h1 
          ref={title1Ref} 
          className="text-2xl md:text-3xl font-medium text-muted-foreground mb-3 opacity-0 transition-all duration-500 animate-slide-up"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm md:text-base font-medium mb-4">
            Meet Octavia
          </span>
        </h1>
        
        <h2 
          ref={title2Ref}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto opacity-0 transition-all duration-500 animate-slide-up"
        >
          Your AI Interview Coach for{' '}
          <span className="text-primary">Perfect Practice</span>
        </h2>
        
        <p 
          ref={subtitleRef}
          className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto opacity-0 transition-all duration-500 animate-slide-up"
        >
          Get real-time feedback and guidance as you practice for your next interview with our AI-powered interview simulator.
        </p>
        
        <div 
          ref={ctaRef}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 transition-all duration-500 animate-slide-up"
        >
          <Link to="/interview">
            <Button className="rounded-full px-8 py-6 text-lg shadow-lg transition-all hover:shadow-xl hover:scale-105">
              Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/#how-it-works">
            <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-2 hover:bg-secondary">
              How It Works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
