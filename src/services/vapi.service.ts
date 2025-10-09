/**
 * VAPI Integration Service
 * Handles real-time voice communication and AI interactions
 */

import config from '@/lib/config';
import type { VapiCall, VapiConfig } from '@/types';

// VAPI SDK types (these would come from @vapi-ai/web package)
declare global {
  interface Window {
    Vapi?: any;
  }
}

export interface VapiCallbacks {
  onCallStart?: () => void;
  onCallEnd?: (call: VapiCall) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onTranscript?: (transcript: string) => void;
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
      // In production, VAPI SDK would be loaded
      if (window.Vapi) {
        this.vapi = new window.Vapi(config.vapi.publicKey);
        this.setupEventListeners();
        console.log('VAPI initialized successfully');
      } else {
        console.warn('VAPI SDK not loaded. Using mock implementation.');
        this.initializeMockVapi();
      }
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
      this.initializeMockVapi();
    }
  }

  private initializeMockVapi(): void {
    // Mock VAPI implementation for development
    this.vapi = {
      start: async (config: VapiConfig) => {
        console.log('[MOCK VAPI] Starting call with config:', config);
        this.currentCall = {
          id: `mock_call_${Date.now()}`,
          status: 'connecting',
          metadata: config.metadata,
        };
        
        // Simulate connection process
        setTimeout(() => {
          if (this.currentCall) {
            this.currentCall.status = 'connected';
            this.callbacks.onCallStart?.();
            
            // Simulate some transcript updates
            this.simulateTranscript();
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
      
      isMuted: () => false,
      mute: () => console.log('[MOCK VAPI] Muted'),
      unmute: () => console.log('[MOCK VAPI] Unmuted'),
      
      setEventHandlers: (handlers: any) => {
        console.log('[MOCK VAPI] Event handlers set');
      }
    };
    
    console.log('Mock VAPI initialized');
  }

  private setupEventListeners(): void {
    if (!this.vapi) return;

    this.vapi.setEventHandlers({
      onCallStart: () => {
        console.log('VAPI call started');
        this.callbacks.onCallStart?.();
      },
      
      onCallEnd: (call: any) => {
        console.log('VAPI call ended:', call);
        this.currentCall = {
          id: call.id,
          status: 'ended',
          duration: call.duration,
          transcript: call.transcript,
          metadata: call.metadata,
        };
        this.callbacks.onCallEnd?.(this.currentCall);
      },
      
      onSpeechStart: () => {
        console.log('Speech started');
        this.callbacks.onSpeechStart?.();
      },
      
      onSpeechEnd: () => {
        console.log('Speech ended');
        this.callbacks.onSpeechEnd?.();
      },
      
      onMessage: (message: any) => {
        console.log('VAPI message:', message);
        this.callbacks.onMessage?.(message);
        
        // Handle transcript updates
        if (message.type === 'transcript' && message.transcript) {
          this.callbacks.onTranscript?.(message.transcript);
        }
      },
      
      onError: (error: any) => {
        console.error('VAPI error:', error);
        this.callbacks.onError?.(new Error(error.message || 'VAPI error'));
      },
      
      onVolumeLevel: (level: number) => {
        this.callbacks.onVolumeLevel?.(level);
      }
    });
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
    }, 15000); // New question every 15 seconds
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
      const call = await this.vapi.start(vapiConfig);
      this.currentCall = call;
      return call;
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
        this.vapi.mute();
      } else {
        this.vapi.unmute();
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
    // In production, these would be actual VAPI assistant IDs
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
      // In production, this would send a message through VAPI
      console.log('[VAPI] Sending message:', message);
      
      // Mock response
      setTimeout(() => {
        this.callbacks.onMessage?.({
          type: 'assistant_response',
          message: `Thank you for sharing that. ${message}`,
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
}

// Export singleton instance
export const vapiService = VapiService.getInstance();

export default vapiService;