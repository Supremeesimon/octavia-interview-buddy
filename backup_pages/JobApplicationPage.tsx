
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Building, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockJob = {
  id: 1,
  title: 'Frontend Developer',
  company: 'Tech Solutions Inc.',
  logo: '🏢'
};

const JobApplicationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [resumeMethod, setResumeMethod] = useState('upload');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  
  // In a real app, we would fetch the job details based on the ID
  const job = mockJob;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate successful submission 90% of the time
    if (Math.random() > 0.1) {
      setFormSubmitted(true);
      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
        variant: "default",
      });
    } else {
      setFormError(true);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (formSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-28">
          <div className="container max-w-3xl mx-auto px-4">
            <TooltipProvider>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center py-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been successfully submitted.
                    </p>
                    <div className="space-y-2 w-full max-w-xs">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate('/jobs')}
                        tooltip="Return to jobs listing"
                      >
                        Browse More Jobs
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => navigate('/student')}
                        tooltip="Go to your dashboard"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container max-w-3xl mx-auto px-4">
          <TooltipProvider>
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate(`/jobs/details/${id}`)}
                tooltip="Return to job details"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Button>
            </div>
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Apply for {job.title}</h1>
              <div className="flex items-center text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
              </div>
            </div>
            
            {formError && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Submission Error</h3>
                      <p className="text-sm text-muted-foreground">
                        There was an error submitting your application. Please check your information and try again.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Enter your contact details for this application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Current Location</Label>
                      <Input id="location" placeholder="City, State, Country" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resume</CardTitle>
                    <CardDescription>
                      Provide your resume for this application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={resumeMethod} onValueChange={setResumeMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger 
                          value="upload" 
                          tooltip="Upload a resume file"
                        >
                          Upload Resume
                        </TabsTrigger>
                        <TabsTrigger 
                          value="select" 
                          tooltip="Select from your saved resumes"
                        >
                          Select Saved
                        </TabsTrigger>
                        <TabsTrigger 
                          value="generate" 
                          tooltip="Generate a resume from your profile"
                        >
                          Generate
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <h3 className="font-medium mb-1">Upload Resume</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop your resume file or click to browse
                          </p>
                          <Button 
                            variant="outline" 
                            tooltip="Select a resume file from your computer"
                          >
                            Select File
                          </Button>
                          <p className="text-xs text-muted-foreground mt-4">
                            Supported formats: PDF, DOCX, DOC (Max: 5MB)
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="select" className="space-y-4">
                        <div className="space-y-4">
                          <RadioGroup defaultValue="resume1">
                            <div className="border rounded-lg p-4 flex items-start space-x-3">
                              <RadioGroupItem value="resume1" id="resume1" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="resume1" className="text-base font-medium">
                                  Software Developer Resume
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Updated 2 months ago • 2 pages
                                </p>
                              </div>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex items-start space-x-3">
                              <RadioGroupItem value="resume2" id="resume2" className="mt-1" />
                              <div className="flex-1">
                                <Label htmlFor="resume2" className="text-base font-medium">
                                  Frontend Developer Resume
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Updated 1 week ago • 1 page
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                          
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              tooltip="Upload a new resume"
                            >
                              <Upload className="h-3.5 w-3.5 mr-2" />
                              Upload New
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="generate" className="space-y-4">
                        <div className="border rounded-lg p-6 text-center">
                          <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <h3 className="font-medium mb-1">Resume Ready!</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            We've generated a resume based on your profile information
                          </p>
                          <div className="flex justify-center gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              tooltip="Preview the generated resume"
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              tooltip="Edit the generated resume"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Provide more details to strengthen your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverletter">Cover Letter</Label>
                      <Textarea 
                        id="coverletter" 
                        placeholder="Write a brief cover letter or introduction" 
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio Website (optional)</Label>
                      <Input id="portfolio" placeholder="https://your-portfolio.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">When can you start?</Label>
                      <Input id="availability" placeholder="e.g. Immediately, Two weeks notice, etc." />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">Ready to submit your application?</h3>
                        <p className="text-sm text-muted-foreground">
                          Make sure all required fields are complete
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/jobs/details/${id}`)}
                          tooltip="Cancel application process"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          tooltip="Submit your job application"
                        >
                          Submit Application
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobApplicationPage;
