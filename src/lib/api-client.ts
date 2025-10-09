/**
 * API Client for Octavia Interview Buddy
 * Handles HTTP requests, authentication, and error handling
 */

import config from './config';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;
    
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || response.statusText || 'An error occurred',
        status: response.status,
        code: data?.code,
        details: data?.details,
      };
      throw error;
    }

    return {
      data: data?.data || data,
      status: response.status,
      message: data?.message || 'Success',
      success: true,
    };
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          status: 408,
          code: 'TIMEOUT',
        } as ApiError;
      }
      
      if (error.status) {
        throw error;
      }
      
      throw {
        message: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET', headers });
  }

  async post<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE', headers });
  }

  // File upload with progress
  async uploadFile<T>(
    url: string,
    file: File,
    fieldName: string = 'file',
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append(fieldName, file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          });
          const result = await this.handleResponse<T>(response);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        reject({
          message: 'Upload failed',
          status: 0,
          code: 'UPLOAD_ERROR',
        } as ApiError);
      });

      xhr.open('POST', `${this.baseUrl}${url}`);
      
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Set authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Mock API responses for development
export const mockApiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    console.log(`[MOCK API] GET ${url}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    return {
      data: {} as T,
      status: 200,
      message: 'Mock response',
      success: true,
    };
  },
  
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    console.log(`[MOCK API] POST ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {} as T,
      status: 201,
      message: 'Mock response',
      success: true,
    };
  },
  
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    console.log(`[MOCK API] PUT ${url}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {} as T,
      status: 200,
      message: 'Mock response',
      success: true,
    };
  },
  
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    console.log(`[MOCK API] DELETE ${url}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {} as T,
      status: 204,
      message: 'Mock response',
      success: true,
    };
  },
  
  uploadFile: async <T>(url: string, file: File): Promise<ApiResponse<T>> => {
    console.log(`[MOCK API] UPLOAD ${url}`, file.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {} as T,
      status: 200,
      message: 'Mock upload success',
      success: true,
    };
  },
  
  setAuthToken: (token: string) => {
    console.log('[MOCK API] Setting auth token:', token);
  },
  
  clearAuthToken: () => {
    console.log('[MOCK API] Clearing auth token');
  },
};

// Export the appropriate client based on configuration
export default config.api.mockApi ? mockApiClient : apiClient;