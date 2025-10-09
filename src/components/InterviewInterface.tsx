import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, PauseCircle, PlayCircle, Loader2, Clock, AlertCircle, CheckCircle, ArrowRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import useVapi from '@/hooks/use-vapi';
import type { InterviewFeedback } from '@/types';

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
    currentFeedback,
    feedbackHistory,
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
  const [activeTab, setActiveTab] = useState('transcript');
  const audioVisualizerRef = useRef<HTMLDivElement>(null);
  
  // Sample job data
  const jobData = {
    title: "(SAMPLE) Customer Support Specialist @ Slack",
    resumeName: "Default Resume"
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
                  <p className="text-sm text-green-600 mt-2">Connected to Octavia AI</p>
                )}
                {vapiError && (
                  <p className="text-sm text-red-600 mt-2">Connection error. Please try again.</p>
                )}
              </div>
            </div>
            
            {!isCallActive && !interviewEnded && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Interview Details</h3>
                  <p className="text-sm text-muted-foreground mb-2">{jobData.title}</p>
                  <p className="text-sm text-muted-foreground">Resume: {jobData.resumeName}</p>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium flex items-center gap-1 mb-2">
                    <Clock className="h-4 w-4" /> 
                    Interview Length
                  </h4>
                  <p className="text-sm text-muted-foreground">15 minutes maximum</p>
                </div>
                
                <Button 
                  onClick={handleStartInterview} 
                  className="w-full gap-2"
                  disabled={vapiLoading || isConnecting}
                >
                  {vapiLoading || isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Interview
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {isCallActive && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    className="gap-2"
                  >
                    {isMuted ? (
                      <>
                        <MicOff className="h-5 w-5" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        Mute
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleEndInterview}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <PauseCircle className="h-5 w-5" />
                    End Interview
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Audio Levels</h4>
                  <div ref={audioVisualizerRef} className="flex items-end justify-center space-x-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="audio-bar bg-primary w-2 rounded-t transition-all duration-100"
                        style={{ height: '10px' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <Card className="flex-grow">
              <CardHeader>
                <div className="flex border-b">
                  <Button
                    variant={activeTab === 'transcript' ? 'default' : 'ghost'}
                    className="rounded-none border-b-0"
                    onClick={() => setActiveTab('transcript')}
                  >
                    Live Transcript
                  </Button>
                  <Button
                    variant={activeTab === 'feedback' ? 'default' : 'ghost'}
                    className="rounded-none border-b-0"
                    onClick={() => setActiveTab('feedback')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Real-time Feedback
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'transcript' ? (
                  transcript ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <p className="text-sm">{transcript}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p className="text-sm">
                        {isCallActive ? "Listening..." : "Transcript will appear here during the interview"}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {currentFeedback ? (
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Current Score</h4>
                            <span className="text-2xl font-bold">{currentFeedback.overallScore}/100</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {currentFeedback.detailedAnalysis}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Category Breakdown</h4>
                          <div className="space-y-3">
                            {currentFeedback.categories.map((category) => (
                              <div key={category.name}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{category.name}</span>
                                  <span className="text-sm">{category.score}/100</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${category.score}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {category.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                            <ul className="text-sm space-y-1">
                              {currentFeedback.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-amber-600">Areas for Improvement</h4>
                            <ul className="text-sm space-y-1">
                              {currentFeedback.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-amber-500 mr-2">•</span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">
                          {isCallActive ? "Analyzing your performance..." : "Feedback will appear here during the interview"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {isCallActive && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Speak clearly and at a normal pace</li>
                    <li>• Take a moment to think before answering</li>
                    <li>• Use specific examples from your experience</li>
                    <li>• Ask for clarification if needed</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewInterface;