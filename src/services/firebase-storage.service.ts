import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
  listAll
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL: string;
}

export class FirebaseStorageService {
  private readonly STORAGE_PATHS = {
    resumes: 'resumes',
    recordings: 'interview-recordings',
    profilePictures: 'profile-pictures',
    institutionLogos: 'institution-logos',
    systemAssets: 'system-assets',
    analyticsExports: 'analytics-exports'
  } as const;

  private readonly FILE_SIZE_LIMITS = {
    resume: 10 * 1024 * 1024, // 10MB
    recording: 100 * 1024 * 1024, // 100MB
    profilePicture: 5 * 1024 * 1024, // 5MB
    institutionLogo: 2 * 1024 * 1024, // 2MB
    analyticsExport: 50 * 1024 * 1024 // 50MB
  } as const;

  private readonly ALLOWED_TYPES = {
    resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    recording: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'],
    profilePicture: ['image/jpeg', 'image/png', 'image/webp'],
    institutionLogo: ['image/jpeg', 'image/png', 'image/svg+xml'],
    analyticsExport: ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  } as const;

  // Upload resume file
  async uploadResume(
    userId: string,
    file: File,
    resumeId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ downloadURL: string; metadata: FileMetadata }> {
    this.validateFile(file, 'resume');
    
    const filePath = `${this.STORAGE_PATHS.resumes}/${userId}/${resumeId}`;
    const storageRef = ref(storage, filePath);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => reject(this.handleStorageError(error)),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await this.getFileMetadata(filePath);
              resolve({ downloadURL, metadata });
            } catch (error) {
              reject(this.handleStorageError(error));
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const metadata = await this.getFileMetadata(filePath);
      return { downloadURL, metadata };
    }
  }

  // Upload interview recording
  async uploadRecording(
    userId: string,
    sessionId: string,
    recordingBlob: Blob,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ downloadURL: string; metadata: FileMetadata }> {
    const file = new File([recordingBlob], fileName, { type: recordingBlob.type });
    this.validateFile(file, 'recording');
    
    const filePath = `${this.STORAGE_PATHS.recordings}/${userId}/${sessionId}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => reject(this.handleStorageError(error)),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await this.getFileMetadata(filePath);
              resolve({ downloadURL, metadata });
            } catch (error) {
              reject(this.handleStorageError(error));
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const metadata = await this.getFileMetadata(filePath);
      return { downloadURL, metadata };
    }
  }

  // Upload profile picture
  async uploadProfilePicture(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ downloadURL: string; metadata: FileMetadata }> {
    this.validateFile(file, 'profilePicture');
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile.${fileExtension}`;
    const filePath = `${this.STORAGE_PATHS.profilePictures}/${userId}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => reject(this.handleStorageError(error)),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await this.getFileMetadata(filePath);
              resolve({ downloadURL, metadata });
            } catch (error) {
              reject(this.handleStorageError(error));
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const metadata = await this.getFileMetadata(filePath);
      return { downloadURL, metadata };
    }
  }

  // Upload institution logo
  async uploadInstitutionLogo(
    institutionId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ downloadURL: string; metadata: FileMetadata }> {
    this.validateFile(file, 'institutionLogo');
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `logo.${fileExtension}`;
    const filePath = `${this.STORAGE_PATHS.institutionLogos}/${institutionId}/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => reject(this.handleStorageError(error)),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await this.getFileMetadata(filePath);
              resolve({ downloadURL, metadata });
            } catch (error) {
              reject(this.handleStorageError(error));
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const metadata = await this.getFileMetadata(filePath);
      return { downloadURL, metadata };
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  // Get file metadata
  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    try {
      const storageRef = ref(storage, filePath);
      const metadata = await getMetadata(storageRef);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType || 'unknown',
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        downloadURL
      };
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  // List user files
  async listUserFiles(userId: string, folder: keyof typeof this.STORAGE_PATHS): Promise<FileMetadata[]> {
    try {
      const folderRef = ref(storage, `${this.STORAGE_PATHS[folder]}/${userId}`);
      const result = await listAll(folderRef);
      
      const files: FileMetadata[] = [];
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          files.push({
            name: metadata.name,
            size: metadata.size,
            contentType: metadata.contentType || 'unknown',
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            downloadURL
          });
        } catch (itemError) {
          // Continue with other items even if one fails
        }
      }
      
      return files.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    } catch (error) {
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Get download URL for existing file
  async getDownloadURL(filePath: string): Promise<string> {
    try {
      const storageRef = ref(storage, filePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw this.handleStorageError(error);
    }
  }

  // Validate file before upload
  private validateFile(file: File, type: keyof typeof this.FILE_SIZE_LIMITS): void {
    // Check file size
    const maxSize = this.FILE_SIZE_LIMITS[type];
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${this.formatFileSize(maxSize)} limit`);
    }

    // Check file type
    const allowedTypes = this.ALLOWED_TYPES[type] as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File cannot be empty');
    }
  }

  // Format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Handle storage errors
  private handleStorageError(error: any): Error {
    console.error('Firebase Storage Error:', error);
    
    switch (error.code) {
      case 'storage/unauthorized':
        return new Error('You do not have permission to upload this file');
      case 'storage/canceled':
        return new Error('Upload was canceled');
      case 'storage/quota-exceeded':
        return new Error('Storage quota exceeded');
      case 'storage/unauthenticated':
        return new Error('User is not authenticated');
      case 'storage/retry-limit-exceeded':
        return new Error('Upload failed after multiple retries');
      case 'storage/invalid-checksum':
        return new Error('File was corrupted during upload');
      case 'storage/server-file-wrong-size':
        return new Error('File size mismatch');
      case 'storage/unknown':
        return new Error('An unknown error occurred during upload');
      default:
        return new Error(error.message || 'File upload failed');
    }
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService();