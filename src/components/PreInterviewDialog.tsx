
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PreInterviewDialogProps {
  open: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

const PreInterviewDialog = ({ open, onClose, onStartInterview }: PreInterviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Start your conversation with Octavia and increase your chance of advancing!
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <p className="text-sm">
            Instead of waiting for a human review of your resume, move forward immediately with a brief conversation with Octavia, our AI Practice Interviewer.
          </p>
          
          <div className="space-y-3">
            <h3 className="font-medium">What to expect:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>A comfortable 15-20 minute conversation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Interview at a time that works best for you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Opportunity to expand on your resume</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✔</span>
                <span>Direct path to the hiring team if your experience aligns</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Quick tips for success:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Find a quiet space with clear audio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Have water nearby</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Share specific examples of your skills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Be yourself (AI-generated responses will be disqualified)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm">
              We've received hundreds of applications for this role.<br />
              <span className="font-medium mt-2 block">
                👉 Candidates who complete this step are <strong>3x more likely to advance</strong>.
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onStartInterview}
            className="px-8 rounded-full"
            tooltip="Begin your practice interview session"
          >
            Start Interview Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreInterviewDialog;
