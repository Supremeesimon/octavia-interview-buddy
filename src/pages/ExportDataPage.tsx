
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Download, FileSpreadsheet, FileText, Calendar, Filter, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExportDataPage = () => {
  const navigate = useNavigate();
  const [fileFormat, setFileFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last30');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container max-w-4xl mx-auto px-4">
          <TooltipProvider>
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/admin')}
                tooltip="Return to admin dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Export Data</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Export Platform Data</CardTitle>
                <CardDescription>
                  Configure and download reports for analytics and record-keeping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="analytics" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger 
                      value="analytics" 
                      tooltip="Export analytics data about platform usage"
                    >
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="users" 
                      tooltip="Export student and institution user data"
                    >
                      Users
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interviews" 
                      tooltip="Export interview data and results"
                    >
                      Interviews
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="analytics" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">File Format</h3>
                        <RadioGroup 
                          defaultValue="csv" 
                          value={fileFormat} 
                          onValueChange={setFileFormat}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              CSV
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="excel" id="excel" />
                            <Label htmlFor="excel" className="flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Excel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pdf" id="pdf" />
                            <Label htmlFor="pdf" className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Date Range</h3>
                        <RadioGroup 
                          defaultValue="last30" 
                          value={dateRange} 
                          onValueChange={setDateRange}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last7" id="last7" />
                            <Label htmlFor="last7">Last 7 days</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last30" id="last30" />
                            <Label htmlFor="last30">Last 30 days</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="last90" id="last90" />
                            <Label htmlFor="last90">Last 90 days</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ytd" id="ytd" />
                            <Label htmlFor="ytd">Year to date</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">All time</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Custom range</Label>
                          </div>
                        </RadioGroup>
                        
                        {dateRange === 'custom' && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="startDate">Start Date</Label>
                              <input
                                id="startDate"
                                type="date"
                                className="w-full h-10 px-3 py-2 border rounded-md"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate">End Date</Label>
                              <input
                                id="endDate"
                                type="date"
                                className="w-full h-10 px-3 py-2 border rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Analytics Categories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-2">
                            <Checkbox id="user_growth" defaultChecked />
                            <div className="grid gap-1.5">
                              <Label htmlFor="user_growth">User Growth & Retention</Label>
                              <p className="text-sm text-muted-foreground">
                                New users, active users, churn rates
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox id="interview_metrics" defaultChecked />
                            <div className="grid gap-1.5">
                              <Label htmlFor="interview_metrics">Interview Metrics</Label>
                              <p className="text-sm text-muted-foreground">
                                Completion rates, scores, frequency
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox id="resume_perf" defaultChecked />
                            <div className="grid gap-1.5">
                              <Label htmlFor="resume_perf">Resume Performance</Label>
                              <p className="text-sm text-muted-foreground">
                                Upload rates, quality scores, improvements
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox id="institution_comp" defaultChecked />
                            <div className="grid gap-1.5">
                              <Label htmlFor="institution_comp">Institution Comparison</Label>
                              <p className="text-sm text-muted-foreground">
                                Performance metrics across institutions
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">User Type</h3>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="students" defaultChecked />
                            <Label htmlFor="students">Students</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="institutions" defaultChecked />
                            <Label htmlFor="institutions">Institutions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="admins" defaultChecked />
                            <Label htmlFor="admins">Admins</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Filter by Institution</h3>
                        <Select>
                          <SelectTrigger className="w-full" tooltip="Select an institution to filter data">
                            <SelectValue placeholder="All institutions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All institutions</SelectItem>
                            <SelectItem value="inst1">University of Technology</SelectItem>
                            <SelectItem value="inst2">Business College</SelectItem>
                            <SelectItem value="inst3">Engineering Institute</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Include Fields</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="user_id" defaultChecked />
                            <Label htmlFor="user_id">User ID</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="name" defaultChecked />
                            <Label htmlFor="name">Name</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email" defaultChecked />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="created_at" defaultChecked />
                            <Label htmlFor="created_at">Created Date</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="last_login" defaultChecked />
                            <Label htmlFor="last_login">Last Login</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="user_type" defaultChecked />
                            <Label htmlFor="user_type">User Type</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="institution" defaultChecked />
                            <Label htmlFor="institution">Institution</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="status" defaultChecked />
                            <Label htmlFor="status">Status</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interviews" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Interview Status</h3>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scheduled" defaultChecked />
                            <Label htmlFor="scheduled">Scheduled</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="completed" defaultChecked />
                            <Label htmlFor="completed">Completed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cancelled" defaultChecked />
                            <Label htmlFor="cancelled">Cancelled</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Interview Types</h3>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="behavioral" defaultChecked />
                            <Label htmlFor="behavioral">Behavioral</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="technical" defaultChecked />
                            <Label htmlFor="technical">Technical</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="industry" defaultChecked />
                            <Label htmlFor="industry">Industry-Specific</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="situational" defaultChecked />
                            <Label htmlFor="situational">Situational</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Include Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="interview_id" defaultChecked />
                            <Label htmlFor="interview_id">Interview ID</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="student_info" defaultChecked />
                            <Label htmlFor="student_info">Student Information</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="date_time" defaultChecked />
                            <Label htmlFor="date_time">Date & Time</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="duration" defaultChecked />
                            <Label htmlFor="duration">Duration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="questions" defaultChecked />
                            <Label htmlFor="questions">Questions Asked</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="feedback" defaultChecked />
                            <Label htmlFor="feedback">AI Feedback</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scores" defaultChecked />
                            <Label htmlFor="scores">Performance Scores</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="improvement" defaultChecked />
                            <Label htmlFor="improvement">Improvement Areas</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  tooltip="Cancel and return to admin dashboard"
                >
                  Cancel
                </Button>
                <Button 
                  className="gap-2"
                  tooltip="Export data with selected options"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </CardFooter>
            </Card>
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExportDataPage;
