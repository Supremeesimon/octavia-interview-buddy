import React, { useState, createElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, Building2, Eye } from 'lucide-react';

const DashboardDemoTabs = () => {
  const [activeTab, setActiveTab] = useState('institutions');

  // Define the tabs configuration
  const tabs = [
    {
      id: 'institutions',
      label: 'Institutions',
      icon: Building2,
      title: 'Institution Dashboard',
      description: 'Comprehensive analytics and management tools for educational institutions to track student progress, engagement metrics, and outcome measurements.',
      screenshots: [
        {
          src: '/images/Screenshot 2026-03-02 at 1.56.34 AM.png',
          alt: 'Institution Dashboard Overview'
        },
        {
          src: '/images/Screenshot 2026-03-02 at 1.57.10 AM.png',
          alt: 'Institution Analytics Metrics'
        },
        {
          src: '/images/Screenshot 2026-03-02 at 1.57.30 AM.png',
          alt: 'Institution Student Management'
        }
      ]
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      title: 'Student Dashboard',
      description: 'Personalized learning experience with progress tracking, interview preparation tools, and performance analytics.',
      screenshots: [
        {
          src: '/images/Screenshot 2026-03-02 at 1.56.34 AM.png',
          alt: 'Student Dashboard Overview'
        },
        {
          src: '/images/Screenshot 2026-03-02 at 1.57.10 AM.png',
          alt: 'Student Progress Tracking'
        }
      ]
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: Users,
      title: 'Teacher Dashboard',
      description: 'Tools for educators to monitor student progress, assign practice sessions, and track performance across classes.',
      screenshots: [
        {
          src: '/images/Screenshot 2026-03-02 at 1.57.30 AM.png',
          alt: 'Teacher Dashboard Overview'
        },
        {
          src: '/images/Screenshot 2026-03-02 at 1.56.34 AM.png',
          alt: 'Teacher Student Management'
        }
      ]
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dashboard Demos</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our role-based dashboards designed for institutions, students, and teachers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/5">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  {createElement(activeTabData.icon, { className: "h-6 w-6 text-primary" })}
                  {activeTabData.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activeTabData.description}
                </p>
                <Button className="w-full md:w-auto">
                  <Eye className="h-4 w-4 mr-2" />
                  View Interactive Demo
                </Button>
              </div>
              
              <div className="md:w-3/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTabData.screenshots.map((screenshot, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <img 
                          src={screenshot.src} 
                          alt={screenshot.alt} 
                          className="w-full h-auto object-cover"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default DashboardDemoTabs;