import { useState, useCallback } from 'react';
import { firebaseStorageService, UploadProgress, FileMetadata } from '@/services/firebase-storage.service';
import { toast } from 'sonner';

interface UseFirebaseStorageReturn {
  uploadResume: (userId: string, file: File, resumeId: string) => Promise<{ downloadURL: string; metadata: FileMetadata } | null>;
  uploadRecording: (userId: string, sessionId: string, recordingBlob: Blob, fileName: string) => Promise<{ downloadURL: string; metadata: FileMetadata } | null>;
  uploadProfilePicture: (userId: string, file: File) => Promise<{ downloadURL: string; metadata: FileMetadata } | null>;
  uploadInstitutionLogo: (institutionId: string, file: File) => Promise<{ downloadURL: string; metadata: FileMetadata } | null>;
  deleteFile: (filePath: string) => Promise<boolean>;
  listUserFiles: (userId: string, folder: 'resumes' | 'recordings' | 'profilePictures') => Promise<FileMetadata[]>;
  getDownloadURL: (filePath: string) => Promise<string | null>;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  error: string | null;
  clearError: () => void;
}

export function useFirebaseStorage(): UseFirebaseStorageReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(progress);
  }, []);

  const uploadResume = useCallback(async (
    userId: string,
    file: File,
    resumeId: string
  ): Promise<{ downloadURL: string; metadata: FileMetadata } | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const result = await firebaseStorageService.uploadResume(
        userId,
        file,
        resumeId,
        handleProgress
      );
      
      toast.success(`Resume "${file.name}" uploaded successfully!`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload resume';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [handleProgress]);

  const uploadRecording = useCallback(async (
    userId: string,
    sessionId: string,
    recordingBlob: Blob,
    fileName: string
  ): Promise<{ downloadURL: string; metadata: FileMetadata } | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const result = await firebaseStorageService.uploadRecording(
        userId,
        sessionId,
        recordingBlob,
        fileName,
        handleProgress
      );
      
      toast.success('Interview recording saved successfully!');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload recording';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [handleProgress]);

  const uploadProfilePicture = useCallback(async (
    userId: string,
    file: File
  ): Promise<{ downloadURL: string; metadata: FileMetadata } | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const result = await firebaseStorageService.uploadProfilePicture(
        userId,
        file,
        handleProgress
      );
      
      toast.success('Profile picture updated successfully!');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [handleProgress]);

  const uploadInstitutionLogo = useCallback(async (
    institutionId: string,
    file: File
  ): Promise<{ downloadURL: string; metadata: FileMetadata } | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const result = await firebaseStorageService.uploadInstitutionLogo(
        institutionId,
        file,
        handleProgress
      );
      
      toast.success('Institution logo updated successfully!');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload institution logo';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [handleProgress]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    setError(null);

    try {
      await firebaseStorageService.deleteFile(filePath);
      toast.success('File deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const listUserFiles = useCallback(async (
    userId: string,
    folder: 'resumes' | 'recordings' | 'profilePictures'
  ): Promise<FileMetadata[]> => {
    setError(null);

    try {
      return await firebaseStorageService.listUserFiles(userId, folder);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, []);

  const getDownloadURL = useCallback(async (filePath: string): Promise<string | null> => {
    setError(null);

    try {
      return await firebaseStorageService.getDownloadURL(filePath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file URL';
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    uploadResume,
    uploadRecording,
    uploadProfilePicture,
    uploadInstitutionLogo,
    deleteFile,
    listUserFiles,
    getDownloadURL,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
}