/**
 * VAPI Hook for React Components
 * Provides voice interaction capabilities and interview management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import vapiService from '@/services/vapi.service';
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
  startInterview: (
    resumeData: any, 
    interviewType?: string,
    studentId?: string,
    departmentId?: string,
    institutionId?: string
  ) => Promise<void>;
  endInterview: () => Promise<void>;
  toggleMute: () => void;
  sendMessage: (message: string) => Promise<void>;
  
  // Status
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

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

interface UseVapiProps {
  onInterviewEnd?: () => void;
}

export const useVapi = (props?: UseVapiProps): UseVapiReturn => {
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
      console.log('Setting current call and stopping duration tracking');
      setCurrentCall(call);
      stopDurationTracking();
      setCallDuration(call.duration || callDuration);
      // Clear any errors when call ends normally
      console.log('Clearing errors in onCallEnd');
      setError(null);
      toast.info('Interview completed');
      
      // Notify parent component that interview has ended
      console.log('Calling parent onInterviewEnd callback from onCallEnd');
      props?.onInterviewEnd?.();
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
      console.log('Transcript update in hook:', newTranscript);
      console.log('Previous transcript:', transcript);
      
      // Only update if we have new transcript content
      if (newTranscript && newTranscript.trim() !== '') {
        setTranscript(prev => {
          // Append new transcript or replace if it's a complete update
          const updatedTranscript = prev ? `${prev}\n\n${newTranscript}` : newTranscript;
          console.log('Updated transcript:', updatedTranscript);
          return updatedTranscript;
        });
      }
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
      console.log('Current call status:', currentCall?.status);
      
      // Check if this is a normal interview end by examining the error
      const isNormalEnd = error.message && (
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
        error.message.includes('peer closed') ||
        error.message.includes('undefined') ||
        error.message.includes('Cannot read properties of undefined') ||
        error.message.includes('component unmounted')
      );
      
      console.log('Is normal end based on message:', isNormalEnd);
      
      // Also check if this might be a normal end based on call status
      const isCallActuallyEnded = currentCall?.status === 'ended';
      
      console.log('Is call actually ended:', isCallActuallyEnded);
      
      // Only show error toast and set error state if it's not a normal end
      if (!isNormalEnd && !isCallActuallyEnded) {
        // Set the error state
        setError(error.message);
        // Show the error toast
        toast.error(`Interview error: ${error.message || 'An unknown error occurred'}`);
      } else {
        console.log('Suppressing error toast for normal interview end');
        // Clear the error since this is a normal end
        setError(null);
        // Still notify parent that interview ended normally
        props?.onInterviewEnd?.();
      }
    },

    onVolumeLevel: (level: number) => {
      setVolumeLevel(level);
    },
    
    onAnalysis: (analysis: any) => {
      console.log('Analysis update received:', analysis);
      
      // Check if this is an end-of-call analysis which means the AI ended the interview
      if (analysis && analysis.summary) {
        console.log('Analysis has summary, AI ended the interview');
        // Stop the timer when AI ends the interview
        console.log('Stopping duration tracking');
        stopDurationTracking();
        
        // Notify parent component that interview has ended
        console.log('Calling parent onInterviewEnd callback from onAnalysis');
        props?.onInterviewEnd?.();
      }
      
      // Convert the analysis data to a feedback object
      if (analysis && analysis.successEvaluation) {
        const feedback: InterviewFeedback = {
          id: `feedback-${Date.now()}`,
          interviewId: 'current-interview',
          overallScore: analysis.successEvaluation.score || 0,
          categories: analysis.structuredData?.categories || [],
          strengths: analysis.structuredData?.strengths || [],
          improvements: analysis.structuredData?.improvements || [],
          recommendations: analysis.structuredData?.recommendations || [],
          detailedAnalysis: analysis.summary || '',
          createdAt: new Date()
        };
        
        console.log('Converted feedback object:', feedback);
        setCurrentFeedback(feedback);
        setFeedbackHistory(prev => [...prev, feedback]);
        
        // Show toast notification for significant feedback updates
        if (feedback.overallScore) {
          toast.info(`Feedback Update: ${feedback.overallScore}/100`, {
            description: `Check the feedback tab for detailed analysis`
          });
        }
      }
    },
    
    onInterviewEnd: () => {
      // This is called when AI ends the interview
      console.log('AI ended the interview via onInterviewEnd callback');
      // Stop the timer when AI ends the interview
      console.log('Stopping duration tracking');
      stopDurationTracking();
      // Clear any errors since this is a normal end
      console.log('Clearing errors');
      setError(null);
      // Notify parent component that interview has ended
      console.log('Calling parent onInterviewEnd callback');
      props?.onInterviewEnd?.();
    }
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
  
  // Effect to stop timer when interview ends
  useEffect(() => {
    if (currentCall?.status === 'ended') {
      console.log('Call ended, stopping duration tracking');
      stopDurationTracking();
    }
  }, [currentCall?.status, stopDurationTracking]);

  // Start interview
  const startInterview = useCallback(async (
    resumeData: any,
    interviewType: string = 'general',
    studentId?: string,
    departmentId?: string,
    institutionId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setTranscript('');
    setCallDuration(0);
    setCurrentFeedback(null);
    setFeedbackHistory([]);

    try {
      console.log('Starting interview with:', {
        resumeData,
        interviewType,
        studentId,
        departmentId,
        institutionId
      });
      
      const call = await vapiService.startInterview(
        resumeData,
        interviewType,
        vapiCallbacks,
        studentId,
        departmentId,
        institutionId
      );
      
      setCurrentCall(call);
      toast.success('Connecting to Octavia...');
    } catch (err: any) {
      console.error('Failed to start interview:', err);
      const errorMessage = err.message || 'Failed to start interview. Please check your internet connection and try again.';
      setError(errorMessage);
      toast.error(`Interview error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [vapiCallbacks]);

  // End interview
  const endInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear any existing errors

    try {
      const endedCall = await vapiService.endInterview();
      if (endedCall) {
        setCurrentCall(endedCall);
      }
      stopDurationTracking();
      // Set interviewEnded state to true
      // This will be handled by the parent component
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to end interview';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stopDurationTracking]);

  // Auto-end interview after 15 minutes (900 seconds)
  // This logic is handled in the InterviewInterface component

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
