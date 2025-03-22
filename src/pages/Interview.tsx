
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewInterface from '@/components/InterviewInterface';
import ResumeUploadDialog from '@/components/ResumeUploadDialog';
import PreInterviewDialog from '@/components/PreInterviewDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'py-28'}`}>
        {!showInterviewInterface && !showPreInterviewDialog && !showResumeDialog && (
          <div className="container mx-auto px-4 mb-6">
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
