
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Clock, 
  Play,
  BarChart3,
  Upload
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StudentDashboard = () => {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // Mock data
  const completedInterviews = 2;
  const scheduledInterview = {
    date: "June 15, 2023",
    time: "2:00 PM",
    title: "General Behavioral Interview"
  };
  
  const interviewHistory = [
    { id: 1, date: "May 28, 2023", title: "Technical Interview Practice", score: 82 },
    { id: 2, date: "May 15, 2023", title: "Behavioral Interview Practice", score: 78 },
  ];
  
  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Practice interviews and track your progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Next Interview</h3>
              <Calendar className="text-primary h-5 w-5" />
            </div>
            
            {scheduledInterview ? (
              <>
                <div className="mb-4">
                  <div className="text-xl font-medium mb-1">{scheduledInterview.title}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{scheduledInterview.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{scheduledInterview.time}</span>
                  </div>
                </div>
                
                <div className="mt-auto flex gap-3">
                  <Button asChild className="flex items-center gap-2">
                    <Link to="/interview">
                      <Play className="h-4 w-4" />
                      Start Interview
                    </Link>
                  </Button>
                  <Button variant="outline">Reschedule</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-40">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground mb-4">No interviews scheduled</p>
                <Button>Book an Interview</Button>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Resume</h3>
            <FileText className="text-primary h-5 w-5" />
          </div>
          
          {resumeUploaded ? (
            <div>
              <div className="p-4 border rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">MyResume.pdf</div>
                    <div className="text-sm text-muted-foreground">Uploaded on May 10, 2023</div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full">Upload New Resume</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-40">
              <Upload className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground mb-4">Upload your resume to enhance your interview experience</p>
              <Button>Upload Resume</Button>
            </div>
          )}
        </Card>
      </div>
      
      <Tabs defaultValue="history">
        <TabsList className="mb-6">
          <TabsTrigger value="history">Interview History</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <div className="p-6">
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
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card className="p-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Performance analysis will appear after completing interviews</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
