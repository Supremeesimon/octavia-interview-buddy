
import React, { useRef } from 'react';
import { useInView } from '@/lib/animations';
import { ArrowRight, Upload, Mic, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: number;
  delay: number;
}

const Step = ({ icon, title, description, number, delay }: StepProps) => {
  const stepRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(stepRef, { threshold: 0.1 });
  
  return (
    <div 
      ref={stepRef}
      className={cn(
        'flex flex-col md:flex-row items-center gap-6 transition-all duration-500 transform opacity-0 translate-y-8',
        isInView && 'opacity-100 translate-y-0'
      )}
      style={{ transitionDelay: `${delay * 100}ms` }}
    >
      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center relative">
        {icon}
        <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
          {number}
        </span>
      </div>
      <div className="flex-grow md:text-left text-center">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { threshold: 0.1 });

  const steps = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload your resume",
      description: "Start by uploading your resume or LinkedIn profile to customize your interview experience."
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Practice with AI interviews",
      description: "Engage in realistic audio interviews with questions tailored to your experience and industry."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Receive detailed feedback",
      description: "Get personalized feedback on your answers and actionable tips to improve your interview skills."
    }
  ];
  
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-background to-blue-50" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-500 transform',
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to boost your interview confidence and stand out from the crowd.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <Step
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              number={index + 1}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

