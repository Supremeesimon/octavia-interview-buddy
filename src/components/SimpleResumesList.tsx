import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Loader2, Download, AlertCircle, Trash2, Eye, Search, Filter } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SimpleResumesList = () => {
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const { uploadResume, listUserFiles, deleteFile, isUploading, uploadProgress, error, clearError } = useFirebaseStorage();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, name, size
  
  // Load user's resumes from Firebase
  useEffect(() => {
    let isMounted = true; // Add this to prevent state updates after unmount
    
    const loadResumes = async () => {
      // Wait for auth to be ready
      if (isAuthLoading) {
        console.log('Auth is still loading...');
        return;
      }
      
      if (!user) {
        console.log('No user found, setting loading to false');
        if (isMounted) setIsLoading(false);
        return;
      }
      
      console.log('Loading resumes for user:', user.id);
      
      try {
        if (isMounted) {
          setIsLoading(true);
          clearError(); // Clear any previous errors
        }
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 15000);
        });
        
        const listFilesPromise = listUserFiles(user.id, 'resumes');
        const userFiles = await Promise.race([listFilesPromise, timeoutPromise]) as any;
        
        console.log('Loaded user files:', userFiles);
        if (isMounted) {
          const processedResumes = userFiles.map((file: any) => {
            // Extract original filename by removing the resume ID prefix
            // Filename format is: resume_{timestamp}_{random}_{original_filename}
            let displayName = file.name;
            const nameParts = file.name.split('_');
            if (nameParts.length > 3) {
              // Reconstruct the original filename
              displayName = nameParts.slice(3).join('_');
            }
            
            return {
              id: file.name,
              name: displayName,
              originalName: file.name, // Keep the original for reference
              size: file.size,
              updated: file.updated,
              downloadURL: file.downloadURL,
              contentType: file.contentType
            };
          });
          
          setResumes(processedResumes);
          setFilteredResumes(processedResumes);
        }
      } catch (error) {
        console.error('Error loading resumes:', error);
        if (isMounted) {
          toast.error('Failed to load resumes: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadResumes();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, listUserFiles, isAuthLoading, clearError]);
  
  // Filter and sort resumes
  useEffect(() => {
    let result = [...resumes];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(resume => 
        resume.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply file type filter
    if (fileTypeFilter !== 'all') {
      result = result.filter(resume => {
        if (fileTypeFilter === 'pdf') {
          return resume.contentType.includes('pdf');
        } else if (fileTypeFilter === 'doc') {
          return resume.contentType.includes('word') || resume.contentType.includes('document');
        }
        return true;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        return b.size - a.size; // Descending by size
      } else {
        // Sort by date (default) - newest first
        return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      }
    });
    
    setFilteredResumes(result);
  }, [resumes, searchTerm, fileTypeFilter, sortBy]);
  
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
    if (!selectedFile || !user) {
      toast.error("Please select a file to upload");
      return;
    }
    
    try {
      // Generate a proper resume ID using timestamp and random string
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await uploadResume(user.id, selectedFile, resumeId);
      
      if (result) {
        // Refresh the resumes list
        const userFiles = await listUserFiles(user.id, 'resumes');
        const processedResumes = userFiles.map(file => ({
          id: file.name,
          name: file.name,
          size: file.size,
          updated: file.updated,
          downloadURL: file.downloadURL,
          contentType: file.contentType
        }));
        
        setResumes(processedResumes);
        setShowUploadDialog(false);
        setSelectedFile(null);
        toast.success('Resume uploaded successfully!');
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  const handleDownload = (downloadURL: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };
  
  const handleView = (downloadURL: string) => {
    try {
      // Open the file in a new tab
      window.open(downloadURL, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Failed to view file');
    }
  };
  
  const confirmDelete = (resume: any) => {
    setResumeToDelete(resume);
    setShowDeleteDialog(true);
  };
  
  const handleDelete = async () => {
    if (!resumeToDelete || !user) {
      toast.error("No resume selected for deletion");
      return;
    }
    
    try {
      // Construct the file path
      const filePath = `resumes/${user.id}/${resumeToDelete.originalName}`;
      const result = await deleteFile(filePath);
      
      if (result) {
        // Refresh the resumes list
        const userFiles = await listUserFiles(user.id, 'resumes');
        const processedResumes = userFiles.map(file => ({
          id: file.name,
          name: file.name,
          size: file.size,
          updated: file.updated,
          downloadURL: file.downloadURL,
          contentType: file.contentType
        }));
        
        setResumes(processedResumes);
        setShowDeleteDialog(false);
        setResumeToDelete(null);
        toast.success('Resume deleted successfully!');
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  // Show loading state while auth is checking
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your resumes...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <Button onClick={() => setShowUploadDialog(true)} disabled={!user || isUploading}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search resumes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">DOC/DOCX</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {user ? (
        filteredResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResumes.map((resume) => (
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
                    <div className="flex gap-2 mt-2">
                      <Button 
                        className="flex-1"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(resume.downloadURL)}
                        disabled={!resume.downloadURL}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        className="flex-1"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(resume.downloadURL, resume.name)}
                        disabled={!resume.downloadURL}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <Button 
                      className="w-full mt-2"
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(resume)}
                      disabled={!resume.downloadURL}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-500">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {resumes.length === 0 ? "No resumes uploaded" : "No matching resumes found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {resumes.length === 0 
                ? "Get started by uploading your resume" 
                : "Try adjusting your search or filter criteria"}
            </p>
            {resumes.length === 0 && (
              <Button 
                onClick={() => setShowUploadDialog(true)} 
                disabled={!user || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            )}
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
                disabled={isUploading}
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
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadDialog(false)}
                disabled={isUploading}
              >
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
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete the resume "<strong>{resumeToDelete?.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleResumesList;