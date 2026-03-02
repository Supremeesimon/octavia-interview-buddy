import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { extractSkillsAndLocationFromResume } from '@/utils/resume-parser';
import { jobRecommendationService } from '@/services/job-recommendation.service';

const JobsForResume = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useFirebaseAuth();
  const { listUserFiles, getFileContent } = useFirebaseStorage();
  const [resumeFiles, setResumeFiles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [location, setLocation] = useState<string>('Remote'); // Default location
  const [loading, setLoading] = useState<boolean>(true);

  // Load user's resume files
  useEffect(() => {
    const loadResumeFiles = async () => {
      if (user) {
        try {
          const files = await listUserFiles(user.id, 'resumes');
          setResumeFiles(files);
          
          // Check if a specific resume was requested via URL parameter
          const requestedResume = searchParams.get('resume');
          
          if (requestedResume) {
            // Find the requested resume in the list
            const decodedResumeName = decodeURIComponent(requestedResume);
            const matchedResume = files.find(file => file.name === decodedResumeName);
            
            if (matchedResume) {
              setSelectedResume(matchedResume);
            } else {
              // If not found, use the first available resume
              if (files.length > 0) {
                setSelectedResume(files[0]);
              }
            }
          } else {
            // If no specific resume requested, use the first available
            if (files.length > 0) {
              setSelectedResume(files[0]);
            }
          }
        } catch (error) {
          console.error('Error loading resume files:', error);
        }
      }
    };

    loadResumeFiles();
  }, [user, listUserFiles, searchParams]);

  // Get jobs related to resume and location
  useEffect(() => {
    if (selectedResume) {
      const fetchJobsForResume = async () => {
        setLoading(true);
        
        try {
          // Extract skills and location from the resume
          const { skills, location: resumeLocation } = await extractSkillsAndLocationFromResume(selectedResume);
          
          // Update location state with the one extracted from resume
          setLocation(resumeLocation);
          
          // Get job recommendations based on extracted skills and location
          const recommendedJobs = await jobRecommendationService.getJobRecommendations(skills, resumeLocation);
          
          setJobs(recommendedJobs);
        } catch (error) {
          console.error('Error fetching jobs for resume:', error);
          
          // Fallback to mock jobs if there's an error
          const mockJobs = [
            {
              id: 1,
              title: 'Specialized Role',
              company: 'Industry Leader Inc.',
              location: location,
              salary: '$90,000 - $140,000',
              type: 'Full-time',
              description: 'Position tailored to your skills and experience as identified in your resume...',
              posted: 'Just now',
              skills: ['Adaptability', 'Problem Solving', 'Communication']
            }
          ];
          
          setJobs(mockJobs);
        } finally {
          setLoading(false);
        }
      };
      
      fetchJobsForResume();
    }
  }, [selectedResume]);

  const handleResumeChange = async (resume: any) => {
    setSelectedResume(resume);
    setLoading(true);
    
    try {
      // Extract location from the new resume
      const { location: resumeLocation } = await extractSkillsAndLocationFromResume(resume);
      setLocation(resumeLocation);
    } catch (error) {
      console.error('Error extracting location from resume:', error);
      // Keep the current location if extraction fails
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Jobs Matching Your Resume</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Select Resume:</h3>
            <div className="flex flex-wrap gap-2">
              {resumeFiles.map((resume, index) => (
                <Button
                  key={index}
                  variant={selectedResume?.name === resume.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleResumeChange(resume)}
                >
                  {resume.name.replace(/resume_\d+_\w+_/, '')} {/* Remove ID prefix */}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Filter
            </h3>
            <div className="flex gap-2">
              {['Remote', 'San Francisco', 'New York', 'Austin', 'Seattle'].map((loc) => (
                <Button
                  key={loc}
                  variant={location === loc ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setLocation(loc);
                    setLoading(true);
                  }}
                >
                  {loc}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Selected location: <span className="font-medium">{location}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-lg text-muted-foreground">{job.company}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.posted}
                            </div>
                          </div>
                          
                          <p className="mt-3">{job.description}</p>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-1">Required Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill: string, idx: number) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button className="ml-4">Apply Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No jobs found matching your criteria</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your location filter or updating your resume
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsForResume;