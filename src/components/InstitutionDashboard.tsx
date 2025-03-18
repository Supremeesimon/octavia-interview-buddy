
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  CheckCircle,
  FileText,
  Calendar,
  BarChart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "sonner";

const InstitutionDashboard = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Demo data
  const totalLicenses = 1000;
  const usedLicenses = 368;
  const pendingApprovals = 15;
  
  const demoSignupLink = "https://octavia.ai/signup/institution-xyz";
  
  const students = [
    { id: 1, name: "Emma Thompson", email: "ethompson@edu.com", status: "Active", interviewsCompleted: 3, lastActivity: "2 days ago" },
    { id: 2, name: "John Davis", email: "jdavis@edu.com", status: "Active", interviewsCompleted: 2, lastActivity: "1 day ago" },
    { id: 3, name: "Maria Garcia", email: "mgarcia@edu.com", status: "Pending", interviewsCompleted: 0, lastActivity: "Just signed up" },
    { id: 4, name: "Ahmed Hassan", email: "ahassan@edu.com", status: "Active", interviewsCompleted: 5, lastActivity: "3 hours ago" },
    { id: 5, name: "Sarah Johnson", email: "sjohnson@edu.com", status: "Pending", interviewsCompleted: 0, lastActivity: "Just signed up" },
  ];
  
  const copySignupLink = () => {
    navigator.clipboard.writeText(demoSignupLink);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const approveStudent = (studentId: number) => {
    toast.success(`Student #${studentId} approved successfully`);
  };
  
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Institution Dashboard</h1>
        <p className="text-muted-foreground">Manage your students and track progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Licenses</h3>
            <Users className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{usedLicenses} / {totalLicenses}</div>
          <Progress value={(usedLicenses / totalLicenses) * 100} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{totalLicenses - usedLicenses} licenses available</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Pending Approvals</h3>
            <UserPlus className="text-primary h-5 w-5" />
          </div>
          <div className="text-3xl font-bold mb-2">{pendingApprovals}</div>
          <p className="text-sm text-muted-foreground">Students awaiting approval</p>
          <Button size="sm" className="mt-4">View All</Button>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Student Signup Link</h3>
            <LinkIcon className="text-primary h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-4 overflow-hidden">
            <div className="text-sm truncate flex-1">{demoSignupLink}</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0" 
              onClick={copySignupLink}
            >
              {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Share this link with your students</p>
        </Card>
      </div>
      
      <Tabs defaultValue="students">
        <TabsList className="mb-6">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="interviews">Scheduled Interviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                <div className="grid grid-cols-6 font-medium p-3 border-b">
                  <div className="col-span-2">Name / Email</div>
                  <div>Status</div>
                  <div>Interviews</div>
                  <div>Last Activity</div>
                  <div className="text-right">Actions</div>
                </div>
                
                {students.map(student => (
                  <div key={student.id} className="grid grid-cols-6 p-3 border-b hover:bg-muted/50">
                    <div className="col-span-2">
                      <div>{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {student.status}
                      </span>
                    </div>
                    <div>{student.interviewsCompleted}</div>
                    <div>{student.lastActivity}</div>
                    <div className="text-right">
                      {student.status === 'Pending' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => approveStudent(student.id)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost">View Profile</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card className="p-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="text-center">
                <BarChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Reports section under development</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews">
          <Card className="p-6">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Scheduled interviews will appear here</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstitutionDashboard;
