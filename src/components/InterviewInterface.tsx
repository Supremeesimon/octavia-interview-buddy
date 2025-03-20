
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, PauseCircle, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { Room } from 'livekit-client';
import '@livekit/components-styles';

const demoQuestions = [
  "Tell me about yourself and your background.",
  "What are your greatest strengths and how do they help you in your work?",
  "Describe a challenging situation you faced at work and how you handled it.",
  "Why are you interested in this role and what can you contribute?",
  "Where do you see yourself professionally in five years?",
  "How do you handle pressure or stressful situations?",
];

interface InterviewInterfaceProps {
  resumeData?: {
    type: 'linkedin' | 'file' | 'text';
    content: string | File;
  };
}

const InterviewInterface = ({ resumeData }: InterviewInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<number | null>(null);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  
  // LiveKit setup
  const [liveKitUrl, setLiveKitUrl] = useState<string>('');
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  
  const currentQuestion = demoQuestions[currentQuestionIndex];
  
  // For demo purposes, generate fake LiveKit credentials
  useEffect(() => {
    // In a real app, these would come from your backend
    setLiveKitUrl('wss://your-livekit-server.livekit.cloud');
    setLiveKitToken('your-token-here');
  }, []);
  
  // Connect to LiveKit room when starting recording
  const connectToLiveKit = async () => {
    try {
      if (liveKitUrl && liveKitToken) {
        // In a real implementation, this would connect to an actual LiveKit room
        // const newRoom = new Room();
        // await newRoom.connect(liveKitUrl, liveKitToken);
        // setRoom(newRoom);
        // await newRoom.localParticipant.enableMicrophone();
        // setIsMicEnabled(true);
        
        // For demo purposes, we'll just simulate a successful connection
        setIsLiveKitConnected(true);
        toast.success("Audio connected successfully");
        return true;
      } else {
        toast.error("Audio connection failed - missing credentials");
        return false;
      }
    } catch (error) {
      console.error("LiveKit connection error:", error);
      toast.error("Audio connection failed - please try again");
      return false;
    }
  };
  
  const enableMicrophone = async () => {
    try {
      // In a real implementation, this would enable the microphone
      // await room?.localParticipant.enableMicrophone();
      setIsMicEnabled(true);
    } catch (error) {
      console.error("Error enabling microphone:", error);
      toast.error("Failed to enable microphone");
    }
  };
  
  const disableMicrophone = async () => {
    try {
      // In a real implementation, this would disable the microphone
      // await room?.localParticipant.disableMicrophone();
      setIsMicEnabled(false);
    } catch (error) {
      console.error("Error disabling microphone:", error);
    }
  };
  
  // Simulate microphone levels for visualization
  useEffect(() => {
    if (isRecording && !isPaused && audioVisualizerRef.current) {
      const bars = audioVisualizerRef.current.querySelectorAll('.audio-bar');
      
      const animateBars = () => {
        bars.forEach(bar => {
          const height = Math.floor(Math.random() * 50) + 10;
          (bar as HTMLElement).style.height = `${height}px`;
        });
      };
      
      const interval = setInterval(animateBars, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused]);
  
  // Timer functionality
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartRecording = async () => {
    // Connect to LiveKit (or simulate in demo mode)
    const connected = await connectToLiveKit();
    
    if (connected) {
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('');
      setFeedback('');
      
      // Simulate transcription updating as user speaks
      const transcriptionInterval = setInterval(() => {
        if (!isRecording || isPaused) {
          clearInterval(transcriptionInterval);
          return;
        }
        
        // Simulate partial transcription (in real app, this would come from LiveKit)
        const demoResponses = [
          "I have over five years of experience in software development...",
          "My background includes working with cross-functional teams to deliver high-quality products...",
          "I've specialized in frontend development using React and TypeScript...",
          "In my previous role, I led a team of three developers to implement a new feature...",
        ];
        
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        setTranscript(prev => prev + (prev ? ' ' : '') + randomResponse);
      }, 5000); // Update every 5 seconds
    }
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsLoading(true);
    
    // Disconnect from LiveKit
    if (isLiveKitConnected) {
      disableMicrophone();
      // In a real implementation: room?.disconnect();
      setIsLiveKitConnected(false);
    }
    
    // Simulate AI processing time
    setTimeout(() => {
      // Simulate feedback from AI
      setFeedback(
        "Your answer demonstrates relevant experience, but could be more concise and structured. Consider using the STAR method (Situation, Task, Action, Result) to organize your response. Your technical qualifications came across well, but you could emphasize more specific achievements with metrics. Good job maintaining professional tone throughout your answer."
      );
      setIsLoading(false);
    }, 2000);
  };
  
  const handlePauseRecording = () => {
    setIsPaused(true);
    disableMicrophone();
  };
  
  const handleResumeRecording = () => {
    setIsPaused(false);
    enableMicrophone();
  };
  
  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % demoQuestions.length);
    setTranscript('');
    setFeedback('');
    setIsRecording(false);
    setIsPaused(false);
    setTimer(0);
  };
  
  // Auto-end interview after 15 minutes (900 seconds)
  useEffect(() => {
    if (timer >= 900 && isRecording) {
      handleStopRecording();
      toast.info("Interview ended: 15 minute time limit reached");
    }
  }, [timer, isRecording]);
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <Card className="border-2 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-primary/10 p-6 border-b border-border">
          <h2 className="text-2xl font-semibold">Practice Interview</h2>
          <p className="text-muted-foreground">Answer the questions as you would in a real interview</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">Question {currentQuestionIndex + 1}/{demoQuestions.length}</span>
              {isRecording && (
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {formatTime(timer)}
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-medium">{currentQuestion}</h3>
          </div>
          
          {isRecording && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Your Response</h4>
                <div className="flex items-center gap-2">
                  <div 
                    ref={audioVisualizerRef}
                    className={cn(
                      "flex items-end gap-[2px] h-[50px] w-[80px]",
                      isPaused && "opacity-50"
                    )}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "audio-bar w-[4px] bg-primary transition-all duration-100",
                          isPaused && "h-[10px]"
                        )}
                        style={{ height: isPaused ? '10px' : '20px' }}
                      />
                    ))}
                  </div>
                  
                  {isPaused ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-full" 
                      onClick={handleResumeRecording}
                    >
                      <PlayCircle className="h-5 w-5 text-primary" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-full" 
                      onClick={handlePauseRecording}
                    >
                      <PauseCircle className="h-5 w-5 text-primary" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-auto">
                <p className="text-muted-foreground">{transcript || "Waiting for you to speak..."}</p>
              </div>
            </div>
          )}
          
          {feedback && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Octavia's Feedback</h4>
              <div className="bg-secondary rounded-lg p-4">
                <p>{feedback}</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4 justify-between mt-8">
            {!isRecording ? (
              <Button 
                className="rounded-full px-6 flex items-center gap-2" 
                onClick={handleStartRecording}
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                className="rounded-full px-6 flex items-center gap-2" 
                onClick={handleStopRecording}
              >
                <MicOff className="h-5 w-5" />
                Stop Recording
              </Button>
            )}
            
            {(feedback || !isRecording) && (
              <Button 
                variant="outline" 
                className="rounded-full px-6" 
                onClick={handleNextQuestion}
              >
                Next Question
              </Button>
            )}
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing your response...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InterviewInterface;
