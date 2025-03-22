
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewInterface from '@/components/InterviewInterface';
import ResumeUploadDialog from '@/components/ResumeUploadDialog';
import PreInterviewDialog from '@/components/PreInterviewDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Mic, Clock, Info, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Interview = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showResumeDialog, setShowResumeDialog] = useState(true);
  const [showPreInterviewDialog, setShowPreInterviewDialog] = useState(false);
  const [showInterviewInterface, setShowInterviewInterface] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  const handleResumeUpload = (data: any) => {
    setResumeData(data);
    setShowResumeDialog(false);
    setShowPreInterviewDialog(true);
  };

  const handleStartInterview = () => {
    setShowPreInterviewDialog(false);
    setShowInterviewInterface(true);
  };

  const handleBackToResumes = () => {
    navigate('/resumes');
  };

  const handleOpenResumeDialog = () => {
    setShowResumeDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        {!showInterviewInterface && !showPreInterviewDialog && !showResumeDialog && (
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={handleBackToResumes}
                tooltip="Return to resumes page"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resumes
              </Button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/10 mb-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Octavia AI Interviewer</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Your personal AI-powered interview practice assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-center text-muted-foreground">
                    Ready to start your interview practice session? Octavia helps you prepare
                    for real interviews by simulating realistic interview scenarios based on your resume.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Resume Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Octavia analyzes your resume to create personalized interview questions
                          relevant to your experience and the job you're applying for.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Mic className="h-5 w-5 text-primary" />
                          Voice Interaction
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Speak naturally with Octavia, who understands your responses and provides
                          realistic follow-up questions like a human interviewer would.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          15-Minute Sessions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Each interview session lasts for 15 minutes, after which Octavia will
                          automatically end the session and provide feedback on your performance.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-primary/5 p-6 rounded-lg mt-8">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-2">Pro Tips for Your AI Interview</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Find a quiet environment with minimal background noise</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Speak clearly and at a moderate pace for best transcription results</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Treat this as a real interview — practice your professional demeanor</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>Have your resume and job description handy for reference</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button 
                      onClick={handleOpenResumeDialog}
                      size="lg"
                      className="px-8 gap-2"
                      tooltip="Start your interview setup"
                    >
                      Start Interview Setup
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {showInterviewInterface && <InterviewInterface resumeData={resumeData} />}
        
        <ResumeUploadDialog 
          open={showResumeDialog}
          onClose={() => setShowResumeDialog(false)}
          onContinue={handleResumeUpload}
        />
        
        <PreInterviewDialog 
          open={showPreInterviewDialog}
          onClose={() => setShowPreInterviewDialog(false)}
          onStartInterview={handleStartInterview}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Interview;
