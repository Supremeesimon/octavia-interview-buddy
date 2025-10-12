
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Building, Clock, MapPin, Calendar, Briefcase, Share2, BookmarkPlus, ExternalLink, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const mockJobDetails = {
  id: 1,
  title: 'Frontend Developer',
  company: 'Tech Solutions Inc.',
  logo: '🏢',
  location: 'Remote',
  type: 'Full-time',
  salary: '$80,000 - $110,000 per year',
  experience: '2-4 years',
  posted: '2 days ago',
  deadline: 'May 15, 2023',
  description: `
    <p>We are looking for a Frontend Developer to join our team. You will be responsible for implementing visual elements that users see and interact with in a web application.</p>
    
    <h4>Responsibilities:</h4>
    <ul>
      <li>Develop new user-facing features</li>
      <li>Build reusable code and libraries for future use</li>
      <li>Ensure the technical feasibility of UI/UX designs</li>
      <li>Optimize application for maximum speed and scalability</li>
      <li>Assure that all user input is validated before submitting to back-end</li>
    </ul>
    
    <h4>Requirements:</h4>
    <ul>
      <li>Proficient understanding of web markup, including HTML5, CSS3</li>
      <li>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model</li>
      <li>Thorough understanding of React.js and its core principles</li>
      <li>Experience with popular React.js workflows (such as Redux)</li>
      <li>Familiarity with newer specifications of EcmaScript</li>
      <li>Experience with data structure libraries (e.g., Immutable.js)</li>
      <li>Knowledge of isomorphic React is a plus</li>
      <li>Understanding of RESTful APIs</li>
      <li>Knowledge of modern authorization mechanisms, such as JSON Web Token</li>
      <li>Familiarity with modern front-end build pipelines and tools</li>
      <li>Experience with common front-end development tools such as Babel, Webpack, NPM, etc.</li>
      <li>A knack for benchmarking and optimization</li>
      <li>Familiarity with code versioning tools such as Git</li>
    </ul>
  `,
  benefits: [
    'Competitive salary',
    'Health insurance',
    'Dental insurance',
    'Vision insurance',
    '401(k) plan',
    'Flexible work hours',
    'Remote work options',
    'Professional development opportunities',
    'Paid time off'
  ]
};

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // In a real app, we would fetch the job details based on the ID
  const job = mockJobDetails;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container max-w-4xl mx-auto px-4">
          <TooltipProvider>
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/jobs')}
                tooltip="Return to jobs list"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="bg-muted h-14 w-14 rounded-lg flex items-center justify-center text-2xl mr-4">
                          {job.logo}
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">{job.title}</h1>
                          <div className="flex items-center text-muted-foreground">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{job.company}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Posted {job.posted}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Apply by {job.deadline}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Badge variant="outline" className="mr-2">{job.experience} Experience</Badge>
                        <Badge variant="outline">{job.salary}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="w-full" 
                        tooltip="Apply for this job position"
                        onClick={() => navigate(`/jobs/apply/${id}`)}
                      >
                        Apply Now
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          tooltip="Save job to favorites"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          tooltip="Share job with others"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          tooltip="View on company website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full max-w-md mb-6">
                <TabsTrigger 
                  value="description" 
                  tooltip="View job description and responsibilities"
                >
                  Job Description
                </TabsTrigger>
                <TabsTrigger 
                  value="company" 
                  tooltip="Learn about the company"
                >
                  Company
                </TabsTrigger>
                <TabsTrigger 
                  value="benefits" 
                  tooltip="View benefits and perks"
                >
                  Benefits
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description">
                <Card>
                  <CardContent className="p-6">
                    <div dangerouslySetInnerHTML={{ __html: job.description }} />
                    
                    <div className="mt-6 pt-6 border-t">
                      <Button 
                        className="w-full md:w-auto" 
                        tooltip="Apply for this job position"
                        onClick={() => navigate(`/jobs/apply/${id}`)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="company">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-muted h-12 w-12 rounded-lg flex items-center justify-center text-xl mr-4">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{job.company}</h3>
                        <span className="text-sm text-muted-foreground">Technology • 100-250 employees</span>
                      </div>
                    </div>
                    
                    <p className="mb-4">
                      Tech Solutions Inc. is a leading software development company specializing in creating innovative solutions for businesses of all sizes. We focus on building user-friendly applications that help our clients streamline their operations and improve their bottom line.
                    </p>
                    
                    <p className="mb-4">
                      Founded in 2015, we've grown from a small team of passionate developers to a diverse group of over 150 talented individuals across multiple disciplines.
                    </p>
                    
                    <h4 className="font-semibold text-lg mt-6 mb-2">Company Values</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Innovation at every level</li>
                      <li>Customer-focused solutions</li>
                      <li>Continuous learning and improvement</li>
                      <li>Transparent and collaborative work environment</li>
                      <li>Work-life balance</li>
                    </ul>
                    
                    <Button 
                      variant="outline" 
                      className="mt-6"
                      tooltip="Visit company website"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="benefits">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Benefits & Perks</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">Ready to apply?</h4>
                        <p className="text-muted-foreground">Join our team and help us build amazing products!</p>
                      </div>
                      <Button 
                        tooltip="Apply for this job position"
                        onClick={() => navigate(`/jobs/apply/${id}`)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetailsPage;
