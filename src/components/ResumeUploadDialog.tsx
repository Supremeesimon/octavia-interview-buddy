
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkIcon, FileUp, Mic } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ResumeUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onContinue: (resumeData: { type: 'linkedin' | 'file' | 'voice', content: string | File }) => void;
  studentName?: string;
}

const ResumeUploadDialog = ({ open, onClose, onContinue, studentName }: ResumeUploadDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<'linkedin' | 'file' | 'voice' | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [voiceSelected, setVoiceSelected] = useState(false);

  const handleContinue = () => {
    if (!selectedOption) return;
    
    if (selectedOption === 'linkedin' && linkedinUrl) {
      onContinue({ type: 'linkedin', content: linkedinUrl });
    } else if (selectedOption === 'file' && resumeFile) {
      onContinue({ type: 'file', content: resumeFile });
    } else if (selectedOption === 'voice' && voiceSelected) {
      onContinue({ type: 'voice', content: 'voice-interaction' });
    }
  };

  const isOptionComplete = () => {
    if (selectedOption === 'linkedin') return !!linkedinUrl;
    if (selectedOption === 'file') return !!resumeFile;
    if (selectedOption === 'voice') return voiceSelected;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Octavia AI Interviewer
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center mb-6">
            Welcome, {studentName || 'Student'} 👋<br />
            Tell us about yourself. Add your resume to begin.
          </p>
          
          <div className="space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === 'linkedin' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedOption('linkedin')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">LinkedIn Profile URL</span>
                  </div>
                  
                  {selectedOption === 'linkedin' && (
                    <div className="mt-3">
                      <Label htmlFor="linkedin-url">LinkedIn URL</Label>
                      <Input 
                        id="linkedin-url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use your LinkedIn profile data</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === 'file' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedOption('file')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">Upload Resume File</span>
                  </div>
                  
                  {selectedOption === 'file' && (
                    <div className="mt-3">
                      <Label htmlFor="resume-file">Choose file</Label>
                      <Input 
                        id="resume-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                        className="mt-2"
                      />
                      {resumeFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {resumeFile.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload resume from your device</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOption === 'voice' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => {
                    setSelectedOption('voice');
                    setVoiceSelected(true);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mic className="h-5 w-5 text-primary" />
                    <span className="font-medium">Speak with Octavia AI</span>
                  </div>
                  
                  {selectedOption === 'voice' && (
                    <div className="mt-3 text-center">
                      <div className="bg-primary/10 rounded-lg p-4 mt-2">
                        <Mic className="h-10 w-10 text-primary mx-auto mb-2" />
                        <p className="text-sm">
                          Just speak directly with Octavia AI. No typing needed - our AI will understand your experience and skills through conversation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Speak directly with Octavia AI - no typing required</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            disabled={!isOptionComplete()}
            className="px-8 rounded-full"
            tooltip="Continue to your interview"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
