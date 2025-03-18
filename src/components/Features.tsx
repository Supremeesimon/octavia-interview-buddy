
import React, { useRef } from 'react';
import { useInView } from '@/lib/animations';
import { Mic, Headphones, Brain, MessageSquare, BarChart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        'bg-white rounded-2xl p-6 shadow-sm border border-border transition-all duration-500 transform opacity-0 translate-y-8',
        isInView && 'opacity-100 translate-y-0'
      )}
      style={{ transitionDelay: `${delay * 100}ms` }}
    >
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { threshold: 0.1 });

  const features = [
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice-Powered Interviews",
      description: "Practice speaking your answers naturally with our advanced voice recognition technology."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Feedback",
      description: "Receive detailed analysis and personalized recommendations to improve your responses."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Industry-Specific Questions",
      description: "Practice with questions tailored to your industry, role, and experience level."
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track your progress over time and identify areas for improvement."
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Realistic Audio Interviews",
      description: "Experience immersive audio-based interview sessions to prepare for phone and virtual interviews."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Interview Mastery",
      description: "Build confidence and master the art of interviewing with consistent practice."
    }
  ];
  
  return (
    <section id="features" className="py-24 relative" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-500 transform',
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Perfect Practice</h2>
          <p className="text-xl text-muted-foreground">
            Octavia combines advanced technology with expert coaching to deliver the most effective interview practice experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
