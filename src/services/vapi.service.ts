/**
 * VAPI Integration Service
 * Handles real-time voice communication and AI interactions
 */

import config from '@/lib/config';
import type { VapiCall, VapiConfig, InterviewFeedback } from '@/types';
import Vapi from '@vapi-ai/web';

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
}

export class VapiService {
  private static instance: VapiService;
  private vapi: any = null;
  private currentCall: VapiCall | null = null;
  private callbacks: VapiCallbacks = {};

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
      // Initialize VAPI SDK with public key
      this.vapi = new Vapi(config.vapi.publicKey);
      this.setupEventListeners();
      console.log('VAPI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      // Fallback to mock implementation if VAPI fails
      this.initializeMockVapi();
    }
  }

  private initializeMockVapi(): void {
    // Mock VAPI implementation for development
    this.vapi = {
      start: async (assistantId: string, metadata: any) => {
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
      }
    };
    
    console.log('Mock VAPI initialized');
  }

  private setupEventListeners(): void {
    if (!this.vapi) return;

    this.vapi.on = (event: string, callback: Function) => {
      // Mock event listener setup
      console.log('[MOCK VAPI] Event listener set for:', event);
    };

    // In a real implementation, VAPI would have these events
    // For the mock, we'll simulate them in other methods
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
   * Start an interview call
   */
  async startInterview(
    resumeData: any,
    interviewType: string = 'general',
    callbacks: VapiCallbacks = {}
  ): Promise<VapiCall> {
    this.callbacks = callbacks;

    const vapiConfig: VapiConfig = {
      assistantId: this.getAssistantIdForType(interviewType),
      publicKey: config.vapi.publicKey,
      metadata: {
        resumeData,
        interviewType,
        startTime: new Date().toISOString(),
      },
    };

    try {
      const call = await this.vapi.start(vapiConfig.assistantId, vapiConfig.metadata);
      this.currentCall = {
        id: call.id,
        status: 'connecting',
        metadata: vapiConfig.metadata,
      };
      return this.currentCall;
    } catch (error: any) {
      console.error('Failed to start VAPI call:', error);
      throw new Error(`Failed to start interview: ${error.message}`);
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
    // These are the actual VAPI assistant IDs
    // Replace these with your actual assistant IDs from VAPI
    const assistantIds = {
      behavioral: 'behavioral_interview_assistant_id',
      technical: 'technical_interview_assistant_id',
      general: 'general_interview_assistant_id',
      industry_specific: 'industry_interview_assistant_id',
    };

    return assistantIds[interviewType as keyof typeof assistantIds] || assistantIds.general;
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
}

// Export singleton instance
export const vapiService = VapiService.getInstance();

export default vapiService;