import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, Download } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const SimpleResumesList = () => {
  const { user } = useFirebaseAuth();
  const { uploadResume, listUserFiles, isUploading, uploadProgress } = useFirebaseStorage();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Load user's resumes from Firebase
  useEffect(() => {
    const loadResumes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userFiles = await listUserFiles(user.id, 'resumes');
        setResumes(userFiles.map(file => ({
          id: file.name,
          name: file.name,
          size: file.size,
          updated: file.updated,
          downloadURL: file.downloadURL,
          contentType: file.contentType
        })));
      } catch (error) {
        console.error('Error loading resumes:', error);
        toast.error('Failed to load resumes');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResumes();
  }, [user, listUserFiles]);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileType = (contentType: string): string => {
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('word')) return 'DOC';
    if (contentType.includes('document')) return 'DOCX';
    return 'FILE';
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    try {
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await uploadResume(user.id, selectedFile, resumeId);
      
      // Refresh the resumes list
      const userFiles = await listUserFiles(user.id, 'resumes');
      setResumes(userFiles.map(file => ({
        id: file.name,
        name: file.name,
        size: file.size,
        updated: file.updated,
        downloadURL: file.downloadURL,
        contentType: file.contentType
      })));
      
      setShowUploadDialog(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    }
  };
  
  const handleDownload = (downloadURL: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <Button onClick={() => setShowUploadDialog(true)} disabled={!user}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>
      
      {user ? (
        resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="truncate">{resume.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {getFileType(resume.contentType)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatFileSize(resume.size)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(resume.updated).toLocaleDateString()}
                    </p>
                    <Button 
                      className="w-full mt-2" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(resume.downloadURL, resume.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No resumes uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Get started by uploading your resume
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Please log in to upload resumes</h3>
          <p className="text-muted-foreground">
            You need to be logged in to manage your resumes
          </p>
        </div>
      )}
      
      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
              
              {uploadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress.percentage)}%</span>
                  </div>
                  <Progress value={uploadProgress.percentage} />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleResumesList;