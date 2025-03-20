
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PauseCircle, PlayCircle, Loader2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface InterviewInterfaceProps {
  resumeData?: {
    type: 'linkedin' | 'file' | 'text';
    content: string | File;
  };
}

const InterviewInterface = ({ resumeData }: InterviewInterfaceProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  
  // LiveKit setup
  const [liveKitUrl, setLiveKitUrl] = useState<string>('');
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  
  // Sample job data
  const jobData = {
    title: "(SAMPLE) Customer Support Specialist @ Slack",
    resumeName: "Default Resume"
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'interview':
        // Stay on this page
        break;
      case 'resumes':
        navigate('/resumes');
        break;
      case 'jobs':
        navigate('/jobs');
        break;
    }
  };
  
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
  
  // Time remaining calculation (15 minutes = 900 seconds)
  const totalInterviewTime = 900; // 15 minutes
  const timeRemaining = totalInterviewTime - timer;
  
  // Show warning when 2 minutes are left
  useEffect(() => {
    if (timeRemaining <= 120 && timeRemaining > 115 && isRecording) {
      setShowWarning(true);
      toast.warning("Only 2 minutes remaining in your interview!");
      
      // Hide warning after 5 seconds
      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    }
  }, [timeRemaining, isRecording]);
  
  const handleStartRecording = async () => {
    // Connect to LiveKit (or simulate in demo mode)
    const connected = await connectToLiveKit();
    
    if (connected) {
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('');
      
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
  
  const handleEndInterview = () => {
    handleStopRecording();
    setInterviewEnded(true);
    toast.success("Interview completed! Results will be sent to your email shortly.");
  };
  
  // Auto-end interview after 15 minutes (900 seconds)
  useEffect(() => {
    if (timer >= 900 && isRecording) {
      handleEndInterview();
      toast.info("Interview ended: 15 minute time limit reached");
    }
  }, [timer, isRecording]);
  
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <Tabs defaultValue="interview" className="w-full mb-6" onValueChange={handleTabChange}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="interview" className="flex-1">
            Interview
          </TabsTrigger>
          <TabsTrigger value="resumes" className="flex-1">
            Resumes
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1">
            Jobs
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isRecording && (
        <div className={cn(
          "sticky top-0 z-10 mb-4 p-3 rounded-lg flex items-center justify-between",
          showWarning ? "bg-amber-50 border border-amber-200" : "bg-primary/5 border border-primary/10"
        )}>
          <div className="flex items-center gap-2">
            {showWarning ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <Clock className="h-5 w-5 text-primary" />
            )}
            <span className="font-medium">
              {showWarning ? "Time is running out!" : "Interview Time"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-linear",
                  showWarning ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${(timer / totalInterviewTime) * 100}%` }}
              />
            </div>
            <span className={cn(
              "font-mono font-medium",
              timeRemaining < 120 ? "text-amber-600" : timeRemaining < 300 ? "text-amber-500" : ""
            )}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <div className="bg-slate-200 aspect-square rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-2xl font-mono">{formatTime(timer)}</p>
            </div>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                <Mic className="h-10 w-10 text-white" />
              </div>
              
              {isRecording && !isPaused ? (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full absolute -bottom-2 -right-2 h-10 w-10 bg-white"
                  onClick={handlePauseRecording}
                >
                  <PauseCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full absolute -bottom-2 -right-2 h-10 w-10 bg-white"
                  onClick={isRecording ? handleResumeRecording : handleStartRecording}
                >
                  <PlayCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <Button 
            size="lg"
            className="mx-auto bg-primary text-white w-28"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? "Stop" : "Start"}
          </Button>
        </div>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Job</h3>
                  <p className="text-primary">{jobData.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Resume</h3>
                  <p>{jobData.resumeName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[250px]">
                {transcript ? (
                  <p>{transcript}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Start the conversation to see the transcript
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
