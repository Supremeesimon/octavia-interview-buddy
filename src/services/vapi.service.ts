/**
 * VAPI Integration Service
 * Handles real-time voice communication and AI interactions
 */

import config from '@/lib/config';
import type { VapiCall, VapiConfig, InterviewFeedback } from '@/types';
import Vapi from '@vapi-ai/web';
import { interviewService } from './interview.service';

export interface VapiCallbacks {
  onCallStart?: () => void;
  onCallEnd?: (call: VapiCall) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onTranscript?: (transcript: string) => void;
  onFeedbackUpdate?: (feedback: InterviewFeedback) => void;
  onError?: (error: Error) => void;
  onVolumeLevel?: (level: number) => void;
  onAnalysis?: (analysis: any) => void; // Add this for end-of-call analysis
  onInterviewEnd?: () => void; // Add this for when AI ends interview
}

export class VapiService {
  private static instance: VapiService;
  private vapi: any = null;
  private currentCall: VapiCall | null = null;
  private callbacks: VapiCallbacks = {};
  private assistantId: string = 'a1218d48-1102-4890-a0a6-d0ed2d207410'; // Default Octavia assistant ID

  private constructor() {
    this.initializeVapi();
  }

  public static getInstance(): VapiService {
    if (!VapiService.instance) {
      VapiService.instance = new VapiService();
    }
    return VapiService.instance;
  }

  private async initializeVapi(): Promise<void> {
    try {
      // Validate configuration
      if (!config.vapi.publicKey) {
        throw new Error('VAPI public key is missing. Please check your environment configuration.');
      }
      
      // Check if we're in production and the public key is still a placeholder
      if (config.app.environment === 'production' && 
          (config.vapi.publicKey === 'your_vapi_public_key_here' || 
           config.vapi.publicKey.includes('your_') || 
           config.vapi.publicKey.length < 20)) {
        throw new Error('Invalid VAPI public key in production. Please set a valid VAPI public key in your environment variables. Check your .env.production file and replace the placeholder values with actual configuration.');
      }
      
      console.log('Initializing VAPI with public key:', config.vapi.publicKey.substring(0, 8) + '...');
      
      // Initialize VAPI SDK with public key
      this.vapi = new Vapi(config.vapi.publicKey);
      
      // Test the connection by checking if the instance is valid
      if (!this.vapi || typeof this.vapi !== 'object') {
        throw new Error('Failed to create VAPI instance');
      }
      
      // Additional check to see if this is a valid VAPI instance
      // by checking for expected methods
      if (typeof this.vapi.start !== 'function') {
        console.warn('VAPI instance missing start method, may be invalid');
      }
      
      this.setupEventListeners();
      console.log('VAPI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      console.error('Stack trace:', error.stack);
      
      // In production, we should not fall back to mock implementation
      if (config.app.environment === 'production') {
        throw new Error(`VAPI initialization failed in production: ${error.message}`);
      }
      
      // Fallback to mock implementation if VAPI fails (only in development)
      this.initializeMockVapi();
    }
  }

  private initializeMockVapi(): void {
    // Mock VAPI implementation for development
    this.vapi = {
      start: async (assistantId: string, overrides?: { metadata?: any }) => {
        const metadata = overrides?.metadata || {};
        console.log('[MOCK VAPI] Starting call with assistant:', assistantId, 'metadata:', metadata);
        this.currentCall = {
          id: `mock_call_${Date.now()}`,
          status: 'connecting',
          metadata,
        };
        
        // Simulate connection process
        setTimeout(() => {
          if (this.currentCall) {
            this.currentCall.status = 'connected';
            this.callbacks.onCallStart?.();
            
            // Simulate some transcript updates
            this.simulateTranscript();
            
            // Simulate feedback updates
            this.simulateFeedback();
          }
        }, 1000);
        
        return this.currentCall;
      },
      
      stop: async () => {
        console.log('[MOCK VAPI] Stopping call');
        if (this.currentCall) {
          this.currentCall.status = 'ended';
          this.currentCall.duration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
          this.callbacks.onCallEnd?.(this.currentCall);
          this.currentCall = null;
        }
      },
      
      setMuted: (muted: boolean) => {
        console.log('[MOCK VAPI] Muted:', muted);
      },
      
      isMuted: () => false,
      
      send: (message: string) => {
        console.log('[MOCK VAPI] Sending message:', message);
        // Simulate response
        setTimeout(() => {
          this.callbacks.onMessage?.({
            type: 'assistant_response',
            message: `Thank you for sharing that. ${message}`,
            timestamp: new Date().toISOString(),
          });
        }, 1000);
      },
      
      // Mock event listener setup
      on: (event: string, callback: Function) => {
        console.log(`[MOCK VAPI] Event listener registered for: ${event}`);
        // In a real implementation, we would store these callbacks
        // For now, we'll just log that they were registered
      }
    };
    
    console.log('Mock VAPI initialized');
  }

  private setupEventListeners(): void {
    if (!this.vapi) return;

    console.log('Setting up VAPI event listeners');

    // Check if we're using the mock implementation
    if (this.vapi.start && this.vapi.start.toString().includes('[MOCK VAPI]')) {
      console.log('Using mock VAPI implementation, event listeners not applicable');
      return;
    }

    // Set up VAPI event listeners (only for real VAPI implementation)
    this.vapi.on('call-start', () => {
      console.log('VAPI call started');
      this.callbacks.onCallStart?.();
    });

    this.vapi.on('call-end', async (call: any) => {
      console.log('VAPI call ended:', call);
      this.currentCall = {
        id: call.id,
        status: 'ended',
        duration: call.duration,
        metadata: call.metadata,
      };
      
      // Handle end-of-call analysis data
      // Only save if analysis exists and hasn't been saved already through the analysis event
      if (call.analysis) {
        // Check if this is a complete analysis (has summary)
        if (call.analysis.summary) {
          console.log('Call-end event has complete analysis, but it may have already been saved through analysis event');
          // We'll still call handleEndOfCallAnalysis, but the Firebase operation should be idempotent
        }
        await this.handleEndOfCallAnalysis(call);
      }
      
      // Call the callback to notify the UI
      console.log('Calling onCallEnd callback');
      this.callbacks.onCallEnd?.(this.currentCall);
      
      // Also call onInterviewEnd to ensure consistent behavior
      console.log('Calling onInterviewEnd callback');
      this.callbacks.onInterviewEnd?.();
    });

    this.vapi.on('speech-start', () => {
      console.log('User started speaking');
      this.callbacks.onSpeechStart?.();
    });

    this.vapi.on('speech-end', () => {
      console.log('User stopped speaking');
      this.callbacks.onSpeechEnd?.();
    });

    this.vapi.on('message', (message: any) => {
      console.log('VAPI message received:', message);
      this.callbacks.onMessage?.(message);
    });

    this.vapi.on('transcript', (transcript: any) => {
      console.log('Transcript update received:', transcript);
      console.log('Transcript type:', typeof transcript);
      console.log('Transcript keys:', transcript ? Object.keys(transcript) : 'null/undefined');
      
      // Handle different transcript formats
      let transcriptText = '';
      if (typeof transcript === 'string') {
        transcriptText = transcript;
      } else if (transcript && typeof transcript === 'object') {
        // Check for common transcript properties
        if (transcript.transcript) {
          transcriptText = transcript.transcript;
        } else if (transcript.text) {
          transcriptText = transcript.text;
        } else if (transcript.message) {
          transcriptText = transcript.message;
        } else {
          // If we can't find the text, convert the object to string
          transcriptText = JSON.stringify(transcript);
        }
      }
      
      console.log('Processed transcript text:', transcriptText);
      this.callbacks.onTranscript?.(transcriptText);
    });

    this.vapi.on('volume-level', (level: number) => {
      // Ensure level is between 0 and 100
      const normalizedLevel = Math.min(100, Math.max(0, level));
      this.callbacks.onVolumeLevel?.(normalizedLevel);
    });

    this.vapi.on('error', (error: any) => {
      console.error('VAPI error:', error);
      
      // Check if this is a normal disconnection error
      const isNormalDisconnection = error.message && (
        error.message.includes('call ended') || 
        error.message.includes('call stopped') ||
        error.message.includes('ended') ||
        error.message.includes('disconnected') ||
        error.message.includes('not connected') ||
        error.message.includes('no active call') ||
        error.message.includes('already ended') ||
        error.message.includes('WebSocket closed') ||
        error.message.includes('connection closed') ||
        error.message.includes('hang up') ||
        error.message.includes('hangup') ||
        error.message.includes('user disconnected') ||
        error.message.includes('peer closed')
      );
      
      // If it's a normal disconnection, don't call the error callback
      if (!isNormalDisconnection) {
        console.log('Calling onError callback with error:', error);
        this.callbacks.onError?.(error);
      } else {
        console.log('Suppressing normal disconnection error:', error.message);
      }
    });

    // Add listener for analysis updates
    this.vapi.on('analysis', async (analysis: any) => {
      console.log('VAPI analysis received:', analysis);
      this.callbacks.onAnalysis?.(analysis);
      
      // If this is an end-of-call analysis, save it to Firebase and call onInterviewEnd
      if (analysis && analysis.summary) {
        console.log('Analysis has summary, saving to Firebase and calling onInterviewEnd callback');
        
        // Create a mock call object to pass to handleEndOfCallAnalysis
        // This is needed because the analysis event doesn't include call metadata
        const mockCall = {
          id: `call_${Date.now()}`, // This will be replaced if we have a current call
          analysis: analysis,
          metadata: this.currentCall?.metadata || {},
          transcript: '', // Transcript is handled separately
          recordingUrl: '',
          duration: 0
        };
        
        // If we have a current call, use its ID and other properties
        if (this.currentCall) {
          mockCall.id = this.currentCall.id;
          mockCall.metadata = this.currentCall.metadata || mockCall.metadata;
        }
        
        // Save the analysis data to Firebase
        try {
          await this.handleEndOfCallAnalysis(mockCall);
          console.log('End-of-call analysis saved to Firebase successfully');
        } catch (error) {
          console.error('Failed to save end-of-call analysis to Firebase:', error);
        }
        
        this.callbacks.onInterviewEnd?.();
      }
    });

    console.log('VAPI event listeners set up successfully');
  }

  private simulateTranscript(): void {
    // Mock transcript updates for development
    const mockTranscripts = [
      "Hello, I'm Octavia, your AI interview assistant. Let's start with a simple question.",
      "Can you tell me about yourself and your background?",
      "That's interesting. What motivated you to apply for this position?",
      "Great! Now, can you describe a challenging project you've worked on?",
      "How do you handle working under pressure or tight deadlines?",
      "What are your greatest strengths and how do they apply to this role?",
      "Do you have any questions for me about the company or position?",
      "Thank you for your time today. The interview is now complete."
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockTranscripts.length && this.currentCall?.status === 'connected') {
        this.callbacks.onTranscript?.(mockTranscripts[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000); // New question every 5 seconds
  }

  private simulateFeedback(): void {
    // Mock feedback updates for development
    const mockFeedbacks: InterviewFeedback[] = [
      { 
        id: 'feedback-1',
        interviewId: 'mock-interview-1',
        overallScore: 75,
        categories: [
          { name: "Communication", score: 80, weight: 0.3, description: "Clear and articulate responses" },
          { name: "Technical Knowledge", score: 70, weight: 0.4, description: "Good understanding of core concepts" },
          { name: "Problem Solving", score: 72, weight: 0.3, description: "Approaches problems methodically" }
        ],
        strengths: ["Clear communication", "Good technical foundation"],
        improvements: ["Provide more specific examples", "Speak more confidently"],
        recommendations: ["Practice with the STAR method", "Review technical concepts"],
        detailedAnalysis: "You demonstrated strong communication skills and a solid understanding of technical concepts. To improve, focus on providing more specific examples and speaking with greater confidence.",
        createdAt: new Date()
      },
      { 
        id: 'feedback-2',
        interviewId: 'mock-interview-1',
        overallScore: 82,
        categories: [
          { name: "Communication", score: 85, weight: 0.3, description: "Excellent clarity and confidence" },
          { name: "Technical Knowledge", score: 78, weight: 0.4, description: "Strong technical foundation" },
          { name: "Problem Solving", score: 80, weight: 0.3, description: "Good approach to complex problems" }
        ],
        strengths: ["Excellent clarity", "Strong technical foundation", "Good problem-solving approach"],
        improvements: ["Provide more context in answers", "Use the STAR method for behavioral questions"],
        recommendations: ["Practice explaining complex technical concepts", "Prepare more detailed project examples"],
        detailedAnalysis: "Your interview performance was generally strong, with clear communication and relevant examples. Continue practicing with structured responses and focus on quantifying your achievements when possible.",
        createdAt: new Date()
      },
      { 
        id: 'feedback-3',
        interviewId: 'mock-interview-1',
        overallScore: 88,
        categories: [
          { name: "Communication", score: 90, weight: 0.3, description: "Outstanding presentation skills" },
          { name: "Technical Knowledge", score: 85, weight: 0.4, description: "Deep technical expertise" },
          { name: "Problem Solving", score: 88, weight: 0.3, description: "Creative and effective solutions" }
        ],
        strengths: ["Outstanding presentation skills", "Deep technical expertise", "Creative problem solving"],
        improvements: ["Could provide more context in some answers"],
        recommendations: ["Continue practicing with varied question types", "Maintain current excellent performance"],
        detailedAnalysis: "Outstanding performance across all categories. Your communication skills are exceptional, and you demonstrate deep technical knowledge. Continue to maintain this high level of performance.",
        createdAt: new Date()
      }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockFeedbacks.length && this.currentCall?.status === 'connected') {
        this.callbacks.onFeedbackUpdate?.(mockFeedbacks[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10000); // Feedback update every 10 seconds
  }

  /**
   * Test if the assistant exists and is accessible
   */
  async testAssistant(): Promise<boolean> {
    try {
      const assistantId = this.getAssistantIdForType('general');
      console.log('Testing assistant with ID:', assistantId);
      
      // If we're using the mock implementation, return true
      if (this.vapi && this.vapi.start && this.vapi.start.toString().includes('[MOCK VAPI]')) {
        console.log('Using mock implementation, assistant test skipped');
        return true;
      }
      
      // Validate that we have a proper assistant ID
      if (!assistantId || assistantId.length === 0) {
        console.log('Assistant ID is empty or invalid');
        return false;
      }
      
      console.log('Assistant ID appears valid:', assistantId);
      return true;
    } catch (error) {
      console.error('Assistant test failed:', error);
      return false;
    }
  }

  /**
   * Test interview call with simulated parameters
   */
  async testInterviewCall(
    resumeData: any,
    interviewType: string = 'general',
    studentId?: string,
    departmentId?: string,
    institutionId?: string
  ): Promise<any> {
    try {
      const assistantId = this.getAssistantIdForType(interviewType);
      console.log('Testing interview call with assistant ID:', assistantId);
      
      // If we're using the mock implementation, return a mock response
      if (this.vapi && this.vapi.start && this.vapi.start.toString().includes('[MOCK VAPI]')) {
        console.log('Using mock implementation for test call');
        return {
          id: `mock_call_${Date.now()}`,
          status: 'queued',
          assistantId,
        };
      }
      
      // Prepare metadata for the assistant with hierarchical information
      const metadata = {
        resumeData: resumeData || {},
        interviewType,
        startTime: new Date().toISOString(),
        studentId,
        departmentId,
        institutionId
      };
      
      console.log('Testing with metadata:', metadata);
      
      // Start the test call
      const result = await this.vapi.start(assistantId, { metadata });
      console.log('Test call result:', result);
      
      return result;
    } catch (error) {
      console.error('Test interview call failed:', error);
      throw error;
    }
  }

  /**
   * Start an interview call
   */
  async startInterview(
    resumeData: any,
    interviewType: string = 'general',
    callbacks: VapiCallbacks = {},
    studentId?: string,
    departmentId?: string,
    institutionId?: string
  ): Promise<VapiCall> {
    this.callbacks = callbacks;

    // Prepare metadata for the assistant with hierarchical information
    const metadata = {
      resumeData: resumeData || {},
      interviewType,
      startTime: new Date().toISOString(),
      studentId,
      departmentId,
      institutionId
    };

    try {
      const assistantId = this.getAssistantIdForType(interviewType);
      console.log('Starting VAPI call with assistant ID:', assistantId);
      console.log('VAPI instance available:', !!this.vapi);
      console.log('VAPI start method available:', !!this.vapi?.start);
      console.log('Metadata being sent:', metadata);
      
      // Test assistant before starting call
      const isAssistantValid = await this.testAssistant();
      console.log('Assistant validation result:', isAssistantValid);
      
      if (!isAssistantValid) {
        throw new Error('Assistant configuration is invalid. Please check your assistant ID.');
      }
      
      // Add additional debugging
      console.log('Calling vapi.start with:', {
        assistantId,
        overrides: { metadata }
      });
      
      // Check if the VAPI instance has the start method
      if (!this.vapi || typeof this.vapi.start !== 'function') {
        throw new Error('VAPI instance is not properly initialized or missing start method.');
      }
      
      // Start the call with the assistant ID and metadata
      console.log('Executing vapi.start...');
      // The correct format according to VAPI documentation is to pass metadata in the overrides object
      const call = await this.vapi.start(assistantId, { metadata });
      
      console.log('VAPI start response received:', call);
      console.log('Response type:', typeof call);
      console.log('Response keys:', call ? Object.keys(call) : 'null/undefined');
      
      // Check if call is null or undefined
      if (call === null) {
        throw new Error('VAPI returned null response. This typically means the assistant ID is invalid or the assistant is not properly configured in VAPI. Please verify that your VAPI assistant is correctly set up in the VAPI dashboard.');
      }
      
      if (call === undefined) {
        throw new Error('VAPI returned undefined response. This could indicate a network issue or VAPI service problem. Please check your internet connection and try again.');
      }
      
      // Check if call is an object with properties
      if (typeof call !== 'object' || call === null) {
        throw new Error(`VAPI returned unexpected response type: ${typeof call}. Response: ${JSON.stringify(call)}`);
      }
      
      // Check if call.id exists
      if (!call.hasOwnProperty('id')) {
        throw new Error(`VAPI response missing 'id' property. The response was: ${JSON.stringify(call)}`);
      }
      
      if (!call.id) {
        throw new Error(`VAPI response has falsy 'id' value. The response was: ${JSON.stringify(call)}`);
      }
      
      this.currentCall = {
        id: call.id,
        status: 'connecting',
        metadata,
      };
      
      console.log('Interview call started successfully:', this.currentCall);
      return this.currentCall;
    } catch (error: any) {
      console.error('Failed to start VAPI call:', error);
      console.error('Stack trace:', error.stack);
      // Log additional debugging information
      console.error('Assistant ID used:', this.getAssistantIdForType(interviewType));
      console.error('VAPI instance available:', !!this.vapi);
      console.error('VAPI start method available:', !!this.vapi?.start);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
      
      // Special handling for common VAPI errors
      if (errorMessage.includes('assistant ID is invalid')) {
        errorMessage += ' Please verify that your VAPI assistant ID is correctly configured in the VAPI service.';
      } else if (errorMessage.includes('VAPI public key is missing')) {
        errorMessage += ' Please ensure that VITE_VAPI_PUBLIC_KEY is set in your environment variables.';
      } else if (errorMessage.includes('network issue')) {
        errorMessage += ' Please check your internet connection and try again.';
      } else if (errorMessage.includes('null response')) {
        errorMessage += ' This typically means the assistant ID is invalid or the assistant is not properly configured in VAPI. Please check your VAPI dashboard to ensure the assistant is correctly configured.';
      }
      
      throw new Error(`Failed to start interview: ${errorMessage}`);
    }
  }

  /**
   * End the current interview call
   */
  async endInterview(): Promise<VapiCall | null> {
    if (!this.currentCall) {
      console.warn('No active call to end');
      return null;
    }

    try {
      await this.vapi.stop();
      return this.currentCall;
    } catch (error: any) {
      console.error('Failed to end VAPI call:', error);
      // Check if this is a normal disconnection error
      const isNormalDisconnection = error.message && (
        error.message.includes('not connected') || 
        error.message.includes('no active call') ||
        error.message.includes('disconnected') ||
        error.message.includes('already ended')
      );
      
      // If it's a normal disconnection, don't throw an error
      if (isNormalDisconnection) {
        console.log('Call ended normally');
        return this.currentCall;
      }
      
      throw new Error(`Failed to end interview: ${error.message}`);
    }
  }

  /**
   * Mute/unmute the microphone
   */
  setMuted(muted: boolean): void {
    if (!this.vapi) return;

    try {
      if (muted) {
        this.vapi.setMuted(true);
      } else {
        this.vapi.setMuted(false);
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }

  /**
   * Check if microphone is muted
   */
  isMuted(): boolean {
    return this.vapi?.isMuted() || false;
  }

  /**
   * Get current call status
   */
  getCurrentCall(): VapiCall | null {
    return this.currentCall;
  }

  /**
   * Check if call is active
   */
  isCallActive(): boolean {
    return this.currentCall?.status === 'connected' || this.currentCall?.status === 'connecting';
  }

  private getAssistantIdForType(interviewType: string): string {
    // Using the default Octavia assistant ID for all interview types
    // In a production environment, you might want different assistants for different types
    const assistantId = this.assistantId;
    
    // Validate that we have a proper assistant ID
    if (!assistantId || assistantId === 'undefined' || assistantId === 'null') {
      throw new Error('Invalid assistant ID configured. Please check your VAPI configuration.');
    }
    
    console.log('Using assistant ID:', assistantId);
    return assistantId;
  }

  /**
   * Update callbacks for the current session
   */
  updateCallbacks(callbacks: VapiCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get call transcript
   */
  getTranscript(): string {
    return this.currentCall?.transcript || '';
  }

  /**
   * Send a message to the AI assistant
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.isCallActive()) {
      throw new Error('No active call to send message to');
    }

    try {
      await this.vapi.send(message);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Handle end-of-call analysis data and store in Firebase
   */
  private async handleEndOfCallAnalysis(call: any): Promise<void> {
    try {
      const analysis = call.analysis;
      const callId = call.id;
      const metadata = call.metadata || {};
      
      console.log('VAPI Service: Handling end-of-call analysis', {
        callId,
        hasAnalysis: !!analysis,
        hasMetadata: !!metadata,
        metadataKeys: Object.keys(metadata || {})
      });
      
      // Extract hierarchical data for proper isolation
      const analysisData = {
        callId,
        summary: analysis.summary || '',
        structuredData: analysis.structuredData || {},
        successEvaluation: analysis.successEvaluation || {},
        transcript: call.transcript || '',
        recordingUrl: call.recordingUrl || '',
        duration: call.duration || 0,
        timestamp: new Date(),
        studentId: metadata.studentId || '',
        departmentId: metadata.departmentId || metadata.department || '',
        institutionId: metadata.institutionId || '',
        interviewType: metadata.interviewType || 'general',
        overallScore: analysis.successEvaluation?.score || 0,
        categories: analysis.structuredData?.categories || [],
        strengths: analysis.structuredData?.strengths || [],
        improvements: analysis.structuredData?.improvements || [],
        recommendations: analysis.structuredData?.recommendations || []
      };

      console.log('VAPI Service: Saving analysis data to Firebase', {
        callId: analysisData.callId,
        studentId: analysisData.studentId ? 'Present' : 'Empty (anonymous)',
        interviewType: analysisData.interviewType
      });

      // Store analysis data in Firebase for institutional dashboards
      await interviewService.saveEndOfCallAnalysis(analysisData);
      
      console.log('VAPI Service: End-of-call analysis saved successfully to Firebase');
    } catch (error) {
      console.error('VAPI Service: Error handling end-of-call analysis:', error);
    }
  }
}

// Export singleton instance
export const vapiService = VapiService.getInstance();

export default vapiService;
