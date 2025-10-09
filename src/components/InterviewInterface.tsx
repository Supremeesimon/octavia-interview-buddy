
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PauseCircle, PlayCircle, Loader2, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
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
  
  // VAPI integration setup
  const [isAudioConnected, setIsAudioConnected] = useState(false);
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
    }
  };
  
  // Connect to VAPI for voice interaction
  const connectToVapi = async () => {
    try {
      // In production, this would initialize VAPI connection
      setIsAudioConnected(true);
      toast.success("Audio connected successfully");
      return true;
    } catch (error) {
      console.error("VAPI connection error:", error);
      toast.error("Audio connection failed - please try again");
      return false;
    }
  };
  
  const enableMicrophone = async () => {
    try {
      // In production, this would enable the microphone via VAPI
      setIsMicEnabled(true);
    } catch (error) {
      console.error("Error enabling microphone:", error);
      toast.error("Failed to enable microphone");
    }
  };
  
  const disableMicrophone = useCallback(async () => {
    try {
      // In production, this would disable the microphone via VAPI
      setIsMicEnabled(false);
    } catch (error) {
      console.error("Error disabling microphone:", error);
    }
  }, []);
  
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
    // Connect to VAPI for voice interaction
    const connected = await connectToVapi();
    
    if (connected) {
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('');
      
      // In production, VAPI would handle real-time transcription
      // For demo purposes, simulate transcription updating
      const transcriptionInterval = setInterval(() => {
        if (!isRecording || isPaused) {
          clearInterval(transcriptionInterval);
          return;
        }
        
        // Simulate AI responses (in production, this comes from VAPI)
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
  
  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    setIsLoading(true);
    
    // Disconnect from VAPI
    if (isAudioConnected) {
      disableMicrophone();
      setIsAudioConnected(false);
    }
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [isAudioConnected, disableMicrophone]);
  
  const handlePauseRecording = () => {
    setIsPaused(true);
    disableMicrophone();
  };
  
  const handleResumeRecording = () => {
    setIsPaused(false);
    enableMicrophone();
  };
  
  const handleEndInterview = useCallback(() => {
    handleStopRecording();
    setInterviewEnded(true);
    toast.success("Interview completed! Results will be sent to your email shortly.");
  }, [handleStopRecording]);
  
  // Auto-end interview after 15 minutes (900 seconds)
  useEffect(() => {
    if (timer >= 900 && isRecording) {
      handleEndInterview();
      toast.info("Interview ended: 15 minute time limit reached");
    }
  }, [timer, isRecording, handleEndInterview]);

  const handleScheduleMore = () => {
    navigate('/resumes');
    toast.success("Redirecting to scheduling page");
  };
  
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <Tabs defaultValue="interview" className="w-full mb-6" onValueChange={handleTabChange}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="interview" tooltip="Practice interview session">
            Interview
          </TabsTrigger>
          <TabsTrigger value="resumes" tooltip="Manage your resumes">
            Resumes
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
      
      {interviewEnded ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Interview Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <p>Thank you for completing your interview. Your responses have been recorded.</p>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm">
                A calendar invite and interview summary will be sent to your email shortly.
              </p>
            </div>
            
            <Button 
              onClick={handleScheduleMore} 
              className="gap-2"
              tooltip="Schedule additional practice interviews"
            >
              Schedule More Interviews
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                    tooltip="Pause interview"
                  >
                    <PauseCircle className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full absolute -bottom-2 -right-2 h-10 w-10 bg-white"
                    onClick={isRecording ? handleResumeRecording : handleStartRecording}
                    tooltip={isRecording ? "Resume interview" : "Start recording"}
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
              tooltip={isRecording ? "Stop recording" : "Start your interview"}
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
      )}
      
      {!isRecording && !interviewEnded && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>About Your AI Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This interview uses voice AI powered by VAPI to simulate a real interview experience.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✔</span>
                  <span>Your responses are automatically transcribed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✔</span>
                  <span>Google Calendar integration for scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✔</span>
                  <span>Automated email reminders via Make.com</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewInterface;
