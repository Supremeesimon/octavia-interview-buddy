
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewInterface from '@/components/InterviewInterface';
import ResumeUploadDialog from '@/components/ResumeUploadDialog';
import PreInterviewDialog from '@/components/PreInterviewDialog';

const Interview = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
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
