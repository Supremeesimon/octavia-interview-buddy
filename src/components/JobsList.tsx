import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Briefcase, Clock, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const JobsList = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      type: 'Full-time',
      posted: '2 days ago',
      applied: true,
      status: 'Interview Scheduled'
    },
    {
      id: 2,
      title: 'UX Designer',
      company: 'Creative Studios',
      location: 'San Francisco, CA',
      type: 'Full-time',
      posted: '1 week ago',
      applied: true,
      status: 'Application Submitted'
    },
    {
      id: 3,
      title: 'Software Engineer',
      company: 'InnovateTech',
      location: 'Remote',
      type: 'Contract',
      posted: '3 days ago',
      applied: false
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'Growth Products',
      location: 'New York, NY',
      type: 'Full-time',
      posted: '5 days ago',
      applied: false
    }
  ];
  
  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const appliedJobs = filteredJobs.filter(job => job.applied);
  const availableJobs = filteredJobs.filter(job => !job.applied);

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'jobs':
        // Stay on this page
        break;
      case 'interviews':
        navigate('/interview');
        break;
      case 'resumes':
        navigate('/resumes');
        break;
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-6">
        <Tabs defaultValue="jobs" className="w-full mb-6" onValueChange={handleTabChange}>
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="interviews" className="flex-1">
              Interviews
            </TabsTrigger>
            <TabsTrigger value="resumes" className="flex-1">
              Resumes
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1">
              Jobs
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Jobs</h1>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="applied" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="applied" 
            tooltip="View your submitted job applications"
          >
            Applied Jobs
          </TabsTrigger>
          <TabsTrigger 
            value="available" 
            tooltip="Browse available job opportunities"
          >
            Available Jobs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applied">
          {appliedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {appliedJobs.map(job => (
                <Card key={job.id} className="overflow-hidden" tooltip={`View details for ${job.title} at ${job.company}`}>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-medium">{job.title}</h3>
                          <p className="text-muted-foreground">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{job.location}</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{job.type}</span>
                            <span className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {job.posted}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <span className="text-sm font-medium text-primary">{job.status}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            tooltip="View detailed information about this job"
                            onClick={() => navigate(`/jobs/details/${job.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No applied jobs yet</h3>
              <p className="text-muted-foreground mb-4">
                Explore available jobs and submit your applications
              </p>
              <Button 
                variant="default" 
                onClick={() => {
                  const availableTab = document.querySelector('[data-value="available"]');
                  if (availableTab) {
                    (availableTab as HTMLElement).click();
                  }
                }}
                tooltip="View available job opportunities"
              >
                Explore Jobs
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available">
          {availableJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {availableJobs.map(job => (
                <Card key={job.id} className="overflow-hidden" tooltip={`View details for ${job.title} at ${job.company}`}>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-medium">{job.title}</h3>
                          <p className="text-muted-foreground">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{job.location}</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">{job.type}</span>
                            <span className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {job.posted}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Button 
                            size="sm"
                            tooltip="Apply for this job position"
                            onClick={() => navigate(`/jobs/apply/${job.id}`)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No jobs available</h3>
              <p className="text-muted-foreground">
                Check back later for new job listings
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobsList;
