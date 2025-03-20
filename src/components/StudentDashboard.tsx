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
  ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import BookingCalendar from './BookingCalendar';

const StudentDashboard = () => {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [linkedinUrlAdded, setLinkedinUrlAdded] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [interviewBooked, setInterviewBooked] = useState(false);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  
  const studentName = "Alex Johnson";
  const completedInterviews = 2;
  const [scheduledInterview, setScheduledInterview] = useState<{date: string, time: string, title: string} | null>(null);
  
  const interviewHistory = [
    { id: 1, date: "May 28, 2023", title: "Technical Interview Practice", score: 82 },
    { id: 2, date: "May 15, 2023", title: "Behavioral Interview Practice", score: 78 },
  ];

  const feedbackCategories = [
    { name: "Confidence", score: 85 },
    { name: "Clarity", score: 78 },
    { name: "Communication", score: 82 },
    { name: "Relevance", score: 75 }
  ];

  const handleResumeUpload = (e) => {
    e.preventDefault();
    toast.success("Resume uploaded successfully!");
    setResumeUploaded(true);
  };

  const handleLinkedinSubmit = (e) => {
    e.preventDefault();
    if (linkedinUrl.includes('linkedin.com')) {
      toast.success("LinkedIn URL added successfully!");
      setLinkedinUrlAdded(true);
    } else {
      toast.error("Please enter a valid LinkedIn URL");
    }
  };
  
  const handleBookingComplete = (date: Date, time: string) => {
    setScheduledInterview({
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: time,
      title: "General Behavioral Interview"
    });
    setInterviewBooked(true);
    setShowBookingCalendar(false);
  };
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
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
                  {resumeUploaded ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={resumeUploaded ? "text-green-600" : "text-muted-foreground"}>
                    Upload your resume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {linkedinUrlAdded ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={linkedinUrlAdded ? "text-green-600" : "text-muted-foreground"}>
                    Add your LinkedIn profile
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {interviewBooked ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  <span className={interviewBooked ? "text-green-600" : "text-muted-foreground"}>
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
            {resumeUploaded ? (
              <div className="p-4 border rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">MyResume.pdf</div>
                    <div className="text-sm text-muted-foreground">Uploaded on May 10, 2023</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm" onClick={() => setResumeUploaded(false)}>Replace</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <form onSubmit={handleResumeUpload}>
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center mb-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-muted-foreground mb-2">Drag and drop your resume here</p>
                    <p className="text-xs text-muted-foreground mb-4">or</p>
                    <Button type="submit">Browse Files</Button>
                  </div>
                </form>
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
                  <div className="text-xl font-medium mb-2">{scheduledInterview.title}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{scheduledInterview.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{scheduledInterview.time}</span>
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
      
      <Tabs defaultValue="history" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Interview History</TabsTrigger>
          <TabsTrigger value="feedback">Latest Feedback</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              {interviewHistory.length > 0 ? (
                <div className="divide-y">
                  {interviewHistory.map(interview => (
                    <div key={interview.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{interview.title}</div>
                          <div className="text-sm text-muted-foreground">{interview.date}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Score</div>
                            <div className="font-medium">{interview.score}/100</div>
                          </div>
                          <Button variant="outline" size="sm">View Feedback</Button>
                        </div>
                      </div>
                      <Progress value={interview.score} className="h-2" />
                    </div>
                  ))}
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
            <CardHeader>
              <CardTitle>Behavioral Interview Practice</CardTitle>
              <CardDescription>Completed on May 15, 2023</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="mb-6">
                <h3 className="font-medium mb-3">Score Breakdown</h3>
                <div className="space-y-4">
                  {feedbackCategories.map(category => (
                    <div key={category.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-medium">{category.score}/100</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Strengths</h3>
                <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm text-green-800">
                  <p>You demonstrated strong communication skills and provided concrete examples. Your enthusiasm came through well, and you maintained good pacing throughout the interview.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Areas for Improvement</h3>
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800">
                  <p>Consider structuring your answers using the STAR method (Situation, Task, Action, Result) to provide more context. Some of your responses could be more concise while still conveying the key information.</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Overall Assessment</h3>
                <p className="text-sm text-muted-foreground">Your interview performance was generally strong, with clear communication and relevant examples. Continue practicing with structured responses and focus on quantifying your achievements when possible.</p>
              </div>
            </CardContent>
            <CardFooter className="px-6 pt-0">
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Feedback Report
              </Button>
            </CardFooter>
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
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
