import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PauseCircle, PlayCircle, Loader2, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import useVapi from '@/hooks/use-vapi';

interface InterviewInterfaceProps {
  resumeData?: {
    type: 'linkedin' | 'file' | 'text';
    content: string | File;
  };
}

const InterviewInterface = ({ resumeData }: InterviewInterfaceProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // VAPI integration for voice interviews
  const {
    currentCall,
    isCallActive,
    isConnecting,
    isConnected,
    callDuration,
    isMuted,
    volumeLevel,
    transcript,
    startInterview,
    endInterview,
    toggleMute,
    isLoading: vapiLoading,
    error: vapiError,
    clearError,
  } = useVapi();
  
  // Local state
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Time remaining calculation (15 minutes = 900 seconds)
  const totalInterviewTime = 900; // 15 minutes
  const timeRemaining = totalInterviewTime - callDuration;
  
  // Show warning when 2 minutes are left
  useEffect(() => {
    if (timeRemaining <= 120 && timeRemaining > 115 && isCallActive) {
      setShowWarning(true);
      toast.warning("Only 2 minutes remaining in your interview!");
      
      // Hide warning after 5 seconds
      setTimeout(() => {
        setShowWarning(false);
      }, 5000);
    }
  }, [timeRemaining, isCallActive]);
  
  // Auto-end interview after 15 minutes (900 seconds)
  useEffect(() => {
    if (callDuration >= 900 && isCallActive) {
      handleEndInterview();
      toast.info("Interview ended: 15 minute time limit reached");
    }
  }, [callDuration, isCallActive]);
  
  // Start interview with VAPI
  const handleStartInterview = async () => {
    try {
      await startInterview(resumeData, 'general');
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };
  
  // End interview
  const handleEndInterview = useCallback(async () => {
    try {
      await endInterview();
      setInterviewEnded(true);
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  }, [endInterview]);

  const handleScheduleMore = () => {
    navigate('/resumes');
    toast.success("Redirecting to scheduling page");
  };
  
  // Simulate microphone levels for visualization
  useEffect(() => {
    if (isCallActive && audioVisualizerRef.current) {
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
  }, [isCallActive]);
  
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
      
      {isCallActive && (
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
                style={{ width: `${(callDuration / totalInterviewTime) * 100}%` }}
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
                <p className="text-2xl font-mono">{formatTime(callDuration)}</p>
                {isConnecting && (
                  <p className="text-sm text-muted-foreground mt-2">Connecting to Octavia...</p>
                )}
                {isConnected && (
                  <p className="text-sm text-primary mt-2">Connected</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center",
                  isCallActive ? "bg-primary" : "bg-muted"
                )}>
                  {isMuted ? (
                    <MicOff className="h-10 w-10 text-white" />
                  ) : (
                    <Mic className="h-10 w-10 text-white" />
                  )}
                </div>
                
                {isCallActive && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full absolute -bottom-2 -right-2 h-10 w-10 bg-white"
                    onClick={toggleMute}
                    tooltip={isMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {isMuted ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                size="lg"
                className="bg-primary text-white"
                onClick={isCallActive ? handleEndInterview : handleStartInterview}
                disabled={vapiLoading || isConnecting}
                tooltip={isCallActive ? "End interview" : "Start your interview"}
              >
                {vapiLoading || isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isConnecting ? "Connecting..." : "Loading..."}
                  </>
                ) : (
                  isCallActive ? "End Interview" : "Start Interview"
                )}
              </Button>
            </div>
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
                <div className="min-h-[250px] max-h-[400px] overflow-y-auto">
                  {transcript ? (
                    <div className="space-y-2">
                      {transcript.split('\n\n').map((section, index) => (
                        <p key={index} className="text-sm">{section}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      {isCallActive 
                        ? "Listening... Start speaking to see the transcript" 
                        : "Start the conversation to see the transcript"
                      }
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {!isCallActive && !interviewEnded && (
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
                  <span>Real-time conversation with Octavia AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✔</span>
                  <span>15-minute interview sessions with immediate feedback</span>
                </li>
              </ul>
              
              {vapiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{vapiError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearError}
                    className="mt-2"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewInterface;