
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkIcon, FileUp, Mic, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';

interface ResumeUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onContinue: (resumeData: { type: 'linkedin' | 'file' | 'voice', content: string | File, downloadURL?: string, fileName?: string }) => void;
  studentName?: string;
}

const ResumeUploadDialog = ({ open, onClose, onContinue, studentName }: ResumeUploadDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<'linkedin' | 'file' | 'voice' | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [voiceSelected, setVoiceSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useFirebaseAuth();
  const { uploadResume, isUploading, uploadProgress } = useFirebaseStorage();

  const handleContinue = async () => {
    if (!selectedOption || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (selectedOption === 'linkedin' && linkedinUrl) {
        onContinue({ type: 'linkedin', content: linkedinUrl });
      } else if (selectedOption === 'file' && resumeFile && user) {
        // Generate a unique resume ID
        const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Upload to Firebase Storage
        const uploadResult = await uploadResume(user.id, resumeFile, resumeId);
        
        if (uploadResult) {
          onContinue({ 
            type: 'file', 
            content: resumeFile,
            downloadURL: uploadResult.downloadURL,
            fileName: resumeFile.name
          });
        } else {
          toast.error('Failed to upload resume. Please try again.');
        }
      } else if (selectedOption === 'voice' && voiceSelected) {
        onContinue({ type: 'voice', content: 'voice-interaction' });
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
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
        
        {/* Upload Progress */}
        {(isUploading || uploadProgress) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading resume...</span>
              <span>{uploadProgress ? Math.round(uploadProgress.percentage) : 0}%</span>
            </div>
            <Progress value={uploadProgress?.percentage || 0} className="w-full" />
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            disabled={!isOptionComplete() || isProcessing || isUploading}
            className="px-8 rounded-full"
          >
            {isProcessing || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeUploadDialog;
