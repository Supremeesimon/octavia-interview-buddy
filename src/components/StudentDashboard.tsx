import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Clock, 
  Play,
  BarChart3,
  Upload,
  GraduationCap,
  ListCheck,
  Linkedin,
  CheckCircle,
  XCircle,
  FileUp,
  MessageSquare,
  Download,
  ArrowRight,
  Loader2,
  Bell
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import BookingCalendar from './BookingCalendar';
import { useStudentDashboard } from '@/hooks/use-student-dashboard';
import { useInterviewFeedback } from '@/hooks/use-interview-feedback';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import DebugDashboard from './DebugDashboard';
import StudentMessageInbox from './StudentMessageInbox';
import InterviewSessionRequest from './InterviewSessionRequest';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [linkedinUrlAdded, setLinkedinUrlAdded] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [interviewBooked, setInterviewBooked] = useState(false);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0); // Add this for resetting file input
  
  // Add ref for file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { user } = useFirebaseAuth();
  const { uploadResume } = useFirebaseStorage();
  const { 
    interviews, 
    stats, 
    scheduledInterview, 
    completedInterviews, 
    averageScore, 
    hasResumes,
    hasLinkedIn,
    hasScheduledInterviews,
    isLoading 
  } = useStudentDashboard();
  const { feedback, isLoading: isFeedbackLoading } = useInterviewFeedback();
  
  // Use real student name from auth
  const studentName = user?.name || "Student";
  
  // Add this helper function
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Process interview history from Firebase data
  console.log('Raw interviews data:', interviews);
  const interviewHistory = interviews
    .filter(interview => interview.createdAt instanceof Date && !isNaN(interview.createdAt.getTime()))
    .map(interview => ({
      id: interview.id,
      date: interview.createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      title: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview`,
      score: interview.score || 0
    }));
  console.log('Processed interviewHistory:', interviewHistory);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleResumeUploadClick = () => {
    // Trigger click on the hidden file input
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("Please select a file to upload");
      return;
    }
    
    console.log(`StudentDashboard: handleResumeUpload called with file ${selectedFile.name}`);
    
    try {
      setIsUploading(true);
      setError(null);
      // Generate a proper resume ID using timestamp and random string
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`StudentDashboard: Uploading resume with ID ${resumeId} for user ${user.id}`);
      const result = await uploadResume(user.id, selectedFile, resumeId);
      
      if (result) {
        toast.success("Resume uploaded successfully!");
        setSelectedFile(null);
        resetFileInput();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload resume');
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkedinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkedinUrl.includes('linkedin.com')) {
      toast.success("LinkedIn URL added successfully!");
      setLinkedinUrlAdded(true);
      // In a real implementation, this would save to Firebase
    } else {
      toast.error("Please enter a valid LinkedIn URL");
    }
  };
  
  const handleBookingComplete = (date: Date, time: string) => {
    // In a real implementation, this would create a scheduled interview in Firebase
    setInterviewBooked(true);
    setShowBookingCalendar(false);
  };
  
  const resetFileInput = () => {
    setFileInputKey(prev => prev + 1); // Force re-render of input
    setSelectedFile(null);
  };

  // Show loading state while data is being fetched
  if (isLoading || isFeedbackLoading) {
    return (
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Welcome/Onboarding Panel */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome, {studentName}!</h2>
              <p className="text-muted-foreground mb-4">Complete these steps to prepare for your interviews</p>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {hasResumes ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={hasResumes ? "text-green-600" : "text-muted-foreground"}>
                    Upload your resume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLinkedIn ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={hasLinkedIn ? "text-green-600" : "text-muted-foreground"}>
                    Add your LinkedIn profile
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasScheduledInterviews ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={hasScheduledInterviews ? "text-green-600" : "text-muted-foreground"}>
                    Book your first interview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completedInterviews > 0 ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={completedInterviews > 0 ? "text-green-600" : "text-muted-foreground"}>
                    Complete your first interview
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Resume & LinkedIn Upload Panel */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Resume & Profile
            </CardTitle>
            <CardDescription>Upload your resume and add your LinkedIn profile</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {selectedFile ? (
              <div className="p-4 border rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFileInput}
                  >
                    Remove
                  </Button>
                </div>
                <Button 
                  className="w-full mt-2" 
                  onClick={handleResumeUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Resume'
                  )}
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <label 
                  className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center mb-4 cursor-pointer hover:border-primary/50 transition-colors block"
                  onClick={handleResumeUploadClick}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                  <p className="text-muted-foreground mb-2">Drag and drop your resume here</p>
                  <p className="text-xs text-muted-foreground mb-4">or</p>
                  <Button type="button" variant="outline">
                    Browse Files
                  </Button>
                  <input 
                    key={fileInputKey} // Add key to reset input
                    ref={fileInputRef} // Add ref
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            )}
            
            {linkedinUrlAdded ? (
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">LinkedIn Profile</div>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {linkedinUrl.length > 30 ? linkedinUrl.substring(0, 30) + '...' : linkedinUrl}
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setLinkedinUrlAdded(false)}>Edit</Button>
                </div>
              </div>
            ) : (
              <div>
                <form onSubmit={handleLinkedinSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="linkedin" className="text-sm font-medium">
                      LinkedIn URL
                    </label>
                    <div className="flex gap-2">
                      <input 
                        id="linkedin"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile" 
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <Button type="submit">Add</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Interview Booking/Launch Panel */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next Interview
            </CardTitle>
            <CardDescription>
              {scheduledInterview ? "Your upcoming interview session" : "Book your next interview"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {showBookingCalendar ? (
              <BookingCalendar 
                onBookingComplete={handleBookingComplete}
                allowedBookingsPerMonth={2}
                usedBookings={1}
              />
            ) : scheduledInterview ? (
              <>
                <div className="mb-4">
                  <div className="text-xl font-medium mb-2">
                    {scheduledInterview.type.charAt(0).toUpperCase() + scheduledInterview.type.slice(1)} Interview
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {scheduledInterview.scheduledAt.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {scheduledInterview.scheduledAt.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <h4 className="font-medium flex items-center gap-1 mb-2">
                    <MessageSquare className="h-4 w-4" /> 
                    Tips for Success
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Find a quiet location with good internet connection</li>
                    <li>• Test your microphone before starting</li>
                    <li>• Prepare some notes but avoid reading directly from them</li>
                    <li>• Speak clearly and take your time to answer questions</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-40">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground mb-4">No interviews scheduled</p>
                <Button onClick={() => setShowBookingCalendar(true)}>Book an Interview</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            {scheduledInterview && !showBookingCalendar && (
              <div className="w-full flex flex-col gap-3">
                <Button asChild className="w-full flex items-center gap-2">
                  <Link to="/interview">
                    <Play className="h-4 w-4" />
                    Start Interview
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBookingCalendar(true)}
                >
                  Reschedule
                </Button>
              </div>
            )}
            
            {showBookingCalendar && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowBookingCalendar(false)}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Interview Session Request Panel */}
      <div className="mb-8">
        <InterviewSessionRequest 
          studentId={user?.id || ''} 
          institutionId={user?.institutionId || ''}
          departmentId="engineering" // This would come from user data in a real implementation
        />
      </div>
      
      <Tabs defaultValue="history" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Interview History</TabsTrigger>
          <TabsTrigger value="feedback">Latest Feedback</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="messages">
            <Bell className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              {interviews && interviews.length > 0 ? (
                <div className="divide-y">
                  {interviews.map(interview => {
                    // Format date safely
                    let formattedDate = 'Unknown Date';
                    if (interview.createdAt) {
                      // Handle different date formats
                      let dateObj: Date;
                      if (interview.createdAt instanceof Date) {
                        dateObj = interview.createdAt;
                      } else if (typeof interview.createdAt === 'object' && (interview.createdAt as any)?._seconds) {
                        dateObj = new Date((interview.createdAt as any)._seconds * 1000);
                      } else if (typeof interview.createdAt === 'string') {
                        dateObj = new Date(interview.createdAt);
                      } else {
                        dateObj = new Date();
                      }
                      
                      if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      }
                    }
                    
                    // Get interview type with fallback
                    const interviewType = interview.type || 'General';
                    const displayType = `${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview`;
                    
                    // Get score with fallback
                    const score = typeof interview.score === 'number' ? interview.score : 0;
                    
                    return (
                      <div key={interview.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{displayType}</div>
                            <div className="text-sm text-muted-foreground">{formattedDate}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Score</div>
                              <div className="font-medium">{score}/100</div>
                            </div>
                            <Button variant="outline" size="sm">View Feedback</Button>
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <Clock className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">No interview history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            {feedback ? (
              <>
                <CardHeader>
                  <CardTitle>{(feedback.categories && feedback.categories.length > 0) || (feedback as any).structuredData?.categories ? "Interview Feedback" : "Behavioral Interview Practice"}</CardTitle>
                  <CardDescription>
                    {feedback.createdAt ? 
                      (() => {
                        // Handle different date formats
                        let dateObj: Date;
                        if (feedback.createdAt instanceof Date) {
                          dateObj = feedback.createdAt;
                        } else if (typeof feedback.createdAt === 'object' && (feedback.createdAt as any)?._seconds) {
                          dateObj = new Date((feedback.createdAt as any)._seconds * 1000);
                        } else if (typeof feedback.createdAt === 'string') {
                          dateObj = new Date(feedback.createdAt);
                        } else {
                          dateObj = new Date();
                        }
                        
                        if (!isNaN(dateObj.getTime())) {
                          return `Completed on ${dateObj.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}`;
                        }
                        return 'Feedback details';
                      })() : 
                      'Feedback details'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Score Breakdown</h3>
                    <div className="space-y-4">
                      {feedback.categories && feedback.categories.length > 0 ? (
                        feedback.categories.map((category: any, index: number) => (
                          <div key={`${category.name || index}`}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{category.name || 'Category'}</span>
                              <span className="text-sm font-medium">{typeof category.score === 'number' ? category.score : 'N/A'}/100</span>
                            </div>
                            <Progress value={typeof category.score === 'number' ? category.score : 0} className="h-2" />
                          </div>
                        ))
                      ) : (feedback as any).structuredData?.categories && (feedback as any).structuredData.categories.length > 0 ? (
                        (feedback as any).structuredData.categories.map((category: any, index: number) => (
                          <div key={`${category.name || index}`}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{category.name || 'Category'}</span>
                              <span className="text-sm font-medium">{typeof category.score === 'number' ? category.score : 'N/A'}/100</span>
                            </div>
                            <Progress value={typeof category.score === 'number' ? category.score : 0} className="h-2" />
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No category scores available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm text-green-800">
                      <p>{(feedback.strengths && feedback.strengths.length > 0) ? feedback.strengths.join(', ') : (feedback as any).structuredData?.strengths?.join(', ') || "No specific strengths identified"}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Areas for Improvement</h3>
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800">
                      <p>{(feedback.improvements && feedback.improvements.length > 0) ? feedback.improvements.join(', ') : (feedback as any).structuredData?.improvements?.join(', ') || "No specific improvements identified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Overall Assessment</h3>
                    <p className="text-sm text-muted-foreground">{(feedback as any).detailedAnalysis || (feedback as any).summary || "No detailed analysis available"}</p>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pt-0">
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download Feedback Report
                  </Button>
                </CardFooter>
              </>
            ) : (
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <MessageSquare className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">Complete an interview to see feedback</p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card className="p-6">
            {completedInterviews > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Performance Trend</h3>
                  <div className="bg-muted/50 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Performance chart will appear here</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Key Insights</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Your communication scores have improved by 15% over the last 3 interviews</li>
                    <li>• Technical explanations are becoming more clear and concise</li>
                    <li>• Consider focusing on more specific examples in your responses</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-800">
                    <p>Based on your interview patterns, we recommend focusing on behavioral questions that emphasize leadership and conflict resolution. These areas have the most potential for improvement in your next session.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-40">
                <BarChart3 className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">Complete at least one interview to see performance analysis</p>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <StudentMessageInbox />
        </TabsContent>
        <TabsContent value="debug">
          <DebugDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;