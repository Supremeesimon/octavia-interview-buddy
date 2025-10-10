import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, FileText, Upload, Calendar, Clock, Download, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const ResumesList = () => {
  const isMobile = useIsMobile();
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const { uploadResume, listUserFiles, deleteFile, isUploading, uploadProgress, error, clearError } = useFirebaseStorage();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Load user's resumes from Firebase
  useEffect(() => {
    let isMounted = true;
    
    const loadResumes = async () => {
      if (isAuthLoading) {
        return;
      }
      
      if (!user) {
        if (isMounted) {
          setResumes([]);
        }
        return;
      }
      
      if (isMounted) {
        setIsLoadingResumes(true);
      }
      
      clearError();
      try {
        const userFiles = await listUserFiles(user.id, 'resumes');
        if (isMounted) {
          setResumes(userFiles.map(file => ({
            id: file.name.split('.')[0],
            name: file.name,
            lastUpdated: new Date(file.updated).toLocaleDateString(),
            format: file.contentType.includes('pdf') ? 'PDF' : file.contentType.includes('word') ? 'DOCX' : 'Unknown',
            size: formatFileSize(file.size),
            downloadURL: file.downloadURL,
            isDefault: false
          })));
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
        if (isMounted) {
          toast.error('Failed to load resumes. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingResumes(false);
        }
      }
    };
    
    loadResumes();
    
    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, listUserFiles, clearError]);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please log in to upload resumes');
      return;
    }
    
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await uploadResume(user.id, file, resumeId);
    
    if (result) {
      // Refresh the resumes list
      const userFiles = await listUserFiles(user.id, 'resumes');
      setResumes(userFiles.map(file => ({
        id: file.name.split('.')[0],
        name: file.name,
        lastUpdated: new Date(file.updated).toLocaleDateString(),
        format: file.contentType.includes('pdf') ? 'PDF' : file.contentType.includes('word') ? 'DOCX' : 'Unknown',
        size: formatFileSize(file.size),
        downloadURL: file.downloadURL,
        isDefault: false
      })));
      setShowUploadDialog(false);
    }
  };
  
  const handleDeleteResume = async (resumeId: string, fileName: string) => {
    if (!user) return;
    
    const filePath = `resumes/${user.id}/${fileName}`;
    const success = await deleteFile(filePath);
    
    if (success) {
      setResumes(resumes.filter(resume => resume.id !== resumeId));
    }
  };
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Resumes</h1>
        
        <Button className="gap-2" onClick={() => setShowUploadDialog(true)} disabled={isUploading || isAuthLoading || !user}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add New Resume
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      
      {uploadProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Uploading resume...</span>
            <span>{Math.round(uploadProgress.percentage)}%</span>
          </div>
          <Progress value={uploadProgress.percentage} className="w-full" />
        </div>
      )}
      
      {isAuthLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      ) : isLoadingResumes ? (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading your resumes...</p>
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map(resume => (
            <Card key={resume.id} className={resume.isDefault ? 'border-primary/30' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {resume.name}
                  </CardTitle>
                  {resume.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Last updated: {resume.lastUpdated}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="bg-muted px-2 py-1 rounded-full">{resume.format}</span>
                  <span className="bg-muted px-2 py-1 rounded-full">{resume.size}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => window.open(resume.downloadURL, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  {!isMobile && "Download"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Pencil className="h-4 w-4" />
                  {!isMobile && "Edit"}
                </Button>
                {!resume.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteResume(resume.id, resume.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {!isMobile && "Delete"}
                  </Button>
                )}
                {!resume.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                  >
                    Set as Default
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No resumes uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your resume to apply for jobs and prepare for interviews
          </p>
          <Button 
            className="gap-2" 
            onClick={() => setShowUploadDialog(true)}
            disabled={isAuthLoading || !user}
          >
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumesList;