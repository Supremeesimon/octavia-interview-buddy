/**
 * VAPI Hook for React Components
 * Provides voice interaction capabilities and interview management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import vapiService, { type VapiCallbacks } from '@/services/vapi.service';
import type { VapiCall, InterviewFeedback } from '@/types';

interface UseVapiReturn {
  // Call state
  currentCall: VapiCall | null;
  isCallActive: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  callDuration: number;
  
  // Audio state
  isMuted: boolean;
  volumeLevel: number;
  transcript: string;
  
  // Feedback state
  currentFeedback: InterviewFeedback | null;
  feedbackHistory: InterviewFeedback[];
  
  // Actions
  startInterview: (resumeData: any, interviewType?: string) => Promise<void>;
  endInterview: () => Promise<void>;
  toggleMute: () => void;
  sendMessage: (message: string) => Promise<void>;
  
  // Status
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useVapi = (): UseVapiReturn => {
  const [currentCall, setCurrentCall] = useState<VapiCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<InterviewFeedback[]>([]);
  
  const durationIntervalRef = useRef<number | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Start call duration tracking
  const startDurationTracking = useCallback(() => {
    callStartTimeRef.current = new Date();
    durationIntervalRef.current = window.setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);
  }, []);

  // Stop call duration tracking
  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
  }, []);

  // VAPI callbacks
  const vapiCallbacks: VapiCallbacks = {
    onCallStart: () => {
      console.log('Interview call started');
      startDurationTracking();
      toast.success('Interview started successfully');
    },

    onCallEnd: (call: VapiCall) => {
      console.log('Interview call ended:', call);
      setCurrentCall(call);
      stopDurationTracking();
      setCallDuration(call.duration || callDuration);
      toast.info('Interview completed');
    },

    onSpeechStart: () => {
      console.log('User started speaking');
    },

    onSpeechEnd: () => {
      console.log('User stopped speaking');
    },

    onMessage: (message: any) => {
      console.log('VAPI message received:', message);
      
      // Handle different message types
      if (message.type === 'assistant_response') {
        // AI assistant responded
        toast.info('Octavia responded', {
          description: message.message?.substring(0, 100) + '...',
        });
      }
    },

    onTranscript: (newTranscript: string) => {
      console.log('Transcript update:', newTranscript);
      setTranscript(prev => {
        // Append new transcript or replace if it's a complete update
        return prev ? `${prev}\n\n${newTranscript}` : newTranscript;
      });
    },

    onFeedbackUpdate: (feedback: InterviewFeedback) => {
      console.log('Feedback update:', feedback);
      setCurrentFeedback(feedback);
      setFeedbackHistory(prev => [...prev, feedback]);
      
      // Show toast notification for significant feedback updates
      if (feedback.overallScore) {
        toast.info(`Feedback Update: ${feedback.overallScore}/100`, {
          description: `Check the feedback tab for detailed analysis`
        });
      }
    },

    onError: (error: Error) => {
      console.error('VAPI error:', error);
      setError(error.message);
      toast.error(`Interview error: ${error.message}`);
    },

    onVolumeLevel: (level: number) => {
      setVolumeLevel(level);
    },
  };

  // Initialize VAPI callbacks
  useEffect(() => {
    vapiService.updateCallbacks(vapiCallbacks);
  }, []);

  // Sync with VAPI service state
  useEffect(() => {
    const call = vapiService.getCurrentCall();
    setCurrentCall(call);
    setIsMuted(vapiService.isMuted());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDurationTracking();
      if (vapiService.isCallActive()) {
        vapiService.endInterview().catch(console.error);
      }
    };
  }, [stopDurationTracking]);

  // Start interview
  const startInterview = useCallback(async (
    resumeData: any,
    interviewType: string = 'general'
  ) => {
    setIsLoading(true);
    setError(null);
    setTranscript('');
    setCallDuration(0);
    setCurrentFeedback(null);
    setFeedbackHistory([]);

    try {
      const call = await vapiService.startInterview(
        resumeData,
        interviewType,
        vapiCallbacks
      );
      
      setCurrentCall(call);
      toast.success('Connecting to Octavia...');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start interview';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [vapiCallbacks]);

  // End interview
  const endInterview = useCallback(async () => {
    setIsLoading(true);

    try {
      const endedCall = await vapiService.endInterview();
      if (endedCall) {
        setCurrentCall(endedCall);
      }
      stopDurationTracking();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to end interview';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stopDurationTracking]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    vapiService.setMuted(newMutedState);
    setIsMuted(newMutedState);
    
    toast.info(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
  }, [isMuted]);

  // Send message to AI
  const sendMessage = useCallback(async (message: string) => {
    try {
      await vapiService.sendMessage(message);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Computed states
  const isCallActive = currentCall?.status === 'connected' || currentCall?.status === 'connecting';
  const isConnecting = currentCall?.status === 'connecting';
  const isConnected = currentCall?.status === 'connected';

  return {
    // Call state
    currentCall,
    isCallActive,
    isConnecting,
    isConnected,
    callDuration,
    
    // Audio state
    isMuted,
    volumeLevel,
    transcript,
    
    // Feedback state
    currentFeedback,
    feedbackHistory,
    
    // Actions
    startInterview,
    endInterview,
    toggleMute,
    sendMessage,
    
    // Status
    isLoading,
    error,
    clearError,
  };
};

export default useVapi;